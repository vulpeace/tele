import { BaseClientConfigDiff, BaseClientConfigNamed } from "@/src/interfaces/config.js";
import { getBaseClientConfigs, createBaseClientConfig, updateBaseClientConfig, deleteBaseClientConfig } from "@/src/db/configs/index.js";

export class ConfigsService {
  public getClient(name?: string): BaseClientConfigNamed[] {
    const configs = getBaseClientConfigs(name ? [name] : undefined);
    return configs;
  }

  public createClient(config: BaseClientConfigNamed) {
    return createBaseClientConfig({
      name: config.name,
      data: JSON.stringify(config.data)
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
