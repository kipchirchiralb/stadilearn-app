import type { ReactNode } from "react";
import { BarChart, DoughnutChart, DualBarChart, LineChart } from "@/components/dashboard/AdminCharts";
import { ButtonLink, Card, Icon, Notice } from "@/components/ui";
import type { NamedCount, SeriesPoint, SuperAdminDashboardData } from "@/lib/admin-dashboard";
import type { InstitutionApprovalRow } from "@/lib/institutions";
import { InstitutionApprovalForm } from "@/components/dashboard/InstitutionApprovalForm";
import { MOODLE_HOST, MOODLE_URL } from "@/lib/site";

function fmt(value: number) {
  return value.toLocaleString("en-KE");
}

function plural(n: number, one: string, many = `${one}s`) {
  return `${fmt(n)} ${n === 1 ? one : many}`;
}

function money(value: number) {
  return value.toLocaleString("en-KE", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
}

function shortDate(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-KE", { day: "numeric", month: "short", timeZone: "UTC" });
}

function when(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Nairobi" });
}

function seriesLabels(points: SeriesPoint[]) {
  return points.map((p) => shortDate(p.date));
}

function seriesValues(points: SeriesPoint[]) {
  return points.map((p) => p.n);
}

function chartLabels(rows: NamedCount[]) {
  return rows.map((r) => r.label);
}

function chartValues(rows: NamedCount[]) {
  return rows.map((r) => r.n);
}

function Stat({ icon, label, value, hint }: { icon: string; label: string; value: string | number; hint?: string }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex items-start gap-space-sm">
      <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
        <Icon className="text-[22px]" name={icon} />
      </div>
      <div className="min-w-0">
        <p className="font-headline-sm text-headline-sm text-on-surface tabular-nums">{typeof value === "number" ? fmt(value) : value}</p>
        <p className="font-body-sm text-body-sm text-on-surface-variant">{label}</p>
        {hint ? <p className="font-label-sm text-label-sm text-outline mt-0.5">{hint}</p> : null}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  source,
  children,
}: {
  title: string;
  source: "Stadilearn" | "Moodle";
  children: ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-space-sm mb-space-sm">
        <h3 className="font-headline-sm text-headline-sm text-on-surface">{title}</h3>
        <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold shrink-0">{source}</span>
      </div>
      {children}
    </Card>
  );
}

function DataTable({
  columns,
  rows,
  empty = "No rows yet",
}: {
  columns: string[];
  rows: (string | number)[][];
  empty?: string;
}) {
  if (rows.length === 0) {
    return <p className="font-body-sm text-body-sm text-on-surface-variant">{empty}</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-outline-variant">
            {columns.map((col) => (
              <th key={col} className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant py-2 pr-3">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-surface-container last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="font-body-sm text-body-sm text-on-surface py-2 pr-3 align-top">
                  {typeof cell === "number" ? fmt(cell) : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SuperAdminDashboard({
  data,
  firstName,
  approvals,
}: {
  data: SuperAdminDashboardData;
  firstName: string;
  approvals: InstitutionApprovalRow[];
}) {
  const { platform: p, moodle: m } = data;
  const generated = when(data.generatedAt);
  const ticketsOpen = p.support.byStatus.filter((s) => !["resolved", "closed"].includes(s.key)).reduce((sum, s) => sum + s.n, 0);
  const flagsOpen = p.ai.flags.filter((s) => s.key === "open" || s.key === "reviewing").reduce((sum, s) => sum + s.n, 0);

  return (
    <div className="flex flex-col gap-gutter">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-space-md">
        <div>
          <p className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">Super admin</p>
          <h1 className="font-headline-lg-mobile sm:text-headline-lg text-on-surface mt-1">Hello {firstName}, here is the live picture</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs max-w-3xl">
            Totals from the Stadilearn platform and a read-only view of Moodle. Learning activity, enrolments and
            completions come from Moodle; accounts, institutions, certificates and AI usage come from Stadilearn.
          </p>
          <p className="font-label-sm text-label-sm text-outline mt-space-xs">Refreshed {generated} (Nairobi time)</p>
        </div>
        <div className="flex flex-wrap gap-space-sm">
          <ButtonLink cta={{ href: MOODLE_URL, label: "Open Moodle", external: true }} variant="secondary" />
          <ButtonLink cta={{ href: "/app/certificates/approvals", label: "Certificate approvals" }} variant="secondary" />
          <ButtonLink cta={{ href: "/app/assistant", label: "Open assistant" }} />
        </div>
      </div>

      {!m.available ? (
        <Notice tone="warning" icon="cloud_off">
          {m.error ?? "Moodle summaries are unavailable. Stadilearn figures are still shown."}
        </Notice>
      ) : null}

      <Card>
        <div className="flex items-start justify-between gap-space-sm mb-space-sm">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Institution access</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Verify organisations and nominate institution admins. Until you do, their dashboard shows no learner data.
            </p>
          </div>
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold shrink-0">
            Stadilearn
          </span>
        </div>
        {approvals.length === 0 ? (
          <p className="font-body-sm text-body-sm text-on-surface-variant">No pending organisations or invited admins.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-outline-variant">
                  {["Organisation", "Type", "Status", "Person", "Action"].map((col) => (
                    <th
                      key={col}
                      className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant py-2 pr-3"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {approvals.map((row) => (
                  <tr
                    className="border-b border-surface-container last:border-0"
                    key={`${row.institutionId}-${row.userId ?? "org"}-${row.action}`}
                  >
                    <td className="font-body-sm text-body-sm text-on-surface py-2 pr-3 align-top">
                      {row.name}
                      <span className="block font-label-sm text-label-sm text-on-surface-variant">{row.createdAt}</span>
                    </td>
                    <td className="font-body-sm text-body-sm text-on-surface py-2 pr-3 align-top">{row.typeLabel}</td>
                    <td className="font-body-sm text-body-sm text-on-surface py-2 pr-3 align-top capitalize">
                      {row.institutionStatus.replace(/_/g, " ")}
                      {row.membershipStatus === "invited" ? " · invited admin" : ""}
                    </td>
                    <td className="font-body-sm text-body-sm text-on-surface py-2 pr-3 align-top">
                      {row.userName ?? "No requester on file"}
                      {row.userEmail ? (
                        <span className="block font-label-sm text-label-sm text-on-surface-variant">{row.userEmail}</span>
                      ) : null}
                    </td>
                    <td className="font-body-sm text-body-sm text-on-surface py-2 pr-3 align-top">
                      {row.action === "approve" ? (
                        <InstitutionApprovalForm
                          action="approve"
                          institutionId={row.institutionId}
                          label="Approve and grant admin"
                          userId={row.userId}
                        />
                      ) : row.userId ? (
                        <InstitutionApprovalForm
                          action="grant_admin"
                          institutionId={row.institutionId}
                          label="Grant admin"
                          userId={row.userId}
                        />
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter">
        <Stat icon="group" label="Stadilearn accounts" value={p.users.total} hint={`${fmt(p.users.linked)} linked to Moodle`} />
        <Stat icon="domain" label="Institutions" value={p.institutions.total} hint={`${fmt(p.institutions.admins)} institution admins`} />
        <Stat icon="groups" label="Cohorts" value={p.cohorts.total} hint={`${fmt(p.cohorts.learners)} learners in cohorts`} />
        <Stat icon="workspace_premium" label="Certificates" value={p.certificates.total} />
        <Stat icon="menu_book" label="Moodle courses" value={m.available ? m.courses.visible : "—"} hint={m.available ? `${fmt(m.courses.hidden)} hidden` : "Moodle offline"} />
        <Stat icon="school" label="Moodle enrolments" value={m.available ? m.enrolments.active : "—"} />
        <Stat icon="task_alt" label="Course completions" value={m.available ? m.enrolments.completed : "—"} />
        <Stat icon="forum" label="Open tickets" value={ticketsOpen} hint={flagsOpen ? `${fmt(flagsOpen)} AI flags to review` : "No open AI flags"} />
      </div>

      <h2 className="font-headline-md text-headline-md text-on-surface pt-space-sm">Stadilearn platform</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <ChartCard title="Accounts by type" source="Stadilearn">
          <DoughnutChart labels={chartLabels(p.users.byType)} values={chartValues(p.users.byType)} />
        </ChartCard>
        <ChartCard title="Account status" source="Stadilearn">
          <DoughnutChart labels={chartLabels(p.users.byStatus)} values={chartValues(p.users.byStatus)} />
        </ChartCard>
        <ChartCard title="Moodle email link" source="Stadilearn">
          <DoughnutChart
            labels={["Linked", "Not linked"]}
            values={[p.users.linked, p.users.unlinked]}
            colors={["#004d61", "#fd6604"]}
          />
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-sm">
            Linking uses the same email on both sites. {fmt(p.users.loggedIn30d)} accounts signed in here in the last 30 days ·{" "}
            {fmt(p.users.activeSessions)} live sessions.
          </p>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        <ChartCard title="New accounts, last 30 days" source="Stadilearn">
          <LineChart labels={seriesLabels(p.users.signups30d)} values={seriesValues(p.users.signups30d)} label="Sign-ups" />
        </ChartCard>
        <ChartCard title="Accounts by county" source="Stadilearn">
          <BarChart labels={chartLabels(p.users.byCounty)} values={chartValues(p.users.byCounty)} horizontal color="#006680" />
        </ChartCard>
      </div>

      {p.users.byGender.length || p.users.byAgeBand.length ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
          {p.users.byGender.length ? (
            <ChartCard title="Gender (consented)" source="Stadilearn">
              <DoughnutChart labels={chartLabels(p.users.byGender)} values={chartValues(p.users.byGender)} />
            </ChartCard>
          ) : null}
          {p.users.byAgeBand.length ? (
            <ChartCard title="Age band (consented)" source="Stadilearn">
              <BarChart labels={chartLabels(p.users.byAgeBand)} values={chartValues(p.users.byAgeBand)} color="#4a616d" />
            </ChartCard>
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <ChartCard title="Institutions by status" source="Stadilearn">
          <DoughnutChart labels={chartLabels(p.institutions.byStatus)} values={chartValues(p.institutions.byStatus)} />
        </ChartCard>
        <ChartCard title="Institutions by type" source="Stadilearn">
          <DoughnutChart labels={chartLabels(p.institutions.byType)} values={chartValues(p.institutions.byType)} />
        </ChartCard>
        <ChartCard title="Cohorts by status" source="Stadilearn">
          <DoughnutChart labels={chartLabels(p.cohorts.byStatus)} values={chartValues(p.cohorts.byStatus)} />
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-sm">
            {plural(p.cohorts.teachers, "teacher")} assigned · {fmt(p.cohorts.linkedToMoodle)} linked to a Moodle cohort ·{" "}
            {plural(p.cohorts.courseLinks, "course link")} · {plural(p.programmes, "programme")}.
          </p>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        <ChartCard title="Largest institutions" source="Stadilearn">
          <DataTable
            columns={["Institution", "Type", "Status", "Members", "Cohorts"]}
            rows={p.institutions.top.map((row) => [row.name, row.type, row.status, row.members, row.cohorts])}
            empty="No institutions yet"
          />
        </ChartCard>
        <ChartCard title="Certificates" source="Stadilearn">
          <DoughnutChart labels={chartLabels(p.certificates.byStatus)} values={chartValues(p.certificates.byStatus)} />
          <div className="mt-space-md">
            <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-bold mb-space-xs">
              Issued, last 30 days
            </p>
            <LineChart labels={seriesLabels(p.certificates.issued30d)} values={seriesValues(p.certificates.issued30d)} label="Issued" color="#a33e00" />
          </div>
        </ChartCard>
      </div>

      <h2 className="font-headline-md text-headline-md text-on-surface pt-space-sm">AI, support and operations</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter">
        <Stat icon="smart_toy" label="AI calls (30 days)" value={p.ai.requests30d} />
        <Stat icon="token" label="Tokens (30 days)" value={p.ai.tokens30d} />
        <Stat icon="payments" label="Estimated AI cost" value={money(p.ai.costUsd30d)} />
        <Stat icon="flag" label="Open data-quality issues" value={p.quality.open} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <ChartCard title="AI usage by assistant" source="Stadilearn">
          <DoughnutChart labels={chartLabels(p.ai.byAssistant)} values={chartValues(p.ai.byAssistant)} />
        </ChartCard>
        <ChartCard title="AI call outcomes" source="Stadilearn">
          <DoughnutChart labels={chartLabels(p.ai.byOutcome)} values={chartValues(p.ai.byOutcome)} />
        </ChartCard>
        <ChartCard title="Open conversations" source="Stadilearn">
          <DoughnutChart labels={chartLabels(p.ai.conversations)} values={chartValues(p.ai.conversations)} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        <ChartCard title="AI chat calls, last 30 days" source="Stadilearn">
          <LineChart labels={seriesLabels(p.ai.daily)} values={seriesValues(p.ai.daily)} label="Chat calls" />
        </ChartCard>
        <ChartCard title="AI answer flags" source="Stadilearn">
          <BarChart labels={chartLabels(p.ai.flags)} values={chartValues(p.ai.flags)} color="#a33e00" />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <ChartCard title="Support tickets by status" source="Stadilearn">
          <DoughnutChart labels={chartLabels(p.support.byStatus)} values={chartValues(p.support.byStatus)} />
        </ChartCard>
        <ChartCard title="Tickets by category" source="Stadilearn">
          <BarChart labels={chartLabels(p.support.byCategory)} values={chartValues(p.support.byCategory)} color="#4a616d" />
        </ChartCard>
        <ChartCard title="Ticket source" source="Stadilearn">
          <DoughnutChart labels={chartLabels(p.support.bySource)} values={chartValues(p.support.bySource)} />
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <ChartCard title="Notification jobs" source="Stadilearn">
          <DoughnutChart labels={chartLabels(p.notifications)} values={chartValues(p.notifications)} />
        </ChartCard>
        <ChartCard title="Recorded consents" source="Stadilearn">
          <BarChart labels={chartLabels(p.consents)} values={chartValues(p.consents)} color="#006680" />
        </ChartCard>
        <ChartCard title="Knowledge index" source="Stadilearn">
          <div className="grid grid-cols-2 gap-space-sm mb-space-md">
            <div>
              <p className="font-headline-sm text-on-surface">{fmt(p.rag.documents)}</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Documents</p>
            </div>
            <div>
              <p className="font-headline-sm text-on-surface">{fmt(p.rag.chunks)}</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Chunks</p>
            </div>
            <div>
              <p className="font-headline-sm text-on-surface">{fmt(p.rag.withdrawn)}</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Withdrawn</p>
            </div>
            <div>
              <p className="font-headline-sm text-on-surface">{fmt(p.reports)}</p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Report runs</p>
            </div>
          </div>
          <DoughnutChart labels={chartLabels(p.rag.versions)} values={chartValues(p.rag.versions)} />
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-sm">{fmt(p.audit7d)} audit events in the last 7 days.</p>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        <ChartCard title="Open data-quality issues" source="Stadilearn">
          {p.quality.byKind.length ? (
            <BarChart labels={chartLabels(p.quality.byKind)} values={chartValues(p.quality.byKind)} horizontal color="#a33e00" />
          ) : (
            <p className="font-body-sm text-body-sm text-on-surface-variant">No open issues.</p>
          )}
          <div className="mt-space-md">
            <DataTable
              columns={["Kind", "Entity", "Id", "Detected"]}
              rows={p.quality.recent.map((row) => [row.kind, row.entityType, row.entityId, when(row.detectedAt)])}
              empty="Queue is clear"
            />
          </div>
        </ChartCard>
        <ChartCard title="Recent sync runs" source="Stadilearn">
          <DataTable
            columns={["Job", "Status", "Read", "Written", "Skipped", "Started"]}
            rows={p.sync.map((row) => [row.jobName, row.status, row.recordsRead, row.recordsWritten, row.recordsSkipped, when(row.startedAt)])}
            empty="No sync runs recorded"
          />
        </ChartCard>
      </div>

      <h2 className="font-headline-md text-headline-md text-on-surface pt-space-sm">Moodle learning space</h2>
      <p className="font-body-sm text-body-sm text-on-surface-variant -mt-space-sm">
        Read-only from the Moodle database. Sign-in on {MOODLE_HOST} stays separate.
      </p>

      {m.available ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter">
            <Stat icon="person" label="Moodle users" value={m.users.total} hint={`${fmt(m.users.confirmed)} confirmed`} />
            <Stat icon="schedule" label="Active in last 7 days" value={m.users.active7d} hint={`${fmt(m.users.active30d)} in 30 days`} />
            <Stat icon="pause_circle" label="Never signed in" value={m.users.neverLoggedIn} hint={`${fmt(m.users.suspended)} suspended`} />
            <Stat icon="extension" label="Course modules" value={m.activity.modules} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
            <ChartCard title="Users by role" source="Moodle">
              <DoughnutChart labels={chartLabels(m.roles)} values={chartValues(m.roles)} />
            </ChartCard>
            <ChartCard title="Courses by category" source="Moodle">
              <BarChart labels={chartLabels(m.courses.byCategory)} values={chartValues(m.courses.byCategory)} horizontal />
            </ChartCard>
            <ChartCard title="Course visibility" source="Moodle">
              <DoughnutChart
                labels={["Visible", "Hidden"]}
                values={[m.courses.visible, m.courses.hidden]}
                colors={["#004d61", "#bfc8cd"]}
              />
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-sm">
                {fmt(m.courses.completionEnabled)} courses have completion tracking on · {fmt(m.enrolments.started)}{" "}
                learners have started a course.
              </p>
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
            <ChartCard title="New Moodle accounts, last 30 days" source="Moodle">
              <LineChart labels={seriesLabels(m.users.new30d)} values={seriesValues(m.users.new30d)} label="New users" color="#006680" />
            </ChartCard>
            <ChartCard title="Course completions, last 30 days" source="Moodle">
              <LineChart labels={seriesLabels(m.enrolments.completions30d)} values={seriesValues(m.enrolments.completions30d)} label="Completions" color="#a33e00" />
            </ChartCard>
          </div>

          <ChartCard title="Courses by enrolment and completion" source="Moodle">
            <DualBarChart
              labels={m.courses.top.map((c) => c.shortname || c.title)}
              series={[
                { label: "Enrolled", values: m.courses.top.map((c) => c.enrolled), color: "#004d61" },
                { label: "Completed", values: m.courses.top.map((c) => c.completed), color: "#fd6604" },
              ]}
            />
          </ChartCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
            <ChartCard title="Top Moodle courses" source="Moodle">
              <DataTable
                columns={["Course", "Category", "Enrolled", "Completed"]}
                rows={m.courses.top.map((c) => [c.title, c.category, c.enrolled, c.completed])}
                empty="No courses besides the site course"
              />
            </ChartCard>
            <ChartCard title="Moodle cohorts" source="Moodle">
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
                {fmt(m.cohorts.total)} cohorts · {fmt(m.cohorts.members)} memberships
              </p>
              <DataTable
                columns={["Cohort", "Members"]}
                rows={m.cohorts.top.map((c) => [c.name, c.members])}
                empty="No Moodle cohorts"
              />
            </ChartCard>
          </div>

          <h3 className="font-headline-sm text-headline-sm text-on-surface">Learning activity</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter">
            <Stat icon="assignment" label="Assignment submissions" value={m.activity.assignmentsSubmitted} hint={`${fmt(m.activity.assignmentsUngraded)} ungraded`} />
            <Stat icon="quiz" label="Finished quiz attempts" value={m.activity.quizFinished} hint={`${fmt(m.activity.quizInProgress)} in progress`} />
            <Stat icon="forum" label="Forum posts" value={m.activity.forumPosts} hint={`${fmt(m.activity.forumDiscussions)} discussions`} />
            <Stat icon="workspace_premium" label="Badges issued" value={m.activity.badgesIssued} hint={`${fmt(m.activity.groups)} groups`} />
          </div>
          {m.activity.actions24h !== null ? (
            <Stat icon="monitoring" label="Moodle log events (24 hours)" value={m.activity.actions24h} />
          ) : null}
        </>
      ) : (
        <Card>
          <p className="font-body-md text-body-md text-on-surface">
            Moodle summaries will appear here when the read-only database connection is available.
          </p>
        </Card>
      )}
    </div>
  );
}
