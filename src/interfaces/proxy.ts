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
