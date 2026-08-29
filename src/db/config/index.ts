import { ClientConfig } from "@/src/interfaces/config.js";
import { db } from "../index.js";

export function getClientBaseConfig(names: string[]) {
  const query = names
    ? db.prepare(`
      SELECT * FROM Configs
      WHERE name IN (${names.map(() => "?").join(", ")})
    `)
    : db.prepare(`
      SELECT * FROM Configs
    `);
  return names
    ? (query.all(...names) as unknown as { name: string; data: string }[])
    : (query.all() as unknown as { name: string; data: string }[]);
}

export function addClientBaseConfig(name: string, data: string) {
  const query = db.prepare(`
    INSERT INTO Configs
    (name, data)
    VALUES (?, ?)
  `);
  query.run(name, data);
}

export function updateClientBaseConfig(
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

export function getClientConfig(path: string) {
  const query = db.prepare(`
    SELECT Configs.data as baseConfig,
           Proxies.name as proxyName,
           Proxies.type,
           Proxies.typeSpecific,
           Users.name as userName,
           Users.uuid,
           Users.flow,
           Users.password
    FROM Users
    INNER JOIN ListenersUsers
    ON Users.name = ListenersUsers.userName
    INNER JOIN Configs
    ON ListenersUsers.baseConfigName = Configs.name
    INNER JOIN Proxies
    ON ListenersUsers.listenerName = Proxies.name
    WHERE Users.path = ?
  `);
  const clientConfig = query.all(path) as unknown as ClientConfig[];
  return clientConfig;
}
