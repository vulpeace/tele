import {
  Body,
  Controller,
  Delete,
  Path,
  Post,
  Request,
  Route,
  Security,
  SuccessResponse,
} from "tsoa";
import { AdminPlaintext } from "@/src/interfaces/admin.js";
import { AuthService } from "@/src/routes/auth/authService.js";
import { Request as ExpressRequest } from "express";

@Route("auth")
export class AuthController extends Controller {
  @SuccessResponse("201", "Registered")
  @Post("register")
  public async register(
    @Body() credentials: AdminPlaintext
  ): Promise<void> {
    this.setStatus(201);
    await new AuthService().register(credentials);
  }

  @SuccessResponse("201", "Logged in")
  @Post("login")
  public async login(
    @Body() credentials: AdminPlaintext,
    @Request() req: ExpressRequest,
  ): Promise<string> {
    this.setStatus(201);
    const tokens = await new AuthService().login(credentials);

    const res = req.res;
    if (!res) {
      throw new Error("Cannot set refresh cookie: response unavailable");
    }
    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: true,
      path: "/api/auth/refresh",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return tokens.accessToken;
  }

  @Post("refresh")
  public async refresh(@Request() req: ExpressRequest): Promise<string> {
    this.setStatus(201);

    const refreshToken: string = req.cookies?.refreshToken;
    const accessToken = await new AuthService().refresh(refreshToken);

    return accessToken;
  }

  @SuccessResponse("204", "Deleted")
  @Delete("{username}")
  @Security("jwt")
  public async delete(@Path() username: string): Promise<void> {
    new AuthService().delete(decodeURIComponent(username));
  }
}
