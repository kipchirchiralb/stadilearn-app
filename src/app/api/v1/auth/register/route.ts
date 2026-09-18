import { ROLES, isEmail } from "@/lib/validation";

/**
 * Start registration: validate details and send a verification code.
 * Returns the same response whether or not the email already has an account.
 *
 * TODO(next phase): create a pending account, record consent with purpose and
 * timestamp, and trigger the OTP flow.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const errors: Record<string, string> = {};

  const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : "";
  if (fullName.length < 2 || fullName.length > 120) errors.fullName = "Enter your full name.";
  if (!isEmail(body?.email)) errors.email = "Enter a valid email address.";
  if (!ROLES.includes(body?.role)) errors.role = "Choose how you will use Stadilearn.";
  if (body?.role === "institution" && !(typeof body?.organization === "string" && body.organization.trim().length >= 2)) {
    errors.organization = "Enter your institution or organisation name.";
  }
  if (body?.acceptTerms !== true) errors.acceptTerms = "You need to accept the terms and privacy notice.";
  if (body?.ageConfirmed !== true) errors.ageConfirmed = "Confirm your age or guardian consent.";

  if (Object.keys(errors).length) return Response.json({ errors }, { status: 400 });

  return Response.json(
    { ok: true, message: "Check your email for a 6-digit code to confirm your account." },
    { status: 202 },
  );
}
