import { getSessionUser } from "@/lib/auth/session";
import { getCertificateForPdf, normaliseCode } from "@/lib/certificates";
import { buildCertificatePdf } from "@/lib/certificates/pdf";

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Sign in to download this certificate." }, { status: 401 });

  const code = normaliseCode(decodeURIComponent((await params).code));
  if (!/^[A-Z0-9-]{6,40}$/.test(code)) {
    return Response.json({ error: "That certificate number is not valid." }, { status: 400 });
  }

  const record = await getCertificateForPdf(code, user);
  if (!record) return Response.json({ error: "Certificate not found." }, { status: 404 });

  const bytes = await buildCertificatePdf(record);
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="stadilearn-${code}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
