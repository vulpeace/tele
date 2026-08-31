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
import { NewUser, User, UserDiff } from "@/src/interfaces/user.js";
import { UsersService } from "./usersService.js";

@Route("users")
@Security("jwt")
export class UsersController extends Controller {
  @Get()
  public getUsers(): User[] {
    return new UsersService().get();
  }

  @SuccessResponse("201", "Created")
  @Post()
  public async createUser(
    @Body() user: NewUser
  ): Promise<string> {
    return await new UsersService().create(user);;
  }

  @SuccessResponse("204", "Deleted")
  @Delete("{username}")
  public deleteUser(
    @Path() username: string
  ): void {
    new UsersService().delete(username);
    return;
  }

  @SuccessResponse("200", "Updated")
  @Patch("{username}")
  public updateUser(
    @Path() username: string,
    @Body() payload: UserDiff
  ): void {
    new UsersService().update(username, payload);
    return;
  }
}
