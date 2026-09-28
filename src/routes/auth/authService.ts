import { AdminPlaintext } from "@/src/interfaces/admin.js";
import { compare, genSalt, hash } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { getAdmin, addAdmin, deleteAdmin } from "@/src/db/auth/index.js";
import { associateTokenId } from "@/src/db/auth/index.js";
import { readFile, writeFile } from "node:fs/promises";
import { serverConfigLocation } from "@/src/app.js";
import { accessSecret, refreshSecret } from "@/src/app.js";

const MIN_PASSWORD_LENGTH = 12;
const MAX_PASSWORD_BYTES = 72;

function assertPasswordPolicy(password: string): void {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`,
    );
  }
  if (Buffer.byteLength(password, "utf-8") > MAX_PASSWORD_BYTES) {
    throw new Error(
      `Password must be at most ${MAX_PASSWORD_BYTES} bytes long`,
    );
  }
  if (!/^[\x20-\x7e]+$/.test(password)) {
    throw new Error("Password must contain only printable ASCII characters");
  }
}

export class AuthService {
  public async login(credentials: AdminPlaintext) {
    const admin = getAdmin(credentials.username, null);
    if (!admin || !(await compare(credentials.password, admin.pwdHash))) {
      throw new Error("Invalid credentials");
    }

    const accessToken = await new SignJWT({ sub: credentials.username })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(accessSecret);

    const tokenId = crypto.randomUUID();
    const refreshToken = await new SignJWT({ sub: credentials.username })
      .setProtectedHeader({ alg: "HS256" })
      .setJti(tokenId)
      .setIssuedAt()
      .setExpirationTime("1d")
      .sign(refreshSecret);
    associateTokenId(credentials.username, tokenId);
    return { accessToken, refreshToken };
  }

  public async register(credentials: AdminPlaintext) {
    let config = JSON.parse(
      await readFile(serverConfigLocation, { encoding: "utf-8" }),
    );
    if (config && config.allowRegistration === false) {
      throw new Error("Registration not allowed");
    }

    assertPasswordPolicy(credentials.password);

    const salt = await genSalt(10);
    const pwdHash = await hash(credentials.password, salt);
    addAdmin({
      username: credentials.username,
      pwdHash: pwdHash,
    });

    config.allowRegistration = false;
    await writeFile(serverConfigLocation, JSON.stringify(config));
  }

  public async refresh(refreshToken: string) {
    const { payload } = await jwtVerify(refreshToken, refreshSecret);
    if (!payload.jti) throw new Error("Invalid token ID");

    const admin = getAdmin(null, payload.jti);
    const username = admin.username;

    const accessToken = await new SignJWT({ sub: username })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(accessSecret);

    return accessToken;
  }

  public delete(username: string) {
    deleteAdmin(username);
  }
}
