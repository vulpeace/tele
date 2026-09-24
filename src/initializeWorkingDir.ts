import { mkdir, readFile } from "node:fs/promises";
import {
  initializeMihomoConfig,
  readMihomoConfig,
} from "./configConstructor/serverConfig.js";
import {
  initializeServerConfig,
  readServerConfig,
} from "./configConstructor/teleConfig.js";
import { connectToDatabase, initializeDatabase } from "./db/index.js";

export async function initializeWorkingDir() {
  const binDir = process.cwd() + "/bin";
  const dataDir = process.cwd() + "/data";
  await Promise.all([
    mkdir(binDir, { recursive: true }),
    mkdir(dataDir, { recursive: true }),
  ]);

  const serverConfigLocation = dataDir + "/config.json";
  const mihomoConfigLocation = dataDir + "/mihomo-config.yaml";
  const dbFileLocation = dataDir + "/db.sqlite3";
  const versionFileLocation = process.cwd() + "/version";

  const promises = [
    readServerConfig(serverConfigLocation),
    readMihomoConfig(mihomoConfigLocation),
    connectToDatabase(dbFileLocation),
    readFile(versionFileLocation, "utf-8"),
  ];
  const results = await Promise.allSettled(promises);

  let serverConfig: any;
  let version = process.env.npm_package_version ?? "unknown";
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.status === "rejected") {
      if (i === 0)
        serverConfig = await initializeServerConfig(serverConfigLocation);
      if (i === 1)
        await initializeMihomoConfig(
          mihomoConfigLocation,
          serverConfig.mihomoSecret,
        );
      if (i === 2) await initializeDatabase(dbFileLocation);
      if (i === 3) {
        try {
          version = JSON.parse(
            await readFile(process.cwd() + "/package.json", "utf-8"),
          ).version;
        } catch {}
      }
    } else {
      if (i === 0) serverConfig = r.value;
      if (i === 3) version = r.value.trim();
    }
  }

  return {
    accessSecret: new TextEncoder().encode(serverConfig.accessSecret),
    refreshSecret: new TextEncoder().encode(serverConfig.refreshSecret),
    mihomoSecret: serverConfig.mihomoSecret,
    subscriptionPath: serverConfig.subscriptionPath,
    version: version,
  };
}
