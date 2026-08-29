import type { NewUser, User, UserDiff } from "@/src/interfaces/user.js";
import { validate } from "uuid";
import { createUser, deleteUser, getUserListeners, getUsers, updateUser } from "@/src/db/users/index.js";
import { addListenersToConfig } from "@/src/configConstructor/mihomoConfig.js";
import { getListeners } from "@/src/db/listeners/index.js";

export class UsersService {
  public get(): User[] {
    const users = getUsers(undefined);
    return users;
  }

  public create(user: NewUser): string {
    const uuid = user.uuid;
    if (uuid && !validate(uuid))
    {
      throw new Error(`Invalid UUIDv4 for ${user.name}`);
    }
    const userPath = createUser(user);
    return userPath;
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
