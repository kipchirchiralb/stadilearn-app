import type { Metadata } from "next";
import { Card, CheckList, CtaBand, FeatureGrid, Notice, PageHero, Section, SectionHeader, Steps } from "@/components/ui";

export const metadata: Metadata = {
  title: "Impact & Reporting",
  description: "What Stadilearn measures, how data is collected and interpreted, and how partners and funders receive programme evidence.",
};

export default function ImpactPage() {
  return (
    <>
      <PageHero
        eyebrow="For partners & funders"
        highlight="and reported honestly."
        intro="Stadilearn gives programme partners and funders clear evidence of participation, completion and teacher development, with a transparent method and a clear line between targets and verified results."
        primary={{ href: "/contact?type=institution", label: "Request programme information" }}
        secondary={{ href: "/institutions", label: "Partnership model" }}
        title="Impact, measured"
      />
      <Section tone="low">
        <SectionHeader eyebrow="Theory of change" title="From access to capability" />
        <Steps
          steps={[
            { title: "Access", body: "Learners and teachers join structured courses that work on phones and low bandwidth." },
            { title: "Engagement", body: "Guided practice, AI support and trainers keep learners progressing." },
            { title: "Completion", body: "Learners meet Moodle completion criteria and earn verifiable certificates." },
            { title: "Capability", body: "Graduates apply digital and AI skills at work, in school and in teaching.", accent: true },
          ]}
        />
      </Section>
      <Section>
        <SectionHeader eyebrow="What we measure" title="Indicators" />
        <FeatureGrid
          columns={4}
          items={[
            { icon: "how_to_reg", title: "Enrolment", body: "Learners enrolled per course, cohort and programme." },
            { icon: "local_fire_department", title: "Active participation", body: "Learners active within a reporting period." },
            { icon: "task_alt", title: "Completion", body: "Module and course completion from Moodle." },
            { icon: "quiz", title: "Assessment performance", body: "Summary results across assessments." },
            { icon: "trending_down", title: "Drop-off points", body: "Where learners stop progressing, by module." },
            { icon: "cast_for_education", title: "Teacher progression", body: "Trainers advancing through the training track." },
            { icon: "pie_chart", title: "Disaggregation", body: "By county, gender and institution where lawful and appropriate." },
            { icon: "workspace_premium", title: "Certification", body: "Certificates issued, verified and revoked." },
          ]}
        />
      </Section>
      <Section tone="low">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter lg:gap-space-xl">
          <div>
            <SectionHeader align="left" eyebrow="Method" title="How data is collected and interpreted" />
            <CheckList
              items={[
                { title: "Source", body: "Learning activity, completion and grades are read from Moodle without modification." },
                { title: "Enrichment", body: "Programme, institution and county metadata come from the Stadilearn platform." },
                { title: "Freshness", body: "Every report shows when its data was last synchronised." },
                { title: "Cadence", body: "Partner reports are available on demand, with summary reports shared at agreed intervals." },
              ]}
            />
          </div>
          <Card>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-sm">Targets, outputs, outcomes, impact</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
              We label every figure for what it is. A target is a goal. Outputs count activity. Outcomes show change in
              learners. Verified impact needs evidence and review.
            </p>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-sm">Public reports and case studies</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Approved public reports and consented learner stories will be published here as they become available.
            </p>
          </Card>
        </div>
        <div className="mt-space-lg">
          <Notice icon="lock">
            We do not publish personal learner data or identifiable statistics for small groups without an approved privacy review.
          </Notice>
        </div>
      </Section>
      <CtaBand
        body="Tell us about your programme and reporting needs."
        icon="query_stats"
        primary={{ href: "/contact?type=institution", label: "Request programme information" }}
        title="Need evidence for your programme?"
      />
    </>
  );
}
