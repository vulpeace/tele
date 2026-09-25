import { writeFile } from "node:fs/promises";
import { DatabaseSync } from "node:sqlite";
import { initializeClientConfig } from "../configConstructor/clientConfig.js";

export let db: DatabaseSync;

export async function connectToDatabase(dbFileLocation: string) {
  db = new DatabaseSync(dbFileLocation);
  db.exec("PRAGMA foreign_keys=ON");
  db.exec("PRAGMA journal_mode=WAL");
  const requiredTables = [
    "Users",
    "Listeners",
    "Proxies",
    "Configs",
    "Admins",
    "ProxiesUsers",
    "ProxiesListeners",
    "ProxyGroups",
  ];
  const missing = requiredTables.filter((table) => {
    const row = db
      .prepare(
        "SELECT count(*) as c FROM sqlite_master WHERE type='table' AND name=?",
      )
      .get(table) as unknown as { c: number };
    return !row || row.c === 0;
  });
  if (missing.length > 0) {
    const hasOldJoin =
      (
        db
          .prepare(
            "SELECT count(*) as c FROM sqlite_master WHERE type='table' AND name='ListenersUsers'",
          )
          .get() as unknown as { c: number }
      ).c !== 0;
    const needsNewJoins =
      missing.includes("ProxiesUsers") || missing.includes("ProxiesListeners");
    if (hasOldJoin && needsNewJoins) {
      console.info(
        `Migrating DB: missing [${missing.join(", ")}], found legacy ListenersUsers – preserving Users/Listeners/Proxies and creating new join tables...`,
      );
      migrateLegacyListenersUsers(db);
      const stillMissing = requiredTables.filter((table) => {
        const row = db
          .prepare(
            "SELECT count(*) as c FROM sqlite_master WHERE type='table' AND name=?",
          )
          .get(table) as unknown as { c: number };
        return !row || row.c === 0;
      });
      if (stillMissing.length > 0) {
        throw new Error(`no such table: ${stillMissing.join(", ")}`);
      }
      return;
    }
    throw new Error(`no such table: ${missing.join(", ")}`);
  }
}

function migrateLegacyListenersUsers(database: DatabaseSync) {
  database.exec("PRAGMA foreign_keys=OFF");
  try {
    const usersCount = (
      database.prepare("SELECT count(*) as c FROM Users").get() as unknown as {
        c: number;
      }
    ).c;
    const listenersCount = (
      database
        .prepare("SELECT count(*) as c FROM Listeners")
        .get() as unknown as { c: number }
    ).c;
    const proxiesCount = (
      database
        .prepare("SELECT count(*) as c FROM Proxies")
        .get() as unknown as { c: number }
    ).c;
    console.info(
      `Preserving ${usersCount} users, ${listenersCount} listeners, ${proxiesCount} proxies`,
    );

    const hasBackup =
      (
        database
          .prepare(
            "SELECT count(*) as c FROM sqlite_master WHERE type='table' AND name='ListenersUsers_backup'",
          )
          .get() as unknown as { c: number }
      ).c !== 0;
    if (!hasBackup) {
      database.exec(
        "ALTER TABLE ListenersUsers RENAME TO ListenersUsers_backup",
      );
      console.info(
        "Backed up legacy ListenersUsers → ListenersUsers_backup (contains old user→listener bindings)",
      );
    } else {
      const hasOriginal =
        (
          database
            .prepare(
              "SELECT count(*) as c FROM sqlite_master WHERE type='table' AND name='ListenersUsers'",
            )
            .get() as unknown as { c: number }
        ).c !== 0;
      if (hasOriginal) database.exec("DROP TABLE ListenersUsers");
    }

    const hasProxiesUsers =
      (
        database
          .prepare(
            "SELECT count(*) as c FROM sqlite_master WHERE type='table' AND name='ProxiesUsers'",
          )
          .get() as unknown as { c: number }
      ).c !== 0;
    if (!hasProxiesUsers) {
      database.exec(`
        CREATE TABLE ProxiesUsers(
          proxyName TEXT,
          userName TEXT,
          CONSTRAINT fk_proxyName FOREIGN KEY (proxyName) REFERENCES Proxies(name) ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT fk_userName FOREIGN KEY (userName) REFERENCES Users(name) ON DELETE CASCADE ON UPDATE CASCADE,
          UNIQUE (proxyName, userName)
        )
      `);
      console.info("Created ProxiesUsers");
    }

    const hasProxiesListeners =
      (
        database
          .prepare(
            "SELECT count(*) as c FROM sqlite_master WHERE type='table' AND name='ProxiesListeners'",
          )
          .get() as unknown as { c: number }
      ).c !== 0;
    if (!hasProxiesListeners) {
      database.exec(`
        CREATE TABLE ProxiesListeners(
          proxyName TEXT,
          listenerName TEXT,
          CONSTRAINT fk_proxyName FOREIGN KEY (proxyName) REFERENCES Proxies(name) ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT fk_listenerName FOREIGN KEY (listenerName) REFERENCES Listeners(name) ON DELETE CASCADE ON UPDATE CASCADE,
          UNIQUE (proxyName, listenerName)
        )
      `);
      console.info("Created ProxiesListeners");
    }

    const afterUsers = (
      database.prepare("SELECT count(*) as c FROM Users").get() as unknown as {
        c: number;
      }
    ).c;
    const afterListeners = (
      database
        .prepare("SELECT count(*) as c FROM Listeners")
        .get() as unknown as { c: number }
    ).c;
    const afterProxies = (
      database
        .prepare("SELECT count(*) as c FROM Proxies")
        .get() as unknown as { c: number }
    ).c;
    if (
      afterUsers !== usersCount ||
      afterListeners !== listenersCount ||
      afterProxies !== proxiesCount
    ) {
      throw new Error(
        "Migration verification failed: Users/Listeners/Proxies count changed",
      );
    }
    console.info(
      "Migration complete – Users/Listeners/Proxies preserved, new join tables ready (empty)",
    );
  } finally {
    database.exec("PRAGMA foreign_keys=ON");
  }
}

export function runLegacyMigration(dbFileLocation: string) {
  const database = new DatabaseSync(dbFileLocation);
  try {
    migrateLegacyListenersUsers(database);
  } finally {
    database.close();
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
