import type { Metadata } from "next";
import { Card, CheckList, CtaBand, FeatureGrid, Icon, PageHero, Section, SectionHeader, Steps } from "@/components/ui";
import { MOODLE_HOST } from "@/lib/site";

export const metadata: Metadata = {
  title: "For Teachers",
  description: "Teacher training for confident digital and AI literacy delivery, with cohort insights and AI-assisted drafting that you review.",
};

export default function TeachersPage() {
  return (
    <>
      <PageHero
        eyebrow="For teachers & trainers"
        highlight="with confidence."
        intro="Stadilearn's teacher training pathway prepares you to deliver digital and AI literacy well, gives you visibility of your cohorts, and saves time on planning with AI drafts that you stay in charge of."
        primary={{ href: "/learn/ai-for-classroom-teachers", label: "Explore teacher training" }}
        secondary={{ href: "/login", label: "Sign in as a trainer" }}
        tertiary={{ href: "/contact?type=teacher-training", label: "Partner on teacher development", icon: "trending_flat" }}
        title="Help others learn"
      />
      <Section tone="low">
        <SectionHeader eyebrow="What you get" title="Support for every part of teaching" />
        <FeatureGrid
          items={[
            { icon: "route", title: "Teacher training pathway", body: "A distinct curriculum track with its own certification, mapped to a trainer competency framework." },
            { icon: "co_present", title: "Practical delivery guidance", body: "Session guides, examples and activities for teaching digital and AI literacy in real Kenyan classrooms." },
            { icon: "monitoring", title: "Cohort visibility", body: "See learner counts, activity, completion, assessment summaries and drop-off points for your assigned cohorts." },
            { icon: "edit_note", title: "AI-assisted drafts", body: "Request draft lesson plans, quiz ideas, hints and feedback comments. Every draft is labelled and needs your review before use." },
            { icon: "forum", title: "Trainer community and support", body: "Connect with other trainers, share practice and escalate issues to the Stadilearn team." },
            { icon: "military_tech", title: "Certificate and competency pathway", body: "Progress through competencies and earn a verifiable trainer certificate on completion." },
          ]}
        />
      </Section>
      <Section>
        <SectionHeader
          eyebrow="Clear division of work"
          intro="You use both platforms, each for what it does best. Logins are separate at launch."
          title="How trainer work is divided"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          <Card>
            <div className="flex items-center gap-space-sm mb-space-md">
              <Icon className="text-secondary-container text-[28px]" name="school" />
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Moodle</h3>
                <p className="font-mono text-[13px] text-primary">{MOODLE_HOST}</p>
              </div>
            </div>
            <CheckList
              items={[
                { title: "Course content and activities" },
                { title: "Grading and feedback" },
                { title: "Forums and announcements" },
                { title: "Cohort and group access" },
              ]}
            />
          </Card>
          <Card>
            <div className="flex items-center gap-space-sm mb-space-md">
              <Icon className="text-primary text-[28px]" name="dashboard" />
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Stadilearn</h3>
                <p className="font-mono text-[13px] text-primary">stadilearn.co.ke</p>
              </div>
            </div>
            <CheckList
              items={[
                { title: "Cohort insights and statistics" },
                { title: "Operational tasks and alerts" },
                { title: "AI drafting assistance" },
                { title: "Reports and support" },
              ]}
            />
          </Card>
        </div>
      </Section>
      <Section tone="low">
        <SectionHeader eyebrow="Getting started" title="Your path as a trainer" />
        <Steps
          steps={[
            { title: "Create your account", body: "Sign up as a teacher or trainer with the same email you use in Moodle, then verify it." },
            { title: "Join the training track", body: "Complete the teacher training pathway in Moodle." },
            { title: "Get assigned cohorts", body: "Your programme administrator assigns you to cohorts." },
            { title: "Teach and track", body: "Teach in Moodle; follow progress and use AI drafts in Stadilearn.", accent: true },
          ]}
        />
      </Section>
      <CtaBand
        body="Join the teacher training pathway or talk to us about developing teachers in your school, county or programme."
        icon="cast_for_education"
        primary={{ href: "/signup?role=trainer", label: "Join teacher training" }}
        secondary={{ href: "/contact?type=teacher-training", label: "Talk to Stadilearn" }}
        title="Build your teaching practice."
      />
    </>
  );
}
