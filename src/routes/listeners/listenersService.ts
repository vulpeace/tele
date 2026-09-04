import {
  MihomoListener,
  MihomoListenerDiff,
} from "@/src/interfaces/listener.js";
import {
  getListeners,
  createListener,
  addUsersToListener,
  deleteListener,
  updateListener,
  removeUsersFromListener,
  getListenerUsers,
} from "@/src/db/listeners/index.js";
import {
  addListenersToConfig,
  deleteListenerFromConfig,
} from "@/src/configConstructor/serverConfig.js";

export class ListenersService {
  public get(name?: string): MihomoListener[] {
    const listeners = getListeners(name ? [name] : undefined);
    return listeners;
  }

  public create(listener: MihomoListener) {
    createListener(listener);
  }

  public async delete(name: string) {
    await deleteListenerFromConfig(name);
    deleteListener(name);
  }

  public getUsers(listenerName: string) {
    return getListenerUsers(listenerName);
  }

  public addUsers(listenerName: string, usernames: string[]) {
    addUsersToListener(listenerName, usernames);
  }

  public removeUsers(listenerName: string, usernames: string[]) {
    removeUsersFromListener(listenerName, usernames);
  }

  public async enable(names: string[]) {
    const listeners = getListeners(names);
    if (listeners.length !== names.length) {
      throw new Error("Not all listeners were found");
    }
    await addListenersToConfig(listeners);
  }

  public update(name: string, payload: MihomoListenerDiff) {
    if (Object.keys(payload).length === 0) {
      throw new Error("Nothing to update");
    }
    updateListener(name, payload);
  }
}
