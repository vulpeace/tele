import { writeFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import { initializeClientConfig } from "../configConstructor/clientConfig.js";

export let db: DatabaseSync;

const REQUIRED_TABLES = [
  "Users",
  "Listeners",
  "Proxies",
  "Configs",
  "Admins",
  "ProxiesUsers",
  "ProxiesListeners",
  "ProxyGroups",
];

function missingObjects(
  db: DatabaseSync,
  type: "table" | "index",
  names: string[],
) {
  return names.filter((name) => {
    const row = db.prepare(
      "SELECT count(*) as c FROM sqlite_master WHERE type = ? AND name = ?",
    ).get(type, name) as unknown as { c: number };
    return !row || row.c === 0;
  });
}

function findDuplicatedPaths(db: DatabaseSync): string[] {
  return (
    db.prepare(
      "SELECT path FROM Users GROUP BY path HAVING count(*) > 1",
    ).all() as unknown as string[]
  );
}

export async function connectToDatabase(dbFileLocation: string) {
  db = new DatabaseSync(dbFileLocation);
  db.exec("PRAGMA foreign_keys=ON");
  db.exec("PRAGMA journal_mode=WAL");

  const missingTables = missingObjects(db, "table", REQUIRED_TABLES);
  if (missingTables.length > 0) {
    throw new Error(
      `Database schema is out of date, missing table(s): ${missingTables.join(", ")}.\n`
    );
  }

  if (missingObjects(db, "index", ["idx_Users_path"]).length > 0) {
    const duplicates = findDuplicatedPaths(db);
    if (duplicates.length > 0) {
      console.warn(
        `Cannot create idx_Users_path - paths are duplicated: ${duplicates}`
      );
    } else {
      throw new Error("Database schema is out of date, missing index: idx_Users_path");
    }
  }
}

export async function initializeDatabase(dbFileLocation: string) {
  console.info("Initializing the db...");
  try {
    db?.close();
  } catch {}
  await writeFile(dbFileLocation, "");
  db = new DatabaseSync(dbFileLocation);
  db.exec(`
    PRAGMA foreign_keys=ON;
    PRAGMA journal_mode=WAL;
    BEGIN TRANSACTION;
    CREATE TABLE Users(
      name TEXT PRIMARY KEY,
      uuid TEXT,
      flow TEXT,
      password TEXT,
      path TEXT NOT NULL
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_Users_path ON Users(path);
    CREATE TABLE Listeners(
      name TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      typeSpecific BLOB
    );
    CREATE TABLE Proxies(
      name TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      typeSpecific BLOB
    );
    CREATE TABLE Configs(
      name TEXT PRIMARY KEY,
      data BLOB
    );
    CREATE TABLE Admins(
      username TEXT PRIMARY KEY,
      pwdHash TEXT NOT NULL,
      tokenID TEXT
    );
    CREATE TABLE ProxiesUsers(
      proxyName TEXT,
      userName TEXT,
      CONSTRAINT fk_proxyName
      FOREIGN KEY (proxyName)
      REFERENCES Proxies(name)
      ON DELETE CASCADE
      ON UPDATE CASCADE,
      CONSTRAINT fk_userName
      FOREIGN KEY (userName)
      REFERENCES Users(name)
      ON DELETE CASCADE
      ON UPDATE CASCADE,
      UNIQUE (proxyName, userName)
    );
    CREATE TABLE ProxiesListeners(
      proxyName TEXT,
      listenerName TEXT,
      CONSTRAINT fk_proxyName
      FOREIGN KEY (proxyName)
      REFERENCES Proxies(name)
      ON DELETE CASCADE
      ON UPDATE CASCADE,
      CONSTRAINT fk_listenerName
      FOREIGN KEY (listenerName)
      REFERENCES Listeners(name)
      ON DELETE CASCADE
      ON UPDATE CASCADE,
      UNIQUE (proxyName, listenerName)
    );
    CREATE TABLE ProxyGroups(
      groupName TEXT,
      proxyName TEXT,
      CONSTRAINT fk_proxyName
      FOREIGN KEY (proxyName)
      REFERENCES Proxies(name)
      ON DELETE CASCADE
      ON UPDATE CASCADE,
      UNIQUE (groupName, proxyName)
    );
    COMMIT;
  `);
  initializeClientConfig();
  console.info("Success");
}
