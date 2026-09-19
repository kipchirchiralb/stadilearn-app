import { CONTACT, MOODLE_HOST, MOODLE_URL, ROUTES } from "@/lib/site";

/**
 * Platform and Moodle how-to used by the support assistant (prompt + RAG).
 * Keep this aligned with the live routes and the help page.
 */
export const PLATFORM_GUIDE = `Stadilearn has two connected systems with separate logins.

1) Main platform — stadilearn.co.ke (this assistant)
- Create account: ${ROUTES["create-account"]} — choose learner, teacher/trainer, or institution. Confirm with a 6-digit code emailed to you. Codes expire in about 10 minutes; wait 60 seconds to resend. Use the same email as your Moodle account.
- Sign in: ${ROUTES["sign-in"]} — passwordless. Enter email, then the emailed one-time code. No password on Stadilearn.
- Lost email access: ${ROUTES.help} and ${"/account-recovery"} — human support verifies identity. Do not guess or reset Moodle from here.
- After sign-in: /app/dashboard (welcome) and /app/assistant (AI). Open tutor for course topics, support for accounts and how-to, trainer (teachers/admins only) for drafts.
- Public catalogue: ${ROUTES.courses} — course pages under /learn/[slug].
- Certificates: issued after Moodle completion; anyone can check a code at ${ROUTES["verify-certificate"]}.
- Help: ${ROUTES.help}. Contact a person: ${ROUTES.contact} (${CONTACT.email}).
- Privacy / terms / data requests: ${ROUTES["privacy-policy"]}, ${ROUTES["terms-of-service"]}, ${ROUTES["kenyan-data-protection"]}.
- Institution accounts start pending. They do not see learner data until Stadilearn verifies the organisation. Institution admin rights are granted by a Stadilearn super admin, not at signup.
- This assistant cannot change enrolments, grades, passwords or accounts. Explain where the user does it.

2) Moodle LMS — ${MOODLE_HOST} (where studying happens)
- Open it from the site (“Open Moodle” / Open learning space) or ${MOODLE_URL}. Sign in to Moodle separately; a Stadilearn OTP does not log you into Moodle.
- Typical Moodle paths: dashboard, My courses, a course page (${MOODLE_URL}/course/view.php?id=COURSEID), activities in each section, grades, and messages.
- Forgotten Moodle password: use “Forgotten password” on the Moodle login page, not Stadilearn.
- Missing course: enrolment is managed in Moodle (self-enrol, key, or institution enrolment). Ask the trainer/institution or human support. This assistant cannot enrol anyone.
- Quizzes, assignments and lessons are submitted in Moodle. Download PDFs in Moodle on Wi-Fi when possible.
- Course completion in Moodle is what later drives Stadilearn certificates once accounts are matched by email (users.moodle_user_id). If progress is missing here, the emails may not match, or the Moodle user is not confirmed yet.
- Teachers author and grade in Moodle. Stadilearn’s trainer assistant only drafts material — it must be reviewed, then added in Moodle.

3) AI assistants on Stadilearn
- Tutor: explains topics from indexed course material (Moodle pages, books, lessons, labels, plus the public catalogue). It must not complete graded quizzes or assignments.
- Support: this role — navigation, accounts, OTP, enrolment pointers, certificates, Moodle how-to.
- Trainer: teachers and institution admins; labelled drafts only.
- If the AI is unavailable, Moodle still works. Daily limits may apply.
- Escalate with “Talk to a person” in a support conversation, or ${ROUTES.contact}.

When you answer, give the exact page or Moodle action. If you are unsure, say so and offer human support.`;

export const PLATFORM_HELP_DOCS: { key: string; title: string; url: string; text: string }[] = [
  {
    key: "two-sites",
    title: "Stadilearn and Moodle: two logins",
    url: `${ROUTES.help}`,
    text: `Stadilearn (stadilearn.co.ke) is the account, AI, progress summaries and certificates site. Moodle (${MOODLE_HOST}) is the learning management system where you study, take quizzes and submit work. Signing in to one does not sign you in to the other. Open Moodle from the header “Open Moodle” or ${MOODLE_URL}.`,
  },
  {
    key: "stadilearn-signin",
    title: "Create an account and sign in with an emailed code",
    url: ROUTES["sign-in"],
    text: `Stadilearn is passwordless. Create an account at ${ROUTES["create-account"]} as a learner, teacher/trainer or institution, accept terms, and confirm with a 6-digit email code. Use the same email as Moodle so progress and (for teachers) taught courses can be read. Sign in at ${ROUTES["sign-in"]} the same way. Codes last about 10 minutes. Resend after 60 seconds. If the inbox is empty, check spam. If you lost the email address, use /account-recovery. Institution accounts stay pending until verified and do not show other learners’ data yet.`,
  },
  {
    key: "moodle-howto",
    title: "How to use Moodle (elearning.stadilearn.co.ke)",
    url: ROUTES["open-learning-space"],
    text: `After you have a Moodle account, go to ${MOODLE_URL} and sign in. Open My courses or the course link your trainer sent. Each course has sections with resources and activities. Complete activities in Moodle; that is what counts toward completion. Use Forgotten password on the Moodle login page if you cannot sign in. If a course is missing, you are not enrolled — ask your trainer. Enrolment keys and self-enrol happen in Moodle, not on stadilearn.co.ke. Teachers build and grade content in Moodle.`,
  },
  {
    key: "ai-and-certificates",
    title: "AI assistants, progress and certificates",
    url: ROUTES["ai-support"],
    text: `The tutor answers questions from indexed course material and will not do graded work for you. Support helps you find pages and use Moodle. Trainer drafts are for teachers and must be reviewed. Open /app/assistant when signed in. Certificates are issued after Moodle completion requirements are met and can be checked at ${ROUTES["verify-certificate"]}. Progress on Stadilearn needs a Moodle user with the same email. Flag bad AI answers in the chat. Contact ${CONTACT.email} or ${ROUTES.contact} for a person.`,
  },
];
