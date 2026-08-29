import { jwtVerify } from "jose";
import { Request as ExpressRequest } from "express";
import { accessSecret } from "./app.js";

export async function expressAuthentication(
  request: ExpressRequest,
): Promise<any> {
  const authHeader = request.headers["authorization"];
  try {
    if (typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
      throw new Error("Invalid Authorization header");
    }

    const token = authHeader.split(" ")[1];

    try {
      const { payload } = await jwtVerify(token, accessSecret);
      return Promise.resolve(payload);
    } catch (e) {
      throw new Error("Invalid token");
    }
  } catch (e: any) {
    return Promise.reject(e);
  }
}
