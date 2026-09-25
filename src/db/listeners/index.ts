import {
  MihomoListener,
  MihomoListenerStringified,
  MihomoListenerDiff,
} from "@/src/interfaces/listener.js";
import { db } from "../index.js";
import { MihomoProxy } from "@/src/interfaces/proxy.js";
import { User } from "@/src/interfaces/user.js";

export function getListeners(listenerNames?: string[]): MihomoListener[] {
  const query = listenerNames
    ? db.prepare(`
      SELECT * FROM Listeners
      WHERE name IN (
      ${listenerNames.map(() => "?").join(", ")}
      )
    `)
    : db.prepare(`
    SELECT * FROM Listeners
  `);

  let listeners: MihomoListenerStringified[];
  if (listenerNames) {
    listeners = query.all(
      ...listenerNames,
    ) as unknown as MihomoListenerStringified[];
  } else {
    listeners = query.all() as unknown as MihomoListenerStringified[];
  }

  const unwrappedListeners = listeners.map((listener) => {
    return {
      name: listener.name,
      type: listener.type,
      ...JSON.parse(listener.typeSpecific),
    };
  });
  return unwrappedListeners;
}

export function createListener(listener: MihomoListener) {
  const query = db.prepare(`
    INSERT INTO Listeners
    (name, type, typeSpecific)
    VALUES (?, ?, ?)
  `);
  const { name, type, users, ...typeSpecific } = listener;
  query.run(name, type, JSON.stringify(typeSpecific));
}

export function deleteListener(listenerName: string) {
  const query = db.prepare(`
    DELETE FROM Listeners
    WHERE name = ?
  `);
  query.run(listenerName);
}

export function updateListener(
  originalName: string,
  payload: MihomoListenerDiff,
) {
  const { name, type, ...typeSpecific } = payload;

  const setClauses: string[] = [];
  const setParameters: string[] = [];

  if (type) throw new Error("Type is immutable");
  if (name) {
    setClauses.push("name = ?");
    setParameters.push(name);
  }
  if (typeSpecific && Object.keys(typeSpecific).length > 0) {
    const originalListenerArray = getListeners([originalName]);
    if (originalListenerArray.length !== 0) {
      const { name, type, ...originalListenerTypeSpecific } =
        originalListenerArray[0];
      const newListener = {
        ...originalListenerTypeSpecific,
        ...typeSpecific,
      };
      setClauses.push("typeSpecific = ?");
      setParameters.push(JSON.stringify(newListener));
    } else {
      throw new Error("Not Found");
    }
  }

  if (setClauses.length > 0) {
    const query = db.prepare(`
      UPDATE Listeners
      SET ${setClauses.join(", ")}
      WHERE name = ?
    `);
    query.run(...setParameters, originalName);
  }
}

export function getListenerProxies(listenerName: string): MihomoProxy[] {
  const query = db.prepare(`
    SELECT Proxies.name, Proxies.type, Proxies.typeSpecific
    FROM Proxies
    INNER JOIN ProxiesListeners ON Proxies.name = ProxiesListeners.proxyName
    WHERE ProxiesListeners.listenerName = ?
  `);
  const rows = query.all(listenerName) as unknown as {
    name: string;
    type: string;
    typeSpecific: string;
  }[];
  return rows.map((r) => ({
    name: r.name,
    type: r.type as MihomoProxy["type"],
    ...JSON.parse(r.typeSpecific),
  })) as MihomoProxy[];
}

export function getListenerUsersTransitive(listenerName: string): User[] {
  const query = db.prepare(`
    SELECT DISTINCT Users.*
    FROM Users
    INNER JOIN ProxiesUsers ON Users.name = ProxiesUsers.userName
    INNER JOIN ProxiesListeners ON ProxiesUsers.proxyName = ProxiesListeners.proxyName
    WHERE ProxiesListeners.listenerName = ?
  `);
  return query.all(listenerName) as unknown as User[];
}

export function addProxiesToListener(
  listenerName: string,
  proxyNames: string[],
) {
  if (proxyNames.length === 0) throw new Error("No proxies to add");
  const listenerTypeQuery = db.prepare(`
    SELECT type FROM Listeners WHERE name = ?
  `);
  const listenerRow = listenerTypeQuery.get(listenerName) as unknown as
    { type: string } | undefined;
  if (!listenerRow) throw new Error("MihomoListener not found");
  const listenerType = listenerRow.type;

  const proxyQuery = db.prepare(`
    SELECT name, type FROM Proxies WHERE name IN (${proxyNames.map(() => "?").join(", ")})
  `);
  const proxies = proxyQuery.all(...proxyNames) as unknown as {
    name: string;
    type: string;
  }[];
  if (proxies.length !== proxyNames.length)
    throw new Error("Not all proxies were found");

  proxies.forEach((p) => {
    if (p.type !== listenerType) {
      throw new Error(
        `Proxy ${p.name} type ${p.type} does not match listener ${listenerName} type ${listenerType}`,
      );
    }
  });

  const query = db.prepare(`
    INSERT OR IGNORE INTO ProxiesListeners
    (proxyName, listenerName)
    VALUES ${proxyNames.map(() => "(?, ?)").join(", ")}
  `);
  query.run(...proxyNames.map((pn) => [pn, listenerName]).flat());
}

export function removeProxiesFromListener(
  listenerName: string,
  proxyNames: string[],
) {
  if (proxyNames.length === 0) throw new Error("No proxies to remove");
  const query = db.prepare(`
    DELETE FROM ProxiesListeners
    WHERE listenerName = ?
    AND proxyName IN (${proxyNames.map(() => "?").join(", ")})
  `);
  query.run(listenerName, ...proxyNames);
}
