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
import {
  BaseClientConfig,
  BaseClientConfigDiff
} from "@/src/interfaces/config.js";
import { ConfigsService } from "./configsService.js";

@Route("configs")
@Security("jwt")
export class ConfigController extends Controller {
  @Get("client")
  public getBaseClientConfig(): BaseClientConfig[] {
    return new ConfigsService().getClient();
  }

  @Get("client/{name}")
  public getBaseClientConfigByName(
    @Path() name: string
  ): BaseClientConfig {
    const result = new ConfigsService().getClient(name);
    if (result.length === 1) {
      return result[0];
    } else{
      throw new Error("Not Found");
    }
  }

  @SuccessResponse("201", "Created")
  @Post("client")
  public createBaseClientConfig(
    @Body() client: {
      name: string,
      config: BaseClientConfig
    }
  ): void {
    new ConfigsService().createClient(client.name, client.config);
    return;
  }

  @SuccessResponse("204", "Deleted")
  @Delete("client/{name}")
  public deleteBaseClientConfig(
    @Path() name: string
  ): void {
    new ConfigsService().deleteClient(name);
    return;
  }

  @SuccessResponse("200", "Updated")
  @Patch("client/{name}")
  public updateBaseClientConfig(
    @Path() name: string,
    @Body() payload: BaseClientConfigDiff
  ): void {
    new ConfigsService().updateClient(name, payload);
    return;
  }
}
