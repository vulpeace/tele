import {
  MihomoProxy,
  MihomoProxyDiff,
  MihomoProxyStringified,
  MihomoProxyStringifiedWithUser,
} from "@/src/interfaces/proxy.js";
import { db } from "../index.js";

export function getProxies(proxyNames?: string[]): MihomoProxy[] {
  const query = proxyNames
    ? db.prepare(`
      SELECT * FROM Proxies
      WHERE name IN (
      ${proxyNames.map(() => "?").join(", ")}
      )
    `)
    : db.prepare(`
      SELECT * FROM Proxies
    `);

  let proxies: MihomoProxyStringified[];
  if (proxyNames) {
    proxies = query.all(...proxyNames) as unknown as MihomoProxyStringified[];
  } else {
    proxies = query.all() as unknown as MihomoProxyStringified[];
  }

  const unwrappedProxies = proxies.map((proxy) => {
    return {
      name: proxy.name,
      type: proxy.type,
      ...JSON.parse(proxy.typeSpecific),
    };
  });
  return unwrappedProxies;
}

export function getProxiesByUserPath(
  path: string,
): MihomoProxyStringifiedWithUser[] {
  const query = db.prepare(`
    SELECT Proxies.name AS proxyName,
           Proxies.type,
           Proxies.typeSpecific,
           Users.uuid,
           Users.password,
           Users.flow
    FROM Users
    INNER JOIN ListenersUsers
    ON Users.name = ListenersUsers.userName
    INNER JOIN Proxies
    ON ListenersUsers.listenerName = Proxies.name
    WHERE Users.path = ?
    AND Proxies.type = 'vless'
  `);
  return query.all(path) as unknown as MihomoProxyStringifiedWithUser[];
}

export function getSubscriptionProxies(
  path: string,
): MihomoProxyStringifiedWithUser[] {
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
  return query.all(path) as unknown as MihomoProxyStringifiedWithUser[];
}

export function createProxy(proxy: MihomoProxy) {
  const listenersQuery = db.prepare(`
    SELECT name FROM Listeners
    WHERE type = ?
  `);
  if (listenersQuery.all(proxy.type).length === 0) {
    throw new Error("No listener with such type");
  }

  if (
    proxy.type === "trojan" ||
    proxy.type === "mieru" ||
    proxy.type === "hysteria2" ||
    proxy.type === "tuic"
  ) {
    delete (proxy as { password?: unknown }).password;
  }
  if (proxy.type === "mieru") delete (proxy as { username?: unknown }).username;
  if (proxy.type === "vless" || proxy.type === "tuic")
    delete (proxy as { uuid?: unknown }).uuid;

  const query = db.prepare(`
    INSERT INTO Proxies
    (name, type, typeSpecific)
    VALUES (?, ?, ?)
  `);
  const { name, type, ...typeSpecific } = proxy;
  query.run(name, type, JSON.stringify(typeSpecific));
}

export function deleteProxy(proxyName: string) {
  const query = db.prepare(`
    DELETE FROM Proxies
    WHERE name = ?
  `);
  query.run(proxyName);
}

export function updateProxy(originalName: string, proxy: MihomoProxyDiff) {
  const { name, type, ...typeSpecific } = proxy;

  const setClauses: string[] = [];
  const setParameters: (string | number)[] = [];

  if (type) throw new Error("Type is immutable");
  if (name) {
    setClauses.push("name = ?");
    setParameters.push(name);
  }
  if (typeSpecific && Object.keys(typeSpecific).length > 0) {
    setClauses.push("typeSpecific = ?");
    setParameters.push(JSON.stringify(typeSpecific));
  }

  if (setClauses.length > 0) {
    const query = db.prepare(`
      UPDATE Proxies
      SET ${setClauses.join(", ")}
      WHERE name = ?
    `);
    query.run(...setParameters, originalName);
  }
}

export function getGroupsByProxyName(proxyName: string) {
  const query = db.prepare(`
    SELECT groupName FROM ProxyGroups
    WHERE proxyName = ?
  `);
  return query.all(proxyName) as unknown as string[];
}

export function addProxyToGroups(proxyName: string, groupNames: string[]) {
  const query = db.prepare(`
    INSERT INTO ProxyGroups
    (groupName, proxyName)
    VALUES ${groupNames.map(() => "(?, ?)").join(", ")}
  `);
  query.run(...groupNames.map((groupName) => [groupName, proxyName]).flat());
}

export function removeProxyFromGroups(proxyName: string, groupNames: string[]) {
  const query = db.prepare(`
    DELETE FROM ProxyGroups
    WHERE groupName
    IN (${groupNames.map(() => "?").join(", ")})
    AND proxyName = ?
  `);
  query.run(...groupNames, proxyName);
}
