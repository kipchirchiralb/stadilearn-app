import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { CONTACT } from "@/lib/site";

export const metadata: Metadata = { title: "Security", description: "How Stadilearn protects the platform and how to report a vulnerability." };

export default function SecurityPage() {
  return (
    <LegalPage
      eyebrow="Security"
      intro="We take the security of learner, trainer and institution data seriously."
      lastUpdated="14 September 2026"
      sections={[
        { id: "measures", title: "How we protect the platform", body: <ul><li>TLS everywhere, with HSTS.</li><li>Passwordless sign-in with short-lived, hashed one-time codes, attempt limits and resend throttling.</li><li>Secure, HttpOnly session cookies limited to stadilearn.co.ke.</li><li>Role- and institution-based access enforced on the server for every request.</li><li>Read-only access to the Moodle database; Stadilearn never writes to Moodle tables.</li><li>Encryption at rest for databases and backups, with daily off-host backups.</li><li>Rate limiting, input validation, audit logs and dependency scanning.</li></ul> },
        { id: "report", title: "Report a vulnerability", body: <p>Email <strong>{CONTACT.email}</strong> with the subject “Security”. Include steps to reproduce and the impact. Please do not access other people&apos;s data, disrupt the service, or publicly disclose the issue before we have had a chance to fix it.</p> },
        { id: "accounts", title: "Protect your account", body: <ul><li>Secure the email account you use to sign in.</li><li>Never share one-time codes — Stadilearn staff will never ask for them.</li><li>Sign out on shared devices.</li></ul> },
      ]}
      title="Security"
    />
  );
}
