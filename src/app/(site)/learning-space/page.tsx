import type { Metadata } from "next";
import { CheckList, CtaBand, MoodleHandoffNotice, PageHero, Section, SectionHeader } from "@/components/ui";
import { MOODLE_HOST, MOODLE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Open Learning Space",
  description: "Your Moodle learning space is where lessons, quizzes and submissions happen. Here is what to expect before you go.",
};

export default function LearningSpacePage() {
  return (
    <>
      <PageHero
        eyebrow="Moodle learning space"
        highlight="in Moodle."
        intro={
          <>
            Lessons, quizzes, assignments and forums live at <code className="font-mono text-primary">{MOODLE_HOST}</code>.
            The button below opens Moodle in a new tab, where you sign in with your Moodle account.
          </>
        }
        primary={{ href: MOODLE_URL, label: "Open learning space", external: true }}
        secondary={{ href: "/help#topic-1", label: "Moodle access help" }}
        title="Study your courses"
      />
      <Section tone="low">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter lg:gap-space-xl">
          <div>
            <SectionHeader align="left" eyebrow="Before you go" title="What to expect" />
            <CheckList
              items={[
                { title: "Separate sign in", body: "Your Moodle login is different from your Stadilearn account at launch." },
                { title: "Your enrolled courses", body: "You will see the courses you are enrolled in, or that your institution has assigned." },
                { title: "Download for later", body: "Save lesson PDFs on Wi-Fi to study without using data." },
              ]}
            />
          </div>
          <div>
            <SectionHeader align="left" eyebrow="Come back to Stadilearn" title="For everything around your study" />
            <CheckList
              items={[
                { title: "Progress summaries", body: "See how far you have come across courses." },
                { title: "AI tutor", body: "Get explanations and hints grounded in your course." },
                { title: "Certificates", body: "Check certificate status and share a verification link." },
              ]}
            />
          </div>
        </div>
        <div className="mt-space-lg">
          <MoodleHandoffNotice />
        </div>
      </Section>
      <CtaBand
        body="Create an account to see your progress, use the AI tutor and receive certificates."
        primary={{ href: "/signup", label: "Create account" }}
        secondary={{ href: "/login", label: "Sign in" }}
        title="New to Stadilearn?"
      />
    </>
  );
}
