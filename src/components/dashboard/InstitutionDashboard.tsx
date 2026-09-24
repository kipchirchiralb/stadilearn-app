import { CohortRoster } from "@/components/dashboard/CohortRoster";
import { ButtonLink, Card, CheckList, Icon, MoodleHandoffNotice, Notice } from "@/components/ui";
import type { InstitutionDashboardData } from "@/lib/institutions";
import { MOODLE_HOST, MOODLE_URL } from "@/lib/site";

function Stat({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex items-start gap-space-sm">
      <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
        <Icon className="text-[22px]" name={icon} />
      </div>
      <div>
        <p className="font-headline-sm text-headline-sm text-on-surface">{value}</p>
        <p className="font-body-sm text-body-sm text-on-surface-variant">{label}</p>
      </div>
    </div>
  );
}

function statusCopy(status: string) {
  if (status === "pending") return "Awaiting Stadilearn verification";
  if (status === "suspended") return "Suspended";
  return "Verified";
}

export function InstitutionDashboard({ firstName, data }: { firstName: string; data: InstitutionDashboardData }) {
  const names = data.institutions.map((row) => row.name).join(", ");

  return (
    <div className="space-y-space-lg">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-space-md">
        <div className="max-w-2xl">
          <p className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">{data.roleLabel}</p>
          <h1 className="font-headline-md text-headline-md text-on-surface">Welcome, {firstName}</h1>
          <p className="mt-space-xs font-body-md text-body-md text-on-surface-variant">
            {data.approved
              ? `Cohort summaries, named learner reports and certificates for ${names}. Access is limited to your organisation and checked on the server.`
              : "Your institution account is signed in. Stadilearn still needs to verify the organisation before this dashboard can show any learner data."}
          </p>
        </div>
        <div className="flex flex-wrap gap-space-sm shrink-0">
          <ButtonLink cta={{ href: MOODLE_URL, label: "Open Moodle", external: true }} />
          <ButtonLink cta={{ href: "/app/assistant?kind=trainer", label: "Ask the assistant" }} variant="secondary" />
          <ButtonLink cta={{ href: "/app/certificates", label: "Your certificates" }} variant="text" />
        </div>
      </div>

      {data.approved ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter">
          <Stat icon="groups" label="Learners in your cohorts" value={data.totals.learners} />
          <Stat icon="task_alt" label="Course completions" value={data.totals.completed} />
          <Stat icon="trending_down" label="Not yet started" value={data.totals.notStarted} />
          <Stat icon="workspace_premium" label="Certificates issued" value={data.totals.certificates} />
        </div>
      ) : (
        <Notice icon="hourglass_top" tone="warning" action={{ href: "/contact?type=institution", label: "Contact Stadilearn" }}>
          Until Stadilearn approves this organisation and nominates you as an institution admin, enrolment,
          completion and certificates stay hidden. You can still sign in and use the assistant for platform questions.
        </Notice>
      )}

      <section>
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-md">Your organisation</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {data.institutions.map((org) => (
            <Card key={org.id}>
              <p className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">{org.typeLabel}</p>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mt-1">{org.name}</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {statusCopy(org.status)}
                {org.county ? ` · ${org.county}` : ""}
                {` · ${org.memberRole === "requester" ? "Requested access" : org.memberRole}`}
                {org.memberStatus === "invited" ? " (invited)" : ""}
              </p>
              {org.access === "pending_grant" && org.status === "active" ? (
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-sm">
                  This organisation is verified, but Stadilearn has not granted you admin access yet.
                </p>
              ) : null}
            </Card>
          ))}
        </div>
      </section>

      {data.approved ? (
        <>
          <section>
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">Programmes</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md max-w-3xl">
              Pathways linked to your organisation. Course content stays in Moodle at {MOODLE_HOST}.
            </p>
            {data.programmes.length === 0 ? (
              <Card>
                <Icon className="text-primary text-[28px]" name="account_tree" />
                <h3 className="font-headline-sm text-headline-sm text-on-surface mt-space-sm">No programmes yet</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  Stadilearn will attach programmes when your cohorts are set up.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                {data.programmes.map((programme) => (
                  <Card key={programme.name}>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">{programme.name}</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 capitalize">{programme.status}</p>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">Cohorts</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md max-w-3xl">
              Named roster and per-learner completion for your organisation. Read-only here — add or remove people,
              and grade work, in Moodle.
            </p>
            {data.cohorts.length === 0 ? (
              <Card>
                <Icon className="text-primary text-[28px]" name="group_add" />
                <h3 className="font-headline-sm text-headline-sm text-on-surface mt-space-sm">No cohorts yet</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  When Stadilearn or your trainers open a cohort, participation, completion and certificates will
                  appear here.
                </p>
              </Card>
            ) : (
              <div className="space-y-space-md">
                {data.cohorts.map((cohort) => (
                  <CohortRoster cohort={cohort} key={cohort.id} />
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">Staff</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md max-w-3xl">
              People linked to your organisation on Stadilearn. Nominating extra admins is done by Stadilearn.
            </p>
            {data.staff.length === 0 ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant">No staff records yet.</p>
            ) : (
              <div className="overflow-x-auto min-w-0">
                <table className="w-full min-w-[24rem] border-collapse text-body-sm">
                  <thead>
                    <tr className="text-left font-label-sm text-label-sm text-on-surface-variant">
                      <th className="pb-space-xs pr-space-sm font-label-sm">Name</th>
                      <th className="pb-space-xs pr-space-sm font-label-sm">Role</th>
                      <th className="pb-space-xs font-label-sm">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.staff.map((person) => (
                      <tr className="border-t border-outline-variant/40" key={`${person.fullName}-${person.role}`}>
                        <td className="py-space-xs pr-space-sm text-on-surface">{person.fullName}</td>
                        <td className="py-space-xs pr-space-sm capitalize text-on-surface-variant">{person.role}</td>
                        <td className="py-space-xs capitalize text-on-surface-variant">{person.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <Card>
          <div className="flex items-center gap-space-sm mb-space-md">
            <Icon className="text-secondary-container text-[28px]" name="school" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Do this in Moodle</h3>
          </div>
          <CheckList
            items={[
              { title: "Course content, announcements and forums" },
              { title: "Grading, feedback and the gradebook" },
              { title: "Adding learners to groups and cohorts" },
            ]}
          />
        </Card>
        <Card>
          <div className="flex items-center gap-space-sm mb-space-md">
            <Icon className="text-primary text-[28px]" name="dashboard" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Do this on Stadilearn</h3>
          </div>
          <CheckList
            items={[
              { title: "Organisation-scoped cohort summaries" },
              { title: "Named learner completion and certificates" },
              { title: "AI drafts you review before use" },
            ]}
          />
        </Card>
      </div>

      <MoodleHandoffNotice />
    </div>
  );
}
