import { Card, CtaBand, Faq, Icon, MoodleHandoffNotice, PageHero, Section, SectionHeader, Steps } from "@/components/ui";
import { howItWorksFaq, howItWorksSteps, pageMeta } from "@/lib/seo";
import { MOODLE_HOST } from "@/lib/site";

export const metadata = pageMeta({
  title: "How It Works",
  description: "How Stadilearn and Moodle work together: separate accounts, studying in Moodle, and progress, AI help and certificates on Stadilearn.",
  path: "/how-it-works",
});

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        highlight="and study in Moodle."
        intro={
          <>
            Stadilearn (<code className="font-mono text-primary">stadilearn.co.ke</code>) is where you manage your account,
            get AI help, see progress and receive certificates. Moodle (
            <code className="font-mono text-primary">{MOODLE_HOST}</code>) is where lessons, quizzes and grading happen.
          </>
        }
        primary={{ href: "/signup", label: "Create account" }}
        secondary={{ href: "/learn", label: "Explore courses" }}
        title="Plan on Stadilearn,"
      />
      <Section tone="low">
        <SectionHeader eyebrow="Step by step" title="Your learning journey" />
        <Steps steps={howItWorksSteps()} />
      </Section>
      <Section>
        <SectionHeader eyebrow="Who does what" title="Two platforms, clear responsibilities" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {[
            {
              icon: "dashboard",
              name: "Stadilearn",
              host: "stadilearn.co.ke",
              items: ["Account and one-time-code sign in", "Progress and completion summaries", "AI tutor and support assistant", "Certificates and public verification", "Institution and partner reports", "Email notifications"],
            },
            {
              icon: "school",
              name: "Moodle",
              host: MOODLE_HOST,
              items: ["Course content and lessons", "Quizzes, assignments and grading", "Enrolments, cohorts and groups", "Forums and announcements", "Course and activity completion", "Moodle login and password"],
            },
          ].map((p) => (
            <Card key={p.name}>
              <div className="flex items-center gap-space-sm mb-space-md">
                <Icon className="text-primary text-[28px]" name={p.icon} />
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">{p.name}</h3>
                  <p className="font-mono text-[13px] text-primary">{p.host}</p>
                </div>
              </div>
              <ul className="space-y-space-xs font-body-md text-body-md text-on-surface-variant">
                {p.items.map((i) => (
                  <li className="flex items-center gap-space-xs" key={i}>
                    <Icon className="text-primary-container text-[18px]" name="check" />
                    {i}
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
        <div className="mt-space-lg">
          <MoodleHandoffNotice />
        </div>
      </Section>
      <Section tone="low">
        <SectionHeader eyebrow="FAQ" title="Common questions" />
        <Faq items={howItWorksFaq()} />
      </Section>
      <CtaBand
        body="Create your Stadilearn account, choose a course and open your Moodle learning space."
        primary={{ href: "/learn", label: "Explore courses" }}
        secondary={{ href: "/signup", label: "Create your account" }}
        title="Ready to begin?"
      />
    </>
  );
}
