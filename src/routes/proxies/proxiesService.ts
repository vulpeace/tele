import { MihomoProxy, MihomoProxyDiff } from "@/src/interfaces/proxy.js";
import {
  getProxies,
  createProxy,
  deleteProxy,
  updateProxy,
  addProxyToGroups,
  removeProxyFromGroups,
  getGroupsByProxyName,
  getProxyUsers,
  addUsersToProxy,
  removeUsersFromProxy,
  getProxyListeners,
  addListenersToProxy,
  removeListenersFromProxy,
} from "@/src/db/proxies/index.js";
import { syncEnabledListeners } from "@/src/configConstructor/serverConfig.js";

export class ProxiesService {
  public get(name?: string): MihomoProxy[] {
    const proxies = getProxies(name ? [name] : undefined);
    return proxies;
  }

  public create(proxy: MihomoProxy) {
    createProxy(proxy);
  }

  public async delete(name: string) {
    deleteProxy(name);
    await syncEnabledListeners();
  }

  public async update(name: string, payload: MihomoProxyDiff) {
    if (Object.keys(payload).length === 0) {
      throw new Error("Nothing to update");
    }
    updateProxy(name, payload);
    await syncEnabledListeners();
  }

  public getGroups(proxyName: string) {
    return getGroupsByProxyName(proxyName);
  }

  public addToGroups(proxyName: string, groupNames: string[]) {
    addProxyToGroups(proxyName, groupNames);
  }

  public removeFromGroups(proxyName: string, groupNames: string[]) {
    removeProxyFromGroups(proxyName, groupNames);
  }

  public getUsers(proxyName: string) {
    return getProxyUsers(proxyName);
  }

  public async addUsers(proxyName: string, usernames: string[]) {
    addUsersToProxy(proxyName, usernames);
    await syncEnabledListeners();
  }

  public async removeUsers(proxyName: string, usernames: string[]) {
    removeUsersFromProxy(proxyName, usernames);
    await syncEnabledListeners();
  }

  public getListeners(proxyName: string) {
    return getProxyListeners(proxyName);
  }

  public async addListeners(proxyName: string, listenerNames: string[]) {
    addListenersToProxy(proxyName, listenerNames);
    await syncEnabledListeners();
  }

  public async removeListeners(proxyName: string, listenerNames: string[]) {
    removeListenersFromProxy(proxyName, listenerNames);
    await syncEnabledListeners();
  }
}
