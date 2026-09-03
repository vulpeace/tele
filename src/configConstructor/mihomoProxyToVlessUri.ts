import { MihomoVlessProxy } from "../interfaces/proxy.js";

function encFrag(s: string): string {
  return encodeURIComponent(s);
}

function isIPv6Literal(host: string): boolean {
  return host.includes(":") && !host.startsWith("[");
}

function buildExtraFromXhttpOpts(
  opts: NonNullable<MihomoVlessProxy["xhttp-opts"]>,
): Record<string, unknown> | undefined {
  const extra: Record<string, unknown> = {};
  let hasExtra = false;

  if (opts["no-grpc-header"]) {
    extra["noGRPCHeader"] = true;
    hasExtra = true;
  }
  if (opts["x-padding-bytes"]) {
    extra["xPaddingBytes"] = opts["x-padding-bytes"];
    hasExtra = true;
  }
  if (typeof opts["x-padding-obfs-mode"] === "boolean") {
    extra["xPaddingObfsMode"] = opts["x-padding-obfs-mode"];
    hasExtra = true;
  }
  if (opts["x-padding-key"]) {
    extra["xPaddingKey"] = opts["x-padding-key"];
    hasExtra = true;
  }
  if (opts["x-padding-header"]) {
    extra["xPaddingHeader"] = opts["x-padding-header"];
    hasExtra = true;
  }
  if (opts["x-padding-placement"]) {
    extra["xPaddingPlacement"] = opts["x-padding-placement"];
    hasExtra = true;
  }
  if (opts["x-padding-method"]) {
    extra["xPaddingMethod"] = opts["x-padding-method"];
    hasExtra = true;
  }
  if (opts["uplink-http-method"]) {
    extra["uplinkHTTPMethod"] = opts["uplink-http-method"];
    hasExtra = true;
  }
  if (opts["session-placement"]) {
    extra["sessionIDPlacement"] = opts["session-placement"];
    hasExtra = true;
  }
  if (opts["session-key"]) {
    extra["sessionIDKey"] = opts["session-key"];
    hasExtra = true;
  }
  if (opts["session-table"]) {
    extra["sessionIDTable"] = opts["session-table"];
    hasExtra = true;
  }
  if (opts["session-length"]) {
    extra["sessionIDLength"] = opts["session-length"];
    hasExtra = true;
  }
  if (opts["seq-placement"]) {
    extra["seqPlacement"] = opts["seq-placement"];
    hasExtra = true;
  }
  if (opts["seq-key"]) {
    extra["seqKey"] = opts["seq-key"];
    hasExtra = true;
  }
  if (opts["uplink-data-placement"]) {
    extra["uplinkDataPlacement"] = opts["uplink-data-placement"];
    hasExtra = true;
  }
  if (opts["uplink-data-key"]) {
    extra["uplinkDataKey"] = opts["uplink-data-key"];
    hasExtra = true;
  }
  if (opts["uplink-chunk-size"] !== undefined) {
    extra["uplinkChunkSize"] = Number(opts["uplink-chunk-size"]);
    hasExtra = true;
  }
  if (opts["sc-max-each-post-bytes"] !== undefined) {
    extra["scMaxEachPostBytes"] = Number(opts["sc-max-each-post-bytes"]);
    hasExtra = true;
  }
  if (opts["sc-min-posts-interval-ms"] !== undefined) {
    extra["scMinPostsIntervalMs"] = Number(opts["sc-min-posts-interval-ms"]);
    hasExtra = true;
  }

  if (
    opts["reuse-settings"] &&
    Object.keys(opts["reuse-settings"]).length > 0
  ) {
    const r = opts["reuse-settings"];
    const xmux: Record<string, unknown> = {};
    if (r["max-connections"]) xmux["maxConnections"] = r["max-connections"];
    if (r["max-concurrency"]) xmux["maxConcurrency"] = r["max-concurrency"];
    if (r["c-max-reuse-times"]) xmux["cMaxReuseTimes"] = r["c-max-reuse-times"];
    if (r["h-max-request-times"])
      xmux["hMaxRequestTimes"] = r["h-max-request-times"];
    if (r["h-max-reusable-secs"])
      xmux["hMaxReusableSecs"] = r["h-max-reusable-secs"];
    if (typeof r["h-keep-alive-period"] === "number")
      xmux["hKeepAlivePeriod"] = r["h-keep-alive-period"];
    if (Object.keys(xmux).length > 0) {
      extra["xmux"] = xmux;
      hasExtra = true;
    }
  }

  if (
    opts["download-settings"] &&
    Object.keys(opts["download-settings"]).length > 0
  ) {
    const ds = opts["download-settings"];
    const out: Record<string, unknown> = {};
    if (ds.server) out["address"] = ds.server;
    if (typeof ds.port === "number") out["port"] = ds.port;

    const hasReality = !!ds["reality-opts"];
    if (hasReality) out["security"] = "reality";
    else if (ds.tls) out["security"] = "tls";

    if (ds.tls || hasReality) {
      const tlsSettings: Record<string, unknown> = {};
      if (ds.servername) tlsSettings["serverName"] = ds.servername;
      if (ds["client-fingerprint"])
        tlsSettings["fingerprint"] = ds["client-fingerprint"];
      if (Array.isArray(ds.alpn) && ds.alpn.length > 0)
        tlsSettings["alpn"] = ds.alpn;
      if (ds["skip-cert-verify"]) tlsSettings["allowInsecure"] = true;
      if (Object.keys(tlsSettings).length > 0) out["tlsSettings"] = tlsSettings;
    }
    if (hasReality && ds["reality-opts"]) {
      const ro: Record<string, unknown> = {};
      if (ds["reality-opts"]!["public-key"])
        ro["publicKey"] = ds["reality-opts"]!["public-key"];
      if (ds["reality-opts"]!["short-id"])
        ro["shortId"] = ds["reality-opts"]!["short-id"];
      if (Object.keys(ro).length > 0) out["realitySettings"] = ro;
    }
    const xhttpSettings: Record<string, unknown> = {};
    if (ds.path) xhttpSettings["path"] = ds.path;
    if (ds.host) xhttpSettings["host"] = ds.host;
    if (ds.headers && Object.keys(ds.headers).length > 0)
      xhttpSettings["headers"] = ds.headers;
    if (ds["reuse-settings"] && Object.keys(ds["reuse-settings"]).length > 0) {
      const r = ds["reuse-settings"];
      const xmux: Record<string, unknown> = {};
      if (r["max-connections"]) xmux["maxConnections"] = r["max-connections"];
      if (r["max-concurrency"]) xmux["maxConcurrency"] = r["max-concurrency"];
      if (r["c-max-reuse-times"])
        xmux["cMaxReuseTimes"] = r["c-max-reuse-times"];
      if (r["h-max-request-times"])
        xmux["hMaxRequestTimes"] = r["h-max-request-times"];
      if (r["h-max-reusable-secs"])
        xmux["hMaxReusableSecs"] = r["h-max-reusable-secs"];
      if (typeof r["h-keep-alive-period"] === "number")
        xmux["hKeepAlivePeriod"] = r["h-keep-alive-period"];
      if (Object.keys(xmux).length > 0) xhttpSettings["extra"] = { xmux };
    }
    if (Object.keys(xhttpSettings).length > 0)
      out["xhttpSettings"] = xhttpSettings;

    extra["downloadSettings"] = out;
    hasExtra = true;
  }

  return hasExtra ? extra : undefined;
}

export function mihomoProxyToVlessUri(proxy: MihomoVlessProxy): string {
  if (proxy.type !== "vless")
    throw new Error(`proxy.type must be "vless", got "${(proxy as any).type}"`);
  if (!proxy.server) throw new Error("proxy.server is required");
  if (
    proxy.port === undefined ||
    proxy.port === null ||
    String(proxy.port) === ""
  )
    throw new Error("proxy.port is required");
  if (!proxy.uuid) throw new Error("proxy.uuid is required");

  const portStr = String(proxy.port);
  const hostPart = isIPv6Literal(proxy.server)
    ? `[${proxy.server}]`
    : proxy.server;
  const userinfo = encodeURIComponent(proxy.uuid);
  let uri = `vless://${userinfo}@${hostPart}:${portStr}`;

  const params = new URLSearchParams();

  if (proxy.encryption !== undefined && proxy.encryption !== "") {
    params.set("encryption", String(proxy.encryption));
  }
  if (proxy.flow) {
    params.set("flow", String(proxy.flow).toLowerCase());
  }

  const realityOpts = proxy["reality-opts"] as
    MihomoVlessProxy["reality-opts"] | undefined;
  const hasReality = !!realityOpts?.["public-key"];
  if (hasReality) {
    params.set("security", "reality");
    params.set("pbk", realityOpts!["public-key"]);
    if (realityOpts!["short-id"]) params.set("sid", realityOpts!["short-id"]);
  } else if (proxy.tls) {
    params.set("security", "tls");
  } else {
    params.set("security", "none");
  }

  if (proxy.servername) params.set("sni", String(proxy.servername));
  if (proxy["client-fingerprint"])
    params.set("fp", String(proxy["client-fingerprint"]));
  if (proxy.fingerprint) params.set("pcs", String(proxy.fingerprint));
  if (Array.isArray(proxy.alpn) && proxy.alpn.length > 0)
    params.set("alpn", proxy.alpn.join(","));

  if (proxy["packet-addr"]) {
    params.set("packetEncoding", "packet");
  } else if (proxy.xudp === false) {
    params.set("packetEncoding", "none");
  } else if (proxy.xudp === true) {
    params.set("packetEncoding", "xudp");
  }

  const networkRaw = (proxy.network ?? "tcp").toLowerCase();
  if (networkRaw === "http") {
    params.set("type", "tcp");
    params.set("headerType", "http");
    const httpOpts = proxy["http-opts"];
    if (httpOpts) {
      const hostArr = (httpOpts.headers as any)?.["Host"] as
        string[] | undefined;
      if (Array.isArray(hostArr) && hostArr[0]) params.set("host", hostArr[0]);
      else if (
        typeof (httpOpts.headers as any)?.["Host"] === "string" &&
        (httpOpts.headers as any)["Host"]
      ) {
        params.set("host", String((httpOpts.headers as any)["Host"]));
      }
      if (httpOpts.method) params.set("method", String(httpOpts.method));
      const p = httpOpts.path;
      if (Array.isArray(p) && p[0] && p[0] !== "/") params.set("path", p[0]);
      else if (Array.isArray(p) && p[0] === "/") {
        /* ? */
      } else if (typeof p === "string" && p) params.set("path", p);
    }
  } else if (networkRaw === "h2") {
    params.set("type", "http");
    const h2Opts = proxy["h2-opts"];
    if (h2Opts) {
      if (h2Opts.path && h2Opts.path !== "/") params.set("path", h2Opts.path);
      const h = h2Opts.host;
      if (Array.isArray(h) && h[0]) params.set("host", h[0]);
    }
  } else if (networkRaw === "ws") {
    const wsOpts = proxy["ws-opts"];
    const isHttpUpgrade = !!wsOpts?.["v2ray-http-upgrade"];
    params.set("type", isHttpUpgrade ? "httpupgrade" : "ws");
    if (wsOpts) {
      if (wsOpts.path) params.set("path", wsOpts.path);
      const hostHeader = wsOpts.headers?.["Host"] ?? wsOpts.headers?.["host"];
      if (hostHeader) params.set("host", String(hostHeader));
      if (wsOpts["max-early-data"] !== undefined && !isHttpUpgrade) {
        params.set("ed", String(wsOpts["max-early-data"]));
      }
      if (wsOpts["v2ray-http-upgrade-fast-open"] && isHttpUpgrade) {
        // ?
      }
      if (wsOpts["early-data-header-name"]) {
        params.set("eh", String(wsOpts["early-data-header-name"]));
      }
    }
  } else if (networkRaw === "grpc") {
    params.set("type", "grpc");
    const g = proxy["grpc-opts"];
    if (g?.["grpc-service-name"])
      params.set("serviceName", String(g["grpc-service-name"]));
  } else if (networkRaw === "xhttp") {
    params.set("type", "xhttp");
    const x = proxy["xhttp-opts"];
    if (x) {
      if (x.path) params.set("path", x.path);
      if (x.host) params.set("host", x.host);
      if (x.mode) params.set("mode", x.mode);
      const extra = buildExtraFromXhttpOpts(x);
      if (extra) params.set("extra", JSON.stringify(extra));
    }
  } else {
    params.set("type", "tcp");
  }

  const qs = params.toString();
  if (qs) uri += `?${qs}`;
  if (proxy.name) uri += `#${encFrag(proxy.name)}`;

  return uri;
}
