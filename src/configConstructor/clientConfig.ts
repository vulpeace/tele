import {
  createBaseClientConfig,
  getBaseClientConfigByName,
  getBaseClientConfigs,
  getSubscriptionProxies,
} from "@/src/db/configs/index.js";
import { BaseClientConfig } from "../interfaces/config.js";

export function initializeClientConfig() {
  const clientConfig: BaseClientConfig = {
    mode: "rule",
    "log-level": "warning",
    ipv6: false,
    "allow-lan": true,
    "enable-process": true,
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
          ports: [80],
        },
        TLS: {
          ports: [443],
        },
        QUIC: {
          ports: [443],
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
  const baseConfig = configName
    ? getBaseClientConfigByName(configName)
    : getBaseClientConfigs()[0];

  const subscriptionParts = getSubscriptionProxies(path);
  if (!baseConfig || subscriptionParts.length === 0) {
    throw new Error("Not Found");
  }

  let subscriptionConfig = {
    ...JSON.parse(baseConfig.data),
    proxies: [],
    "proxy-groups": [],
  };

  for (let i = 0; i < subscriptionParts.length; i++) {
    const subscriptionPart = subscriptionParts[i];
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
      ...(["trojan", "anytls", "mieru"].find(
        (type) => type === subscriptionPart.type,
      ) && {
        password: subscriptionPart.password,
      }),
      ...(subscriptionPart.type === "mieru" && {
        username: subscriptionPart.userName,
      }),
    });
    if (subscriptionPart.groupName) {
      const groupIndex = subscriptionConfig["proxy-groups"].findIndex(
        (group: {
          name: string;
          type: string;
          proxies: string[];
          [key: string]: unknown;
        }) => group.name === subscriptionPart.groupName,
      );
      if (groupIndex !== -1) {
        subscriptionConfig["proxy-groups"][groupIndex].proxies.push(
          subscriptionPart.proxyName,
        );
      } else {
        subscriptionConfig["proxy-groups"].push({
          name: subscriptionPart.groupName,
          type: "select",
          proxies: [subscriptionPart.proxyName],
        });
      }
    } else if (subscriptionConfig["proxy-groups"].length !== 0) {
      subscriptionConfig["proxy-groups"][0].proxies.push(
        subscriptionPart.proxyName,
      );
    }
  }
  return subscriptionConfig;
}
