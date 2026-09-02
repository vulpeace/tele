import { createProxyMiddleware } from "http-proxy-middleware";
import type { Request, Response, NextFunction } from "express";
import { expressAuthentication } from "../authentication.js";
import { stringify } from "yaml";
import { constructClientConfig } from "@/src/configConstructor/clientConfig.js";
import { mihomoSecret } from "../app.js";

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await expressAuthentication(req);
    next();
  } catch (e: any) {
    res.status(401).json({
      message: `Unauthorized: ${e.message}`,
    });
  }
}

export const proxyMiddleware = createProxyMiddleware<Request, Response>({
  target: "http://127.0.0.1:9090/",
  changeOrigin: true,
  pathRewrite: {
    "^/core": "",
  },
  on: {
    proxyReq: (proxyReq) => {
      proxyReq.setHeader("Authorization", `Bearer ${mihomoSecret}`);
    },
  },
});

export async function clientConfigMiddleware(
  req: Request,
  res: Response,
): Promise<void> {
  if (req.method === "GET") {
    const rawPath = req.path || req.originalUrl.split("?")[0].split("#")[0];
    const path = rawPath.replace(/^\//, "").split("/")[0].trim();
    res.contentType("application/yaml");
    try {
      if (!path) throw new Error("Not found");
      res.send(stringify(constructClientConfig(path)));
    } catch (e: any) {
      if (e.message === "Not found") {
        res.status(404).send({
          message: "Not Found",
        });
      } else {
        res.status(500).send({
          message: "Internal Server Error",
        });
      }
    }
  } else {
    res.status(404).send({
      message: "Not Found",
    });
  }
}
