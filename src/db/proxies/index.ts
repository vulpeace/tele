import {
  MihomoProxy,
  MihomoProxyDiff,
  MihomoProxyStringified,
  MihomoProxyStringifiedWithUser,
} from "@/src/interfaces/proxy.js";
import { db } from "../index.js";
import { User } from "@/src/interfaces/user.js";
import { MihomoListener } from "@/src/interfaces/listener.js";

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
    INNER JOIN ProxiesUsers ON Users.name = ProxiesUsers.userName
    INNER JOIN Proxies ON ProxiesUsers.proxyName = Proxies.name
    WHERE Users.path = ?
    AND Proxies.type IN ('vless', 'hysteria2') 
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
    INNER JOIN ProxiesUsers ON Users.name = ProxiesUsers.userName
    INNER JOIN Proxies ON ProxiesUsers.proxyName = Proxies.name
    LEFT JOIN ProxyGroups ON Proxies.name = ProxyGroups.proxyName
    WHERE Users.path = ?
  `);
  return query.all(path) as unknown as MihomoProxyStringifiedWithUser[];
}

export function createProxy(proxy: MihomoProxy) {
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
    const originalProxyArray = getProxies([originalName]);
    if (originalProxyArray.length !== 0) {
      const { name, type, ...originalProxyTypeSpecific } =
        originalProxyArray[0];
      const newProxy = {
        ...originalProxyTypeSpecific,
        ...typeSpecific,
      };
      setClauses.push("typeSpecific = ?");
      setParameters.push(JSON.stringify(newProxy));
    } else {
      throw new Error("Not Found");
    }
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

export function getProxyUsers(proxyName: string): User[] {
  const query = db.prepare(`
    SELECT Users.* FROM Users
    INNER JOIN ProxiesUsers ON Users.name = ProxiesUsers.userName
    WHERE ProxiesUsers.proxyName = ?
  `);
  return query.all(proxyName) as unknown as User[];
}

export function getProxyListeners(proxyName: string): MihomoListener[] {
  const query = db.prepare(`
    SELECT Listeners.name, Listeners.type, Listeners.typeSpecific
    FROM Listeners
    INNER JOIN ProxiesListeners ON Listeners.name = ProxiesListeners.listenerName
    WHERE ProxiesListeners.proxyName = ?
  `);
  const rows = query.all(proxyName) as unknown as {
    name: string;
    type: string;
    typeSpecific: string;
  }[];
  return rows.map((r) => ({
    name: r.name,
    type: r.type,
    ...JSON.parse(r.typeSpecific),
  })) as unknown as MihomoListener[];
}

export function addUsersToProxy(proxyName: string, usernames: string[]) {
  if (usernames.length === 0) throw new Error("No users to add");
  const proxyTypeQuery = db.prepare(`
    SELECT type FROM Proxies WHERE name = ?
  `);
  const row = proxyTypeQuery.get(proxyName) as unknown as
    { type: string } | undefined;
  if (!row) throw new Error("Proxy not found");
  const type = row.type;

  const userQuery = db.prepare(`
    SELECT * FROM Users WHERE name IN (${usernames.map(() => "?").join(", ")})
  `);
  const users = userQuery.all(...usernames) as unknown as User[];
  if (users.length !== usernames.length)
    throw new Error("Not all users were found");

  if (type === "vless" || type === "tuic") {
    users.forEach((user) => {
      if (!user.uuid) throw new Error(`User ${user.name} has no UUID`);
    });
  }
  if (
    ["trojan", "anytls", "mieru", "hysteria2", "tuic"].find((i) => i === type)
  ) {
    users.forEach((user) => {
      if (!user.password) throw new Error(`User ${user.name} has no password`);
    });
  }

  const query = db.prepare(`
    INSERT OR IGNORE INTO ProxiesUsers
    (proxyName, userName)
    VALUES ${usernames.map(() => "(?, ?)").join(", ")}
  `);
  query.run(...usernames.map((u) => [proxyName, u]).flat());
}

export function removeUsersFromProxy(proxyName: string, usernames: string[]) {
  if (usernames.length === 0) throw new Error("No users to remove");
  const query = db.prepare(`
    DELETE FROM ProxiesUsers
    WHERE proxyName = ?
    AND userName IN (${usernames.map(() => "?").join(", ")})
  `);
  query.run(proxyName, ...usernames);
}

export function addListenersToProxy(
  proxyName: string,
  listenerNames: string[],
) {
  if (listenerNames.length === 0) throw new Error("No listeners to add");
  const proxyTypeQuery = db.prepare(`
    SELECT type FROM Proxies WHERE name = ?
  `);
  const proxyRow = proxyTypeQuery.get(proxyName) as unknown as
    { type: string } | undefined;
  if (!proxyRow) throw new Error("Proxy not found");
  const proxyType = proxyRow.type;

  const listenerQuery = db.prepare(`
    SELECT name, type FROM Listeners WHERE name IN (${listenerNames.map(() => "?").join(", ")})
  `);
  const listeners = listenerQuery.all(...listenerNames) as unknown as {
    name: string;
    type: string;
  }[];
  if (listeners.length !== listenerNames.length)
    throw new Error("Not all listeners were found");

  listeners.forEach((l) => {
    if (l.type !== proxyType) {
      throw new Error(
        `Listener ${l.name} type ${l.type} does not match proxy ${proxyName} type ${proxyType}`,
      );
    }
  });

  const query = db.prepare(`
    INSERT OR IGNORE INTO ProxiesListeners
    (proxyName, listenerName)
    VALUES ${listenerNames.map(() => "(?, ?)").join(", ")}
  `);
  query.run(...listenerNames.map((ln) => [proxyName, ln]).flat());
}

export function removeListenersFromProxy(
  proxyName: string,
  listenerNames: string[],
) {
  if (listenerNames.length === 0) throw new Error("No listeners to remove");
  const query = db.prepare(`
    DELETE FROM ProxiesListeners
    WHERE proxyName = ?
    AND listenerName IN (${listenerNames.map(() => "?").join(", ")})
  `);
  query.run(proxyName, ...listenerNames);
}
