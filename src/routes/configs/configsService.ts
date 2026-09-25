import {
  MihomoClientConfigDiff,
  MihomoClientConfigNamed,
  MihomoServerConfig,
  MihomoServerConfigDiff,
} from "@/src/interfaces/config.js";
import {
  getBaseClientConfigs,
  createBaseClientConfig,
  updateBaseClientConfig,
  deleteBaseClientConfig,
} from "@/src/db/configs/index.js";
import {
  getMihomoConfig,
  updateMihomoConfig,
} from "@/src/configConstructor/serverConfig.js";

export class ConfigsService {
  public getClient(name?: string): MihomoClientConfigNamed[] {
    const configs = getBaseClientConfigs(name ? [name] : undefined);
    return configs;
  }

  public createClient(config: MihomoClientConfigNamed) {
    return createBaseClientConfig({
      name: config.name,
      data: JSON.stringify(config.data),
    });
  }

  public deleteClient(name: string) {
    deleteBaseClientConfig(name);
  }

  public updateClient(name: string, payload: MihomoClientConfigDiff) {
    if (Object.keys(payload).length === 0) {
      throw new Error("Nothing to update");
    }
    updateBaseClientConfig(name, payload);
  }

  public async getServer(): Promise<MihomoServerConfig> {
    return getMihomoConfig();
  }

  public async updateServer(payload: MihomoServerConfigDiff) {
    if (Object.keys(payload).length === 0) {
      throw new Error("Nothing to update");
    }
    await updateMihomoConfig(payload);
  }
}
