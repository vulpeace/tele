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
import {
  MihomoListener,
  MihomoListenerDiff,
} from "@/src/interfaces/listener.js";
import { ListenersService } from "./listenersService.js";

@Route("listeners")
@Security("jwt")
export class ListenersController extends Controller {
  @Get("enabled")
  public getEnabled(): MihomoListener[] {
    return new ListenersService().getEnabled();
  }

  @Get()
  public getProxy(): MihomoListener[] {
    return new ListenersService().get();
  }

  @Get("{name}")
  public getListenerByName(@Path() name: string): MihomoListener {
    const result = new ListenersService().get(decodeURIComponent(name));
    if (result.length === 1) {
      return result[0];
    } else {
      throw new Error("Not Found");
    }
  }

  @SuccessResponse("201", "Created")
  @Post()
  public createListener(@Body() listener: MihomoListener) {
    new ListenersService().create(listener);
    return;
  }

  @SuccessResponse("204", "Deleted")
  @Delete("{name}")
  public async deleteListener(@Path() name: string): Promise<void> {
    await new ListenersService().delete(decodeURIComponent(name));
    return;
  }

  @SuccessResponse("200", "Updated")
  @Patch("{name}")
  public updateListener(
    @Path() name: string,
    @Body() payload: MihomoListenerDiff,
  ) {
    new ListenersService().update(decodeURIComponent(name), payload);
    return;
  }

  @Get("{listenerName}/proxies")
  public getProxies(@Path() listenerName: string) {
    return new ListenersService().getProxies(decodeURIComponent(listenerName));
  }

  @Get("{listenerName}/users")
  public getUsers(@Path() listenerName: string) {
    return new ListenersService().getUsers(decodeURIComponent(listenerName));
  }

  @SuccessResponse("200")
  @Post("{listenerName}/proxies")
  public addProxies(
    @Path() listenerName: string,
    @Body() proxyNames: string[],
  ) {
    new ListenersService().addProxies(
      decodeURIComponent(listenerName),
      proxyNames,
    );
    return;
  }

  @SuccessResponse("200")
  @Delete("{listenerName}/proxies")
  public removeProxies(
    @Path() listenerName: string,
    @Body() proxyNames: string[],
  ) {
    new ListenersService().removeProxies(
      decodeURIComponent(listenerName),
      proxyNames,
    );
    return;
  }

  @SuccessResponse("200")
  @Post("enable")
  public async enableListeners(@Body() names: string[]) {
    await new ListenersService().enable(names);
    return;
  }
}
