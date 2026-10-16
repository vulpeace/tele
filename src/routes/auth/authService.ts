import { AdminPlaintext } from "@/src/interfaces/admin.js";
import { compare, genSalt, hash } from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import {
  getAdminCount,
  getAdmin,
  addAdmin,
  addAdminSession,
  deleteAdminSession,
  deleteAllAdminSessions,
  deleteAdmin,
  getAdminSession,
} from "@/src/db/auth/index.js";
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
    const admin = getAdmin();
    if (
      !admin ||
      admin.username !== credentials.username ||
      !(await compare(credentials.password, admin.pwdHash))
    ) {
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
    addAdminSession(tokenId);
    return { accessToken, refreshToken };
  }

  public async register(credentials: AdminPlaintext) {
    if (getAdminCount() > 0) {
      throw new Error("Registration not allowed");
    }

    assertPasswordPolicy(credentials.password);

    const salt = await genSalt(10);
    const pwdHash = await hash(credentials.password, salt);
    addAdmin({
      username: credentials.username,
      pwdHash: pwdHash,
    });
  }

  public async refresh(refreshToken: string) {
    const { payload } = await jwtVerify(refreshToken, refreshSecret);
    if (!payload.jti || typeof payload.jti !== "string") {
      throw new Error("Invalid token");
    }

    const session = getAdminSession(payload.jti);
    if (!session) {
      throw new Error("Invalid token");
    }

    const admin = getAdmin();
    if (!admin) {
      throw new Error("Invalid token");
    }

    const newTokenId = crypto.randomUUID();
    const newRefreshToken = await new SignJWT({ sub: admin.username })
      .setProtectedHeader({ alg: "HS256" })
      .setJti(newTokenId)
      .setIssuedAt()
      .setExpirationTime("1d")
      .sign(refreshSecret);

    deleteAdminSession(payload.jti);
    addAdminSession(newTokenId);

    const accessToken = await new SignJWT({ sub: admin.username })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(accessSecret);

    return { accessToken, refreshToken: newRefreshToken };
  }

  public delete(username: string) {
    const admin = getAdmin();
    if (!admin || admin.username !== username) {
      throw new Error("Not Found");
    }
    deleteAllAdminSessions();
    deleteAdmin(username);
  }
}
