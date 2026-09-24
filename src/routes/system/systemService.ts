import { version } from "@/src/app.js";
import { restartCore } from "@/src/coreManager/coreManager.js";

export class SystemService {
  public getVersion(): string {
    return version;
  }

  public async restartMihomo() {
    await restartCore();
  }
}
