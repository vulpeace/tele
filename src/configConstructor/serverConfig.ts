import { readFile, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";

export async function initializeServerConfig(serverConfigLocation: string) {
  const accessSecret = randomBytes(32).toString("base64");
  const refreshSecret = randomBytes(32).toString("base64");
  const mihomoSecret = randomBytes(32).toString("base64");

  const subscriptionPathInput = (process.env.SUBSCRIPTION_PATH ?? "/sub")
    .trim()
    .replace(/^["'`]+|["'`]+$/g, "");
  const subscriptionPath = subscriptionPathInput.match(
    /^(?:https?:\/\/[^\/\s?#]+)?\/?([^\s?#]*)$/,
  );
  if (!subscriptionPath) {
    throw new Error("Provided subscription path is invalid");
  }

  const config = {
    accessSecret,
    refreshSecret,
    mihomoSecret,
    subscriptionPath: subscriptionPath[1],
  };

  await writeFile(serverConfigLocation, JSON.stringify(config), "utf-8");
  return config;
}

export async function readServerConfig(serverConfigLocation: string) {
  const config = JSON.parse(await readFile(serverConfigLocation, "utf-8"));

  if (
    !config.accessSecret ||
    !config.refreshSecret ||
    !config.subscriptionPath
  ) {
    throw new Error("Missing fields in config");
  }
  return config;
}
