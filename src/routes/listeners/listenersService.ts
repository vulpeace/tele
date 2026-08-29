import { Listener, ListenerDiff } from "@/src/interfaces/listener.js";
import { getListeners, createListener, addUsersToListener, deleteListener, updateListener } from "@/src/db/listeners/index.js";
import { addListenersToConfig, deleteListenerFromConfig } from "@/src/configConstructor/mihomoConfig.js";

export class ListenersService {
  public get(): Listener[] {
    const listeners = getListeners(undefined);
    return listeners;
  }

  public create(listener: Listener) {
    createListener(listener);
  }

  public async delete(listenerName: string) {
    await deleteListenerFromConfig(listenerName);
    deleteListener(listenerName);
  }

  public addUsers(
    listenerName: string,
    usernames: string[]
  ) {
    addUsersToListener(listenerName, usernames);
  }

  public async enable(listenerNames: string[]) {
    const listeners = getListeners(listenerNames);
    await addListenersToConfig(listeners);
  }

  public update(
    listenerName: string,
    payload: ListenerDiff
  ) {
    if (Object.keys(payload).length === 0) {
      throw new Error("Nothing to update");
    }
    updateListener(listenerName, payload);
  }
}