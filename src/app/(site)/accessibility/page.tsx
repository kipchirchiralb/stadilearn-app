import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Accessibility", description: "Stadilearn's accessibility commitment (WCAG 2.1 AA) and how to report a barrier." };

export default function AccessibilityPage() {
  return (
    <LegalPage
      eyebrow="Accessibility"
      intro="We want everyone to be able to use Stadilearn, including first-time smartphone users and people using assistive technology."
      lastUpdated="14 September 2026"
      sections={[
        { id: "target", title: "Our target", body: <p>Stadilearn targets the Web Content Accessibility Guidelines (WCAG) 2.1 level AA across public pages and the platform.</p> },
        {
          id: "measures",
          title: "What we do",
          body: (
            <ul>
              <li>Keyboard navigation with visible focus.</li>
              <li>Semantic headings, labels and alternative text for screen readers.</li>
              <li>Adequate colour contrast and large touch targets.</li>
              <li>Plain language and simple navigation on small screens.</li>
              <li>Captions or transcripts for instructional video.</li>
              <li>No autoplaying video; low-data and downloadable options.</li>
            </ul>
          ),
        },
        { id: "known", title: "Known limitations", body: <p>We are still testing the platform with assistive technologies. Some Moodle activities and third-party content may not yet meet the target. We will list known issues here as we find them.</p> },
        { id: "report", title: "Report a barrier", body: <p>If something is hard to use, <Link href="/contact?type=support">tell us</Link>. Describe the page, what you were trying to do and the device or assistive technology you use. We aim to respond within five working days.</p> },
      ]}
      title="Accessibility Statement"
    />
  );
}
