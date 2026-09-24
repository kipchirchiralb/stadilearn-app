import Link from "next/link";
import { MOODLE_HOST, MOODLE_URL } from "@/lib/site";

/* Shared building blocks for interior pages, styled to match the landing page. */

export function Icon({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span aria-hidden="true" className={`material-symbols-outlined ${className}`}>
      {name}
    </span>
  );
}

export function Eyebrow({ children, icon }: { children: React.ReactNode; icon?: string }) {
  return (
    <div className="inline-flex items-center gap-space-xs bg-surface-container px-space-md py-space-xs rounded-full w-fit mb-space-xs">
      {icon ? (
        <Icon className="text-primary text-[18px]" name={icon} />
      ) : (
        <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
      )}
      <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">{children}</span>
    </div>
  );
}

type Cta = { href: string; label: string; icon?: string; external?: boolean; download?: boolean };

export function ButtonLink({ cta, variant = "primary" }: { cta: Cta; variant?: "primary" | "secondary" | "accent" | "text" }) {
  const styles = {
    primary:
      "inline-flex items-center gap-space-xs bg-primary-container text-on-primary font-label-lg text-label-lg px-space-lg py-space-sm rounded-lg hover:bg-primary transition-all shadow-[0_4px_16px_rgba(0,102,128,0.2)] hover:shadow-none",
    accent:
      "inline-flex items-center gap-space-xs bg-secondary-container text-on-secondary font-label-lg text-label-lg px-space-lg py-space-sm rounded-lg hover:bg-secondary transition-all shadow-md",
    secondary:
      "inline-flex items-center gap-space-xs bg-surface-container-lowest text-primary font-label-lg text-label-lg px-space-lg py-space-sm rounded-lg shadow-sm hover:bg-surface-container-high transition-colors",
    text: "inline-flex items-center gap-space-xs font-label-md text-label-md text-primary font-bold hover:text-secondary-container transition-colors py-space-sm",
  }[variant];
  const icon =
    cta.icon ?? (cta.external ? "open_in_new" : cta.download ? "download" : variant === "secondary" ? undefined : "arrow_forward");
  const content = (
    <>
      <span>{cta.label}</span>
      {icon && <Icon className="text-[18px]" name={icon} />}
    </>
  );
  if (cta.external || cta.download) {
    return (
      <a
        className={styles}
        download={cta.download ? true : undefined}
        href={cta.href}
        rel={cta.external ? "noopener noreferrer" : undefined}
        target={cta.external ? "_blank" : undefined}
      >
        {content}
      </a>
    );
  }
  return (
    <Link className={styles} href={cta.href}>
      {content}
    </Link>
  );
}

export function PageHero({
  eyebrow,
  title,
  highlight,
  intro,
  primary,
  secondary,
  tertiary,
  aside,
}: {
  eyebrow: string;
  title: string;
  highlight?: string;
  intro: React.ReactNode;
  primary?: Cta;
  secondary?: Cta;
  tertiary?: Cta;
  aside?: React.ReactNode;
}) {
  return (
    <section className="relative w-full bg-surface py-space-xl lg:py-20">
      <div className="max-w-7xl mx-auto px-margin">
        <div className={`grid grid-cols-1 ${aside ? "lg:grid-cols-12" : ""} gap-gutter lg:gap-space-xl items-center`}>
          <div className={`${aside ? "lg:col-span-7" : "max-w-3xl"} flex flex-col space-y-space-md`}>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h1 className="font-display-hero text-headline-lg-mobile sm:text-headline-lg lg:text-display-hero text-on-surface tracking-tight">
              {title}
              {highlight && (
                <>
                  {" "}
                  <span className="text-primary-container">{highlight}</span>
                </>
              )}
            </h1>
            <div className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">{intro}</div>
            {(primary || secondary || tertiary) && (
              <div className="flex flex-wrap items-center gap-space-sm pt-space-xs">
                {primary && <ButtonLink cta={primary} />}
                {secondary && <ButtonLink cta={secondary} variant="secondary" />}
                {tertiary && <ButtonLink cta={tertiary} variant="text" />}
              </div>
            )}
          </div>
          {aside && <div className="lg:col-span-5">{aside}</div>}
        </div>
      </div>
    </section>
  );
}

export function Section({
  children,
  tone = "surface",
  id,
}: {
  children: React.ReactNode;
  tone?: "surface" | "low" | "high";
  id?: string;
}) {
  const bg = { surface: "bg-surface", low: "bg-surface-container-low", high: "bg-surface-container-high" }[tone];
  return (
    <section className={`w-full ${bg} py-space-xl`} id={id}>
      <div className="max-w-7xl mx-auto px-margin">{children}</div>
    </section>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  intro,
  align = "center",
}: {
  eyebrow?: string;
  title: string;
  intro?: React.ReactNode;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "text-center max-w-2xl mx-auto mb-space-xl flex flex-col items-center" : "max-w-2xl mb-space-xl"}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="font-headline-lg text-headline-lg-mobile sm:text-headline-lg text-on-surface">{title}</h2>
      {intro && <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">{intro}</p>}
    </div>
  );
}

export type Feature = { icon: string; title: string; body: React.ReactNode; badge?: string };

export function FeatureGrid({ items, columns = 3 }: { items: Feature[]; columns?: 2 | 3 | 4 }) {
  const cols = { 2: "md:grid-cols-2", 3: "md:grid-cols-2 lg:grid-cols-3", 4: "md:grid-cols-2 lg:grid-cols-4" }[columns];
  return (
    <div className={`grid grid-cols-1 ${cols} gap-gutter`}>
      {items.map((f) => (
        <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm hover:shadow-md transition-shadow flex flex-col" key={f.title}>
          <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary mb-space-md">
            <Icon className="text-[28px]" name={f.icon} />
          </div>
          {f.badge && (
            <div className="inline-block text-secondary-container font-label-sm text-label-sm uppercase tracking-wider font-bold mb-space-xs">
              {f.badge}
            </div>
          )}
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-sm">{f.title}</h3>
          <div className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">{f.body}</div>
        </div>
      ))}
    </div>
  );
}

export function CheckList({ items }: { items: { title: string; body?: React.ReactNode }[] }) {
  return (
    <div className="space-y-space-sm">
      {items.map((item) => (
        <div className="flex items-start gap-space-sm" key={item.title}>
          <div className="w-8 h-8 rounded-full bg-primary-container/10 text-primary-container flex items-center justify-center shrink-0 mt-0.5">
            <Icon className="text-[18px]" name="check_circle" />
          </div>
          <div>
            <h3 className="font-headline-sm text-on-surface text-[18px] leading-7">{item.title}</h3>
            {item.body && <p className="font-body-sm text-body-sm text-on-surface-variant">{item.body}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Steps({ steps }: { steps: { title: string; body: React.ReactNode; tag?: string; accent?: boolean }[] }) {
  const cols = steps.length >= 4 ? "md:grid-cols-2 lg:grid-cols-4" : steps.length === 3 ? "md:grid-cols-3" : "md:grid-cols-2";
  return (
    <ol className={`grid grid-cols-1 ${steps.length > 4 ? "md:grid-cols-2 lg:grid-cols-3" : cols} gap-gutter`}>
      {steps.map((s, i) => (
        <li className="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm flex flex-col justify-between" key={s.title}>
          <div>
            <div
              className={`w-12 h-12 rounded-xl ${s.accent ? "bg-secondary-container text-on-secondary" : "bg-primary text-on-primary"} flex items-center justify-center font-headline-sm font-bold mb-space-md`}
            >
              {i + 1}
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">{s.title}</h3>
            <div className="font-body-sm text-body-sm text-on-surface-variant">{s.body}</div>
          </div>
          {s.tag && (
            <div className={`pt-space-md text-[12px] font-semibold ${s.accent ? "text-secondary-container" : "text-primary"}`}>
              {s.tag}
            </div>
          )}
        </li>
      ))}
    </ol>
  );
}

export function Faq({ items }: { items: { q: string; a: React.ReactNode }[] }) {
  return (
    <div className="max-w-3xl mx-auto space-y-space-sm">
      {items.map((item) => (
        <details className="group bg-surface-container-lowest rounded-xl shadow-sm" key={item.q}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-space-md p-space-md font-label-lg text-label-lg text-on-surface">
            {item.q}
            <Icon className="faq-chevron text-primary transition-transform" name="expand_more" />
          </summary>
          <div className="px-space-md pb-space-md font-body-md text-body-md text-on-surface-variant">{item.a}</div>
        </details>
      ))}
    </div>
  );
}

export function CtaBand({
  title,
  body,
  primary,
  secondary,
  icon = "auto_stories",
}: {
  title: string;
  body: string;
  primary: Cta;
  secondary?: Cta;
  icon?: string;
}) {
  return (
    <section className="w-full bg-surface py-space-xl">
      <div className="max-w-7xl mx-auto px-margin">
        <div className="bg-primary rounded-3xl p-space-lg lg:p-space-xl text-on-primary shadow-xl relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-primary-container/30 blur-3xl pointer-events-none"></div>
          <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-space-lg">
            <div className="flex items-center gap-space-md">
              <div className="hidden sm:flex w-16 h-16 rounded-2xl bg-primary-container items-center justify-center text-secondary-container shrink-0 shadow-sm">
                <Icon className="text-[36px]" name={icon} />
              </div>
              <div className="flex flex-col">
                <h2 className="font-headline-lg text-headline-lg-mobile sm:text-headline-lg text-on-primary font-bold">{title}</h2>
                <p className="font-body-md text-body-md text-on-tertiary-container mt-1 max-w-xl">{body}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-space-sm shrink-0">
              <ButtonLink cta={primary} variant="accent" />
              {secondary && <ButtonLink cta={secondary} variant="secondary" />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Notice({
  icon = "info",
  children,
  action,
  tone = "info",
}: {
  icon?: string;
  children: React.ReactNode;
  action?: Cta;
  tone?: "info" | "warning";
}) {
  const bg = tone === "warning" ? "bg-secondary-fixed/60" : "bg-surface-container";
  return (
    <div className={`${bg} p-space-md rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md`} role="note">
      <div className="flex items-start gap-space-sm">
        <Icon className={`${tone === "warning" ? "text-secondary" : "text-primary"} text-[24px] shrink-0`} name={icon} />
        <div className="font-body-sm text-body-sm text-on-surface">{children}</div>
      </div>
      {action && (
        <ButtonLink cta={action} variant="text" />
      )}
    </div>
  );
}

/** Required whenever a page sends users to Moodle (see websitecontent.md §4 and §6.3). */
export function MoodleHandoffNotice() {
  return (
    <Notice action={{ href: MOODLE_URL, label: "Open learning space", external: true }} icon="swap_horiz">
      Learning activities, assessments, and course content open in Moodle. You may need to sign in separately at{" "}
      <code className="font-mono text-primary font-bold">{MOODLE_HOST}</code>.
    </Notice>
  );
}

export function AiDisclosureNotice() {
  return (
    <Notice icon="smart_toy">
      AI responses are labelled, grounded in approved course material where possible, and can be wrong. The assistant
      will not complete graded work, and access may be limited by usage quotas or programme settings.
    </Notice>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm ${className}`}>{children}</div>;
}
