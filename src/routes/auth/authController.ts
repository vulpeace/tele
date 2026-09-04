import {
  Body,
  Controller,
  Delete,
  Get,
  Path,
  Post,
  Query,
  Request,
  Route,
  Security,
  SuccessResponse,
} from "tsoa";
import { AdminPlaintext } from "@/src/interfaces/admin.js";
import { AuthService } from "./authService.js";
import { Request as ExpressRequest } from "express";

@Route("auth")
export class AuthController extends Controller {
  @SuccessResponse("201", "Registered")
  @Post("register")
  public async register(
    @Body() credentials: AdminPlaintext,
    @Query() willDisable?: boolean,
  ): Promise<void> {
    this.setStatus(201);
    await new AuthService().register(credentials, willDisable);
  }

  @SuccessResponse("201", "Logged in")
  @Post("login")
  public async login(
    @Body() credentials: AdminPlaintext,
    @Request() req: ExpressRequest,
  ): Promise<string> {
    this.setStatus(201);
    const tokens = await new AuthService().login(credentials);

    req.res &&
      req.res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        secure: true,
        path: "/api/auth/refresh",
        maxAge: 86400000,
      });

    return tokens.accessToken;
  }

  @Get("refresh")
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
