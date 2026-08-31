import { User } from "@/src/interfaces/user.js";
import { Listener } from "@/src/interfaces/listener.js";
import { stringify } from "yaml";
import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { getListenerUsers } from "../db/listeners/index.js";
import { restartCore } from "../coreManager/coreManager.js";
import { mihomoConfigLocation } from "../app.js";

export let mihomoConfig: {
  secret: string;
  listeners: Listener[];
  [key: string]: unknown;
};

export async function initializeMihomoConfig(mihomoConfigLocation: string) {
  const secret =
    process.env.MIHOMO_SECRET ?? randomBytes(32).toString("base64");
  mihomoConfig = {
    "external-controller": "0.0.0.0:9090",
    secret: secret,
    "log-level": "debug",
    dns: {
      enable: true,
      nameserver: ["system"],
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
    },
    listeners: [],
    "rule-providers": {},
    rules: [],
  };

  console.info("Writing basic mihomo configuration...");
  const basicYaml = stringify(mihomoConfig);
  await writeFile(mihomoConfigLocation, basicYaml, "utf-8");
  console.info("Success");
}

export async function readMihomoConfig(mihomoConfigLocation: string) {
  const config = JSON.parse(await readFile(mihomoConfigLocation, "utf-8"));

  if (!config["external-controller"] || !config.secret || !config.listeners) {
    throw new Error("Missing fields in config");
  }
  mihomoConfig = config;
}

export async function addListenersToConfig(listeners: Listener[]) {
  if (!mihomoConfig.listeners) {
    mihomoConfig.listeners = [];
  }

  for (let i = 0; i < listeners.length; i++) {
    const listener = listeners[i];
    const users = getListenerUsers(listener.name);

    if (users.length === 0) {
      throw new Error("Cannot enable listener with no users");
    }

    let formattedUsers: any[] = [];
    switch (listener.type) {
      case "vless":
        users.forEach((user: User) => {
          formattedUsers.push({
            username: user.name,
            uuid: user.uuid,
            ...(user.flow && {
              flow: user.flow,
            }),
          });
        });
        break;
      case "trojan":
        users.forEach((user: User) => {
          formattedUsers.push({
            username: user.name,
            password: user.password,
          });
        });
        break;
      case "anytls":
      case "mieru":
      case "hysteria2":
        users.forEach((user: User) => {
          formattedUsers.push({
            [user.name]: user.password,
          });
        });
        break;
      case "tuic":
        users.forEach((user: User) => {
          user.uuid &&
            formattedUsers.push({
              [user.uuid]: user.password,
            });
        });
        break;
    }

    const formattedListener = {
      users: formattedUsers,
      ...listener,
    };

    const listenerIndex = mihomoConfig.listeners.findIndex(
      (item) => item.name === listener.name,
    );

    if (listenerIndex !== -1) {
      mihomoConfig.listeners[listenerIndex] = formattedListener;
    } else {
      mihomoConfig.listeners.push(formattedListener);
    }
  }

  const redactedConfig = stringify(mihomoConfig);
  await writeFile(mihomoConfigLocation, redactedConfig, "utf-8");
  await restartCore(mihomoConfig.secret);
}

export async function deleteListenerFromConfig(listenerName: string) {
  const listeners: Listener[] = mihomoConfig.listeners;
  if (typeof listeners !== "undefined") {
    const cutoutIndex = listeners.findIndex(
      (listener) => listener.name === listenerName,
    );
    const redactedListeners =
      cutoutIndex === -1
        ? listeners
        : listeners
            .slice(0, cutoutIndex)
            .concat(listeners.slice(cutoutIndex + 1));
    const redactedConfig = { ...mihomoConfig, listeners: redactedListeners };
    await writeFile(mihomoConfigLocation, stringify(redactedConfig), "utf-8");

    await restartCore(mihomoConfig.secret);
  } else {
    throw new Error("No listeners in config");
  }
}
