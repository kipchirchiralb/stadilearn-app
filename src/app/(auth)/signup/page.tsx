import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = { title: "Create account", robots: { index: false } };

type Props = { searchParams: Promise<{ role?: string }> };

export default async function SignupPage({ searchParams }: Props) {
  const { role } = await searchParams;
  return <SignupForm initialRole={role} />;
}
