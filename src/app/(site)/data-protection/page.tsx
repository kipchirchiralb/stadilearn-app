import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/forms/ContactForm";
import { LegalPage } from "@/components/legal/LegalPage";
import { Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "Kenyan Data Protection",
  description: "Stadilearn's responsibilities under the Kenya Data Protection Act, 2019 and how to make a data request.",
};

export default function DataProtectionPage() {
  return (
    <LegalPage
      eyebrow="Kenyan data protection"
      intro="Stadilearn processes personal data in line with the Kenya Data Protection Act, 2019. Here is how we meet those responsibilities and how you can exercise your rights."
      lastUpdated="14 September 2026"
      sections={[
        { id: "principles", title: "Our commitments", body: <ul><li>Record a lawful basis for each type of processing.</li><li>Collect only the data we need and capture consent where required.</li><li>Keep data accurate, secure and no longer than necessary.</li><li>Sign data processing agreements with every vendor, including AI providers.</li><li>Document where data is stored and which processors receive it.</li></ul> },
        { id: "rights", title: "Your rights", body: <ul><li>Be informed about how your data is used.</li><li>Access the personal data we hold about you.</li><li>Correct inaccurate data.</li><li>Request deletion, subject to legal retention requirements.</li><li>Object to processing and withdraw consent.</li><li>Receive your data in a portable format.</li></ul> },
        { id: "process", title: "How requests are handled", body: <p>We verify your identity, then respond within the timeframe required by law. Sensitive requests, such as exporting your data, require you to sign in again. Some records, like issued certificates or audit logs, may be retained where the law requires it.</p> },
        { id: "breach", title: "Breach notification", body: <p>If a breach is likely to put your rights at risk, we notify the ODPC and affected people as required. Report concerns via <Link href="/security">Security</Link>.</p> },
        { id: "complaints", title: "Complaints", body: <p>You can complain to the Office of the Data Protection Commissioner (ODPC) if you are unhappy with how we handle your data.</p> },
      ]}
      title="Kenyan Data Protection"
    >
      <section className="mt-space-xl scroll-mt-28" id="request">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-space-sm">Make a data request</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
          Tell us which right you want to exercise (access, correction, export, deletion or objection). Use the email address linked to your account.
        </p>
        <Card>
          <ContactForm initialMessage="Data request type (access / correction / export / deletion / objection): " initialType="support" />
        </Card>
      </section>
    </LegalPage>
  );
}
