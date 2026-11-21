import { MOODLE_HOST, MOODLE_URL } from "@/lib/site";

export type HelpTopic = {
  icon: string;
  title: string;
  items: { q: string; a: string }[];
};

/** Visible help answers. Links use [label](href) and are rendered on the help page. */
export const HELP_TOPICS: HelpTopic[] = [
  {
    icon: "person_add",
    title: "Accounts and signing in",
    items: [
      {
        q: "How do I create a Stadilearn account?",
        a: "Go to [Create account](/signup), enter your details and confirm your email with the one-time code we send. Teachers and learners should use the same email they use in Moodle so we can match the accounts.",
      },
      {
        q: "I did not receive my one-time code",
        a: "Check spam or promotions folders and make sure the email address is correct. Codes expire after a few minutes; you can request a new one after a short wait.",
      },
      {
        q: "How do I sign in?",
        a: "Go to [Sign in](/login), enter your email and type the code we send you.",
      },
      {
        q: "I no longer have access to my email",
        a: "Use [account recovery](/account-recovery) and our team will help verify your identity.",
      },
    ],
  },
  {
    icon: "swap_horiz",
    title: "Stadilearn and Moodle",
    items: [
      {
        q: "Why are there two websites?",
        a: `Stadilearn handles your account, AI help, progress and certificates. Moodle at [${MOODLE_HOST}](${MOODLE_URL}) is where you study, take quizzes and submit work.`,
      },
      {
        q: "Should I use the same email for both?",
        a: "Yes. Stadilearn looks up your Moodle user by email (read-only) so teachers can see the courses they teach and everyone can see progress. Logins stay separate.",
      },
      {
        q: "How do I open Moodle?",
        a: `Use the “Open learning space” button in your dashboard, or go to [${MOODLE_HOST}](${MOODLE_URL}). You sign in to Moodle separately.`,
      },
      {
        q: "I forgot my Moodle password or cannot see my course",
        a: "Use “Forgotten password” on the Moodle login page. If your course is missing, contact your trainer or our support team — enrolments are managed in Moodle.",
      },
    ],
  },
  {
    icon: "download",
    title: "Learning materials and data",
    items: [
      {
        q: "Can I download lessons?",
        a: "Many lessons include downloadable PDFs in Moodle. Download them on Wi-Fi to study later without data.",
      },
      {
        q: "How can I use less data?",
        a: "See the [offline and low-data toolkit](/offline-toolkit) for tips.",
      },
    ],
  },
  {
    icon: "smart_toy",
    title: "AI assistant",
    items: [
      {
        q: "Why won't the AI answer my quiz question?",
        a: "The assistant is designed not to complete graded work. It can explain the topic and give hints instead.",
      },
      {
        q: "How do I flag a bad answer?",
        a: "Use the flag button on any AI response. Flagged answers are reviewed by our team.",
      },
      {
        q: "The assistant says it is unavailable",
        a: "Daily usage limits or service interruptions can pause AI features. Your Moodle courses continue to work.",
      },
    ],
  },
  {
    icon: "workspace_premium",
    title: "Certificates",
    items: [
      {
        q: "When do I get my certificate?",
        a: "Learners and teachers request a certificate from [Your certificates](/app/certificates) after signing in. A Stadilearn admin checks Moodle completion using your signup email, then issues a branded PDF with a certificate number.",
      },
      {
        q: "How does someone verify my certificate?",
        a: "They enter the certificate number on [Verify Certificate](/verify-certificate).",
      },
    ],
  },
  {
    icon: "shield_person",
    title: "Accessibility and privacy",
    items: [
      {
        q: "How do I request my data or delete my account?",
        a: "Use the [data request form](/data-protection#request).",
      },
      {
        q: "I have an accessibility problem",
        a: "Tell us on the [accessibility page](/accessibility) and we will help.",
      },
    ],
  },
  {
    icon: "domain",
    title: "Institutions and partners",
    items: [
      {
        q: "How do we get institution reports?",
        a: "Create an institution account and [contact us](/contact?type=institution) so we can verify and link it to your cohorts.",
      },
      {
        q: "Our dashboard shows no data",
        a: "Access is granted after verification, and figures update after Moodle synchronisation. Check the data freshness label or contact support.",
      },
    ],
  },
];

export function plainAnswer(answer: string) {
  return answer.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}
