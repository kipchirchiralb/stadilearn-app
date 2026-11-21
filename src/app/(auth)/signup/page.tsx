import { SignupForm } from "@/components/auth/SignupForm";
import { noIndexMeta } from "@/lib/seo";

export const metadata = noIndexMeta("Create account");

type Props = { searchParams: Promise<{ role?: string }> };

export default async function SignupPage({ searchParams }: Props) {
  const { role } = await searchParams;
  return <SignupForm initialRole={role} />;
}
