export type DNSPrefer =
  "dual" | "ipv4" | "ipv6" | "ipv4-prefer" | "ipv6-prefer";

export interface BasicProxyOptions {
  tfo?: boolean;
  mptcp?: boolean;
  "interface-name"?: string;
  interfaceName?: string;
  "routing-mark"?: number;
  routingMark?: number;
  "ip-version"?: DNSPrefer;
  ipVersion?: DNSPrefer;
  "dialer-proxy"?: string; // "ss1"
  dialerProxy?: string;
}

export interface ECHOptions {
  enable?: boolean; // true
  config?: string; // "AEn+DQBFKwAgACABWIHUGj4u+PIggYXcR5JF0gYk3dCRioBW8uJq9H4mKAAIAAEAAQABAANAEnB1YmxpYy50bHMtZWNoLmRldgAA"
  "query-server-name"?: string; // "tls-ech.dev"
}

export interface ShadowTLSOptions {
  password?: string; // "shadow-tls-password"
  version?: 1 | 2 | 3;
}

export interface RestlsOptions {
  password?: string; // "restls-password"
  "version-hint"?: "tls12" | "tls13";
  "restls-script"?: string;
}

export interface JLSOptions {
  username?: string; // "jls-user"
  password?: string; // "jls-password"
}

export interface RealityOptions {
  "public-key": string; // "CrrQSjAG_YkHLwvM2M-7XkKJilgL5upBKCp0od0tLhE"
  "short-id"?: string; // "10f897e26c4b9478"
  "support-x25519mlkem768"?: boolean;
}

export interface GrpcOptions {
  "grpc-service-name"?: string; // "grpc"
  "grpc-user-agent"?: string; // "grpc-go/1.36.0"
  "ping-interval"?: number; // 0
  "max-connections"?: number; // 1
  "min-streams"?: number; // 0
  "max-streams"?: number; // 0
}

export interface WSOptions {
  path?: string; // "/"
  headers?: Record<string, string>; // {"Host": "example.com"}
  "max-early-data"?: number; // 2048
  "early-data-header-name"?: string; // "Sec-WebSocket-Protocol"
  "v2ray-http-upgrade"?: boolean;
  "v2ray-http-upgrade-fast-open"?: boolean;
}

export interface HTTPOptions {
  method?: string; // "POST"
  path?: string[]; // ["/edge"]
  headers?: Record<string, string[]>; // {"Host": ["cdn.example.com"]}
}

export interface HTTP2Options {
  host?: string[]; // ["cdn.example.com"]
  path?: string; // "/grpc"
}

export interface XHTTPReuseSettings {
  "max-concurrency"?: string; // "16-32"
  "max-connections"?: string; // "0"
  "c-max-reuse-times"?: string; // "0"
  "h-max-request-times"?: string; // "600-900"
  "h-max-reusable-secs"?: string; // "1800-3000"
  "h-keep-alive-period"?: number; // 0
}

export interface XHTTPDownloadSettings {
  path?: string; // "/"
  host?: string; // "xxx.com"
  headers?: Record<string, string>; // {"X-Forwarded-For": ""}
  "reuse-settings"?: XHTTPReuseSettings;
  server?: string; // "server"
  port?: number; // 443
  tls?: boolean;
  alpn?: string[]; // ["h2"]
  "ech-opts"?: ECHOptions;
  "shadow-tls-opts"?: ShadowTLSOptions;
  "restls-opts"?: RestlsOptions;
  "jls-opts"?: JLSOptions;
  "reality-opts"?: RealityOptions;
  "skip-cert-verify"?: boolean;
  "name-cert-verify"?: string; // "example.com"
  fingerprint?: string; // "xxxx"
  certificate?: string; // "./client.crt"
  "private-key"?: string; // "./client.key"
  servername?: string; // "xxx.com"
  "client-fingerprint"?:
    | "chrome"
    | "firefox"
    | "safari"
    | "ios"
    | "android"
    | "edge"
    | "360"
    | "qq"
    | "random"
    | "randomized"
    | "none";
}

export interface XHTTPOptions {
  path?: string; // "/"
  host?: string; // "xxx.com"
  mode?: "stream-one" | "stream-up" | "packet-up" | "auto";
  headers?: Record<string, string>; // {"X-Forwarded-For": ""}
  "no-grpc-header"?: boolean;
  "x-padding-bytes"?: string; // "100-1000"
  "x-padding-obfs-mode"?: boolean;
  "x-padding-key"?: string; // "x_padding"
  "x-padding-header"?: string; // "Referer"
  "x-padding-placement"?: "queryInHeader" | "cookie" | "header" | "query";
  "x-padding-method"?: "repeat-x" | "tokenish";
  "uplink-http-method"?: "POST" | "PUT" | "PATCH" | "DELETE";
  "session-placement"?: "path" | "query" | "cookie" | "header";
  "session-key"?: string;
  "session-table"?: string; // "ALPHABET"
  "session-length"?: string; // "16-32"
  "seq-placement"?: "path" | "query" | "cookie" | "header";
  "seq-key"?: string;
  "uplink-data-placement"?: "body" | "cookie" | "header";
  "uplink-data-key"?: string;
  "uplink-chunk-size"?: string; // "0"
  "sc-max-each-post-bytes"?: string; // "1000000"
  "sc-min-posts-interval-ms"?: string; // "30"
  "reuse-settings"?: XHTTPReuseSettings;
  "download-settings"?: XHTTPDownloadSettings;
}

export interface MihomoVlessProxy extends BasicProxyOptions {
  type: "vless";
  name: string; // "vless-tcp"
  server: string; // "server"
  port: number | string; // 443
  uuid: string; // "uuid"
  flow?: "xtls-rprx-vision";
  tls?: boolean;
  alpn?: string[]; // ["h2"]
  udp?: boolean;
  "packet-addr"?: boolean;
  xudp?: boolean;
  "packet-encoding"?: "packetaddr" | "packet" | "xudp" | "none";
  encryption?: string; // "none"
  network?: "tcp" | "ws" | "grpc" | "http" | "h2" | "xhttp";
  "ech-opts"?: ECHOptions;
  "shadow-tls-opts"?: ShadowTLSOptions;
  "restls-opts"?: RestlsOptions;
  "jls-opts"?: JLSOptions;
  "reality-opts"?: RealityOptions;
  "http-opts"?: HTTPOptions;
  "h2-opts"?: HTTP2Options;
  "grpc-opts"?: GrpcOptions;
  "ws-opts"?: WSOptions;
  "xhttp-opts"?: XHTTPOptions;
  "ws-headers"?: Record<string, string>;
  "skip-cert-verify"?: boolean;
  "name-cert-verify"?: string; // "example.com"
  fingerprint?: string; // "xxxx"
  certificate?: string; // "./client.crt"
  "private-key"?: string; // "./client.key"
  servername?: string; // "example.com"
  "client-fingerprint"?:
    | "chrome"
    | "firefox"
    | "safari"
    | "ios"
    | "android"
    | "edge"
    | "360"
    | "qq"
    | "random"
    | "randomized"
    | "none";
}

export interface TrojanSSOption {
  enabled?: boolean;
  method?: "aes-128-gcm" | "aes-256-gcm" | "chacha20-ietf-poly1305";
  password?: string; // "example"
}

export interface MihomoTrojanProxy extends BasicProxyOptions {
  type: "trojan";
  name: string; // "trojan"
  server: string; // "server"
  port: number | string; // 443
  password: string; // "yourpsk"
  alpn?: string[]; // ["h2", "http/1.1"]
  sni?: string; // "example.com"
  "skip-cert-verify"?: boolean;
  "name-cert-verify"?: string; // "example.com"
  fingerprint?: string; // "xxxx"
  certificate?: string; // "./client.crt"
  "private-key"?: string; // "./client.key"
  udp?: boolean;
  network?: "tcp" | "ws" | "grpc";
  "ech-opts"?: ECHOptions;
  "shadow-tls-opts"?: ShadowTLSOptions;
  "restls-opts"?: RestlsOptions;
  "jls-opts"?: JLSOptions;
  "reality-opts"?: RealityOptions;
  "grpc-opts"?: GrpcOptions;
  "ws-opts"?: WSOptions;
  "ss-opts"?: TrojanSSOption;
  "client-fingerprint"?:
    | "chrome"
    | "firefox"
    | "safari"
    | "ios"
    | "android"
    | "edge"
    | "360"
    | "qq"
    | "random"
    | "randomized"
    | "none";
}

export interface MihomoAnyTLSProxy extends BasicProxyOptions {
  type: "anytls";
  name: string; // "anytls"
  server: string; // "server"
  port: number | string; // 443
  password: string; // "yourpsk"
  alpn?: string[]; // ["h2"]
  sni?: string; // "example.com"
  "ech-opts"?: ECHOptions;
  "shadow-tls-opts"?: ShadowTLSOptions;
  "restls-opts"?: RestlsOptions;
  "jls-opts"?: JLSOptions;
  "client-fingerprint"?:
    | "chrome"
    | "firefox"
    | "safari"
    | "ios"
    | "android"
    | "edge"
    | "360"
    | "qq"
    | "random"
    | "randomized"
    | "none";
  "skip-cert-verify"?: boolean;
  "name-cert-verify"?: string; // "example.com"
  fingerprint?: string; // "xxxx"
  certificate?: string; // "./client.crt"
  "private-key"?: string; // "./client.key"
  udp?: boolean;
  "client-metadata"?: string;
  "idle-session-check-interval"?: number; // 30
  "idle-session-timeout"?: number; // 30
  "min-idle-session"?: number; // 0
  "disable-reuse"?: boolean;
}

export interface MihomoMieruProxy extends BasicProxyOptions {
  type: "mieru";
  name: string; // "mieru"
  server: string; // "server"
  port?: number | string; // 443
  "port-range"?: string; // "9998-9999"
  transport: "TCP" | "UDP";
  udp?: boolean;
  username: string; // "username1"
  password: string; // "password1"
  multiplexing?:
    "MULTIPLEXING_LOW" | "MULTIPLEXING_MIDDLE" | "MULTIPLEXING_HIGH";
  "handshake-mode"?: "HANDSHAKE_NO_WAIT" | "HANDSHAKE_WAIT";
  "traffic-pattern"?: string; // "CCoQARoECAEQCiIYCAMQASoIMDAwMTAyMDMqCDA0MDUwNjA3"
}

export interface Hysteria2RealmOption {
  enable?: boolean;
  "server-url"?: string; // "https://realm.hy2.io"
  token?: string; // "public"
  "realm-id"?: string; // "my-cabin-1f3a8c2e9b"
  "stun-servers"?: string[]; // ["stun.nextcloud.com:3478"]
  sni?: string; // "example.com"
  "skip-cert-verify"?: boolean;
  "name-cert-verify"?: string; // "example.com"
  fingerprint?: string; // "xxxx"
  certificate?: string; // "./client.crt"
  "private-key"?: string; // "./client.key"
  alpn?: string[];
}

export interface MihomoHysteria2Proxy extends BasicProxyOptions {
  type: "hysteria2";
  name: string; // "hysteria2"
  server: string; // "server.com"
  port?: number | string; // 443
  ports?: string; // "1000,2000-3000,5000"
  "hop-interval"?: string; // "30"
  up?: string; // "30 Mbps"
  down?: string; // "200 Mbps"
  password?: string; // "yourpassword"
  obfs?: "salamander" | "gecko";
  "obfs-password"?: string; // "yourpassword"
  "obfs-min-packet-size"?: number; // 512
  "obfs-max-packet-size"?: number; // 1200
  sni?: string; // "server.com"
  "ech-opts"?: ECHOptions;
  "skip-cert-verify"?: boolean;
  "name-cert-verify"?: string; // "example.com"
  fingerprint?: string; // "xxxx"
  certificate?: string; // "./client.crt"
  "private-key"?: string; // "./client.key"
  alpn?: string[]; // ["h3"]
  cwnd?: number;
  "bbr-profile"?: "standard" | "conservative" | "aggressive";
  "udp-mtu"?: number; // 1200
  "handshake-timeout"?: number; // 30
  "realm-opts"?: Hysteria2RealmOption;
  "initial-stream-receive-window"?: number; // 8388608
  "max-stream-receive-window"?: number; // 8388608
  "initial-connection-receive-window"?: number; // 20971520
  "max-connection-receive-window"?: number; // 20971520
}

export interface MihomoTuicProxy extends BasicProxyOptions {
  type: "tuic";
  name: string; // "tuic"
  server: string; // "server"
  port: number | string; // 443
  token?: string; // "yourtoken"
  uuid?: string; // "uuid"
  password?: string; // "yourpassword"
  ip?: string; // "1.2.3.4"
  "heartbeat-interval"?: number; // 10000
  alpn?: string[]; // ["h3"]
  "reduce-rtt"?: boolean;
  "request-timeout"?: number; // 8000
  "udp-relay-mode"?: "native" | "quic";
  "congestion-controller"?: "cubic" | "bbr" | "new_reno" | "bbr3";
  "disable-sni"?: boolean;
  "max-udp-relay-packet-size"?: number; // 1252
  "fast-open"?: boolean;
  "max-open-streams"?: number; // 100
  cwnd?: number; // 32
  "bbr-profile"?: "standard" | "conservative" | "aggressive";
  "skip-cert-verify"?: boolean;
  "name-cert-verify"?: string; // "example.com"
  fingerprint?: string; // "xxxx"
  certificate?: string; // "./client.crt"
  "private-key"?: string; // "./client.key"
  "recv-window-conn"?: number; // 12582912
  "recv-window"?: number; // 52428800
  "disable-mtu-discovery"?: boolean;
  "max-datagram-frame-size"?: number; // 1400
  sni?: string; // "server"
  "ech-opts"?: ECHOptions;
  "udp-over-stream"?: boolean;
  "udp-over-stream-version"?: number;
}

export type MihomoProxy =
  | MihomoVlessProxy
  | MihomoTrojanProxy
  | MihomoAnyTLSProxy
  | MihomoMieruProxy
  | MihomoHysteria2Proxy
  | MihomoTuicProxy;

export type MihomoProxyType = MihomoProxy["type"];

export type MihomoVlessProxyDiff = Partial<MihomoVlessProxy>;
export type MihomoTrojanProxyDiff = Partial<MihomoTrojanProxy>;
export type MihomoAnyTLSProxyDiff = Partial<MihomoAnyTLSProxy>;
export type MihomoMieruProxyDiff = Partial<MihomoMieruProxy>;
export type MihomoHysteria2ProxyDiff = Partial<MihomoHysteria2Proxy>;
export type MihomoTuicProxyDiff = Partial<MihomoTuicProxy>;

export type MihomoProxyDiff =
  | MihomoVlessProxyDiff
  | MihomoTrojanProxyDiff
  | MihomoAnyTLSProxyDiff
  | MihomoMieruProxyDiff
  | MihomoHysteria2ProxyDiff
  | MihomoTuicProxyDiff;

export interface MihomoProxyStringified {
  name: string;
  type: "vless" | "trojan" | "anytls" | "mieru" | "hysteria2" | "tuic";
  typeSpecific: string;
}

export interface MihomoProxyStringifiedWithUser {
  proxyName: string;
  type: string;
  typeSpecific: string;
  groupName?: string;
  userName: string;
  uuid: string | null;
  flow: string | null;
  password: string | null;
}
