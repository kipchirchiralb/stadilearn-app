import type { Metadata } from "next";
import { FeatureGrid, MoodleHandoffNotice, PageHero, Section, SectionHeader } from "@/components/ui";
import { MOODLE_HOST, MOODLE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Trainer Workspace",
  description: "Trainer and author tools in Moodle for teaching, grading and content creation, plus cohort insights and AI drafting on Stadilearn.",
};

export default function TrainerWorkspacePage() {
  return (
    <>
      <PageHero
        eyebrow="Trainer & author workspace"
        highlight="and insight in Stadilearn."
        intro={
          <>
            Teaching, grading and content creation happen in Moodle at{" "}
            <code className="font-mono text-primary">{MOODLE_HOST}</code>. Cohort statistics, alerts and AI drafting
            live in your Stadilearn dashboard.
          </>
        }
        primary={{ href: MOODLE_URL, label: "Open teaching workspace", external: true }}
        secondary={{ href: "/login?next=/app/dashboard", label: "Sign in to Stadilearn" }}
        title="Teach in Moodle,"
      />
      <Section tone="low">
        <SectionHeader eyebrow="In Moodle" title="Moodle-owned trainer and author tasks" />
        <FeatureGrid
          items={[
            { icon: "co_present", title: "Open teaching workspace", body: "Run your assigned courses, post announcements and moderate forums." },
            { icon: "grading", title: "Open grading workspace", body: "Grade submissions with rubrics and give feedback in the Moodle gradebook." },
            { icon: "edit_document", title: "Open authoring workspace", body: "Create and revise official course content and question banks." },
          ]}
        />
      </Section>
      <Section>
        <SectionHeader eyebrow="In Stadilearn" title="Around your teaching" />
        <FeatureGrid
          items={[
            { icon: "monitoring", title: "Cohort statistics", body: "Learner counts, activity, completion and drop-off for your assigned cohorts only." },
            { icon: "notifications_active", title: "Alerts", body: "Pending grading indicators, inactive learners and synchronisation issues." },
            { icon: "edit_note", title: "AI drafting", body: "Draft lesson plans, quiz ideas and feedback. Review every draft before copying it into Moodle." },
          ]}
        />
        <div className="mt-space-lg">
          <MoodleHandoffNotice />
        </div>
      </Section>
    </>
  );
}
