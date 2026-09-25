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
  Security,
} from "tsoa";
import { MihomoProxy, MihomoProxyDiff } from "@/src/interfaces/proxy.js";
import { ProxiesService } from "./proxiesService.js";

@Route("proxies")
@Security("jwt")
export class ProxiesController extends Controller {
  @Get()
  public getProxy(): MihomoProxy[] {
    return new ProxiesService().get();
  }

  @Get("{name}")
  public getProxyByName(@Path() name: string): MihomoProxy {
    const result = new ProxiesService().get(decodeURIComponent(name));
    if (result.length === 1) {
      return result[0];
    } else {
      throw new Error("Not Found");
    }
  }

  @SuccessResponse("201", "Created")
  @Post()
  public createProxy(@Body() proxy: MihomoProxy): void {
    new ProxiesService().create(proxy);
    return;
  }

  @SuccessResponse("204", "Deleted")
  @Delete("{name}")
  public deleteProxy(@Path() name: string): void {
    new ProxiesService().delete(decodeURIComponent(name));
    return;
  }

  @SuccessResponse("200", "Updated")
  @Patch("{name}")
  public updateProxy(
    @Path() name: string,
    @Body() payload: MihomoProxyDiff,
  ): void {
    new ProxiesService().update(decodeURIComponent(name), payload);
    return;
  }

  @Get("{name}/users")
  public getProxyUsers(@Path() name: string) {
    return new ProxiesService().getUsers(decodeURIComponent(name));
  }

  @SuccessResponse("200")
  @Post("{name}/users")
  public addProxyUsers(
    @Path() name: string,
    @Body() usernames: string[],
  ): void {
    new ProxiesService().addUsers(decodeURIComponent(name), usernames);
    return;
  }

  @SuccessResponse("200")
  @Delete("{name}/users")
  public removeProxyUsers(
    @Path() name: string,
    @Body() usernames: string[],
  ): void {
    new ProxiesService().removeUsers(decodeURIComponent(name), usernames);
    return;
  }

  @Get("{name}/listeners")
  public getProxyListeners(@Path() name: string) {
    return new ProxiesService().getListeners(decodeURIComponent(name));
  }

  @SuccessResponse("200")
  @Post("{name}/listeners")
  public addProxyListeners(
    @Path() name: string,
    @Body() listenerNames: string[],
  ): void {
    new ProxiesService().addListeners(decodeURIComponent(name), listenerNames);
    return;
  }

  @SuccessResponse("200")
  @Delete("{name}/listeners")
  public removeProxyListeners(
    @Path() name: string,
    @Body() listenerNames: string[],
  ): void {
    new ProxiesService().removeListeners(
      decodeURIComponent(name),
      listenerNames,
    );
    return;
  }

  @Get("{name}/groups")
  public getProxyGroups(@Path() name: string): string[] {
    return new ProxiesService().getGroups(decodeURIComponent(name));
  }

  @SuccessResponse("201", "Created")
  @Post("{name}/groups")
  public addProxyToGroups(
    @Path() name: string,
    @Body() groupNames: string[],
  ): void {
    if (groupNames.length === 0) {
      throw new Error("No groups to add to");
    }

    new ProxiesService().addToGroups(decodeURIComponent(name), groupNames);
    return;
  }

  @SuccessResponse("204", "Deleted")
  @Delete("{name}/groups")
  public removeProxyFromGroups(
    @Path() name: string,
    @Body() groupNames: string[],
  ): void {
    if (groupNames.length === 0) {
      throw new Error("No groups to remove from");
    }

    new ProxiesService().removeFromGroups(decodeURIComponent(name), groupNames);
    return;
  }
}
