import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/LegalPage";
import { CONTACT } from "@/lib/site";

export const metadata: Metadata = { title: "Safeguarding", description: "How Stadilearn protects learners, including under-18s, and how to raise a concern." };

export default function SafeguardingPage() {
  return (
    <LegalPage
      eyebrow="Safeguarding"
      intro="Everyone who learns with Stadilearn should be safe. This page explains how we protect learners and how to raise a concern."
      lastUpdated="14 September 2026"
      sections={[
        { id: "minors", title: "Learners under 18", body: <ul><li>Guardian consent is required before an under-18 learner can use the platform.</li><li>We collect the minimum data needed and do not publish identifiable information.</li><li>Institutions enrolling minors must follow their own safeguarding policies as well as ours.</li></ul> },
        { id: "conduct", title: "Expected conduct", body: <p>Trainers, staff and learners must communicate respectfully and only through approved channels such as Moodle forums and Stadilearn support.</p> },
        { id: "ai", title: "AI and safety", body: <p>AI assistants are scoped to education and support topics. Unsafe responses can be flagged and are reviewed by our team. See <Link href="/ai-transparency">AI Transparency</Link>.</p> },
        { id: "concern", title: "Raise a concern", body: <p>If you are worried about a learner&apos;s safety, email <strong>{CONTACT.email}</strong> with the subject “Safeguarding” or call {CONTACT.phone}. If someone is in immediate danger, contact the police or call the national child helpline <strong>116</strong>.</p> },
      ]}
      title="Safeguarding"
    />
  );
}
