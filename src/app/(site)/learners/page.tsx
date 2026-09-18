import type { Metadata } from "next";
import { CtaBand, FeatureGrid, MoodleHandoffNotice, PageHero, Section, SectionHeader, Steps } from "@/components/ui";

export const metadata: Metadata = {
  title: "For Learners",
  description: "Learn useful digital and AI skills one step at a time, on your phone, with guided practice and verifiable certificates.",
};

export default function LearnersPage() {
  return (
    <>
      <PageHero
        eyebrow="For learners & students"
        highlight="one step at a time."
        intro="Build practical digital and AI skills at your own level. Study on a phone, get guided help when you are stuck, and earn proof of completion you can share."
        primary={{ href: "/learn", label: "Explore courses" }}
        secondary={{ href: "/login", label: "Sign in" }}
        title="Learn useful skills,"
      />
      <Section tone="low">
        <SectionHeader eyebrow="Your experience" title="Built around how you actually learn" />
        <FeatureGrid
          items={[
            { icon: "stairs", title: "Start where you are", body: "Courses run from beginner to advanced, with clear prerequisites so you know what to take first." },
            { icon: "smartphone", title: "Learn on a phone", body: "Lightweight pages, downloadable PDFs and low-data media designed for mid-range Android phones." },
            { icon: "psychology", title: "Practise with guidance", body: "Optional AI explanations, hints and extra practice questions. The assistant helps you think; it does not do graded work for you." },
            { icon: "insights", title: "Know your progress", body: "See course and module completion summaries from Moodle in your Stadilearn dashboard." },
            { icon: "workspace_premium", title: "Earn proof of completion", body: "Track certificate status and share a public verification link with employers or schools." },
            { icon: "support_agent", title: "Get help", body: "Use the support assistant for account and navigation questions, and escalate to a person when you need to." },
          ]}
        />
      </Section>
      <Section>
        <SectionHeader
          eyebrow="Two sites, one journey"
          intro="Stadilearn and Moodle each do a different job. Your accounts are separate at launch."
          title="How the two sites work"
        />
        <Steps
          steps={[
            { title: "Create a Stadilearn account", body: "Sign up at stadilearn.co.ke and verify your email with a one-time code.", tag: "stadilearn.co.ke" },
            { title: "Choose or receive a course", body: "Browse the catalogue or join through your school, TVET or programme.", tag: "stadilearn.co.ke" },
            { title: "Open Moodle for lessons", body: "Study lessons, take quizzes and submit activities in Moodle. Sign in there separately.", tag: "elearning.stadilearn.co.ke", accent: true },
            { title: "Return to Stadilearn", body: "Come back for progress views, AI assistance, support and certificates.", tag: "stadilearn.co.ke" },
          ]}
        />
        <div className="mt-space-lg">
          <MoodleHandoffNotice />
        </div>
      </Section>
      <CtaBand
        body="Create your free Stadilearn account and pick your first course."
        primary={{ href: "/learn", label: "Explore courses" }}
        secondary={{ href: "/signup", label: "Create account" }}
        title="Ready to begin?"
      />
    </>
  );
}
