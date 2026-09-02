import { createProxyMiddleware } from "http-proxy-middleware";
import type { Request, Response, NextFunction } from "express";
import { expressAuthentication } from "../authentication.js";
import { stringify } from "yaml";
import { constructSubscription } from "@/src/configConstructor/clientConfig.js";
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

export async function subscriptionMiddleware(
  req: Request,
  res: Response,
): Promise<void> {
  if (
    req.method === "GET" &&
    typeof req.params.path === "string" &&
    req.params.path.length >= 24
  ) {
    res.contentType("application/yaml");
    try {
      res.send(stringify(constructSubscription(req.params.path)));
    } catch (e: any) {
      if (e.message === "Not Found") {
        res.status(404).send();
      } else {
        console.error(e.message);
        res.status(500).send();
      }
    }
  } else {
    res.status(400).send();
  }
}
