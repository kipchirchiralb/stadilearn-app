import type { Metadata } from "next";
import { AiDisclosureNotice, CheckList, CtaBand, FeatureGrid, PageHero, Section, SectionHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "AI Learning Support",
  description: "How Stadilearn's AI tutor, practice, support and trainer assistants work, and the guardrails that keep learning honest.",
};

export default function AiSupportPage() {
  return (
    <>
      <PageHero
        eyebrow="AI learning support"
        highlight="without losing the learning."
        intro="Stadilearn's AI assistants explain, hint and guide, using approved course material. They are there to support your thinking and your teacher, not to replace either."
        primary={{ href: "/login?next=/app/assistant", label: "Sign in to try the assistant" }}
        secondary={{ href: "/ai-transparency", label: "Read AI transparency" }}
        title="Get help"
      />
      <Section tone="low">
        <SectionHeader eyebrow="The assistants" title="Four kinds of help" />
        <FeatureGrid
          columns={2}
          items={[
            { icon: "psychology", title: "Virtual tutor", body: "Ask questions about your lesson. The tutor explains concepts, asks guiding questions, and cites the course, module or lesson it drew from where possible." },
            { icon: "fitness_center", title: "Adaptive practice", body: "Generate optional practice questions at your level from approved content and author-seeded question banks. Practice never changes your Moodle grades." },
            { icon: "support_agent", title: "Support assistant", body: "Get help with navigation, your account and enrolment. Escalate to a person whenever you need to." },
            { icon: "edit_note", title: "Trainer assistant", body: "Trainers can request draft lesson plans, quiz ideas, hints and feedback comments. Every draft is labelled and must be reviewed before use." },
          ]}
        />
      </Section>
      <Section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter lg:gap-space-xl">
          <div>
            <SectionHeader align="left" eyebrow="Guardrails" title="What the AI will and will not do" />
            <CheckList
              items={[
                { title: "Does not complete graded work", body: "It refuses or redirects requests to answer assessments on your behalf." },
                { title: "Does not replace a trainer", body: "Complex questions can be flagged for human follow-up." },
                { title: "May say it does not know", body: "If the course material does not support an answer, it tells you instead of guessing." },
                { title: "Always labelled", body: "Every AI response is clearly marked as AI-generated." },
                { title: "You can flag poor answers", body: "Flagged answers go to a review queue checked by the Stadilearn team." },
              ]}
            />
          </div>
          <div>
            <SectionHeader align="left" eyebrow="Language and availability" title="Know the limits" />
            <CheckList
              items={[
                { title: "English and Kiswahili", body: "Ask in either language, or mix them. Kiswahili quality depends on the model and content available." },
                { title: "Usage limits apply", body: "Daily limits per user and programme keep the service fair and affordable." },
                { title: "Service may be unavailable", body: "If AI is paused or quotas run out, your Moodle courses still work as normal." },
                { title: "Your conversations", body: "We configure providers not to train on learner conversations where that control is available." },
              ]}
            />
          </div>
        </div>
        <div className="mt-space-lg">
          <AiDisclosureNotice />
        </div>
      </Section>
      <CtaBand
        body="Sign in to your Stadilearn account to open the assistant from your dashboard."
        icon="smart_toy"
        primary={{ href: "/login?next=/app/assistant", label: "Sign in to try the assistant" }}
        secondary={{ href: "/signup", label: "Create account" }}
        title="See how AI support works for you."
      />
    </>
  );
}
