import {
  MihomoClientConfig,
  MihomoClientConfigStringified,
} from "@/src/interfaces/config.js";
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

  let configs: MihomoClientConfigStringified[];
  if (names) {
    configs = query.all(...names) as unknown as MihomoClientConfigStringified[];
  } else {
    configs = query.all() as unknown as MihomoClientConfigStringified[];
  }

  const unwrappedConfigs = configs.map((config) => {
    return {
      name: config.name,
      data: {
        ...JSON.parse(config.data),
      } as MihomoClientConfig,
    };
  });
  return unwrappedConfigs;
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

export function deleteBaseClientConfig(name: string) {
  const query = db.prepare(`
    DELETE FROM Configs
    WHERE name = ?
  `);
  query.run(name);
}
