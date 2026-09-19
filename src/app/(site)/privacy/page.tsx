import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/LegalPage";
import { CONTACT, MOODLE_HOST } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy Policy", description: "How Stadilearn collects, uses and protects personal data." };

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy"
      intro="This notice explains what personal data Stadilearn collects, why, how long we keep it, and your rights under the Kenya Data Protection Act, 2019."
      lastUpdated="14 September 2026"
      sections={[
        { id: "who", title: "Who we are", body: <p>Stadilearn operates stadilearn.co.ke and acts as data controller for data processed on this platform. We intend to be registered with the Office of the Data Protection Commissioner (ODPC). Contact: {CONTACT.email}.</p> },
        {
          id: "collect",
          title: "Data we collect and why",
          body: (
            <ul>
              <li><strong>Account data</strong> (name, email, role) to create and secure your account — contract.</li>
              <li><strong>Institution and cohort links</strong> to show the right dashboards and reports — contract or legitimate interest of your institution.</li>
              <li><strong>Learning records read from Moodle</strong> (enrolment, completion, grades) to show progress and issue certificates — contract.</li>
              <li><strong>Optional demographics</strong> (county, gender, age band) for disaggregated programme reporting — consent, which you can withdraw.</li>
              <li><strong>AI conversations</strong> to provide the assistant, review flagged answers and control costs — contract and legitimate interest.</li>
              <li><strong>Enquiries and support tickets</strong> to respond to you — consent or legitimate interest.</li>
              <li><strong>Security logs and audit events</strong> to protect the service — legal obligation and legitimate interest.</li>
            </ul>
          ),
        },
        { id: "moodle", title: "Stadilearn and Moodle", body: <p>Moodle at {MOODLE_HOST} is a separate system with its own accounts. Stadilearn reads learning records from Moodle to show progress and reports but does not change them. Moodle&apos;s own data handling is covered by its privacy notice.</p> },
        { id: "ai", title: "AI providers", body: <p>AI features send your question and relevant course content to a third-party AI provider under a data processing agreement. We configure providers not to train on learner conversations where that control is available, and we set a retention period for conversations. See <Link href="/ai-transparency">AI Transparency</Link>.</p> },
        { id: "sharing", title: "Who we share data with", body: <ul><li>Your institution or programme partner, limited to their own cohorts and approved summaries.</li><li>Service providers for hosting, email and AI, under contract.</li><li>Public certificate verification shows only the minimum approved details.</li><li>Authorities where required by law.</li></ul> },
        { id: "retention", title: "Retention", body: <p>We keep account data while your account is active and for a limited period afterwards. Certificates and verification records are kept so they can continue to be verified. Specific retention periods will be published before launch.</p> },
        { id: "rights", title: "Your rights", body: <p>You can access, correct, export or ask us to delete your data, object to processing, and withdraw consent. Use the <Link href="/data-protection#request">data request form</Link>. You may also complain to the ODPC.</p> },
        { id: "minors", title: "Learners under 18", body: <p>Where under-18 learners take part, we require guardian consent and collect less data. See <Link href="/safeguarding">Safeguarding</Link>.</p> },
        { id: "security", title: "Security and breaches", body: <p>Data is encrypted in transit and at rest, access is role-based and enforced on the server, and we have a breach notification procedure. See <Link href="/security">Security</Link>.</p> },
      ]}
      title="Privacy Policy"
    />
  );
}
