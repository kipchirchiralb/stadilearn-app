import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LearnerDashboard } from "@/components/dashboard/LearnerDashboard";
import { TeacherDashboard } from "@/components/dashboard/TeacherDashboard";
import { Section } from "@/components/ui";
import { getLearnerDashboard, getTeacherDashboard } from "@/lib/dashboard";
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

  const data = await getTeacherDashboard(user);
  return (
    <Section tone="low">
      <TeacherDashboard data={data} firstName={firstName} />
    </Section>
  );
}
