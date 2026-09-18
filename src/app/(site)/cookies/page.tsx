import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";
import { MOODLE_HOST } from "@/lib/site";

export const metadata: Metadata = { title: "Cookie Policy", description: "Cookies and session technologies used by Stadilearn." };

export default function CookiesPage() {
  return (
    <LegalPage
      eyebrow="Cookies"
      intro="We use a small number of cookies, mostly to keep you signed in securely."
      lastUpdated="14 September 2026"
      sections={[
        {
          id: "essential",
          title: "Essential cookies",
          body: (
            <ul>
              <li><strong>Session cookie</strong> — keeps you signed in. Secure, HttpOnly, limited to stadilearn.co.ke and expires after inactivity.</li>
              <li><strong>Security cookie</strong> — protects forms against cross-site request forgery.</li>
              <li><strong>Preference cookie</strong> — remembers your language choice.</li>
            </ul>
          ),
        },
        { id: "analytics", title: "Analytics", body: <p>If we use analytics, it will only run with your consent and will not record message contents, codes, passwords or sensitive learner data.</p> },
        { id: "moodle", title: "Moodle cookies", body: <p>Moodle at {MOODLE_HOST} sets its own cookies. Stadilearn does not share its session cookie with Moodle.</p> },
        { id: "control", title: "Managing cookies", body: <p>You can clear or block cookies in your browser settings. Blocking essential cookies will prevent you from signing in.</p> },
      ]}
      title="Cookie Policy"
    />
  );
}
