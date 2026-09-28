export type MihomoClientConfig = Record<string, unknown>;

export type MihomoClientConfigDiff = Record<string, unknown>;

export type MihomoServerConfig = Record<string, unknown>;

export type MihomoServerConfigDiff = Record<string, unknown>;

export interface MihomoClientConfigNamed {
  name: string;
  data: MihomoClientConfig;
}

export interface MihomoClientConfigStringified {
  name: string;
  data: string;
}
