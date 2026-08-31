import type { NewUser, User, UserDiff } from "@/src/interfaces/user.js";
import { hash } from "bcryptjs";
import { createUser, deleteUser, getUserListeners, getUsers, updateUser } from "@/src/db/users/index.js";
import { addListenersToConfig } from "@/src/configConstructor/mihomoConfig.js";
import { getListeners } from "@/src/db/listeners/index.js";
import { ValidateError } from "tsoa";

export class UsersService {
  public get(username?: string): User[] {
    const users = getUsers(username ? [username] : undefined);
    return users;
  }

  public async create(user: NewUser): Promise<string> {
    const uuidv4Regexp = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
    const uuid = user.uuid;
    if (uuid && !uuidv4Regexp.test(uuid))
    {
      throw new ValidateError({ uuid: {
        message: "Invalid UUIDv4"
      }}, "Validation Failed");
    }
    const path = btoa(await hash(user.name + Date.now(), 10));
    createUser({ ...user, path });
    return path;
  }

  public async delete(username: string): Promise<void> {
    const listenerNames = getUserListeners(username);
    deleteUser(username);
    const listeners = getListeners(listenerNames);
    await addListenersToConfig(listeners);
  }

  public update(
    username: string,
    payload: UserDiff
  ): void {
    if (Object.keys(payload).length === 0) {
      throw new Error("Nothing to update");
    }
    updateUser(username, payload);
  }
}
