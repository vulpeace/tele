import { Controller, Get, Post, Route, Security } from "tsoa";
import { SystemService } from "./systemService.js";

@Route("system")
@Security("jwt")
export class SystemController extends Controller {
  @Get("version")
  public getVersion(): string {
    return new SystemService().getVersion();
  }

  @Post("restart")
  public async restartMihomo(): Promise<void> {
    await new SystemService().restartMihomo();
  }
}
