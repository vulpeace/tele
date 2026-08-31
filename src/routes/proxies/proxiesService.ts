import { Proxy, ProxyDiff } from "@/src/interfaces/proxy.js";
import { getProxies, createProxy, deleteProxy, updateProxy } from "@/src/db/proxies/index.js";

export class ProxiesService {
  public get(name?: string): Proxy[] {
    const proxies = getProxies(name ? [name] : undefined);
    return proxies;
  }

  public create(proxy: Proxy) {
    createProxy(proxy);
  }

  public delete(name: string) {
    deleteProxy(name);
  }

  public update(
    name: string,
    payload: ProxyDiff
  ) {
    if (Object.keys(payload).length === 0) {
      throw new Error("Nothing to update");
    }
    updateProxy(name, payload);
  }
}
