import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { safeAppPath } from "@/lib/auth/http";
import { getSessionUser } from "@/lib/auth/session";
import { noIndexMeta } from "@/lib/seo";

export const metadata = noIndexMeta("Sign in");

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  const user = await getSessionUser();
  if (user) redirect(safeAppPath(next));
  return <LoginForm next={next} />;
}
