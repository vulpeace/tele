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
    "^/api/core": "",
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
    (typeof req.query.config === "string" || !req.query.config)
  ) {
    const path = decodeURIComponent(req.params.path);
    if (path.length !== 24) {
      res.status(400).send();
      return;
    }

    res.contentType("application/yaml");
    try {
      const configName = req.query.config
        ? decodeURIComponent(req.query.config)
        : "";
      res.send(stringify(constructSubscription(path, configName)));
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
