import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getSessionUser } from "@/lib/auth/session";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  return (
    <>
      <SiteHeader user={user ? { fullName: user.fullName } : null} />
      <main className="w-full pt-24 bg-background flex-1">
        <div className="flex flex-col w-full overflow-hidden">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}
