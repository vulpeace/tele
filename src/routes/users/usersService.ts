import type { NewUser, User, UserDiff } from "@/src/interfaces/user.js";
import {
  createUser,
  deleteUser,
  getUserProxies,
  getUserListenersTransitive,
  getUsers,
  updateUser,
} from "@/src/db/users/index.js";
import { ValidateError } from "tsoa";
import { generateSubscriptionPath } from "@/src/util/subscriptionPath.js";
import { isUuidV4 } from "@/src/util/uuid.js";

function invalidUuid(): ValidateError {
  return new ValidateError(
    {
      uuid: {
        message: "Invalid UUIDv4",
      },
    },
    "Validation Failed",
  );
}

export class UsersService {
  public get(username?: string): User[] {
    const users = getUsers(username ? [username] : undefined);
    return users;
  }

  public async create(user: NewUser): Promise<string> {
    if (user.uuid && !isUuidV4(user.uuid)) {
      throw invalidUuid();
    }
    const path = generateSubscriptionPath();
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
    if (typeof payload.uuid === "string" && !isUuidV4(payload.uuid)) {
      throw invalidUuid();
    }
    updateUser(username, payload);
  }

  public getProxies(username: string) {
    return getUserProxies(username);
  }

  public getListeners(username: string) {
    return getUserListenersTransitive(username);
  }
}
