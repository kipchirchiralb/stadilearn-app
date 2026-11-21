import Link from "next/link";
import { Card, Faq, Icon, PageHero, Section, SectionHeader } from "@/components/ui";
import { LinkedText } from "@/components/seo/LinkedText";
import { HELP_TOPICS } from "@/lib/help-faq";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Help & Support",
  description: "Answers about accounts, one-time codes, Moodle access, downloads, AI assistance, certificates, privacy and institution support.",
  path: "/help",
});

export default function HelpPage() {
  return (
    <>
      <PageHero
        eyebrow="Help & support"
        highlight="we can help."
        intro="Find answers to common questions, or contact a person if you are still stuck."
        primary={{ href: "/contact?type=support", label: "Contact human support", icon: "support_agent" }}
        secondary={{ href: "/login?next=/app/support", label: "Open support assistant" }}
        title="Stuck on something?"
      />
      <Section tone="low">
        <nav aria-label="Help topics" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-space-sm mb-space-xl">
          {HELP_TOPICS.map((t, i) => (
            <a className="flex flex-col items-center gap-space-xs text-center bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-md transition-shadow" href={`#topic-${i}`} key={t.title}>
              <Icon className="text-primary text-[28px]" name={t.icon} />
              <span className="font-label-sm text-label-sm text-on-surface">{t.title}</span>
            </a>
          ))}
        </nav>
        <div className="space-y-space-xl">
          {HELP_TOPICS.map((t, i) => (
            <div className="scroll-mt-28" id={`topic-${i}`} key={t.title}>
              <SectionHeader title={t.title} />
              <Faq items={t.items.map((item) => ({ q: item.q, a: <LinkedText text={item.a} /> }))} />
            </div>
          ))}
        </div>
      </Section>
      <Section>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <Card>
            <Icon className="text-primary text-[28px]" name="smart_toy" />
            <h2 className="font-headline-sm text-headline-sm text-on-surface mt-space-sm">Support assistant</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Sign in to ask about navigation, your account or enrolment, any time.</p>
            <Link className="mt-space-sm inline-block font-label-md text-label-md text-primary font-bold" href="/login?next=/app/support">Open assistant →</Link>
          </Card>
          <Card>
            <Icon className="text-primary text-[28px]" name="mail" />
            <h2 className="font-headline-sm text-headline-sm text-on-surface mt-space-sm">Human support</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Send us a message and we will reply by email, usually within two working days.</p>
            <Link className="mt-space-sm inline-block font-label-md text-label-md text-primary font-bold" href="/contact?type=support">Contact support →</Link>
          </Card>
          <Card>
            <Icon className="text-primary text-[28px]" name="monitor_heart" />
            <h2 className="font-headline-sm text-headline-sm text-on-surface mt-space-sm">Service status</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">A live status view for Stadilearn, Moodle and AI services will appear here.</p>
          </Card>
        </div>
      </Section>
    </>
  );
}
