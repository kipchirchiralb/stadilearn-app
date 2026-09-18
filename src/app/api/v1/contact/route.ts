const ENQUIRY_TYPES = [
  "learning",
  "teacher-training",
  "institution",
  "support",
  "certificate",
  "media",
  "other",
] as const;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const errors: Record<string, string> = {};

  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const type = body?.type;

  if (name.length < 2 || name.length > 120) errors.name = "Enter your name.";
  if (!EMAIL.test(email) || email.length > 254) errors.email = "Enter a valid email address.";
  if (!ENQUIRY_TYPES.includes(type)) errors.type = "Choose an enquiry type.";
  if (message.length < 10 || message.length > 5000) errors.message = "Enter a message of at least 10 characters.";
  if (body?.consent !== true) errors.consent = "We need your consent to respond.";

  if (Object.keys(errors).length) return Response.json({ errors }, { status: 400 });

  // TODO(next phase): persist the enquiry in the custom database and queue an email to the right team.
  return Response.json({ ok: true, stored: false }, { status: 202 });
}
