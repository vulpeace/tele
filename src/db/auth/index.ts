import { db } from "../index.js";
import { AdminHashed } from "@/src/interfaces/admin.js";

export function getAdminCount(): number {
  const row = db.prepare("SELECT count(*) as c FROM Admin").get() as unknown as
    { c: number } | undefined;
  return row?.c ?? 0;
}

export function getAdmin(): AdminHashed | undefined {
  return db
    .prepare("SELECT username, pwdHash FROM Admin LIMIT 1")
    .get() as unknown as AdminHashed | undefined;
}

export function getAdminSession(
  tokenId: string,
): { tokenId: string } | undefined {
  return db
    .prepare("SELECT tokenId FROM AdminSessions WHERE tokenId = ?")
    .get(tokenId) as unknown as { tokenId: string } | undefined;
}

export function addAdmin(admin: AdminHashed) {
  const query = db.prepare(`
    INSERT INTO Admin
    (username, pwdHash)
    VALUES (?, ?)
  `);
  query.run(admin.username, admin.pwdHash);
}

export function addAdminSession(tokenId: string) {
  const query = db.prepare(`
    INSERT INTO AdminSessions
    (tokenId)
    VALUES (?)
  `);
  query.run(tokenId);
}

export function deleteAdminSession(tokenId: string) {
  const query = db.prepare(`
    DELETE FROM AdminSessions
    WHERE tokenId = ?
  `);
  query.run(tokenId);
}

export function deleteAllAdminSessions() {
  db.prepare("DELETE FROM AdminSessions").run();
}

export function deleteAdmin(username: string) {
  const query = db.prepare(`
    DELETE FROM Admin
    WHERE username = ?
  `);
  query.run(username);
}
