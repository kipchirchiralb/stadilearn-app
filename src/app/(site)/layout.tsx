import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="w-full pt-24 bg-background flex-1">
        <div className="flex flex-col w-full overflow-hidden">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}
