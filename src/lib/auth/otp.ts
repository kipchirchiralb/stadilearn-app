import { randomInt } from "node:crypto";
import { appDb } from "@/lib/db";
import { hmacEqual, hmacOtp, normalizeEmail, sha256 } from "@/lib/auth/hash";
import { sendOtpEmail } from "@/lib/mail";

export const OTP_PURPOSES = ["signup", "login", "recovery"] as const;
export type OtpPurpose = (typeof OTP_PURPOSES)[number];

const GENERIC_VERIFY_ERROR = "That code did not work. Try again.";
const RESEND_SECONDS = 60;
const HOURLY_LIMIT = 8;
const HOUR_SECONDS = 3600;

type UserRow = {
  id: number;
  email: string;
  status: "pending" | "active" | "locked" | "disabled";
  preferred_language: "en" | "sw";
};

export function isOtpPurpose(value: unknown): value is OtpPurpose {
  return typeof value === "string" && (OTP_PURPOSES as readonly string[]).includes(value);
}

export async function findUserByEmail(email: string) {
  const [user] = await appDb.query<UserRow>(
    "SELECT id, email, status, preferred_language FROM users WHERE email = ?",
    [normalizeEmail(email)],
  );
  return user ?? null;
}

function ttlSeconds() {
  const n = Number(process.env.OTP_TTL_SECONDS || 600);
  return Number.isFinite(n) && n >= 60 ? Math.min(n, 3600) : 600;
}

function canReceive(user: UserRow, purpose: OtpPurpose) {
  if (user.status === "locked" || user.status === "disabled") return false;
  if (purpose === "signup") return user.status === "pending";
  return user.status === "active" || user.status === "pending";
}

export async function issueOtp(opts: {
  email: string;
  purpose: OtpPurpose;
  ip?: string;
}): Promise<{ queued: boolean }> {
  const email = normalizeEmail(opts.email);
  const user = await findUserByEmail(email);
  if (!user || !canReceive(user, opts.purpose)) return { queued: false };

  // created_at uses the DB's CURRENT_TIMESTAMP zone; elapsed seconds stay correct
  // even when that zone differs from UTC_TIMESTAMP / the Node process.
  const [recent] = await appDb.query<{ age_sec: number | null }>(
    `SELECT TIMESTAMPDIFF(SECOND, created_at, CURRENT_TIMESTAMP(3)) AS age_sec
     FROM otp_codes
     WHERE email = ? AND purpose = ?
     ORDER BY id DESC LIMIT 1`,
    [email, opts.purpose],
  );
  if (recent && Number(recent.age_sec) < RESEND_SECONDS) return { queued: false };

  const [hourly] = await appDb.query<{ n: number }>(
    `SELECT COUNT(*) AS n FROM otp_codes
     WHERE email = ? AND TIMESTAMPDIFF(SECOND, created_at, CURRENT_TIMESTAMP(3)) < ?`,
    [email, HOUR_SECONDS],
  );
  if (Number(hourly?.n) >= HOURLY_LIMIT) return { queued: false };

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  const ttl = ttlSeconds();
  const minutes = Math.max(1, Math.round(ttl / 60));

  await appDb.execute(
    `UPDATE otp_codes SET consumed_at = CURRENT_TIMESTAMP(3)
     WHERE email = ? AND purpose = ? AND consumed_at IS NULL`,
    [email, opts.purpose],
  );

  const inserted = await appDb.execute(
    `INSERT INTO otp_codes (email, user_id, purpose, code_hash, expires_at, request_ip_hash)
     VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP(3) + INTERVAL ? SECOND, ?)`,
    [email, user.id, opts.purpose, hmacOtp(code), ttl, opts.ip ? sha256(opts.ip) : null],
  );

  await sendOtpEmail({
    to: email,
    code,
    minutes,
    language: user.preferred_language,
    userId: user.id,
    otpId: Number(inserted.insertId),
  });

  return { queued: true };
}

export async function consumeOtp(email: string, code: string, purpose?: OtpPurpose) {
  const normalised = normalizeEmail(email);
  const [row] = await appDb.query<{
    id: number;
    user_id: number | null;
    purpose: OtpPurpose;
    code_hash: string;
    attempts: number;
    max_attempts: number;
    expired: number;
  }>(
    `SELECT id, user_id, purpose, code_hash, attempts, max_attempts,
            (TIMESTAMPDIFF(SECOND, created_at, CURRENT_TIMESTAMP(3)) >= ?) AS expired
     FROM otp_codes
     WHERE email = ? AND consumed_at IS NULL ${purpose ? "AND purpose = ?" : "AND purpose IN ('signup','login','recovery')"}
     ORDER BY id DESC LIMIT 1`,
    purpose ? [ttlSeconds(), normalised, purpose] : [ttlSeconds(), normalised],
  );

  if (!row) return { ok: false as const, error: GENERIC_VERIFY_ERROR };
  if (Number(row.expired) || Number(row.attempts) >= Number(row.max_attempts)) {
    return { ok: false as const, error: GENERIC_VERIFY_ERROR };
  }

  if (!hmacEqual(row.code_hash, hmacOtp(code))) {
    await appDb.execute("UPDATE otp_codes SET attempts = attempts + 1 WHERE id = ?", [row.id]);
    return { ok: false as const, error: GENERIC_VERIFY_ERROR };
  }

  await appDb.execute(
    "UPDATE otp_codes SET consumed_at = CURRENT_TIMESTAMP(3), attempts = attempts + 1 WHERE id = ?",
    [row.id],
  );

  return {
    ok: true as const,
    userId: row.user_id === null ? null : Number(row.user_id),
    purpose: row.purpose,
  };
}

export async function activateUser(userId: number) {
  const [user] = await appDb.query<UserRow>("SELECT id, email, status, preferred_language FROM users WHERE id = ?", [
    userId,
  ]);
  if (!user) return { ok: false as const, error: GENERIC_VERIFY_ERROR };
  if (user.status === "locked" || user.status === "disabled") {
    return { ok: false as const, error: "This account cannot sign in." };
  }

  await appDb.execute(
    `UPDATE users
     SET status = IF(status = 'pending', 'active', status),
         email_verified_at = COALESCE(email_verified_at, UTC_TIMESTAMP(3)),
         last_login_at = UTC_TIMESTAMP(3)
     WHERE id = ?`,
    [userId],
  );

  return { ok: true as const, user };
}
