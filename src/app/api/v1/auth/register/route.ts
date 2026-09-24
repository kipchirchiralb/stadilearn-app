import { NextResponse } from "next/server";
import { requestIp } from "@/lib/auth/http";
import { startRegistration } from "@/lib/auth/register";
import { ROLES, isEmail, type SignupRole } from "@/lib/validation";

/**
 * Start registration: create a pending account, record consent, and email a code.
 * Returns the same response whether or not the email already has an account.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const errors: Record<string, string> = {};

  const fullName = typeof body?.fullName === "string" ? body.fullName.trim() : "";
  if (fullName.length < 2 || fullName.length > 120) errors.fullName = "Enter your full name.";
  if (!isEmail(body?.email)) errors.email = "Enter a valid email address.";
  if (!ROLES.includes(body?.role as SignupRole)) errors.role = "Choose how you will use Stadilearn.";
  if (body?.role === "institution" && !(typeof body?.organization === "string" && body.organization.trim().length >= 2)) {
    errors.organization = "Enter your institution or organisation name.";
  }
  if (body?.acceptTerms !== true) errors.acceptTerms = "You need to accept the terms and privacy notice.";
  if (body?.ageConfirmed !== true) errors.ageConfirmed = "Confirm your age or guardian consent.";

  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 400 });

  try {
    await startRegistration({
      fullName,
      email: body.email,
      role: body.role as SignupRole,
      organization: typeof body?.organization === "string" ? body.organization : undefined,
      institutionType: typeof body?.institutionType === "string" ? body.institutionType : undefined,
      jobTitle: typeof body?.jobTitle === "string" ? body.jobTitle : undefined,
      county: typeof body?.county === "string" ? body.county : undefined,
      demographicsConsent: body?.demographicsConsent === true,
      ip: requestIp(request),
    });
  } catch (err) {
    console.error("[auth] register failed", err);
    return NextResponse.json({ error: "We could not create your account right now. Please try again." }, { status: 500 });
  }

  return NextResponse.json(
    { ok: true, message: "Check your email for a 6-digit code to confirm your account." },
    { status: 202 },
  );
}
