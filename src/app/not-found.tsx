import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ButtonLink, Section } from "@/components/ui";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="w-full pt-24 bg-background flex-1">
        <Section>
          <div className="max-w-xl mx-auto text-center py-space-xl">
            <p className="font-display-hero text-display-hero text-primary-container">404</p>
            <h1 className="font-headline-lg text-headline-lg-mobile sm:text-headline-lg text-on-surface mt-space-sm">
              We could not find that page
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
              The link may be broken or the page may have moved.
            </p>
            <div className="mt-space-lg flex flex-wrap justify-center gap-space-sm">
              <ButtonLink cta={{ href: "/", label: "Go home" }} />
              <ButtonLink cta={{ href: "/help", label: "Get help" }} variant="secondary" />
            </div>
          </div>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
