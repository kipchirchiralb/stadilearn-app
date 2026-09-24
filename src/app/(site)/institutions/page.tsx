import type { Metadata } from "next";
import { Card, CheckList, CtaBand, FeatureGrid, Icon, Notice, PageHero, Section, SectionHeader, Steps } from "@/components/ui";
import { getSessionUser } from "@/lib/auth/session";
import { listInstitutionAffiliations, wantsInstitutionDashboard } from "@/lib/institutions";

export const metadata: Metadata = {
  title: "For Institutions",
  description:
    "Deliver digital and AI learning programmes through Moodle and see cohort participation, completion and certification in institution-scoped Stadilearn dashboards.",
};

export default async function InstitutionsPage() {
  const user = await getSessionUser();
  const affiliations = user ? await listInstitutionAffiliations(user.id) : [];
  const orgAccount = Boolean(user && wantsInstitutionDashboard(affiliations));
  const dashboardCta = { href: "/app/dashboard", label: "Open institution dashboard" };
  const signupCta = { href: "/signup?role=institution", label: "Create institution account" };
  const signInCta = { href: "/login?next=/app/dashboard", label: "Sign in" };
  const primary = user ? dashboardCta : { href: "/contact?type=institution", label: "Request a programme conversation" };

  return (
    <>
      <PageHero
        aside={
          <Card>
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-md">What your dashboard shows</h2>
            <ul className="space-y-space-sm">
              {[
                ["groups", "Enrolment and active learners per cohort"],
                ["task_alt", "Module and course completion"],
                ["quiz", "Assessment performance summaries"],
                ["trending_down", "Drop-off points by module"],
                ["workspace_premium", "Certificates issued and verified"],
                ["download", "CSV and PDF exports for partners and donors"],
              ].map(([icon, label]) => (
                <li className="flex items-center gap-space-sm font-body-md text-body-md text-on-surface" key={label}>
                  <Icon className="text-primary text-[22px]" name={icon} />
                  {label}
                </li>
              ))}
            </ul>
            <p className="mt-space-md font-body-sm text-body-sm text-on-surface-variant">
              Figures are read from Moodle and show when they were last updated.
            </p>
          </Card>
        }
        eyebrow="For institutions & organisations"
        highlight="into visible progress."
        intro="Schools, TVETs, NGOs, county programmes and training organisations deliver courses to their cohorts in Moodle. A Stadilearn institution account then gives you the summaries: participation, completion, learner reports and certification."
        primary={primary}
        secondary={{ href: "#reporting", label: "View reporting capabilities" }}
        title="Turn a learning programme"
      />
      <Section tone="low">
        <SectionHeader eyebrow="Partnership offer" title="Everything a programme needs around the classroom" />
        <FeatureGrid
          items={[
            { icon: "handshake", title: "Programme delivery support", body: "We help you define goals, choose pathways and plan cohorts that fit your learners and timelines." },
            { icon: "account_tree", title: "Courses and cohorts in Moodle", body: "Learners are organised into Moodle cohorts and groups with assigned trainers and access dates." },
            { icon: "person_add", title: "Trainer assignment and learner support", body: "Assign trainers to cohorts; learners get AI assistance and a support route with human escalation." },
            { icon: "dashboard", title: "Institution-scoped dashboards", body: "Your account sees only your institution's cohorts. Access is checked on the server, not just hidden in the interface." },
            { icon: "school", title: "Kenyan classroom context", body: "Programmes, examples and reporting are shaped for Kenyan schools, counties and TVET settings." },
            { icon: "tune", title: "Responsible AI with limits", body: "AI assistance runs within configurable usage limits per programme, and normal Moodle access continues if AI is unavailable." },
          ]}
        />
      </Section>
      <Section id="reporting">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter lg:gap-space-xl items-center">
          <div>
            <SectionHeader
              align="left"
              eyebrow="Reporting"
              intro="Reports are built from Moodle completion and assessment data, enriched with your programme, county and cohort metadata."
              title="Evidence you can share with partners and funders"
            />
            <CheckList
              items={[
                { title: "Filters", body: "Course, cohort, trainer, county, gender, language and date — where data is collected lawfully." },
                { title: "Exports", body: "CSV and PDF formatted for programme and donor reporting. Large reports run in the background." },
                { title: "Transparency", body: "Every report shows its filters, generation time, source and data freshness." },
                { title: "Privacy", body: "No identifiable statistics for small groups without an approved privacy review." },
              ]}
            />
          </div>
          <Card>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-sm">Institution accounts</h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {orgAccount
                ? "You already have an institution account. Until Stadilearn verifies the organisation and nominates you as admin, the dashboard shows no learner data."
                : "Institution and partner staff create a Stadilearn account, then Stadilearn links it to your institution after verification. Until access is approved, your dashboard shows no learner data."}
            </p>
            <div className="mt-space-md flex flex-wrap gap-space-sm">
              {user ? (
                <a className="inline-flex items-center gap-space-xs bg-primary-container text-on-primary font-label-md text-label-md px-space-lg py-space-sm rounded-lg hover:bg-primary transition-all" href="/app/dashboard">
                  {orgAccount ? "Open institution dashboard" : "Open dashboard"}
                </a>
              ) : (
                <>
                  <a className="inline-flex items-center gap-space-xs bg-primary-container text-on-primary font-label-md text-label-md px-space-lg py-space-sm rounded-lg hover:bg-primary transition-all" href={signupCta.href}>
                    {signupCta.label}
                  </a>
                  <a className="inline-flex items-center gap-space-xs font-label-md text-label-md text-primary font-bold px-space-sm py-space-sm hover:text-secondary-container" href={signInCta.href}>
                    {signInCta.label}
                  </a>
                </>
              )}
            </div>
          </Card>
        </div>
      </Section>
      <Section tone="low">
        <SectionHeader eyebrow="Implementation model" title="From goal to evidence in six steps" />
        <Steps
          steps={[
            { title: "Define the learning goal", body: "Agree who you want to reach and what they should be able to do." },
            { title: "Select the course pathway", body: "Choose or configure courses for learners and trainers." },
            { title: "Prepare trainers and learners", body: "Train your trainers and onboard learners to both platforms." },
            { title: "Launch cohorts", body: "Open cohorts in Moodle with schedules and assigned trainers.", accent: true },
            { title: "Monitor participation", body: "Follow activity, completion and drop-off in your dashboard." },
            { title: "Review and improve", body: "Export evidence, review results and adjust delivery." },
          ]}
        />
        <div className="mt-space-lg">
          <Notice action={{ href: "/contact?type=institution&brief=1", label: "Request programme brief" }} icon="description">
            Need something to share internally? Ask for our programme brief and we will send the current version.
          </Notice>
        </div>
      </Section>
      <CtaBand
        body={
          user
            ? orgAccount
              ? "Open your dashboard to see verification status, or contact Stadilearn if you are waiting on approval."
              : "Tell us about your learners, goals and timelines. We will follow up to plan a programme that fits."
            : "Tell us about your learners, goals and timelines. We will follow up to plan a programme that fits."
        }
        icon="domain"
        primary={user ? dashboardCta : { href: "/contact?type=institution", label: "Request a programme conversation" }}
        secondary={user ? { href: "/contact?type=institution", label: "Contact Stadilearn" } : { href: "/impact", label: "View impact" }}
        title={user ? "Continue with your institution account." : "Talk to Stadilearn."}
      />
    </>
  );
}
