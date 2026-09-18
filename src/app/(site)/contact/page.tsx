import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/forms/ContactForm";
import { Card, Eyebrow, Icon, Section } from "@/components/ui";
import { CONTACT } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Stadilearn about learning, teacher training, institution partnerships, support, certificates or media.",
};

type Props = { searchParams: Promise<{ type?: string; course?: string; brief?: string }> };

export default async function ContactPage({ searchParams }: Props) {
  const { type, course, brief } = await searchParams;
  const initialMessage = brief
    ? "Please send us the Stadilearn programme brief."
    : course
      ? `I would like to join the interest list for: ${course}`
      : "";

  return (
    <Section>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-space-xl py-space-lg">
        <div className="lg:col-span-5 space-y-space-md">
          <Eyebrow>Contact</Eyebrow>
          <h1 className="font-display-hero text-headline-lg-mobile sm:text-headline-lg text-on-surface tracking-tight">
            Talk to Stadilearn
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Tell us what you need and we will route your message to the right team. We usually reply within two working days.
          </p>
          <Card className="space-y-space-sm">
            {[
              ["location_on", CONTACT.location],
              ["mail", CONTACT.email],
              ["call", CONTACT.phone],
            ].map(([icon, text]) => (
              <p className="flex items-center gap-space-sm font-body-md text-body-md text-on-surface" key={icon}>
                <Icon className="text-primary text-[22px]" name={icon} />
                {text}
              </p>
            ))}
          </Card>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Safeguarding concern about a learner? Please use the route on our{" "}
            <Link className="text-primary underline" href="/safeguarding">
              safeguarding page
            </Link>
            . Security issue? See{" "}
            <Link className="text-primary underline" href="/security">
              security
            </Link>
            .
          </p>
        </div>
        <Card className="lg:col-span-7">
          <ContactForm initialMessage={initialMessage} initialType={type} />
        </Card>
      </div>
    </Section>
  );
}
