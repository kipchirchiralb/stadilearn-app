import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { InstitutionDashboard } from "@/components/dashboard/InstitutionDashboard";
import { LearnerDashboard } from "@/components/dashboard/LearnerDashboard";
import { SuperAdminDashboard } from "@/components/dashboard/SuperAdminDashboard";
import { TeacherDashboard } from "@/components/dashboard/TeacherDashboard";
import { Section } from "@/components/ui";
import { getSuperAdminDashboard } from "@/lib/admin-dashboard";
import { getLearnerDashboard, getTeacherDashboard } from "@/lib/dashboard";
import { getInstitutionDashboard, listInstitutionApprovals } from "@/lib/institutions";
import { getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Dashboard", robots: { index: false } };

export default async function DashboardPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login?next=/app/dashboard");

  const firstName = user.fullName.split(" ")[0];

  if (user.accountType === "learner") {
    const data = await getLearnerDashboard(user);
    return (
      <Section tone="low">
        <LearnerDashboard data={data} firstName={firstName} />
      </Section>
    );
  }

  if (user.accountType === "super_admin") {
    const [data, approvals] = await Promise.all([getSuperAdminDashboard(), listInstitutionApprovals()]);
    return (
      <Section tone="low">
        <SuperAdminDashboard approvals={approvals} data={data} firstName={firstName} />
      </Section>
    );
  }

  const institution = await getInstitutionDashboard(user);
  if (institution) {
    return (
      <Section tone="low">
        <InstitutionDashboard data={institution} firstName={firstName} />
      </Section>
    );
  }

  const data = await getTeacherDashboard(user);
  return (
    <Section tone="low">
      <TeacherDashboard data={data} firstName={firstName} />
    </Section>
  );
}
