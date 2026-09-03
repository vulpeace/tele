import { User } from "@/src/interfaces/user.js";
import { MihomoListener } from "@/src/interfaces/listener.js";
import { stringify, parse } from "yaml";
import { readFile, writeFile } from "node:fs/promises";
import { getListenerUsers } from "../db/listeners/index.js";
import { restartCore } from "../coreManager/coreManager.js";
import { mihomoConfigLocation } from "../app.js";

export let mihomoConfig: {
  secret: string;
  listeners: MihomoListener[];
  [key: string]: unknown;
};

export async function initializeMihomoConfig(
  mihomoConfigLocation: string,
  mihomoSecret: string,
) {
  mihomoConfig = {
    "external-controller": "0.0.0.0:9090",
    secret: mihomoSecret,
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

  console.info("Writing base mihomo configuration...");
  const baseYaml = stringify(mihomoConfig);
  await writeFile(mihomoConfigLocation, baseYaml, "utf-8");
  console.info("Success");
}

export async function readMihomoConfig(mihomoConfigLocation: string) {
  const config = parse(await readFile(mihomoConfigLocation, "utf-8"));

  if (!config["external-controller"] || !config.secret || !config.listeners) {
    throw new Error("Missing fields in config");
  }
  mihomoConfig = config;
}

export async function addListenersToConfig(listeners: MihomoListener[]) {
  if (!mihomoConfig.listeners) {
    mihomoConfig.listeners = [];
  }

  for (let i = 0; i < listeners.length; i++) {
    const listener = listeners[i];
    const users = getListenerUsers(listener.name);

    if (users.length === 0) {
      throw new Error("Cannot enable listener with no users");
    }

    const listenerIndex = mihomoConfig.listeners.findIndex(
      (item) => item.name === listener.name,
    );

    let formattedListener: MihomoListener;

    switch (listener.type) {
      case "vless": {
        const formattedUsers = users.map((user: User) => ({
          username: user.name,
          ...(user.uuid && {
            uuid: user.uuid,
          }),
          ...(user.flow && {
            flow: user.flow,
          }),
        }));
        formattedListener = {
          ...listener,
          users: formattedUsers,
        } as MihomoListener;
        break;
      }
      case "trojan": {
        const formattedUsers = users.map((user: User) => ({
          username: user.name,
          ...(user.password && {
            password: user.password,
          }),
        }));
        formattedListener = {
          ...listener,
          users: formattedUsers,
        } as MihomoListener;
        break;
      }
      case "anytls":
      case "mieru":
      case "hysteria2": {
        const formattedUsers: Record<string, string> = {};
        users.forEach((user: User) => {
          if (user.password) {
            formattedUsers[user.name] = user.password;
          }
        });
        formattedListener = {
          ...listener,
          users: formattedUsers,
        } as MihomoListener;
        break;
      }
      case "tuic": {
        const formattedUsers: Record<string, string> = {};
        users.forEach((user: User) => {
          if (user.uuid && user.password) {
            formattedUsers[user.uuid] = user.password;
          }
        });
        formattedListener = {
          ...listener,
          users: formattedUsers,
        } as MihomoListener;
        break;
      }
      default: {
        const _exhaustive: never = listener as never;
        throw new Error(
          `Unsupported listener type: ${(_exhaustive as MihomoListener).type}`,
        );
      }
    }

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
  const listeners: MihomoListener[] = mihomoConfig.listeners;
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
    mihomoConfig = { ...mihomoConfig, listeners: redactedListeners };
    await writeFile(mihomoConfigLocation, stringify(mihomoConfig), "utf-8");

    await restartCore(mihomoConfig.secret);
  } else {
    throw new Error("No listeners in config");
  }
}
