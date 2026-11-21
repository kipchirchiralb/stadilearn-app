import { headers } from "next/headers";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { JsonLd } from "@/components/seo/JsonLd";
import { getHeaderUser } from "@/lib/header";
import { jsonLdForRequest } from "@/lib/seo";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const user = await getHeaderUser();
  const path = (await headers()).get("x-stadilearn-path") ?? "";
  return (
    <>
      <JsonLd data={jsonLdForRequest(path)} />
      <SiteHeader user={user} />
      <main className="w-full pt-24 bg-background flex-1">
        <div className="flex flex-col w-full overflow-hidden">{children}</div>
      </main>
      <SiteFooter />
    </>
  );
}
