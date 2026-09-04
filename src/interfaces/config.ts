export interface MihomoFallbackFilter {
  geoip?: boolean; // true
  "geoip-code"?: string; // "CN"
  ipcidr?: string[]; // ["240.0.0.0/4"]
  domain?: string[]; // ["+.google.com"]
  geosite?: string[]; // ["gfw"]
}

export interface MihomoDnsConfig {
  enable?: boolean; // false
  "prefer-h3"?: boolean; // false
  ipv6?: boolean; // false
  "ipv6-timeout"?: number; // 100
  "use-hosts"?: boolean; // true
  "use-system-hosts"?: boolean; // true
  "respect-rules"?: boolean; // false
  nameserver?: string[]; // ["114.114.114.114", "tls://223.5.5.5:853", "https://doh.pub/dns-query"]
  fallback?: string[]; // ["tcp://1.1.1.1"]
  "fallback-filter"?: MihomoFallbackFilter;
  "fallback-lazy-query"?: boolean;
  listen?: string; // "0.0.0.0:53"
  "listen-routing-mark"?: number;
  "enhanced-mode"?: "normal" | "fake-ip" | "redir-host";
  "fake-ip-range"?: string; // "198.18.0.1/16"
  "fake-ip-range6"?: string; // "fdfe:dcba:9876::1/64"
  "fake-ip-filter"?: string[]; // ["*.lan", "localhost.ptlogin2.qq.com"]
  "fake-ip-filter-mode"?: "blacklist" | "whitelist" | "rule";
  "fake-ip-ttl"?: number; // 1
  "default-nameserver"?: string[]; // ["114.114.114.114"]
  "cache-algorithm"?: "arc" | "lru";
  "cache-max-size"?: number;
  "nameserver-policy"?: Record<string, string | string[]>; // {"geosite:cn": "114.114.114.114"}
  "proxy-server-nameserver"?: string[]; // ["https://doh.pub/dns-query"]
  "proxy-server-nameserver-policy"?: Record<string, string | string[]>;
  "direct-nameserver"?: string[]; // ["system://"]
  "direct-nameserver-follow-policy"?: boolean;
}

export interface MihomoProfileConfig {
  "store-selected"?: boolean; // false
  "store-fake-ip"?: boolean; // true
}

export interface MihomoGeoXUrlConfig {
  geoip?: string; // "https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geoip.dat"
  geosite?: string; // "https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geosite.dat"
  mmdb?: string; // "https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geoip.metadb"
  asn?: string; // "https://fastly.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/GeoLite2-ASN.mmdb"
}

export interface MihomoSniffingConfig {
  ports?: string[]; // ["80", "8080-8880"]
  "override-destination"?: boolean;
}

export interface MihomoSnifferConfig {
  enable?: boolean; // false
  "override-destination"?: boolean;
  sniffing?: string[]; // ["tls", "http"]
  "force-domain"?: string[]; // ["+.v2ex.com"]
  "skip-src-address"?: string[]; // ["192.168.0.3/32"]
  "skip-dst-address"?: string[]; // ["192.168.0.3/32"]
  "skip-domain"?: string[]; // ["Mijia Cloud"]
  ports?: string[]; // ["80", "443"]
  "port-whitelist"?: string[]; // ["80", "443"]
  "force-dns-mapping"?: boolean; // true
  "parse-pure-ip"?: boolean; // true
  sniff?: Record<string, MihomoSniffingConfig>; // {"TLS": {"ports": [443]}, "HTTP": {"ports": [80]}}
}

export interface MihomoCorsConfig {
  "allow-origins"?: string[]; // ["*"]
  "allow-private-network"?: boolean; // true
}

export interface MihomoClashForAndroidConfig {
  "append-system-dns"?: boolean;
  "ui-subtitle-pattern"?: string;
}

export interface MihomoTunConfig {
  enable?: boolean; // false
  device?: string;
  stack?: "gvisor" | "system" | "mixed" | "gVisor" | "System" | "Mixed";
  "dns-hijack"?: string[]; // ["0.0.0.0:53"]
  "auto-route"?: boolean; // true
  "auto-detect-interface"?: boolean; // true
  mtu?: number; // 9000
  gso?: boolean; // false
  "gso-max-size"?: number; // 65536
  "inet6-address"?: string[]; // ["fdfe:dcba:9876::1/126"]
  "iproute2-table-index"?: number;
  "iproute2-rule-index"?: number;
  "auto-redirect"?: boolean; // false
  "auto-redirect-input-mark"?: number;
  "auto-redirect-output-mark"?: number;
  "auto-redirect-iproute2-fallback-rule-index"?: number;
  "loopback-address"?: string[]; // ["1.1.1.1"]
  "strict-route"?: boolean; // true
  "route-address"?: string[]; // ["0.0.0.0/1"]
  "route-address-set"?: string[]; // ["ruleset-1"]
  "route-exclude-address"?: string[]; // ["192.168.0.0/24"]
  "route-exclude-address-set"?: string[]; // ["ruleset-3"]
  "include-interface"?: string[]; // ["lan0"]
  "exclude-interface"?: string[]; // ["lan1"]
  "include-uid"?: number[]; // [0]
  "include-uid-range"?: string[]; // ["1000:9999"]
  "exclude-uid"?: number[]; // [1000]
  "exclude-uid-range"?: string[]; // ["1000:9999"]
  "exclude-src-port"?: number[];
  "exclude-src-port-range"?: string[];
  "exclude-dst-port"?: number[];
  "exclude-dst-port-range"?: string[];
  "include-android-user"?: number[]; // [0]
  "include-package"?: string[]; // ["com.android.chrome"]
  "exclude-package"?: string[]; // ["com.android.captiveportallogin"]
  "include-mac-address"?: string[];
  "exclude-mac-address"?: string[];
  "endpoint-independent-nat"?: boolean; // false
  "udp-timeout"?: number; // 300
  "icmp-timeout"?: number;
  "disable-icmp-forwarding"?: boolean;
  "file-descriptor"?: number;
  "inet4-route-address"?: string[]; // ["0.0.0.0/1"]
  "inet6-route-address"?: string[]; // ["::/1"]
  "inet4-route-exclude-address"?: string[];
  "inet6-route-exclude-address"?: string[];
  recvmsgx?: boolean; // true
  sendmsgx?: boolean; // false
}

export interface MihomoTunnelConfig {
  network?: string[]; // ["tcp", "udp"]
  address?: string; // "127.0.0.1:7777"
  target?: string; // "target.com"
  proxy?: string; // "proxy"
}

export interface MihomoClientConfig {
  port?: number; // 7890
  "socks-port"?: number; // 7891
  "redir-port"?: number; // 7892
  "tproxy-port"?: number; // 7893
  "mixed-port"?: number; // 10801
  "ss-config"?: string;
  "vmess-config"?: string;
  "inbound-tfo"?: boolean;
  "inbound-mptcp"?: boolean;
  authentication?: string[]; // ["username:password"]
  "skip-auth-prefixes"?: string[]; // ["127.0.0.1/8"]
  "lan-allowed-ips"?: string[]; // ["0.0.0.0/0"]
  "lan-disallowed-ips"?: string[]; // ["192.168.0.3/32"]
  "allow-lan"?: boolean; // true
  "bind-address"?: string; // "*"
  mode?: "rule" | "global" | "direct";
  "unified-delay"?: boolean;
  "log-level"?: "silent" | "error" | "warning" | "info" | "debug";
  ipv6?: boolean; // true
  "external-controller"?: string; // "0.0.0.0:9093"
  "external-controller-routing-mark"?: number;
  "external-controller-pipe"?: string; // "\\\\.\\pipe\\mihomo"
  "external-controller-unix"?: string; // "mihomo.sock"
  "external-controller-tls"?: string; // "0.0.0.0:9443"
  "external-controller-cors"?: MihomoCorsConfig;
  "external-ui"?: string; // "/path/to/ui/folder/"
  "external-ui-url"?: string; // "https://github.com/MetaCubeX/metacubexd/archive/refs/heads/gh-pages.zip"
  "external-ui-name"?: string; // "xd"
  "external-doh-server"?: string; // "/dns-query"
  secret?: string; // "123456"
  "interface-name"?: string; // "en0"
  "routing-mark"?: number; // 6666
  tunnels?: MihomoTunnelConfig[]; // [{"network": ["tcp"], "address": "127.0.0.1:7777"}]
  "geo-auto-update"?: boolean; // false
  "geo-update-interval"?: number; // 24
  "geodata-mode"?: boolean;
  "geodata-loader"?: "standard" | "memconservative" | "memc";
  "geosite-matcher"?: "succinct" | "mph" | "hybrid";
  "tcp-concurrent"?: boolean;
  "find-process-mode"?: "always" | "strict" | "off";
  "global-client-fingerprint"?: string;
  "global-ua"?: string; // "clash.meta/1.0"
  "etag-support"?: boolean; // true
  "keep-alive-idle"?: number; // 15
  "keep-alive-interval"?: number; // 15
  "disable-keep-alive"?: boolean;
  "proxy-providers"?: Record<string, Record<string, any>>;
  "rule-providers"?: Record<string, Record<string, any>>;
  "proxy-groups"?: Record<string, any>[];
  rules?: string[]; // ["DOMAIN,example.com,DIRECT"]
  "sub-rules"?: Record<string, string[]>;
  hosts?: Record<string, string | string[]>; // {"*.mihomo.dev": "127.0.0.1"}
  dns?: MihomoDnsConfig;
  tun?: MihomoTunConfig;
  profile?: MihomoProfileConfig;
  "geox-url"?: MihomoGeoXUrlConfig;
  sniffer?: MihomoSnifferConfig;
  "clash-for-android"?: MihomoClashForAndroidConfig;
}

export type MihomoClientConfigDiff = Partial<MihomoClientConfig>;

export interface MihomoClientConfigNamed {
  name: string;
  data: MihomoClientConfig;
}

export interface MihomoClientConfigStringified {
  name: string;
  data: string;
}
