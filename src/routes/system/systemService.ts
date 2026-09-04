import { version } from "@/src/app.js";

export class SystemService {
  public getVersion(): string {
    return version;
  }
}
