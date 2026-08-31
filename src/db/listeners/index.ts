import {
  Listener,
  ListenerStringified,
  ListenerDiff,
} from "@/src/interfaces/listener.js";
import { User } from "@/src/interfaces/user.js";
import { db } from "../index.js";

export function getListeners(listenerNames?: string[]): Listener[] {
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

  let listeners: ListenerStringified[];
  if (listenerNames) {
    listeners = query.all(...listenerNames) as unknown as ListenerStringified[];
  } else {
    listeners = query.all() as unknown as ListenerStringified[];
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

export function createListener(listener: Listener) {
  const query = db.prepare(`
    INSERT INTO Listeners
    (name, type, typeSpecific)
    VALUES (?, ?, ?)
  `);
  const { name, type, ...typeSpecific } = listener;
  query.run(name, type, JSON.stringify(typeSpecific));
}

export function deleteListener(listenerName: string) {
  const query = db.prepare(`
    DELETE FROM Listeners
    WHERE name = ?
  `);
  query.run(listenerName);
}

export function updateListener(originalName: string, listener: ListenerDiff) {
  const { name, type, usernames, ...typeSpecific } = listener;

  const setClauses: string[] = [];
  const setParameters: string[] = [];

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
      UPDATE Listeners
      SET ${setClauses.join(", ")}
      WHERE name = ?
    `);
    query.run(...setParameters, originalName);
  }
}

export function addUsersToListener(listenerName: string, usernames: string[]) {
  const listenerTypeQuery = db.prepare(`
    SELECT type FROM Listeners
    WHERE name = ?
  `);
  const row = listenerTypeQuery.get(listenerName) as unknown as
    { type: string } | undefined;
  if (!row) throw new Error("Listener not found");
  const type = row.type;

  const userQuery = db.prepare(`
    SELECT * FROM Users
    WHERE name IN (${usernames.map(() => "?").join(", ")})
  `);
  const users = userQuery.all(...usernames) as unknown as User[];
  if (users.length !== usernames.length)
    throw new Error("Not all users were found");

  // Replace with automatic credentials generation
  if (type === "vless" || type === "tuic") {
    users.forEach((user) => {
      if (!user.uuid) {
        throw new Error(`User ${user.name} has no UUID`);
      }
    });
  }
  if (
    ["trojan", "anytls", "mieru", "hysteria2", "tuic"].find((i) => i === type)
  ) {
    users.forEach((user) => {
      if (!user.password) {
        throw new Error(`User ${user.name} has no password`);
      }
    });
  }

  const query = db.prepare(`
    INSERT OR IGNORE INTO ListenersUsers
    (listenerName, userName)
    VALUES ${usernames.map(() => "(?, ?)").join(", ")}
  `);
  query.run(...usernames.map((username) => [listenerName, username]).flat());
}

export function removeUsersFromListener(
  listenerName: string,
  usernames: string[],
) {
  const query = db.prepare(`
    DELETE FROM ListenersUsers
    WHERE listenerName = ?
    AND userName IN (${usernames.map(() => "?").join(", ")})
  `);
  query.run(listenerName, ...usernames);
}

export function getListenerUsers(name: string): User[] {
  const query = db.prepare(`
    SELECT * FROM Users
    WHERE name IN(
      SELECT userName FROM ListenersUsers
      WHERE listenerName = ?
    )
  `);
  const res = query.all(name) as unknown as User[];
  return res;
}
