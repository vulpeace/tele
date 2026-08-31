import "dotenv/config";
import express, {
  Request,
  Response,
  NextFunction,
  urlencoded,
  json,
} from "express";
import { ValidateError } from "tsoa";
import { ValidateError as RuntimeValidateError } from "@tsoa/runtime";
import cookieParser from "cookie-parser";
import { RegisterRoutes } from "../routes/routes.js";
import {
  authMiddleware,
  proxyMiddleware,
  clientConfigMiddleware,
} from "./middleware/middleware.js";
import { initializeCore } from "./coreManager/coreManager.js";
import { initializeWorkingDir } from "./initializeWorkingDir.js";
import { ChildProcessWithoutNullStreams } from "node:child_process";

export let mihomo: ChildProcessWithoutNullStreams;
export let mihomoConfigLocation: string, serverConfigLocation: string;
export let accessSecret: Uint8Array, refreshSecret: Uint8Array;
let subscriptionPath: string;

try {
  const workingDir = await initializeWorkingDir();
  mihomoConfigLocation = workingDir.mihomoConfigLocation;
  serverConfigLocation = workingDir.serverConfigLocation;
  accessSecret = workingDir.accessSecret;
  refreshSecret = workingDir.refreshSecret;
  subscriptionPath = workingDir.subscriptionPath;
  mihomo = await initializeCore(workingDir.executable, mihomoConfigLocation);
} catch (e: any) {
  console.error(e.message);
  process.exit(1);
}

mihomo.stdout.on("data", (data) => {
  console.log(data.toString());
});

export const app = express();

app.use("/core", authMiddleware, proxyMiddleware);
app.use(`/${subscriptionPath.replace(/^\//, "")}`, clientConfigMiddleware);
app.use(
  urlencoded({
    extended: true,
  }),
);
app.use(json());
app.use(cookieParser());
RegisterRoutes(app);

app.use(function notFoundHandler(_req, res: Response) {
  res.status(404).send({
    message: "Not Found",
  });
});

app.use(function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): Response | void {
  if (
    err instanceof ValidateError ||
    err instanceof RuntimeValidateError ||
    (err as any)?.name === "ValidateError"
  ) {
    return res.status(422).json({
      message: "Validation Failed",
      details: (err as any)?.fields,
    });
  }
  if (err instanceof Error) {
    const status = (err as any).status;
    if (status === 401) {
      return res.status(401).send();
    }
    if (err.message === "Not Found") {
      return res.status(404).send();
    }
    return res.status(500).json({
      message: err.message,
    });
  }

  next();
});
