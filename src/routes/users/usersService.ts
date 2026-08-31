import type { NewUser, User, UserDiff } from "@/src/interfaces/user.js";
import { validate } from "uuid";
import { hash } from "bcryptjs";
import { createUser, deleteUser, getUserListeners, getUsers, updateUser } from "@/src/db/users/index.js";
import { addListenersToConfig } from "@/src/configConstructor/mihomoConfig.js";
import { getListeners } from "@/src/db/listeners/index.js";

export class UsersService {
  public get(username?: string): User[] {
    const users = getUsers(username ? [username] : undefined);
    return users;
  }

  public async create(user: NewUser): Promise<string> {
    const uuid = user.uuid;
    if (uuid && !validate(uuid))
    {
      throw new Error(`Invalid UUIDv4 for ${user.name}`);
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
