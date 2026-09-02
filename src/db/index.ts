import { writeFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import { initializeClientConfig } from "../configConstructor/clientConfig.js";

export let db: DatabaseSync;

export async function connectToDatabase(dbFileLocation: string) {
  db = new DatabaseSync(dbFileLocation);
  db.exec("PRAGMA foreign_keys=ON");
  db.exec("PRAGMA journal_mode=WAL");
  // Add ways to migrate the database
  const requiredTables = [
    "Users",
    "Listeners",
    "Proxies",
    "Configs",
    "Admins",
    "ListenersUsers",
    "ProxyGroups",
  ];
  for (const table of requiredTables) {
    const row = db
      .prepare(
        "SELECT count(*) as c FROM sqlite_master WHERE type='table' AND name=?",
      )
      .get(table) as any;
    if (!row || row.c === 0) {
      throw new Error(`no such table: ${table}`);
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
    CREATE TABLE ListenersUsers(
      listenerName TEXT,
      userName TEXT,
      CONSTRAINT fk_listenerName
      FOREIGN KEY (listenerName)
      REFERENCES Listeners(name)
      ON DELETE CASCADE
      ON UPDATE CASCADE,
      CONSTRAINT fk_userName
      FOREIGN KEY (userName)
      REFERENCES Users(name)
      ON DELETE CASCADE
      ON UPDATE CASCADE,
      UNIQUE (listenerName, userName)
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
