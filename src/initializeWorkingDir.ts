import { mkdir } from "node:fs/promises";
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
  const isTestEnv = process.env.TEST_ENV;
  const binDir = process.cwd() + (isTestEnv ? "/temp/bin" : "/bin");
  const dataDir = process.cwd() + (isTestEnv ? "/temp/data" : "/data");
  Promise.all([
    await mkdir(binDir, { recursive: true }),
    await mkdir(dataDir, { recursive: true }),
  ]);

  const serverConfigLocation = dataDir + "/config.json";
  const mihomoConfigLocation = dataDir + "/mihomo-config.yaml";
  const dbFileLocation = dataDir + "/db.sqlite3";

  const promises = [
    readServerConfig(serverConfigLocation),
    readMihomoConfig(mihomoConfigLocation),
    connectToDatabase(dbFileLocation),
  ];
  const results = await Promise.allSettled(promises);

  let serverConfig: any;
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
    } else {
      if (i === 0) serverConfig = r.value;
    }
  }

  return {
    executable: binDir + "/mihomo",
    mihomoConfigLocation: mihomoConfigLocation,
    serverConfigLocation: serverConfigLocation,
    accessSecret: new TextEncoder().encode(serverConfig.accessSecret),
    refreshSecret: new TextEncoder().encode(serverConfig.refreshSecret),
    mihomoSecret: serverConfig.mihomoSecret,
    subscriptionPath: serverConfig.subscriptionPath,
  };
}
