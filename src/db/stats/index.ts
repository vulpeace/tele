// import { db } from "../index.js";

// export async function getLastOnline(names: string[]): Promise<{ name: string, lastOnline: number }[]> {
//   const query = db.prepare(`
//     SELECT name, lastOnline
//     FROM Stats
//     WHERE name IN ${names.map(() => "?").join(", ")}
//   `);
//   const res = query.all(...names) as unknown as { name: string, lastOnline: number }[];
//   return res;
// }

// export async function resetStats(name: string) {
//   const resetDate = Date.now();
//   const query = db.prepare(`
//     UPDATE Stats
//     SET allTimeTraffic = 0,
//     startsFrom = ? WHERE name = ?
//   `);
//   const res = query.run(
//     resetDate,
//     name
//   );
// }

// export async function updateStats(
//   stats: StatsWithDiff[])
// {
//   const query = db.prepare(`
//     UPDATE Stats
//     SET allTimeTraffic = allTimeTraffic + ?,
//     lastOnline = ? WHERE name = ?
//   `);

//   db.exec("BEGIN TRANSACTION");
//   try {
//     for (const statsItem of stats) {
//       query.run(
//         statsItem.diff,
//         statsItem.lastOnline,
//         statsItem.name
//       );
//     }
//     db.exec("COMMIT");
//   } catch(e) {
//     db.exec("ROLLBACK");
//     throw e;
//   }
// }
