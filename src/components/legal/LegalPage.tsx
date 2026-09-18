import Link from "next/link";
import { Eyebrow, Notice } from "@/components/ui";

export type LegalSection = { id: string; title: string; body: React.ReactNode };

const RELATED = [
  ["/privacy", "Privacy Policy"],
  ["/terms", "Terms of Service"],
  ["/cookies", "Cookie Policy"],
  ["/accessibility", "Accessibility"],
  ["/ai-transparency", "AI Transparency"],
  ["/data-protection", "Kenyan Data Protection"],
  ["/safeguarding", "Safeguarding"],
  ["/security", "Security"],
] as const;

export function LegalPage({
  eyebrow,
  title,
  intro,
  lastUpdated,
  sections,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: React.ReactNode;
  lastUpdated: string;
  sections: LegalSection[];
  children?: React.ReactNode;
}) {
  return (
    <section className="w-full bg-surface py-space-xl lg:py-20">
      <div className="max-w-7xl mx-auto px-margin">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-space-xl">
          <aside className="lg:col-span-3 lg:sticky lg:top-28 self-start space-y-space-lg">
            <nav aria-label="On this page">
              <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-space-xs">On this page</p>
              <ul className="space-y-1 font-body-sm text-body-sm">
                {sections.map((s) => (
                  <li key={s.id}>
                    <a className="text-on-surface-variant hover:text-primary" href={`#${s.id}`}>
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <nav aria-label="Trust and legal pages">
              <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant mb-space-xs">Trust &amp; legal</p>
              <ul className="space-y-1 font-body-sm text-body-sm">
                {RELATED.map(([href, label]) => (
                  <li key={href}>
                    <Link className="text-on-surface-variant hover:text-primary" href={href}>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
          <article className="lg:col-span-9 max-w-3xl">
            <Eyebrow>{eyebrow}</Eyebrow>
            <h1 className="font-display-hero text-headline-lg-mobile sm:text-headline-lg text-on-surface tracking-tight">{title}</h1>
            <p className="mt-space-xs font-body-sm text-body-sm text-on-surface-variant">Last updated: {lastUpdated}</p>
            <div className="mt-space-md font-body-lg text-body-lg text-on-surface-variant">{intro}</div>
            <div className="mt-space-md">
              <Notice icon="gavel" tone="warning">
                Draft pending review by Stadilearn&apos;s legal and data-protection adviser. Content may change before public launch.
              </Notice>
            </div>
            <div className="mt-space-xl space-y-space-xl">
              {sections.map((s) => (
                <section className="scroll-mt-28" id={s.id} key={s.id}>
                  <h2 className="font-headline-md text-headline-md text-on-surface mb-space-sm">{s.title}</h2>
                  <div className="space-y-space-sm font-body-md text-body-md text-on-surface-variant [&_ul]:list-disc [&_ul]:pl-space-lg [&_ul]:space-y-1 [&_a]:text-primary [&_a]:underline">
                    {s.body}
                  </div>
                </section>
              ))}
            </div>
            {children}
          </article>
        </div>
      </div>
    </section>
  );
}
