import type { Metadata } from "next";
import Link from "next/link";
import { Card, Faq, Icon, PageHero, Section, SectionHeader } from "@/components/ui";
import { MOODLE_HOST, MOODLE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Help & Support",
  description: "Answers about accounts, one-time codes, Moodle access, downloads, AI assistance, certificates, privacy and institution support.",
};

const TOPICS: { icon: string; title: string; items: { q: string; a: React.ReactNode }[] }[] = [
  {
    icon: "person_add",
    title: "Accounts and signing in",
    items: [
      { q: "How do I create a Stadilearn account?", a: <>Go to <Link className="text-primary underline" href="/signup">Create account</Link>, enter your details and confirm your email with the one-time code we send.</> },
      { q: "I did not receive my one-time code", a: "Check spam or promotions folders and make sure the email address is correct. Codes expire after a few minutes; you can request a new one after a short wait." },
      { q: "How do I sign in?", a: <>Go to <Link className="text-primary underline" href="/login">Sign in</Link>, enter your email and type the code we send you.</> },
      { q: "I no longer have access to my email", a: <>Use <Link className="text-primary underline" href="/account-recovery">account recovery</Link> and our team will help verify your identity.</> },
    ],
  },
  {
    icon: "swap_horiz",
    title: "Stadilearn and Moodle",
    items: [
      { q: "Why are there two websites?", a: `Stadilearn handles your account, AI help, progress and certificates. Moodle at ${MOODLE_HOST} is where you study, take quizzes and submit work.` },
      { q: "How do I open Moodle?", a: <>Use the “Open learning space” button in your dashboard, or go to <a className="text-primary underline" href={MOODLE_URL} rel="noopener noreferrer" target="_blank">{MOODLE_HOST}</a>. You sign in to Moodle separately.</> },
      { q: "I forgot my Moodle password or cannot see my course", a: "Use “Forgotten password” on the Moodle login page. If your course is missing, contact your trainer or our support team — enrolments are managed in Moodle." },
    ],
  },
  {
    icon: "download",
    title: "Learning materials and data",
    items: [
      { q: "Can I download lessons?", a: "Many lessons include downloadable PDFs in Moodle. Download them on Wi-Fi to study later without data." },
      { q: "How can I use less data?", a: <>See the <Link className="text-primary underline" href="/offline-toolkit">offline and low-data toolkit</Link> for tips.</> },
    ],
  },
  {
    icon: "smart_toy",
    title: "AI assistant",
    items: [
      { q: "Why won't the AI answer my quiz question?", a: "The assistant is designed not to complete graded work. It can explain the topic and give hints instead." },
      { q: "How do I flag a bad answer?", a: "Use the flag button on any AI response. Flagged answers are reviewed by our team." },
      { q: "The assistant says it is unavailable", a: "Daily usage limits or service interruptions can pause AI features. Your Moodle courses continue to work." },
    ],
  },
  {
    icon: "workspace_premium",
    title: "Certificates",
    items: [
      { q: "When do I get my certificate?", a: "After you meet the course completion requirements in Moodle. Status appears in your dashboard once progress has synchronised." },
      { q: "How does someone verify my certificate?", a: <>They enter your code on <Link className="text-primary underline" href="/verify-certificate">Verify Certificate</Link>.</> },
    ],
  },
  {
    icon: "shield_person",
    title: "Accessibility, language and privacy",
    items: [
      { q: "Can I use Stadilearn in Kiswahili?", a: "Kiswahili is being added for learner navigation, key actions, help and the AI tutor." },
      { q: "How do I request my data or delete my account?", a: <>Use the <Link className="text-primary underline" href="/data-protection#request">data request form</Link>.</> },
      { q: "I have an accessibility problem", a: <>Tell us on the <Link className="text-primary underline" href="/accessibility">accessibility page</Link> and we will help.</> },
    ],
  },
  {
    icon: "domain",
    title: "Institutions and partners",
    items: [
      { q: "How do we get institution reports?", a: <>Create an institution account and <Link className="text-primary underline" href="/contact?type=institution">contact us</Link> so we can verify and link it to your cohorts.</> },
      { q: "Our dashboard shows no data", a: "Access is granted after verification, and figures update after Moodle synchronisation. Check the data freshness label or contact support." },
    ],
  },
];

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
          {TOPICS.map((t, i) => (
            <a className="flex flex-col items-center gap-space-xs text-center bg-surface-container-lowest rounded-xl p-space-md shadow-sm hover:shadow-md transition-shadow" href={`#topic-${i}`} key={t.title}>
              <Icon className="text-primary text-[28px]" name={t.icon} />
              <span className="font-label-sm text-label-sm text-on-surface">{t.title}</span>
            </a>
          ))}
        </nav>
        <div className="space-y-space-xl">
          {TOPICS.map((t, i) => (
            <div className="scroll-mt-28" id={`topic-${i}`} key={t.title}>
              <SectionHeader title={t.title} />
              <Faq items={t.items} />
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
