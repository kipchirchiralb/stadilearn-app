import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ButtonLink, Section } from "@/components/ui";
import { SESSION_COOKIE, getSessionUser, revokeSessionCookie } from "@/lib/auth/session";
import { appDb } from "@/lib/db";
import { ensureMoodleLinked } from "@/lib/moodle/identity";
import { MOODLE_HOST, MOODLE_URL } from "@/lib/site";

export const metadata: Metadata = { title: "Your profile", robots: { index: false } };

const ROLE_LABEL: Record<string, string> = {
  learner: "Learner",
  teacher: "Teacher / trainer",
  super_admin: "Stadilearn admin",
};

function formatWhen(value: Date | string | null) {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Nairobi" });
}

async function signOut() {
  "use server";
  await revokeSessionCookie();
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/");
}

export default async function ProfilePage() {
  const session = await getSessionUser();
  if (!session) redirect("/login?next=/app/profile");
  const linked = await ensureMoodleLinked(session);

  const [row] = await appDb.query<{
    email: string;
    full_name: string;
    account_type: "learner" | "teacher" | "super_admin";
    job_title: string | null;
    county: string | null;
    moodle_user_id: number | null;
    email_verified_at: Date | string | null;
    last_login_at: Date | string | null;
  }>(
    `SELECT u.email, u.full_name, u.account_type, u.job_title,
            co.name AS county, u.moodle_user_id, u.email_verified_at, u.last_login_at
     FROM users u
     LEFT JOIN counties co ON co.id = u.county_id
     WHERE u.id = ?`,
    [session.id],
  );
  if (!row) redirect("/login?next=/app/profile");

  const role =
    session.adminOf.length && row.account_type === "teacher"
      ? "Institution admin"
      : ROLE_LABEL[row.account_type] ?? row.account_type;
  const initial = row.full_name.trim().charAt(0).toUpperCase() || "S";

  const fields: { label: string; value: string }[] = [
    { label: "Full name", value: row.full_name },
    { label: "Email", value: row.email },
    { label: "Role", value: role },
    { label: "County", value: row.county || "Not set" },
    { label: "Job title", value: row.job_title || "Not set" },
    { label: "Email confirmed", value: row.email_verified_at ? formatWhen(row.email_verified_at) : "Not yet" },
    { label: "Last sign-in", value: formatWhen(row.last_login_at) },
    {
      label: "Moodle account",
      value: linked.moodleUserId
        ? `Linked by matching email (Moodle user ${linked.moodleUserId}). Study at ${MOODLE_HOST} with your separate Moodle login.`
        : `Not linked. Use the same email in Moodle as this account so we can match you. Studying still happens at ${MOODLE_HOST}, with a separate login.`,
    },
  ];

  return (
    <Section tone="low">
      <div className="max-w-3xl">
        <div className="flex items-center gap-space-md mb-space-lg">
          <div
            aria-hidden="true"
            className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center font-headline-md text-headline-md"
          >
            {initial}
          </div>
          <div>
            <p className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">Your profile</p>
            <h1 className="font-headline-md text-headline-md text-on-surface">{row.full_name}</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{role}</p>
          </div>
        </div>

        <dl className="rounded-2xl bg-surface-container-lowest shadow-sm divide-y divide-outline-variant/40">
          {fields.map((f) => (
            <div className="grid grid-cols-1 sm:grid-cols-[12rem_1fr] gap-space-xs px-space-md py-space-sm" key={f.label}>
              <dt className="font-label-md text-label-md text-on-surface-variant">{f.label}</dt>
              <dd className="font-body-md text-body-md text-on-surface">{f.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-space-md flex flex-wrap gap-space-sm">
          <ButtonLink cta={{ href: "/app/dashboard", label: "Dashboard" }} />
          <ButtonLink cta={{ href: "/app/assistant", label: "AI assistant" }} variant="secondary" />
          <ButtonLink cta={{ href: MOODLE_URL, label: "Open Moodle", external: true }} variant="secondary" />
        </div>
        <form action={signOut} className="mt-space-md">
          <button
            className="font-label-md text-label-md text-on-surface-variant hover:text-primary"
            type="submit"
          >
            Sign out
          </button>
        </form>
      </div>
    </Section>
  );
}
