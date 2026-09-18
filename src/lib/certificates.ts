/**
 * Placeholder certificate lookup until the custom database exists.
 * Demo codes let the UI show every verification state during development.
 */

export type CertificateResult =
  | { status: "valid"; displayName: string; course: string; completedOn: string; programme: string; code: string }
  | { status: "revoked"; code: string }
  | { status: "not_found" };

const DEMO: Record<string, CertificateResult> = {
  "SL-DEMO-VALID": {
    status: "valid",
    displayName: "Demo Learner",
    course: "Foundations of Practical AI & Everyday Work",
    completedOn: "2026-08-01",
    programme: "Stadilearn Digital & AI Literacy Programme",
    code: "SL-DEMO-VALID",
  },
  "SL-DEMO-REVOKED": { status: "revoked", code: "SL-DEMO-REVOKED" },
};

export function normaliseCode(input: string) {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}

export async function lookupCertificate(code: string): Promise<CertificateResult> {
  // TODO(next phase): query certificate records in the custom database.
  if (process.env.NODE_ENV !== "production" && DEMO[code]) return DEMO[code];
  return { status: "not_found" };
}
