import { isEmail } from "@/lib/validation";

/**
 * Verify a one-time code and start a session.
 *
 * TODO(next phase): compare against the stored hash, enforce expiry and max attempts,
 * invalidate on success, rotate the session ID, and set a Secure HttpOnly cookie.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!isEmail(body?.email) || typeof body?.code !== "string" || !/^\d{6}$/.test(body.code)) {
    return Response.json({ error: "Enter the 6-digit code from your email." }, { status: 400 });
  }
  return Response.json(
    { error: "Sign in is not available yet. The authentication service is being connected." },
    { status: 501 },
  );
}
