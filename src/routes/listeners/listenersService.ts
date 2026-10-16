import {
  MihomoListener,
  MihomoListenerDiff,
} from "@/src/interfaces/listener.js";
import {
  getListeners,
  createListener,
  deleteListener,
  updateListener,
  getListenerProxies,
  getListenerUsersTransitive,
  addProxiesToListener,
  removeProxiesFromListener,
} from "@/src/db/listeners/index.js";
import {
  addListenersToConfig,
  deleteListenerFromConfig,
  getEnabledListeners,
  syncEnabledListeners,
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
    await syncEnabledListeners();
  }

  public getProxies(listenerName: string) {
    return getListenerProxies(listenerName);
  }

  public getUsers(listenerName: string) {
    return getListenerUsersTransitive(listenerName);
  }

  public async addProxies(listenerName: string, proxyNames: string[]) {
    addProxiesToListener(listenerName, proxyNames);
    await syncEnabledListeners();
  }

  public async removeProxies(listenerName: string, proxyNames: string[]) {
    removeProxiesFromListener(listenerName, proxyNames);
    await syncEnabledListeners();
  }

  public getEnabled(): MihomoListener[] {
    return getEnabledListeners();
  }

  public async enable(names: string[]) {
    const listeners = getListeners(names);
    if (listeners.length !== names.length) {
      throw new Error("Not all listeners were found");
    }
    await addListenersToConfig(listeners);
  }

  public async update(name: string, payload: MihomoListenerDiff) {
    if (Object.keys(payload).length === 0) {
      throw new Error("Nothing to update");
    }
    updateListener(name, payload);
    await syncEnabledListeners();
  }
}
