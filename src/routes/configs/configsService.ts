import { BaseClientConfig, BaseClientConfigDiff } from "@/src/interfaces/config.js";
import { getBaseClientConfigs, createBaseClientConfig, updateBaseClientConfig, deleteBaseClientConfig } from "@/src/db/configs/index.js";

export class ConfigsService {
  public getClient(name?: string): BaseClientConfig[] {
    const configs = getBaseClientConfigs(name ? [name] : undefined);
    return configs;
  }

  public createClient(
    name: string,
    baseClientConfig: BaseClientConfig
  ) {
    return createBaseClientConfig({
      name,
      data: JSON.stringify(baseClientConfig)
    });
  }

  public deleteClient(name: string) {
    deleteBaseClientConfig(name);
  }

  public updateClient(
    name: string,
    payload: BaseClientConfigDiff
  ) {
    if (Object.keys(payload).length === 0) {
      throw new Error("Nothing to update");
    }
    updateBaseClientConfig(name, JSON.stringify(payload));
  }
}
