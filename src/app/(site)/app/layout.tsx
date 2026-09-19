import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";

function safeNext(path: string | null) {
  if (path && /^\/app(\/[-a-z0-9/?=&]*)?$/i.test(path)) return path;
  return "/app/dashboard";
}

/** Signed-in area. Individual pages still check the session. */
export default async function AppSectionLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) {
    const path = (await headers()).get("x-stadilearn-path");
    redirect(`/login?next=${encodeURIComponent(safeNext(path))}`);
  }
  return children;
}
