import type { NewUser, User, UserDiff } from "@/src/interfaces/user.js";
import {
  createUser,
  deleteUser,
  getUserListeners,
  getUsers,
  updateUser,
} from "@/src/db/users/index.js";
import { ValidateError } from "tsoa";
import { randomBytes } from "node:crypto";

export class UsersService {
  public get(username?: string): User[] {
    const users = getUsers(username ? [username] : undefined);
    return users;
  }

  public async create(user: NewUser): Promise<string> {
    const uuidv4Regexp =
      /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
    const uuid = user.uuid;
    if (uuid && !uuidv4Regexp.test(uuid)) {
      throw new ValidateError(
        {
          uuid: {
            message: "Invalid UUIDv4",
          },
        },
        "Validation Failed",
      );
    }
    const path = randomBytes(16).toString("base64");
    createUser({ ...user, path });
    return path;
  }

  public async delete(username: string): Promise<void> {
    deleteUser(username);
  }

  public update(username: string, payload: UserDiff): void {
    if (Object.keys(payload).length === 0) {
      throw new Error("Nothing to update");
    }
    updateUser(username, payload);
  }

  public getListeners(username: string) {
    return getUserListeners(username);
  }
}
