import { db } from "../index.js";
import { AdminHashed } from "@/src/interfaces/admin.js";

export function getAdmin(
  username: string | null,
  tokenId: string | null,
): AdminHashed {
  if (!username && !tokenId) {
    throw new Error("Either admin username or tokenId must be present");
  }

  const query = username
    ? db.prepare(`
    SELECT * FROM Admins
    WHERE username = ?
  `)
    : db.prepare(`
    SELECT * FROM Admins
    WHERE tokenId = ?
  `);
  const admin = query.get(username || tokenId) as unknown as AdminHashed;
  return admin;
}

export function addAdmin(admin: AdminHashed) {
  const query = db.prepare(`
    INSERT INTO Admins
    (username, pwdHash)
    VALUES (?, ?)
  `);
  query.run(admin.username, admin.pwdHash);
}

export function associateTokenId(username: string, tokenId: string) {
  const query = db.prepare(`
    UPDATE Admins
    SET tokenId = ?
    WHERE username = ?
  `);
  query.run(tokenId, username);
}

export function deleteAdmin(username: string) {
  const query = db.prepare(`
    DELETE FROM Admins
    WHERE username = ?
  `);
  query.run(username);
}
