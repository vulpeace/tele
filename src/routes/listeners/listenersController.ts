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
import { Listener, ListenerDiff } from "@/src/interfaces/listener.js";
import { ListenersService } from "./listenersService.js";

@Route("listeners")
@Security("jwt")
export class ListenersController extends Controller {
  @Get()
  public async getListeners(): Promise<Listener[]> {
    return new ListenersService().get();
  }

  @SuccessResponse("201", "Created")
  @Post()
  public async createListener(
    @Body() listener: Listener
  ): Promise<void> {
    await new ListenersService().create(listener);
    return;
  }

  @SuccessResponse("204", "Deleted")
  @Delete("{listenerName}")
  public async deleteListener(
    @Path() listenerName: string
  ): Promise<void> {
    await new ListenersService().delete(listenerName);
    return;
  }

  @SuccessResponse("200", "Updated")
  @Patch("{listenerName}")
  public async updateListener(
    @Path() listenerName: string,
    @Body() payload: ListenerDiff
  ) {
    await new ListenersService().update(listenerName, payload);
    return;
  }

  @SuccessResponse("200")
  @Patch("{listenerName}/users")
  public async addUsers(
    @Path() listenerName: string,
    @Body() usernames: string[]
  ) {
    await new ListenersService().addUsers(decodeURIComponent(listenerName), usernames);
    return;
  }

  @SuccessResponse("200")
  @Patch("{listenerName}/enable")
  public async enableListener(
    @Path() listenerName: string,
  ) {
    await new ListenersService().enable([decodeURIComponent(listenerName)]);
    return;
  }
}