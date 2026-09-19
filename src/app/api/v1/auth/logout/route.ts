import { NextResponse } from "next/server";
import { clearSessionCookie, revokeSessionCookie } from "@/lib/auth/session";

/** End the current session and clear the cookie. */
export async function POST() {
  await revokeSessionCookie();
  const res = NextResponse.json({ ok: true });
  clearSessionCookie(res);
  return res;
}
