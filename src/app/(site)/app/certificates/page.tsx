import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RequestCertificateForm } from "@/components/certificates/RequestCertificateForm";
import { ButtonLink, Card, Icon, Notice, Section } from "@/components/ui";
import { listMyCertificates, listRequestableCourses } from "@/lib/certificates";
import { getSessionUser } from "@/lib/auth/session";
import { headerUserFrom } from "@/lib/header";
import { ROUTES } from "@/lib/site";

export const metadata: Metadata = { title: "Your certificates", robots: { index: false } };

function formatDay(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso.includes("T") ? iso : `${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-KE", { dateStyle: "medium", timeZone: iso.includes("T") ? "Africa/Nairobi" : "UTC" });
}

export default async function CertificatesPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/app/certificates");
  if (user.accountType === "super_admin") redirect("/app/certificates/approvals");

  const header = await headerUserFrom(user);
  const [{ issued, requests }, requestable] = await Promise.all([listMyCertificates(user.id), listRequestableCourses(user)]);
  const pending = requests.filter((r) => r.status === "pending");
  const declined = requests.filter((r) => r.status === "declined");

  return (
    <Section tone="low">
      <div className="max-w-4xl space-y-space-lg">
        <div>
          <p className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">Certificates</p>
          <h1 className="font-headline-md text-headline-md text-on-surface">Your certificates</h1>
          <p className="mt-space-xs font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Request a certificate of proficiency for a Moodle course you study with this email. A Stadilearn admin
            checks completion, then you can download a branded PDF with a certificate number.
          </p>
        </div>

        {header.nav === "institution" ? (
          <Notice icon="apartment">
            Institution totals stay on your dashboard. This page is for certificates issued to you personally.
          </Notice>
        ) : null}

        <section className="space-y-space-md">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Issued</h2>
          {issued.length === 0 ? (
            <Card>
              <Icon className="text-primary text-[28px]" name="workspace_premium" />
              <h3 className="font-headline-sm text-headline-sm text-on-surface mt-space-sm">None issued yet</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                When a request is approved, the PDF and certificate number will appear here.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-gutter">
              {issued.map((cert) => (
                <Card key={cert.id}>
                  <p className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
                    {cert.status === "valid" ? "Certificate of proficiency" : "Revoked"}
                  </p>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mt-1">{cert.courseTitle}</h3>
                  {cert.courseSummary ? (
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{cert.courseSummary}</p>
                  ) : null}
                  <p className="font-body-sm text-body-sm text-on-surface mt-space-sm">
                    Certificate no. <span className="font-mono">{cert.code}</span>
                    {cert.completedOn ? ` · Completed ${formatDay(cert.completedOn)}` : ""}
                  </p>
                  {cert.status === "valid" ? (
                    <div className="mt-space-sm flex flex-wrap gap-space-sm">
                      <ButtonLink
                        cta={{
                          href: `/api/v1/certificates/${encodeURIComponent(cert.code)}/pdf`,
                          label: "Download PDF",
                          download: true,
                        }}
                      />
                      <ButtonLink
                        cta={{ href: `${ROUTES["verify-certificate"]}?code=${encodeURIComponent(cert.code)}`, label: "Verify" }}
                        variant="secondary"
                      />
                    </div>
                  ) : (
                    <p className="font-body-sm text-body-sm text-error mt-space-sm">This certificate has been revoked.</p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </section>

        {pending.length > 0 ? (
          <section>
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-md">Awaiting review</h2>
            <div className="space-y-space-sm">
              {pending.map((row) => (
                <Card key={row.id}>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">{row.courseTitle}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Requested {formatDay(row.requestedAt)}. Stadilearn will check Moodle completion for this email
                    before issuing.
                  </p>
                </Card>
              ))}
            </div>
          </section>
        ) : null}

        {declined.length > 0 ? (
          <section>
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-md">Declined</h2>
            <div className="space-y-space-sm">
              {declined.map((row) => (
                <Card key={row.id}>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">{row.courseTitle}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    {row.declineReason || "Stadilearn declined this request. You can request again if the course is completed."}
                  </p>
                </Card>
              ))}
            </div>
          </section>
        ) : null}

        <section>
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">Request a certificate</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md max-w-2xl">
            Choose a Moodle course linked to this signup email. Completion is checked by a Stadilearn admin using that
            same address.
          </p>
          {!requestable.moodleLinked ? (
            <Notice icon="link_off">
              No Moodle user matches this email yet, so there is no course to request. Use the same address in Moodle,
              then return here.
            </Notice>
          ) : (
            <Card>
              <RequestCertificateForm courses={requestable.courses} />
            </Card>
          )}
        </section>
      </div>
    </Section>
  );
}
