import { Proxy, ProxyDiff } from "@/src/interfaces/proxy.js";
import { getProxies, createProxy, deleteProxy, updateProxy } from "@/src/db/proxies/index.js";

export class ProxiesService {
  public get(): Proxy[] {
    const proxies = getProxies(undefined);
    return proxies;
  }

  public create(proxy: Proxy) {
    createProxy(proxy);
  }

  public delete(proxyName: string) {
    deleteProxy(proxyName);
  }

  public update(
    proxyName: string,
    payload: ProxyDiff
  ) {
    if (Object.keys(payload).length === 0) {
      throw new Error("Nothing to update");
    }
    updateProxy(proxyName, payload);
  }
}
