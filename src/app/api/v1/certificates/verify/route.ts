import { lookupCertificate, normaliseCode } from "@/lib/certificates";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const code = typeof body?.code === "string" ? normaliseCode(body.code) : "";

  if (!/^[A-Z0-9-]{6,40}$/.test(code)) {
    return Response.json({ error: "Enter the verification code shown on the certificate." }, { status: 400 });
  }

  const result = await lookupCertificate(code);
  return Response.json(result);
}
