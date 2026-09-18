import { isEmail } from "@/lib/validation";

/**
 * Request an emailed one-time code for sign in, sign up or recovery.
 * Always returns the same response for valid input to prevent account enumeration.
 *
 * TODO(next phase): rate limit, generate a CSPRNG code, store only its hash with a
 * short expiry and attempt counter, and queue the email.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!isEmail(body?.email)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  return Response.json(
    { ok: true, message: "If this email can be used, we have sent a one-time code to it." },
    { status: 202 },
  );
}
