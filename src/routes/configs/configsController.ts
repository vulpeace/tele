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
  MihomoClientConfigDiff,
  MihomoClientConfigNamed,
} from "@/src/interfaces/config.js";
import { ConfigsService } from "./configsService.js";

@Route("configs")
@Security("jwt")
export class ConfigController extends Controller {
  @Get("client")
  public getBaseClientConfig(): MihomoClientConfigNamed[] {
    return new ConfigsService().getClient();
  }

  @Get("client/{name}")
  public getBaseClientConfigByName(
    @Path() name: string,
  ): MihomoClientConfigNamed {
    const result = new ConfigsService().getClient(decodeURIComponent(name));
    if (result.length === 1) {
      return result[0];
    } else {
      throw new Error("Not Found");
    }
  }

  @SuccessResponse("201", "Created")
  @Post("client")
  public createBaseClientConfig(@Body() config: MihomoClientConfigNamed): void {
    new ConfigsService().createClient(config);
    return;
  }

  @SuccessResponse("204", "Deleted")
  @Delete("client/{name}")
  public deleteBaseClientConfig(@Path() name: string): void {
    new ConfigsService().deleteClient(decodeURIComponent(name));
    return;
  }

  @SuccessResponse("200", "Updated")
  @Patch("client/{name}")
  public updateBaseClientConfig(
    @Path() name: string,
    @Body() payload: MihomoClientConfigDiff,
  ): void {
    new ConfigsService().updateClient(decodeURIComponent(name), payload);
    return;
  }
}
