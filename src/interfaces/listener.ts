export interface Listener {
  name: string;
  type: "vless" | "trojan" | "anytls" | "mieru" | "hysteria2" | "tuic";
  [key: string]: unknown;
}

export interface ListenerDiff {
  name?: string;
  [key: string]: unknown;
}

export interface ListenerStringified {
  name: string;
  type: "vless" | "trojan" | "anytls" | "mieru" | "hysteria2" | "tuic";
  typeSpecific: string;
}
