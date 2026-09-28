import {
  MihomoClientConfig,
  MihomoClientConfigDiff,
  MihomoClientConfigStringified,
} from "@/src/interfaces/config.js";
import { deepMerge } from "@/src/util/deepMerge.js";
import { db } from "../index.js";

export function getBaseClientConfigs(names?: string[]) {
  const query = names
    ? db.prepare(`
      SELECT * FROM Configs
      WHERE name IN (
      ${names.map(() => "?").join(", ")}
      )
    `)
    : db.prepare(`
    SELECT * FROM Configs
  `);

  const configs = (names
    ? query.all(...names)
    : query.all()) as unknown as MihomoClientConfigStringified[];

  return configs.map((config) => ({
    name: config.name,
    data: JSON.parse(config.data) as MihomoClientConfig,
  }));
}

export function createBaseClientConfig(
  clientConfig: MihomoClientConfigStringified,
) {
  const query = db.prepare(`
    INSERT INTO Configs
    (name, data)
    VALUES (?, ?)
  `);
  query.run(clientConfig.name, clientConfig.data);
}

export function updateBaseClientConfig(
  originalName: string,
  payload: MihomoClientConfigDiff,
) {
  const originalConfigs = getBaseClientConfigs([originalName]);
  if (originalConfigs.length === 0) {
    throw new Error("Not Found");
  }

  const query = db.prepare(`
    UPDATE Configs
    SET data = ?
    WHERE name = ?
  `);
  query.run(
    JSON.stringify(deepMerge(originalConfigs[0].data, payload)),
    originalName,
  );
}

export function deleteBaseClientConfig(name: string) {
  const query = db.prepare(`
    DELETE FROM Configs
    WHERE name = ?
  `);
  query.run(name);
}
