import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/LegalPage";
import { MOODLE_HOST } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of Service", description: "The terms for using Stadilearn." };

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Terms"
      intro="These terms apply when you use stadilearn.co.ke. By creating an account you agree to them."
      lastUpdated="14 September 2026"
      sections={[
        { id: "service", title: "The service", body: <p>Stadilearn provides accounts, AI learning assistance, progress summaries, certificates and reporting. Courses, assessments and grading are delivered through Moodle at {MOODLE_HOST}, which has its own terms and login.</p> },
        { id: "accounts", title: "Your account", body: <ul><li>Give accurate information and keep your email account secure; we sign you in with one-time codes sent to it.</li><li>One person per account. Do not share access.</li><li>Institution accounts are granted access to learner data only after verification.</li></ul> },
        { id: "use", title: "Acceptable use", body: <ul><li>Do not try to break, overload or access parts of the service you are not authorised to use.</li><li>Do not use AI features to cheat on assessments or generate harmful content.</li><li>Respect other learners, trainers and staff.</li></ul> },
        { id: "ai", title: "AI features", body: <p>AI output can be wrong and is provided to support learning, not replace it. Usage limits apply and AI features may be paused. See <Link href="/ai-transparency">AI Transparency</Link>.</p> },
        { id: "certificates", title: "Certificates", body: <p>Certificates confirm completion of Stadilearn course requirements. They are not formal accreditation unless a specific programme says so. We may revoke a certificate issued in error or obtained through misconduct.</p> },
        { id: "availability", title: "Availability and changes", body: <p>We aim for high availability but cannot guarantee uninterrupted service. We may change features or these terms and will notify you of significant changes. The service is not promised to be free forever.</p> },
        { id: "liability", title: "Liability", body: <p>To the extent permitted by Kenyan law, Stadilearn is not liable for indirect losses arising from use of the service.</p> },
        { id: "law", title: "Governing law", body: <p>These terms are governed by the laws of Kenya.</p> },
      ]}
      title="Terms of Service"
    />
  );
}
