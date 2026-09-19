import { NextResponse } from "next/server";
import { activateUser, consumeOtp, findUserByEmail, isOtpPurpose } from "@/lib/auth/otp";
import { requestIp, requestUserAgent, safeAppPath } from "@/lib/auth/http";
import { applySessionCookie, createSession, revokeSessionCookie } from "@/lib/auth/session";
import { appDb } from "@/lib/db";
import { linkStadilearnUserToMoodle } from "@/lib/moodle/identity";
import { isEmail } from "@/lib/validation";
import { normalizeEmail, sha256 } from "@/lib/auth/hash";

/**
 * Verify a one-time code, activate a pending account if needed, and start a session.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!isEmail(body?.email) || typeof body?.code !== "string" || !/^\d{6}$/.test(body.code)) {
    return NextResponse.json({ error: "Enter the 6-digit code from your email." }, { status: 400 });
  }

  const purpose = isOtpPurpose(body?.purpose) ? body.purpose : undefined;
  const email = normalizeEmail(body.email);

  try {
    const consumed = await consumeOtp(email, body.code, purpose);
    if (!consumed.ok) return NextResponse.json({ error: consumed.error }, { status: 400 });

    const userId = consumed.userId ?? (await findUserByEmail(email))?.id;
    if (!userId) return NextResponse.json({ error: "That code did not work. Try again." }, { status: 400 });

    const activated = await activateUser(userId);
    if (!activated.ok) return NextResponse.json({ error: activated.error }, { status: 403 });

    await linkStadilearnUserToMoodle(userId, email).catch((err) =>
      console.error("[auth] Moodle email link failed", err),
    );

    await revokeSessionCookie();
    const { token, expires } = await createSession(userId, {
      ip: requestIp(request),
      userAgent: requestUserAgent(request),
    });

    const ip = requestIp(request);
    await appDb.execute(
      "INSERT INTO audit_events (actor_id, action, entity_type, entity_id, ip_hash, details) VALUES (?, ?, 'user', ?, ?, ?)",
      [
        userId,
        consumed.purpose === "signup" ? "auth.register_verified" : "auth.login",
        String(userId),
        ip ? sha256(ip) : null,
        JSON.stringify({ purpose: consumed.purpose }),
      ],
    ).catch((err) => console.error("[auth] audit insert failed", err));

    const res = NextResponse.json({ ok: true, redirectTo: safeAppPath(body?.next) });
    applySessionCookie(res, token, expires);
    return res;
  } catch (err) {
    console.error("[auth] OTP verify failed", err);
    return NextResponse.json({ error: "We could not verify that code right now. Please try again." }, { status: 500 });
  }
}
