import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function sessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("Missing environment variable SESSION_SECRET");
  return secret;
}

/** HMAC-SHA256 hex of the OTP, as stored in otp_codes.code_hash. */
export function hmacOtp(code: string) {
  return createHmac("sha256", sessionSecret()).update(code, "utf8").digest("hex");
}

export function hmacEqual(left: string, right: string) {
  const a = Buffer.from(left, "hex");
  const b = Buffer.from(right, "hex");
  return a.length === b.length && a.length > 0 && timingSafeEqual(a, b);
}
