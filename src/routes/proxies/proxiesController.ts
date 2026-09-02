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
  public getProxy(): Proxy[] {
    return new ProxiesService().get();
  }

  @Get("{name}")
  public getProxyByName(
    @Path() name: string
  ): Proxy {
    const result = new ProxiesService().get(name);
    if (result.length === 1) {
      return result[0];
    } else{
      throw new Error("Not Found");
    }
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

  @SuccessResponse("201", "Created")
  @Post("{name}/groups")
  public addProxyToGroups(
    @Path() name: string,
    @Body() groupNames: string[]
  ): void {
    if (groupNames.length === 0) {
      throw new Error("No groups to add to");
    }

    new ProxiesService().addToGroups(name, groupNames);
    return;
  }

  @SuccessResponse("204", "Deleted")
  @Delete("{name}/groups")
  public removeProxyFromGroups(
    @Path() name: string,
    @Body() groupNames: string[]
  ): void {
    if (groupNames.length === 0) {
      throw new Error("No groups to remove from");
    }

    new ProxiesService().removeFromGroups(name, groupNames);
    return;
  }
}
