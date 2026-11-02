/**
 * How the Go sources map to TypeScript:
 * - `adapter/parser.go` / `listener/parse.go` map each `type:` value to its
 *   option struct (`case "mieru": ... &outbound.MieruOption{...}`).
 * - Struct fields are read from their `proxy:"..."` / `inbound:"..."` tags.
 *   mihomo's decoder (common/structure) rejects a config that is missing a
 *   field without `omitempty`, so only `omitempty` fields are optional.
 * - Embedded structs are squashed by the decoder and become `extends`.
 * - Go has no string enums, so string fields stay `string` unless listed in
 *   OVERRIDES below.
 */
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MIHOMO = join(ROOT, "mihomo");
const OUT_DIR = join(ROOT, "src/interfaces/generated");

/** Types that go into the `MihomoProxy` / `MihomoListener` unions. */
const SUPPORTED_PROXY_TYPES = [
  "vless",
  "trojan",
  "anytls",
  "mieru",
  "hysteria2",
  "tuic",
];
const SUPPORTED_LISTENER_TYPES = [
  "vless",
  "trojan",
  "anytls",
  "mieru",
  "hysteria2",
  "tuic",
];

/** Types from other Go packages, keyed as written in the source. */
const EXTERNAL_TYPES: Record<string, string> = {
  "C.DNSPrefer": '"dual" | "ipv4" | "ipv6" | "ipv4-prefer" | "ipv6-prefer"',
  "C.TUNStack": "string", // gvisor | system | mixed, case-insensitive
  "netip.Prefix": "string",
  "netip.Addr": "string",
};

/**
 * Hand-picked TypeScript types for fields whose Go type is too loose,
 * keyed as `<proxy|listener>:<GoStruct>.<yaml-key>`, e.g.
 *   "proxy:MieruOption.handshake-mode": '"HANDSHAKE_STANDARD" | "HANDSHAKE_NO_WAIT"',
 */
const OVERRIDES: Record<string, string> = {};

interface Kind {
  name: "proxy" | "listener";
  pkgDir: string;
  parserFile: string;
  pkgAlias: string; // how the parser refers to the option package
  tag: string;
  prefix: string; // prefix for nested type names
  topName: (stem: string) => string;
  supported: string[];
}

const KINDS: Kind[] = [
  {
    name: "proxy",
    pkgDir: "adapter/outbound",
    parserFile: "adapter/parser.go",
    pkgAlias: "outbound",
    tag: "proxy",
    prefix: "Proxy",
    topName: (stem) => `Mihomo${stem}Proxy`,
    supported: SUPPORTED_PROXY_TYPES,
  },
  {
    name: "listener",
    pkgDir: "listener/inbound",
    parserFile: "listener/parse.go",
    pkgAlias: "IN",
    tag: "inbound",
    prefix: "Listener",
    topName: (stem) => `Mihomo${stem}Listener`,
    supported: SUPPORTED_LISTENER_TYPES,
  },
];

interface GoField {
  names: string[]; // empty for embedded fields
  type: string;
  tags: Record<string, string>;
  comment?: string;
}

interface GoPackage {
  structs: Map<string, GoField[]>;
  aliases: Map<string, string>;
}

const warnings: string[] = [];

function readPackage(dir: string): GoPackage {
  const structs = new Map<string, GoField[]>();
  const aliases = new Map<string, string>();
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".go") || file.endsWith("_test.go")) continue;
    const src = readFileSync(join(dir, file), "utf8");
    for (const m of src.matchAll(/^type (\w+) struct \{\n([\s\S]*?)^\}/gm)) {
      structs.set(m[1], parseStructBody(m[2], `${file}:${m[1]}`));
    }
    for (const m of src.matchAll(
      /^type (\w+) (?!struct\b|interface\b|func\b|=)(\S+)/gm,
    )) {
      aliases.set(m[1], m[2]);
    }
  }
  return { structs, aliases };
}

function parseStructBody(body: string, where: string): GoField[] {
  const fields: GoField[] = [];
  for (const rawLine of body.split("\n")) {
    let line = rawLine.trim();
    if (!line || line.startsWith("//")) continue;
    if (/\bstruct\s*\{\s*$/.test(line)) {
      warnings.push(`${where}: inline struct field not supported: ${line}`);
      continue;
    }
    const tags: Record<string, string> = {};
    const tagMatch = line.match(/`([^`]*)`/);
    if (tagMatch) {
      for (const t of tagMatch[1].matchAll(/(\w+):"([^"]*)"/g))
        tags[t[1]] = t[2];
      line = line.replace(tagMatch[0], " ");
    }
    let comment: string | undefined;
    const commentIdx = line.indexOf("//");
    if (commentIdx !== -1) {
      comment = line.slice(commentIdx + 2).trim() || undefined;
      line = line.slice(0, commentIdx);
    }
    const tokens = line.trim().split(/\s+/);
    const type = tokens.pop()!;
    const names = tokens
      .join(" ")
      .split(",")
      .map((n) => n.trim())
      .filter(Boolean);
    fields.push({ names, type, tags, comment });
  }
  return fields;
}

/** Maps `case "<type>":` in the parser to the option struct it decodes into. */
function readParser(kind: Kind, pkg: GoPackage): Map<string, string> {
  const src = readFileSync(join(MIHOMO, kind.parserFile), "utf8");
  const result = new Map<string, string>();
  const cases = [...src.matchAll(/^\s*case "([^"]+)":/gm)];
  cases.forEach((c, i) => {
    const end = cases[i + 1]?.index ?? src.length;
    const block = src.slice(c.index, end);
    const alias = kind.pkgAlias;
    const direct = block.match(new RegExp(`&${alias}\\.(\\w+)\\{`));
    let struct = direct?.[1];
    if (!struct) {
      // e.g. IN.DefaultHysteria2RealmServerOption() returning *Hysteria2RealmServerOption
      const fn = block.match(new RegExp(`${alias}\\.(\\w+)\\(\\)`))?.[1];
      if (fn) {
        const pkgSrc = readdirSync(join(MIHOMO, kind.pkgDir))
          .filter((f) => f.endsWith(".go"))
          .map((f) => readFileSync(join(MIHOMO, kind.pkgDir, f), "utf8"))
          .join("\n");
        struct = pkgSrc.match(new RegExp(`func ${fn}\\(\\) \\*?(\\w+)`))?.[1];
      }
    }
    if (struct && pkg.structs.has(struct)) result.set(c[1], struct);
    else
      warnings.push(
        `${kind.parserFile}: could not resolve struct for type "${c[1]}"`,
      );
  });
  return result;
}

function generate(kind: Kind): string {
  const pkg = readPackage(join(MIHOMO, kind.pkgDir));
  const types = readParser(kind, pkg);

  const emitted = new Map<string, string>(); // TS name -> source
  const queue: string[] = [];
  const nestedName = (goName: string) => `${kind.prefix}${goName}`;

  const wrap = (t: string) => (t.includes("|") ? `(${t})` : t);

  function tsType(goType: string, where: string): string {
    if (goType.startsWith("*")) return tsType(goType.slice(1), where);
    if (goType === "[]byte" || goType === "[]uint8") return "number[] | string";
    if (goType.startsWith("[]"))
      return `${wrap(tsType(goType.slice(2), where))}[]`;
    const map = goType.match(/^map\[(\w+)\](.+)$/);
    if (map) return `Record<string, ${tsType(map[2], where)}>`;
    if (goType in EXTERNAL_TYPES) return EXTERNAL_TYPES[goType];
    if (goType === "string") return "string";
    if (goType === "bool") return "boolean";
    if (/^(u?int(8|16|32|64)?|float(32|64)|uintptr)$/.test(goType))
      return "number";
    if (goType === "any" || goType === "interface{}") return "unknown";
    if (pkg.structs.has(goType)) {
      if (!queue.includes(goType)) queue.push(goType);
      return nestedName(goType);
    }
    if (pkg.aliases.has(goType)) return tsType(pkg.aliases.get(goType)!, where);
    warnings.push(
      `${kind.name}: ${where}: unknown Go type ${goType}, emitted as unknown`,
    );
    return "unknown";
  }

  function emitInterface(
    tsName: string,
    goName: string,
    discriminator?: string,
  ): string {
    const fields = pkg.structs.get(goName)!;
    const parents: string[] = [];
    const lines: string[] = [];
    if (discriminator) lines.push(`  type: ${JSON.stringify(discriminator)};`);
    for (const f of fields) {
      const tag = f.tags[kind.tag];
      if (f.names.length === 0) {
        const embedded = f.type.replace(/^\*/, "");
        if (pkg.structs.has(embedded)) {
          if (!queue.includes(embedded)) queue.push(embedded);
          parents.push(nestedName(embedded));
        } else {
          warnings.push(
            `${kind.name}: ${goName}: embedded ${f.type} is not an option struct, skipped`,
          );
        }
        continue;
      }
      if (tag === "-") continue;
      for (const goField of f.names) {
        if (!/^[A-Z]/.test(goField)) continue; // unexported
        // Without a tag the decoder matches the Go field name case-insensitively.
        const [key, ...opts] = (tag ?? "").split(",");
        const yamlKey = key || goField.toLowerCase();
        const optional = opts.includes("omitempty");
        const override = OVERRIDES[`${kind.name}:${goName}.${yamlKey}`];
        const type = override ?? tsType(f.type, `${goName}.${goField}`);
        const prop = /^[A-Za-z_$][\w$]*$/.test(yamlKey)
          ? yamlKey
          : JSON.stringify(yamlKey);
        const notes = [
          ...(tag === undefined
            ? [`untagged in mihomo, matched case-insensitively`]
            : []),
          ...(f.comment ? [f.comment] : []),
        ];
        const comment = notes.length ? ` // ${notes.join("; ")}` : "";
        lines.push(`  ${prop}${optional ? "?" : ""}: ${type};${comment}`);
      }
    }
    const ext = parents.length ? ` extends ${parents.join(", ")}` : "";
    return `export interface ${tsName}${ext} {\n${lines.join("\n")}\n}`;
  }

  const topLevel: Array<{ type: string; tsName: string }> = [];
  for (const [type, goName] of types) {
    const tsName = kind.topName(goName.replace(/Option$/, ""));
    emitted.set(tsName, emitInterface(tsName, goName, type));
    topLevel.push({ type, tsName });
  }
  // Nested structs discovered while emitting (the queue grows as we go).
  for (let i = 0; i < queue.length; i++) {
    const tsName = nestedName(queue[i]);
    if (!emitted.has(tsName))
      emitted.set(tsName, emitInterface(tsName, queue[i]));
  }

  const unionName = kind.name === "proxy" ? "MihomoProxy" : "MihomoListener";
  const supported = kind.supported.map((t) => {
    const top = topLevel.find((tl) => tl.type === t);
    if (!top)
      throw new Error(
        `Supported ${kind.name} type "${t}" not found in ${kind.parserFile}`,
      );
    return top.tsName;
  });

  const parts = [...emitted.values()];
  parts.push(
    `export type ${unionName} =\n${supported.map((n) => `  | ${n}`).join("\n")};`,
    `export type ${unionName}Type = ${unionName}["type"];`,
    supported.map((n) => `export type ${n}Diff = Partial<${n}>;`).join("\n"),
    `export type ${unionName}Diff =\n${supported.map((n) => `  | ${n}Diff`).join("\n")};`,
  );
  return parts.join("\n\n");
}

const revision = execFileSync(
  "git",
  ["-C", MIHOMO, "describe", "--tags", "--always", "--dirty"],
  {
    encoding: "utf8",
  },
).trim();

mkdirSync(OUT_DIR, { recursive: true });
const written: string[] = [];
for (const kind of KINDS) {
  const header =
    `// Generated by scripts/generateInterfaces.ts from mihomo ${revision} ` +
    `(${kind.pkgDir}). Do not edit by hand.\n\n`;
  const file = join(OUT_DIR, `${kind.name}.ts`);
  writeFileSync(file, header + generate(kind) + "\n");
  written.push(file);
}

execFileSync(
  join(ROOT, "node_modules/.bin/prettier"),
  ["--write", ...written],
  { stdio: "ignore" },
);

for (const w of warnings) console.warn(`warning: ${w}`);
for (const f of written) console.log(`wrote ${relative(ROOT, f)}`);
