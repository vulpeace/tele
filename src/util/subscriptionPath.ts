import { randomBytes } from "node:crypto";

const pattern = /^[A-Za-z0-9_-]{22}$/;

export function generateSubscriptionPath(): string {
  return randomBytes(16).toString("base64url");
}

export function isValidSubscriptionPath(value: string): boolean {
  return pattern.test(value);
}
