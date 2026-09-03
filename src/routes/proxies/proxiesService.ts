import { MihomoProxy, MihomoProxyDiff } from "@/src/interfaces/proxy.js";
import { getProxies, createProxy, deleteProxy, updateProxy, addProxyToGroups, removeProxyFromGroups, getGroupsByProxyName } from "@/src/db/proxies/index.js";

export class ProxiesService {
  public get(name?: string): MihomoProxy[] {
    const proxies = getProxies(name ? [name] : undefined);
    return proxies;
  }

  public create(proxy: MihomoProxy) {
    createProxy(proxy);
  }

  public delete(name: string) {
    deleteProxy(name);
  }

  public update(
    name: string,
    payload: MihomoProxyDiff
  ) {
    if (Object.keys(payload).length === 0) {
      throw new Error("Nothing to update");
    }
    updateProxy(name, payload);
  }

  public getGroups(
    proxyName: string
  ) {
    return getGroupsByProxyName(proxyName);
  }

  public addToGroups(
    proxyName: string,
    groupNames: string[]
  ) {
    addProxyToGroups(proxyName, groupNames);
  }

  public removeFromGroups(
    proxyName: string,
    groupNames: string[]
  ) {
    removeProxyFromGroups(proxyName, groupNames);
  }
}
