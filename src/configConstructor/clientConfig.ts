import {
  createBaseClientConfig,
  getBaseClientConfigs,
} from "@/src/db/configs/index.js";
import { MihomoClientConfig } from "../interfaces/config.js";
import {
  MihomoHysteria2Proxy,
  MihomoProxy,
  MihomoVlessProxy,
} from "../interfaces/generated/proxy.js";
import {
  getProxiesByUserPath,
  getSubscriptionProxies,
} from "../db/proxies/index.js";
import { mihomoProxyToVlessUri } from "./mihomoProxyToVlessUri.js";
import { mihomoProxyToHysteria2Uri } from "./mihomoProxyToHysteria2Uri.js";

interface ProxyGroup {
  name: string;
  type: string;
  proxies: string[];
  [key: string]: unknown;
}

export function initializeClientConfig() {
  const clientConfig: MihomoClientConfig = {
    mode: "rule",
    "log-level": "warning",
    ipv6: false,
    "allow-lan": true,
    "find-process-mode": "always",
    "tcp-concurrent": true,
    "keep-alive-interval": 15,
    "keep-alive-idle": 120,
    profile: {
      "store-selected": true,
    },
    sniffer: {
      enable: true,
      sniff: {
        HTTP: {
          ports: ["80"],
        },
        TLS: {
          ports: ["443"],
        },
        QUIC: {
          ports: ["443"],
        },
      },
      "skip-domain": ["+.lan"],
    },
    tun: {
      enable: true,
      stack: "mixed",
      "auto-route": true,
      "auto-detect-interface": true,
      "strict-route": true,
      "dns-hijack": ["udp://any:53", "tcp://any:53"],
      mtu: 9000,
      "exclude-package": [],
    },
    dns: {
      enable: true,
      listen: "0.0.0.0:1053",
      ipv6: false,
      nameserver: ["https://1.1.1.1/dns-query"],
      "nameserver-policy": {
        "+.lan": "dhcp://system",
      },
    },
    "proxy-groups": [
      {
        name: "PROXY",
        type: "select",
        proxies: [],
      },
    ],
    rules: ["MATCH,PROXY"],
  };
  createBaseClientConfig({
    name: "default",
    data: JSON.stringify(clientConfig),
  });
}

export function constructSubscription(path: string, configName: string) {
  const baseConfigArray = configName
    ? getBaseClientConfigs([configName])
    : getBaseClientConfigs();

  const subscriptionParts = getSubscriptionProxies(path);

  if (baseConfigArray.length === 0 || subscriptionParts.length === 0) {
    throw new Error("Not Found");
  }

  const baseConfig = baseConfigArray[0];
  const baseGroups = Array.isArray(baseConfig.data["proxy-groups"])
    ? (baseConfig.data["proxy-groups"] as ProxyGroup[])
    : [];

  let subscriptionConfig = {
    ...baseConfig.data,
    proxies: [] as MihomoProxy[],
    // Keep the base groups so that rules referencing them stay valid
    "proxy-groups": baseGroups.map((group) => ({
      ...group,
      proxies: Array.isArray(group.proxies) ? [...group.proxies] : [],
    })),
  };

  const addToGroup = (group: ProxyGroup, proxyName: string) => {
    if (!group.proxies.includes(proxyName)) {
      group.proxies.push(proxyName);
    }
  };

  const seenProxies = new Set<string>();
  const ungroupedProxies: string[] = [];
  for (let i = 0; i < subscriptionParts.length; i++) {
    const subscriptionPart = subscriptionParts[i];
    if (!seenProxies.has(subscriptionPart.proxyName)) {
      seenProxies.add(subscriptionPart.proxyName);
      subscriptionConfig.proxies.push({
        name: subscriptionPart.proxyName,
        type: subscriptionPart.type,
        ...JSON.parse(subscriptionPart.typeSpecific),
        ...(subscriptionPart.type === "vless" && {
          uuid: subscriptionPart.uuid,
          ...(subscriptionPart.flow && {
            flow: subscriptionPart.flow,
          }),
        }),
        ...(subscriptionPart.type === "tuic" && {
          uuid: subscriptionPart.uuid,
          password: subscriptionPart.password,
        }),
        ...(["trojan", "anytls", "mieru", "hysteria2"].find(
          (type) => type === subscriptionPart.type,
        ) && {
          password: subscriptionPart.password,
        }),
        ...(subscriptionPart.type === "mieru" && {
          username: subscriptionPart.userName,
        }),
      });
    }

    if (subscriptionPart.groupName) {
      const group = subscriptionConfig["proxy-groups"].find(
        (group) => group.name === subscriptionPart.groupName,
      );
      if (group) {
        addToGroup(group, subscriptionPart.proxyName);
      } else {
        subscriptionConfig["proxy-groups"].push({
          name: subscriptionPart.groupName,
          type: "select",
          proxies: [subscriptionPart.proxyName],
        });
      }
    } else {
      ungroupedProxies.push(subscriptionPart.proxyName);
    }
  }

  // Deferred until all groups exist, so the result doesn't depend on row order
  const firstGroup = subscriptionConfig["proxy-groups"][0];
  if (firstGroup) {
    ungroupedProxies.forEach((proxyName) => addToGroup(firstGroup, proxyName));
  }
  return subscriptionConfig;
}

export function constructUris(path: string) {
  const proxies = getProxiesByUserPath(path);
  if (proxies.length === 0) throw new Error("Not Found");
  let vlessProxies: MihomoVlessProxy[] = [];
  let hysteria2Proxies: MihomoHysteria2Proxy[] = [];
  proxies.forEach((proxy) => {
    const typeSpecific = JSON.parse(proxy.typeSpecific);
    if (proxy.type === "vless") {
      delete typeSpecific.uuid;
      delete typeSpecific.flow;
      vlessProxies.push({
        name: proxy.proxyName,
        type: proxy.type,
        ...typeSpecific,
        uuid: proxy.uuid,
        ...(proxy.flow && {
          flow: proxy.flow,
        }),
      });
    }
    if (proxy.type === "hysteria2") {
      delete typeSpecific.password;
      hysteria2Proxies.push({
        name: proxy.proxyName,
        type: proxy.type,
        ...typeSpecific,
        password: proxy.password,
      });
    }
  });
  return (
    vlessProxies.map(mihomoProxyToVlessUri).join("\n") +
    "\n" +
    hysteria2Proxies.map(mihomoProxyToHysteria2Uri).join("\n")
  );
}
