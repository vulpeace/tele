import {
  BaseClientConfigStringified,
  SubscriptionParts,
} from "@/src/interfaces/config.js";
import { db } from "../index.js";

export function getBaseClientConfigs(names?: string[]) {
  const query = names
    ? db.prepare(`
      SELECT * FROM Configs
      WHERE name IN (
      ${names.map(() => "?").join(", ")}
      )
    `)
    : db.prepare(`
    SELECT * FROM Configs
  `);

  let configs: BaseClientConfigStringified[];
  if (names) {
    configs = query.all(...names) as unknown as BaseClientConfigStringified[];
  } else {
    configs = query.all() as unknown as BaseClientConfigStringified[];
  }

  const unwrappedConfigs = configs.map((config) => {
    return {
      name: config.name,
      ...JSON.parse(config.data),
    };
  });
  return unwrappedConfigs;
}

export function getBaseClientConfigByName(name: string) {
  const query = db.prepare(`
    SELECT * FROM Configs
    WHERE name = ?
  `);
  return query.get(name) as unknown as BaseClientConfigStringified;
}

export function createBaseClientConfig(
  clientConfig: BaseClientConfigStringified,
) {
  const query = db.prepare(`
    INSERT INTO Configs
    (name, data)
    VALUES (?, ?)
  `);
  query.run(clientConfig.name, clientConfig.data);
}

export function updateBaseClientConfig(
  originalName: string,
  payload: string,
  name?: string,
) {
  const setClauses: string[] = [];
  const setParameters: string[] = [];

  if (name) {
    setClauses.push("name = ?");
    setParameters.push(name);
  }
  if (payload) {
    setClauses.push("data = ?");
    setParameters.push(payload);
  }

  if (setClauses.length > 0) {
    const query = db.prepare(`
      UPDATE Configs
      SET ${setClauses.join(", ")}
      WHERE name = ?
    `);
    query.run(...setParameters, originalName);
  }
}

export function deleteBaseClientConfig(name: string) {
  const query = db.prepare(`
    DELETE FROM Configs
    WHERE name = ?
  `);
  query.run(name);
}

export function getSubscriptionProxies(path: string) {
  const query = db.prepare(`
    SELECT Proxies.name as proxyName,
           Proxies.type,
           Proxies.typeSpecific,
           ProxyGroups.groupName,
           Users.name as userName,
           Users.uuid,
           Users.flow,
           Users.password
    FROM Users
    INNER JOIN ListenersUsers
    ON Users.name = ListenersUsers.userName
    INNER JOIN Proxies
    ON ListenersUsers.listenerName = Proxies.name
    LEFT JOIN ProxyGroups
    ON Proxies.name = ProxyGroups.proxyName
    WHERE Users.path = ?
  `);
  const clientConfig = query.all(path) as unknown as SubscriptionParts[];
  return clientConfig;
}
