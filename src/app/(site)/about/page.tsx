import type { Metadata } from "next";
import Link from "next/link";
import { Card, CtaBand, FeatureGrid, Notice, PageHero, Section, SectionHeader } from "@/components/ui";

export const metadata: Metadata = {
  title: "About Stadilearn",
  description: "Stadilearn's mission is to expand practical AI and technology literacy in Kenya through structured learning, teacher enablement and responsible AI.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Stadilearn"
        highlight="AI and technology literacy in Kenya."
        intro="Stadilearn is a learning platform for digital skills, AI literacy and teacher capacity building. We combine structured courses in Moodle with AI assistance, progress reporting and verifiable certificates."
        primary={{ href: "/contact", label: "Work with Stadilearn" }}
        secondary={{ href: "/how-it-works", label: "See how it works" }}
        title="Expanding practical"
      />
      <Section tone="low">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter lg:gap-space-xl">
          <div>
            <SectionHeader align="left" eyebrow="Why this matters" title="Digital confidence is now a basic skill" />
            <div className="space-y-space-md font-body-md text-body-md text-on-surface-variant">
              <p>
                Work, schooling and public services increasingly depend on digital tools, and AI is changing how people
                write, search and learn. Learners need practical confidence, and they need to use AI responsibly.
              </p>
              <p>
                Lasting change depends on local teachers who can deliver these skills well. That is why teacher
                enablement sits at the centre of what we do.
              </p>
            </div>
          </div>
          <div>
            <SectionHeader align="left" eyebrow="Who we serve" title="Learners, teachers and institutions" />
            <ul className="space-y-space-sm">
              {[
                ["Learners", "Youth, students and adults building everyday digital and AI skills.", "/learners"],
                ["Teachers and trainers", "Educators delivering digital and AI literacy.", "/teachers"],
                ["Institutions", "Schools, TVETs, NGOs and county programmes.", "/institutions"],
                ["Partners and funders", "Organisations supporting and measuring programmes.", "/impact"],
              ].map(([t, d, href]) => (
                <li key={t}>
                  <Link className="block bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-md transition-shadow" href={href}>
                    <span className="font-label-lg text-label-lg text-on-surface">{t}</span>
                    <span className="block font-body-sm text-body-sm text-on-surface-variant">{d}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>
      <Section>
        <SectionHeader eyebrow="Our approach" title="How we work" />
        <FeatureGrid
          columns={4}
          items={[
            { icon: "account_tree", title: "Structured learning", body: "Clear levels, modules and completion criteria in Moodle." },
            { icon: "cast_for_education", title: "Teacher enablement", body: "A dedicated training track that builds local delivery capacity." },
            { icon: "verified_user", title: "Responsible AI", body: "Grounded, labelled assistance with guardrails and human review." },
            { icon: "query_stats", title: "Evidence-informed", body: "Measured participation and completion used to improve delivery." },
          ]}
        />
      </Section>
      <Section tone="low">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <Card>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">Kenya context</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Designed mobile-first for mid-range Android phones and 2G/3G connections. The platform is in English.
            </p>
          </Card>
          <Card>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">Team and governance</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Team members, roles and affiliations will be listed here once verified and approved for publication.
            </p>
          </Card>
          <Card>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">Partners and supporters</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Partner names and logos are shown only with their permission.
            </p>
          </Card>
        </div>
        <div className="mt-space-lg">
          <Notice icon="policy">
            Transparency matters to us. Read our <Link className="text-primary font-semibold underline" href="/privacy">privacy notice</Link>,{" "}
            <Link className="text-primary font-semibold underline" href="/safeguarding">safeguarding</Link>,{" "}
            <Link className="text-primary font-semibold underline" href="/accessibility">accessibility</Link> and{" "}
            <Link className="text-primary font-semibold underline" href="/ai-transparency">AI transparency</Link> pages.
          </Notice>
        </div>
      </Section>
      <CtaBand
        body="Partner with us on learner programmes, teacher development or research."
        icon="handshake"
        primary={{ href: "/contact", label: "Work with Stadilearn" }}
        secondary={{ href: "/impact", label: "View impact" }}
        title="Let us build skills together."
      />
    </>
  );
}
