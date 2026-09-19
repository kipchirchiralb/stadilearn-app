import type { Metadata } from "next";
import { Card, CtaBand, Faq, Icon, MoodleHandoffNotice, PageHero, Section, SectionHeader, Steps } from "@/components/ui";
import { MOODLE_HOST } from "@/lib/site";

export const metadata: Metadata = {
  title: "How It Works",
  description: "How Stadilearn and Moodle work together: separate accounts, studying in Moodle, and progress, AI help and certificates on Stadilearn.",
};

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
        <Steps
          steps={[
            {
              title: "Create your Stadilearn account",
              body: "Verify your email with a one-time code. Use the same email as Moodle so we can match your accounts. Logins stay separate.",
              tag: "Stadilearn",
            },
            { title: "Find your learning pathway", body: "Browse available courses or join through your institution.", tag: "Stadilearn" },
            {
              title: "Study in Moodle",
              body: "Lessons, quizzes, assignments, discussions and grading take place in Moodle.",
              tag: "Moodle",
              accent: true,
            },
            {
              title: "Use Stadilearn around your learning",
              body: "View progress summaries, ask the AI assistants for help, receive emails, and see certificates and reports where permitted.",
              tag: "Stadilearn",
            },
            {
              title: "Complete and verify",
              body: "Meet the course requirements, receive certificate status and share a verification link.",
              tag: "Stadilearn",
            },
          ]}
        />
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
        <Faq
          items={[
            { q: "Why are there two websites?", a: "Moodle is a proven learning system for lessons, assessments and grading. Stadilearn adds what Moodle does not: AI assistance, progress summaries, certificates, and reporting for institutions and partners." },
            { q: "Do I need two accounts?", a: "Yes. Your Stadilearn account and your Moodle account are separate, and signing in to one does not sign you in to the other. Use the same email on both so Stadilearn can match you and show progress or teaching data." },
            { q: "Where do I study?", a: `In Moodle at ${MOODLE_HOST}. Stadilearn links you to the right course or activity.` },
            { q: "Where do I see progress?", a: "In your Stadilearn dashboard. Progress is read from Moodle and shows when it was last updated." },
            { q: "What happens if I forget my Moodle password?", a: "Use the “Forgotten password” link on the Moodle login page. Stadilearn cannot reset Moodle passwords. Stadilearn itself signs you in with an emailed one-time code." },
            { q: "Does the AI tutor complete assignments?", a: "No. It explains concepts, gives hints and points to course material, but it will not complete graded work for you." },
            { q: "Can I learn with limited data?", a: "Yes. Pages are lightweight and many lessons have downloadable PDFs. Quizzes and submissions still need a connection to Moodle." },
            { q: "How are certificates verified?", a: "Each certificate has a unique code. Anyone can check it on the Verify Certificate page." },
          ]}
        />
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
