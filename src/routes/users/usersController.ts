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
import { NewUser, User, UserDiff } from "@/src/interfaces/user.js";
import { UsersService } from "./usersService.js";

@Route("users")
@Security("jwt")
export class UsersController extends Controller {
  @Get()
  public getUser(): User[] {
    return new UsersService().get();
  }

  @Get("{username}")
  public getUserByName(@Path() username: string): User {
    const result = new UsersService().get(decodeURIComponent(username));
    if (result.length === 1) {
      return result[0];
    } else {
      throw new Error("Not Found");
    }
  }

  @SuccessResponse("201", "Created")
  @Post()
  public async createUser(@Body() user: NewUser): Promise<string> {
    return await new UsersService().create(user);
  }

  @SuccessResponse("204", "Deleted")
  @Delete("{username}")
  public deleteUser(@Path() username: string): void {
    new UsersService().delete(decodeURIComponent(username));
    return;
  }

  @SuccessResponse("200", "Updated")
  @Patch("{username}")
  public updateUser(@Path() username: string, @Body() payload: UserDiff): void {
    new UsersService().update(decodeURIComponent(username), payload);
    return;
  }

  @Get("{username}/listeners")
  public getListeners(@Path() username: string) {
    return new UsersService().getListeners(decodeURIComponent(username));
  }
}
