import { NextResponse } from "next/server";
import { isOtpPurpose, issueOtp } from "@/lib/auth/otp";
import { requestIp } from "@/lib/auth/http";
import { isEmail } from "@/lib/validation";

const ACCEPTED = {
  ok: true,
  message: "If this email can be used, we have sent a one-time code to it.",
};

/**
 * Request an emailed one-time code for sign in, sign up or recovery.
 * Always returns the same response for valid input to prevent account enumeration.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!isEmail(body?.email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (!isOtpPurpose(body?.purpose)) {
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 400 });
  }

  try {
    await issueOtp({ email: body.email, purpose: body.purpose, ip: requestIp(request) });
  } catch (err) {
    console.error("[auth] OTP request failed", err);
  }

  return NextResponse.json(ACCEPTED, { status: 202 });
}
