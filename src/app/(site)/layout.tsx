import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { getHeaderUser } from "@/lib/header";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const user = await getHeaderUser();
  return (
    <>
      <SiteHeader user={user} />
      <main className="w-full pt-24 bg-background flex-1">
        <div className="flex flex-col w-full overflow-hidden">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}
