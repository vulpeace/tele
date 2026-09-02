export interface BaseClientConfig {
  sniffer: {
    enable: boolean;
    [key: string]: unknown;
  };
  tun: {
    enable: boolean;
    [key: string]: unknown;
  };
  dns: {
    enable: boolean;
    [key: string]: unknown;
  };
  rules: string[];
  [key: string]: unknown;
}

export interface BaseClientConfigDiff {
  sniffer?: {
    enable?: boolean;
    [key: string]: unknown;
  };
  tun?: {
    enable?: boolean;
    [key: string]: unknown;
  };
  dns?: {
    enable?: boolean;
    [key: string]: unknown;
  };
  rules?: string[];
  [key: string]: unknown;
}

export interface BaseClientConfigStringified {
  name: string;
  data: string;
}

export interface SubscriptionParts {
  proxyName: string;
  type: string;
  typeSpecific: string;
  groupName: string;
  userName: string;
  uuid: string | null;
  flow: string | null;
  password: string | null;
}
