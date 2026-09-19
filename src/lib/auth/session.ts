import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { sha256 } from "@/lib/auth/hash";
import { appDb } from "@/lib/db";

/**
 * Server-side sessions stored in the custom DB. The cookie carries a random
 * token; the database stores only its SHA-256, so a DB leak cannot be replayed.
 */

export const SESSION_COOKIE = "sl_session";
const IDLE_MINUTES = 60 * 12;
const ABSOLUTE_DAYS = 14;

export type AccountType = "learner" | "teacher" | "super_admin";

export type SessionUser = {
  id: number;
  fullName: string;
  accountType: AccountType;
  language: "en" | "sw";
  moodleUserId: number | null;
  /** Institutions where this user is an active admin. */
  adminOf: number[];
};

export async function createSession(userId: number, meta: { ip?: string; userAgent?: string } = {}) {
  const token = randomBytes(32).toString("base64url");
  const now = Date.now();
  const idle = new Date(now + IDLE_MINUTES * 60_000);
  const absolute = new Date(now + ABSOLUTE_DAYS * 86_400_000);
  await appDb.execute(
    `INSERT INTO sessions (id, user_id, idle_expires_at, absolute_expires_at, ip_hash, user_agent)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [sha256(token), userId, idle, absolute, meta.ip ? sha256(meta.ip) : null, meta.userAgent?.slice(0, 255) ?? null],
  );
  return { token, expires: absolute };
}

export function applySessionCookie(res: NextResponse, token: string, expires: Date) {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}

export async function revokeSessionCookie() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return;
  await appDb.execute(
    "UPDATE sessions SET revoked_at = UTC_TIMESTAMP(3) WHERE id = ? AND revoked_at IS NULL",
    [sha256(token)],
  );
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;

  const [row] = await appDb.query<{
    session_id: string;
    id: number;
    full_name: string;
    account_type: AccountType;
    preferred_language: "en" | "sw";
    moodle_user_id: number | null;
  }>(
    `SELECT s.id AS session_id, u.id, u.full_name, u.account_type, u.preferred_language, u.moodle_user_id
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.id = ? AND s.revoked_at IS NULL AND u.status = 'active'
       AND s.idle_expires_at > UTC_TIMESTAMP(3) AND s.absolute_expires_at > UTC_TIMESTAMP(3)`,
    [sha256(token)],
  );
  if (!row) return null;

  const [admins] = await Promise.all([
    appDb.query<{ institution_id: number }>(
      `SELECT m.institution_id FROM institution_members m
       JOIN institutions i ON i.id = m.institution_id AND i.status = 'active'
       WHERE m.user_id = ? AND m.member_role = 'admin' AND m.status = 'active'`,
      [row.id],
    ),
    appDb.execute(
      `UPDATE sessions SET last_seen_at = UTC_TIMESTAMP(3),
         idle_expires_at = LEAST(absolute_expires_at, UTC_TIMESTAMP(3) + INTERVAL ? MINUTE)
       WHERE id = ?`,
      [IDLE_MINUTES, row.session_id],
    ),
  ]);

  return {
    id: Number(row.id),
    fullName: row.full_name,
    accountType: row.account_type,
    language: row.preferred_language,
    moodleUserId: row.moodle_user_id === null ? null : Number(row.moodle_user_id),
    adminOf: admins.map((a) => Number(a.institution_id)),
  };
}

/** The role used for AI quotas and assistant access. */
export function effectiveRole(user: SessionUser) {
  if (user.accountType === "super_admin") return "super_admin";
  if (user.adminOf.length) return "institution_admin";
  return user.accountType;
}

export function canUseTrainerAssistant(user: SessionUser) {
  return user.accountType !== "learner";
}
