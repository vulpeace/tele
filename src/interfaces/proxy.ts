export interface Proxy {
  name: string;
  type: "vless" | "trojan" | "anytls" | "mieru" | "hysteria2" | "tuic";
  [key: string]: unknown;
}

export interface ProxyStringified {
  name: string;
  type: "vless" | "trojan" | "anytls" | "mieru" | "hysteria2" | "tuic";
  typeSpecific: string;
}

export interface ProxyDiff {
  name?: string;
  [key: string]: unknown;
}
