import { Controller, Get, Route, Security } from "tsoa";
import { SystemService } from "./systemService.js";

@Route("system")
@Security("jwt")
export class SystemController extends Controller {
  @Get("version")
  public getVersion(): string {
    return new SystemService().getVersion();
  }
}
