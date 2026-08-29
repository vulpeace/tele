import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Path,
  Post,
  Route,
  SuccessResponse,
  Security
} from "tsoa";
import { Proxy, ProxyDiff } from "@/src/interfaces/proxy.js";
import { ProxiesService } from "./proxiesService.js";

@Route("proxies")
@Security("jwt")
export class ProxiesController extends Controller {
  @Get()
  public getProxies(): Proxy[] {
    return new ProxiesService().get();
  }

  @SuccessResponse("201", "Created")
  @Post()
  public createProxy(
    @Body() proxy: Proxy
  ): void {
    new ProxiesService().create(proxy);
    return;
  }

  @SuccessResponse("204", "Deleted")
  @Delete("{name}")
  public deleteProxy(
    @Path() name: string
  ): void {
    new ProxiesService().delete(name);
    return;
  }

  @SuccessResponse("200", "Updated")
  @Patch("{name}")
  public updateProxy(
    @Path() name: string,
    @Body() payload: ProxyDiff
  ): void {
    new ProxiesService().update(name, payload);
    return;
  }
}
