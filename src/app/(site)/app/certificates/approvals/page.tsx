import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DeclineCertificateForm, IssueCertificateForm } from "@/components/certificates/CertificateReviewForms";
import { Card, Notice, Section } from "@/components/ui";
import { getSessionUser } from "@/lib/auth/session";
import { listCertificateApprovals } from "@/lib/certificates";

export const metadata: Metadata = { title: "Certificate approvals", robots: { index: false } };

function formatWhen(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Nairobi" });
}

export default async function CertificateApprovalsPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/app/certificates/approvals");
  if (user.accountType !== "super_admin") redirect("/app/certificates");

  const rows = await listCertificateApprovals();

  return (
    <Section tone="low">
      <div className="max-w-5xl space-y-space-lg">
        <div>
          <p className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">Super admin</p>
          <h1 className="font-headline-md text-headline-md text-on-surface">Certificate approvals</h1>
          <p className="mt-space-xs font-body-md text-body-md text-on-surface-variant max-w-3xl">
            Each request uses the person&apos;s Stadilearn signup email to look up Moodle enrolment and completion.
            Issue a certificate of proficiency when you are satisfied the course was completed.
          </p>
        </div>

        {rows.length === 0 ? (
          <Card>
            <p className="font-body-md text-body-md text-on-surface-variant">No pending certificate requests.</p>
          </Card>
        ) : (
          <div className="space-y-gutter">
            {rows.map((row) => (
              <Card key={row.requestId}>
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-space-md">
                  <div className="min-w-0">
                    <h2 className="font-headline-sm text-headline-sm text-on-surface">{row.fullName}</h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      {row.email} · requested {formatWhen(row.requestedAt)}
                    </p>
                    <p className="font-body-md text-body-md text-on-surface mt-space-sm">{row.courseTitle}</p>
                    {row.courseSummary ? (
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{row.courseSummary}</p>
                    ) : null}
                    <div className="mt-space-md">
                      {row.moodle.completed ? (
                        <Notice icon="verified">{row.moodle.note}</Notice>
                      ) : (
                        <Notice icon="warning" tone="warning">
                          {row.moodle.note} Issue only if you have verified completion another way.
                        </Notice>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-space-sm shrink-0">
                    <IssueCertificateForm requestId={row.requestId} warn={!row.moodle.completed} />
                    <DeclineCertificateForm requestId={row.requestId} />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
