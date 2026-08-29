import { db } from "../index.js";
import sum from "hash-sum";
import { NewUser, User, UserDiff } from "@/src/interfaces/user.js";

export function getUsers(usernames?: string[]): User[] {
  const query = usernames
    ? db.prepare(`
    SELECT * FROM Users
    WHERE name IN (${usernames.map(() => "?").join(", ")})
  `)
    : db.prepare(`
    SELECT * FROM Users
  `);
  if (usernames) return query.all(...usernames) as unknown as User[];
  return query.all() as unknown as User[];
}

export function createUser(user: NewUser): string {
  const path = sum(user);
  const insertUsersQuery = db.prepare(`
    INSERT INTO Users
    (name, uuid, flow, password, path)
    VALUES(?, ?, ?, ?, ?)
  `);
  insertUsersQuery.run(user.name, user.uuid, user.flow, user.password, path);
  return path;
}

export function deleteUser(username: string) {
  const query = db.prepare(`
    DELETE FROM Users
    WHERE name = ?
  `);
  query.run(username);
}

export function updateUser(originalUsername: string, user: UserDiff) {
  const { name, uuid, flow, password } = user;

  const setClauses: string[] = [];
  const setParameters: string[] = [];
  if (name) {
    setClauses.push("name = ?");
    setParameters.push(name);
  }
  if (uuid) {
    setClauses.push("uuid = ?");
    setParameters.push(uuid);
  }
  if (flow) {
    setClauses.push("flow = ?");
    setParameters.push(flow);
  }
  if (password) {
    setClauses.push("password = ?");
    setParameters.push(password);
  }

  const query = db.prepare(`
    UPDATE Users
    SET ${setClauses.join(", ")}
    WHERE name = ?
  `);

  query.run(...setParameters, originalUsername);
}

export function getUserListeners(username: string): string[] {
  const query = db.prepare(`
    Select listenerName
    FROM ListenersUsers
    WHERE userName = ?
  `);
  return query.all(username) as unknown as string[];
}
