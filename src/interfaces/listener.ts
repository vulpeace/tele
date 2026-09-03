export interface ListenerBaseOptions {
  name: string; // "vless-in-1"
  listen?: string; // "0.0.0.0"
  port?: string; // "10817"
  rule?: string; // "sub-rule-name1"
  proxy?: string; // "proxy"
  "routing-mark"?: number;
}

export interface ListenerRealityLimitFallback {
  "after-bytes"?: number; // 0
  "bytes-per-sec"?: number; // 0
  "burst-bytes-per-sec"?: number; // 0
}

export interface ListenerRealityConfig {
  dest: string; // "test.com:443"
  "private-key": string; // "jNXHt1yRo0vDuchQlIP6Z0ZvjT3KtzVI-T4E7RoLJS0"
  "short-id"?: string[]; // ["0123456789abcdef"]
  "server-names"?: string[]; // ["test.com"]
  "max-time-difference"?: number;
  proxy?: string;
  "limit-fallback-upload"?: ListenerRealityLimitFallback;
  "limit-fallback-download"?: ListenerRealityLimitFallback;
}

export interface ListenerShadowTLSHandshakeOptions {
  dest: string; // "www.example.com:443"
  proxy?: string;
}

export interface ListenerShadowTLS {
  enable: boolean;
  version?: 1 | 2 | 3;
  password?: string; // "shadow-tls-password"
  users?: Array<{ name?: string; password?: string }>; // [{"name": "shadow-tls-user", "password": "shadow-tls-password"}]
  handshake?: ListenerShadowTLSHandshakeOptions;
  "handshake-for-server-name"?: Record<
    string,
    ListenerShadowTLSHandshakeOptions
  >;
  "strict-mode"?: boolean;
  "wildcard-sni"?: string;
}

export interface ListenerResTLS {
  enable: boolean;
  dest: string; // "www.example.com:443"
  password: string; // "restls-password"
  "restls-script"?: string;
  "min-record-len"?: number;
  "rate-limit"?: number;
  proxy?: string;
}

export interface ListenerJLSConfig {
  enable: boolean;
  users: Array<{ username: string; password: string }>; // [{"username": "jls-user", "password": "jls-password"}]
  sni?: string; // "www.example.com"
  dest: string; // "www.example.com:443"
  alpn?: string[]; // ["h2", "http/1.1"]
  proxy?: string;
  "rate-limit"?: number;
}

export interface ListenerBrutalOptions {
  enabled?: boolean;
  up?: string; // "30 Mbps"
  down?: string; // "200 Mbps"
}

export interface ListenerMuxOption {
  padding?: boolean;
  brutal?: ListenerBrutalOptions;
}

export interface ListenerVlessUser {
  username?: string; // "1"
  uuid: string; // "9d0cb9d0-964f-4ef6-897d-6c6b3ccf9e68"
  flow?: "xtls-rprx-vision";
}

export interface ListenerXHTTPConfig {
  path?: string; // "/"
  host?: string;
  mode?: "auto" | "stream-one" | "stream-up" | "packet-up";
  "x-padding-bytes"?: string; // "100-1000"
  "x-padding-obfs-mode"?: boolean;
  "x-padding-key"?: string; // "x_padding"
  "x-padding-header"?: string; // "Referer"
  "x-padding-placement"?: "queryInHeader" | "cookie" | "header" | "query";
  "x-padding-method"?: "repeat-x" | "tokenish";
  "uplink-http-method"?: "POST" | "PUT" | "PATCH" | "DELETE";
  "session-placement"?: "path" | "query" | "cookie" | "header";
  "session-key"?: string;
  "seq-placement"?: "path" | "query" | "cookie" | "header";
  "seq-key"?: string;
  "uplink-data-placement"?: "body" | "cookie" | "header";
  "uplink-data-key"?: string;
  "uplink-chunk-size"?: string; // "0"
  "no-sse-header"?: boolean;
  "sc-stream-up-server-secs"?: string; // "20-80"
  "sc-max-buffered-posts"?: string; // "30"
  "sc-max-each-post-bytes"?: string; // "1000000"
}

export interface MihomoVlessListener extends ListenerBaseOptions {
  type: "vless";
  users: ListenerVlessUser[];
  decryption?: string; // "mlkem768x25519plus.native/xorpub/random.600s/0s.(X25519 PrivateKey)..."
  "ws-path"?: string; // "/"
  "xhttp-config"?: ListenerXHTTPConfig;
  "grpc-service-name"?: string; // "GunService"
  certificate?: string; // "./server.crt"
  "private-key"?: string; // "./server.key"
  "client-auth-type"?:
    "" | "request" | "require-any" | "verify-if-given" | "require-and-verify";
  "client-auth-cert"?: string;
  "ech-key"?: string; // "-----BEGIN ECH KEYS-----"
  "allow-insecure"?: boolean;
  "shadow-tls"?: ListenerShadowTLS;
  "res-tls"?: ListenerResTLS;
  "jls-config"?: ListenerJLSConfig;
  "reality-config"?: ListenerRealityConfig;
  "mux-option"?: ListenerMuxOption;
}

export interface ListenerTrojanUser {
  username?: string; // "1"
  password: string; // "9d0cb9d0-964f-4ef6-897d-6c6b3ccf9e68"
}

export interface ListenerTrojanSSOption {
  enabled?: boolean;
  method?: "aes-128-gcm" | "aes-256-gcm" | "chacha20-ietf-poly1305";
  password?: string; // "example"
}

export interface MihomoTrojanListener extends ListenerBaseOptions {
  type: "trojan";
  users: ListenerTrojanUser[];
  "ws-path"?: string; // "/"
  "grpc-service-name"?: string; // "GunService"
  certificate?: string; // "./server.crt"
  "private-key"?: string; // "./server.key"
  "client-auth-type"?:
    "" | "request" | "require-any" | "verify-if-given" | "require-and-verify";
  "client-auth-cert"?: string;
  "ech-key"?: string;
  "allow-insecure"?: boolean;
  "shadow-tls"?: ListenerShadowTLS;
  "res-tls"?: ListenerResTLS;
  "jls-config"?: ListenerJLSConfig;
  "reality-config"?: ListenerRealityConfig;
  "mux-option"?: ListenerMuxOption;
  "ss-option"?: ListenerTrojanSSOption;
}

export interface MihomoAnyTLSListener extends ListenerBaseOptions {
  type: "anytls";
  users?: Record<string, string>; // {"username1": "password1"}
  certificate?: string; // "./server.crt"
  "private-key"?: string; // "./server.key"
  "client-auth-type"?:
    "" | "request" | "require-any" | "verify-if-given" | "require-and-verify";
  "client-auth-cert"?: string;
  "ech-key"?: string;
  "shadow-tls"?: ListenerShadowTLS;
  "res-tls"?: ListenerResTLS;
  "jls-config"?: ListenerJLSConfig;
  "allow-insecure"?: boolean;
  "padding-scheme"?: string;
}

export interface MihomoMieruListener extends ListenerBaseOptions {
  type: "mieru";
  transport: "TCP" | "UDP";
  users: Record<string, string>; // {"username1": "password1"}
  "traffic-pattern"?: string;
  "user-hint-is-mandatory"?: boolean;
}

export interface ListenerHysteria2RealmOption {
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
  alpn?: string[]; // ["h3"]
  proxy?: string; // "DIRECT"
}

export interface MihomoHysteria2Listener extends ListenerBaseOptions {
  type: "hysteria2";
  users?: Record<string, string>; // {"00000000-0000-0000-0000-000000000000": "PASSWORD_0"}
  obfs?: "salamander" | "gecko";
  "obfs-password"?: string; // "yourpassword"
  "obfs-min-packet-size"?: number; // 512
  "obfs-max-packet-size"?: number; // 1200
  certificate: string; // "./server.crt"
  "private-key": string; // "./server.key"
  "client-auth-type"?:
    "" | "request" | "require-any" | "verify-if-given" | "require-and-verify";
  "client-auth-cert"?: string;
  "ech-key"?: string;
  "max-idle-time"?: number; // 15000
  alpn?: string[]; // ["h3"]
  up?: string; // "30 Mbps"
  down?: string; // "200 Mbps"
  "ignore-client-bandwidth"?: boolean;
  masquerade?: string; // "file:///var/www"
  cwnd?: number;
  "bbr-profile"?: "standard" | "conservative" | "aggressive";
  "udp-mtu"?: number;
  "mux-option"?: ListenerMuxOption;
  "realm-opts"?: ListenerHysteria2RealmOption;
  "initial-stream-receive-window"?: number; // 8388608
  "max-stream-receive-window"?: number; // 8388608
  "initial-connection-receive-window"?: number; // 20971520
  "max-connection-receive-window"?: number; // 20971520
}

export interface MihomoTuicListener extends ListenerBaseOptions {
  type: "tuic";
  token?: string[]; // ["token1"]
  users?: Record<string, string>; // {"uuid": "password"}
  certificate: string; // "./server.crt"
  "private-key": string; // "./server.key"
  "client-auth-type"?:
    "" | "request" | "require-any" | "verify-if-given" | "require-and-verify";
  "client-auth-cert"?: string;
  "ech-key"?: string;
  "congestion-controller"?: "cubic" | "bbr" | "new_reno" | "bbr3";
  "max-idle-time"?: number;
  "authentication-timeout"?: number;
  alpn?: string[]; // ["h3"]
  "max-udp-relay-packet-size"?: number; // 1252
  cwnd?: number;
  "bbr-profile"?: "standard" | "conservative" | "aggressive";
  "mux-option"?: ListenerMuxOption;
}

export type MihomoListener =
  | MihomoVlessListener
  | MihomoTrojanListener
  | MihomoAnyTLSListener
  | MihomoMieruListener
  | MihomoHysteria2Listener
  | MihomoTuicListener;

export type MihomoListenerType = MihomoListener["type"];

export type MihomoVlessListenerDiff = Partial<MihomoVlessListener>;
export type MihomoTrojanListenerDiff = Partial<MihomoTrojanListener>;
export type MihomoAnyTLSListenerDiff = Partial<MihomoAnyTLSListener>;
export type MihomoMieruListenerDiff = Partial<MihomoMieruListener>;
export type MihomoHysteria2ListenerDiff = Partial<MihomoHysteria2Listener>;
export type MihomoTuicListenerDiff = Partial<MihomoTuicListener>;

export type MihomoListenerDiff =
  | MihomoVlessListenerDiff
  | MihomoTrojanListenerDiff
  | MihomoAnyTLSListenerDiff
  | MihomoMieruListenerDiff
  | MihomoHysteria2ListenerDiff
  | MihomoTuicListenerDiff;

export interface MihomoListenerStringified {
  name: string;
  type: "vless" | "trojan" | "anytls" | "mieru" | "hysteria2" | "tuic";
  typeSpecific: string;
}
