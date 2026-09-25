import { MihomoHysteria2Proxy } from "../interfaces/proxy.js";

function encFrag(s: string): string {
  return encodeURIComponent(s);
}

function isIPv6Literal(host: string): boolean {
  return host.includes(":") && !host.startsWith("[");
}

export function mihomoProxyToHysteria2Uri(proxy: MihomoHysteria2Proxy): string {
  const realmOpts = proxy["realm-opts"] as
    MihomoHysteria2Proxy["realm-opts"] | undefined;
  const isRealm = !!realmOpts?.enable;

  // Determine server host and port segment.
  // For realm, prefer server-url host if present, else proxy.server.
  let host = proxy.server;
  let portsOrPort: string | undefined;

  if (isRealm) {
    if (realmOpts["server-url"]) {
      try {
        const u = new URL(realmOpts["server-url"]);
        if (u.hostname) host = u.hostname;
        const portFromUrl = u.port;
        if (proxy.ports) portsOrPort = String(proxy.ports);
        else if (portFromUrl) portsOrPort = portFromUrl;
        else if (
          proxy.port !== undefined &&
          proxy.port !== null &&
          String(proxy.port) !== ""
        )
          portsOrPort = String(proxy.port);
        else portsOrPort = undefined;
      } catch {
        // fallback to proxy fields if server-url is malformed
        host = proxy.server;
        if (proxy.ports) portsOrPort = String(proxy.ports);
        else if (
          proxy.port !== undefined &&
          proxy.port !== null &&
          String(proxy.port) !== ""
        )
          portsOrPort = String(proxy.port);
        else portsOrPort = undefined;
      }
    } else {
      if (proxy.ports) portsOrPort = String(proxy.ports);
      else if (
        proxy.port !== undefined &&
        proxy.port !== null &&
        String(proxy.port) !== ""
      )
        portsOrPort = String(proxy.port);
    }
  } else {
    if (proxy.ports) portsOrPort = String(proxy.ports);
    else if (
      proxy.port !== undefined &&
      proxy.port !== null &&
      String(proxy.port) !== ""
    )
      portsOrPort = String(proxy.port);
  }

  if (!host) throw new Error("proxy.server is required");
  if (portsOrPort === undefined || portsOrPort === null || portsOrPort === "") {
    throw new Error("proxy.port is required");
  }

  const hostPart = isIPv6Literal(host) ? `[${host}]` : host;
  const authorityHostPort = `${hostPart}:${portsOrPort}`;

  const scheme = isRealm ? "hysteria2+realm" : "hysteria2";

  // Build userinfo
  let userinfo = "";
  if (isRealm) {
    const token = realmOpts.token ?? "";
    if (token) {
      userinfo = `${encodeURIComponent(token)}@`;
    }
  } else {
    if (proxy.password) {
      userinfo = `${encodeURIComponent(String(proxy.password))}@`;
    }
  }

  let uri = `${scheme}://${userinfo}${authorityHostPort}`;

  // Realm path: /realm-id
  if (isRealm && realmOpts["realm-id"]) {
    const rid = String(realmOpts["realm-id"]);
    // Realm ID may contain characters needing encoding, keep as single segment
    uri += `/${encodeURIComponent(rid)}`;
  }

  const params = new URLSearchParams();

  if (isRealm) {
    if (proxy.password) {
      params.set("auth", String(proxy.password));
    }
    const stunServers = realmOpts["stun-servers"] as string[] | undefined;
    if (Array.isArray(stunServers) && stunServers.length > 0) {
      for (const s of stunServers) {
        if (s) params.append("stun", String(s));
      }
    }
  }

  if (proxy.obfs) {
    params.set("obfs", String(proxy.obfs));
  }
  if (proxy["obfs-password"]) {
    params.set("obfs-password", String(proxy["obfs-password"]));
  }
  if (proxy.sni) {
    params.set("sni", String(proxy.sni));
  }
  if (proxy["skip-cert-verify"]) {
    params.set("insecure", "1");
  }
  if (Array.isArray(proxy.alpn) && proxy.alpn.length > 0) {
    params.set("alpn", proxy.alpn.join(","));
  }
  if (proxy.fingerprint) {
    params.set("pinSHA256", String(proxy.fingerprint));
  }
  if (proxy.up !== undefined && proxy.up !== null && String(proxy.up) !== "") {
    params.set("up", String(proxy.up));
  }
  if (
    proxy.down !== undefined &&
    proxy.down !== null &&
    String(proxy.down) !== ""
  ) {
    params.set("down", String(proxy.down));
  }

  const qs = params.toString();
  if (qs) uri += `?${qs}`;
  if (proxy.name) uri += `#${encFrag(proxy.name)}`;

  return uri;
}
