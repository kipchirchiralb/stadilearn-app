import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "AI Transparency & Safeguarding", description: "How Stadilearn uses AI, its limits, data handling and human oversight." };

export default function AiTransparencyPage() {
  return (
    <LegalPage
      eyebrow="AI transparency"
      intro="Stadilearn uses AI to support learners and trainers. This page explains how it works, what it will not do, and how your data is handled."
      lastUpdated="14 September 2026"
      sections={[
        { id: "features", title: "Where we use AI", body: <ul><li>Virtual tutor for questions about course content.</li><li>Optional adaptive practice questions.</li><li>Support assistant for navigation and account help.</li><li>Trainer assistant for draft lesson plans, quiz ideas and feedback.</li></ul> },
        { id: "grounding", title: "Grounding and citations", body: <p>The tutor answers from approved, published course content indexed from Moodle and cites its source where possible. Hidden, unpublished or withdrawn content is excluded. When the material does not support an answer, the tutor says so.</p> },
        { id: "guardrails", title: "Guardrails", body: <ul><li>Refuses to complete graded assessments or give final answers learners must demonstrate.</li><li>Favours explanations, hints, examples and guiding questions.</li><li>Stays within educational and platform-support topics.</li><li>Trainer drafts are labelled and require human approval before use.</li><li>AI practice never changes official Moodle grades.</li></ul> },
        { id: "labelling", title: "Labelling and feedback", body: <p>All AI output is visibly labelled. Learners can flag poor or unsafe answers; flags go to a review queue with the course, source, model and prompt version so our team can fix problems.</p> },
        { id: "data", title: "Your data and AI providers", body: <p>Questions and relevant course excerpts are sent to a hosted AI provider through a provider-neutral adapter. We configure no-training and retention settings where available and have data processing agreements with providers. See the <Link href="/privacy">Privacy Policy</Link>.</p> },
        { id: "limits", title: "Limits and availability", body: <p>Per-user, daily and programme usage limits apply. If AI is unavailable or quotas are exhausted, AI features pause gracefully and Moodle access continues. AI can make mistakes; it does not replace your trainer.</p> },
        { id: "safeguarding", title: "Safeguarding", body: <p>Conversations suggesting a learner may be at risk are handled under our <Link href="/safeguarding">safeguarding procedure</Link>.</p> },
      ]}
      title="AI Transparency & Safeguarding"
    />
  );
}
