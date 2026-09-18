# Stadilearn — Main Platform (`stadilearn.co.ke`)

Next.js full-stack application for **Stadilearn**, a practical digital and AI learning platform for Kenya.

This app is the **main / custom platform**. It sits alongside a separately hosted **Moodle** instance at
`elearning.stadilearn.co.ke`, which delivers the training content.

> **Status: Phase 1 — public pages.** Every page linked from the landing page, plus login and signup, is built.
> Dashboards, the custom database, sessions and Moodle reads come in the next phase.

---

## 1. How the platform fits together

```
                 discover, sign up, sign in
 Learners  ─┐   ┌───────────────────────────────────────────────┐
 Teachers  ─┼──▶│  Stadilearn main platform (this app)          │
 Institutions┘  │  stadilearn.co.ke                             │
                │  • Accounts (emailed OTP) & role dashboards   │
                │  • Dedicated AI assistant (tutor / drafting)  │
                │  • Certificates + public verification         │
                │  • Statistics, summaries, cohort reports      │
                │  • Custom database (read/write)               │
                └───────────────┬───────────────────────────────┘
                                │ READ-ONLY (SELECT only)
                                ▼
                ┌───────────────────────────────────────────────┐
                │  Moodle (separate install)                    │
                │  elearning.stadilearn.co.ke                   │
                │  • Courses, lessons, quizzes, grading         │
                │  • Enrolments, cohorts, groups, completion    │
                │  • Its own users and login                    │
                └───────────────────────────────────────────────┘
```

- **People find Stadilearn through the main platform.** To use the AI assistant, see statistics and summaries, and
  get certificates, learners and teachers **must sign up and sign in** here.
- **Institutions and organisations** create accounts on the main platform to see summaries of their Moodle cohorts,
  learner reports and certifications. Access is limited to their own institution and checked on the server.
- **Moodle delivers the training**, to individuals or to cohorts. Studying, authoring and grading happen there.
- **The main platform only reads numbers from Moodle's database.** It never writes to Moodle tables. Changes to
  Moodle go through Moodle itself, its web services, or controlled imports.
- **Separate logins at launch.** Signing in to Stadilearn does not sign you in to Moodle. Pages say this wherever
  they send users to Moodle.

### Roles

| Role | On the main platform |
| --- | --- |
| Learner | AI tutor, progress summaries, certificates, support, links into Moodle |
| Teacher / Trainer | AI drafting (lesson plans, quizzes, feedback), assigned-cohort statistics, certificates |
| Content Author | Content usage stats, AI indexing status, AI drafting, links to Moodle authoring |
| Institution / Partner | Read-only, institution-scoped cohort summaries, learner reports, certification, exports |
| Programme Admin | Institutions, programmes, cohorts, reports, certificates, notifications |
| System Admin | Integrations, AI config and quotas, Moodle sync health, audit |

Source specs (in the parent folder): `custom-platform-system-requirements.md`, `moodle-configuration-requirements.md`,
`stadilearn-system-requirements.md` and `websitecontent.md`.

---

## 2. Tech stack

- **Next.js 16** (App Router, React Server Components, Route Handlers) + **React 19**
- **TypeScript** (strict)
- **Tailwind CSS 3.4**, using the landing page's design tokens copied exactly (`tailwind.config.ts`)
- Fonts: Inter, Plus Jakarta Sans and Material Symbols (Google Fonts)

Planned for the next phase: MySQL/MariaDB for the custom database, a separate read-only pool for Moodle, server-side
sessions, SMTP email, and a provider-neutral AI adapter (Gemini first).

---

## 3. Getting started

Requires Node.js 20+ (tested on Node 24).

```bash
cd app
npm install
cp .env.example .env.local   # fill in values; never commit secrets
npm run dev                   # http://localhost:3000
```

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build (also type-checks) |
| `npm run start` | Serve the production build |
| `npm run typecheck` | TypeScript check only |

### Environment variables

See [`.env.example`](.env.example). Phase 1 only uses `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_MOODLE_URL`. The
database, session, SMTP and AI variables are placeholders for the next phase.

> ⚠️ Keep real credentials (database passwords, Moodle admin, SMTP, AI keys) in `.env.local` or a secret manager,
> never in source control or plain text files in the repo. The Moodle credential used by this app must be a
> **dedicated `SELECT`-only account**, not the Moodle application or admin account.

---

## 4. Project structure

```
app/
├─ public/                     # static assets (logo)
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx            # root <html>, fonts, metadata
│  │  ├─ globals.css           # Tailwind + base styles from the landing page
│  │  ├─ not-found.tsx         # 404
│  │  ├─ robots.ts, sitemap.ts
│  │  ├─ (site)/               # public website — shared header + footer
│  │  │  ├─ page.tsx           # landing page (ported 1:1 from index.html)
│  │  │  ├─ learn/             # catalogue + learn/[slug] course detail
│  │  │  ├─ learners/  teachers/  institutions/  impact/
│  │  │  ├─ how-it-works/  ai-support/  about/  help/  contact/
│  │  │  ├─ verify-certificate/
│  │  │  ├─ learning-space/  trainer-workspace/  offline-toolkit/   # Moodle handoff pages
│  │  │  └─ privacy/ terms/ cookies/ accessibility/ ai-transparency/
│  │  │     data-protection/ safeguarding/ security/               # trust & legal
│  │  ├─ (auth)/               # split-screen auth layout
│  │  │  ├─ login/  signup/  account-recovery/
│  │  └─ api/v1/               # versioned route handlers (stubs in Phase 1)
│  │     ├─ auth/otp/request   auth/otp/verify   auth/register
│  │     ├─ certificates/verify
│  │     └─ contact
│  ├─ components/
│  │  ├─ layout/               # SiteHeader, SiteFooter (landing markup)
│  │  ├─ ui/                   # PageHero, Section, FeatureGrid, Steps, Faq, CtaBand, notices…
│  │  ├─ courses/              # CourseCard, CourseCatalogue (search + filters)
│  │  ├─ forms/                # ContactForm, VerifyCertificateForm, field helpers
│  │  ├─ auth/                 # LoginForm, SignupForm, OtpStep
│  │  └─ legal/                # LegalPage layout
│  └─ lib/
│     ├─ site.ts               # ROUTES map (landing data-path → URL), Moodle URL, contact
│     ├─ courses.ts            # placeholder catalogue (→ Moodle read model later)
│     ├─ certificates.ts       # placeholder lookup (→ custom DB later)
│     ├─ counties.ts, validation.ts
├─ tailwind.config.ts          # design tokens copied from the landing page
└─ index.html                  # original approved landing page (design reference)
```

---

## 5. Pages (Phase 1)

### Public website

| Route | Page | Notes |
| --- | --- | --- |
| `/` | Home | Original `index.html` ported 1:1. Only `href="#"` links were wired to routes |
| `/learn` | Course catalogue | Search and filters: level, topic, language, delivery, availability. Empty state |
| `/learn/[slug]` | Course detail | Outcomes, modules, prerequisites, connectivity, assessment, certificate, FAQ. CTA changes with availability |
| `/learners` | For Learners | Experience, plus how the two sites work |
| `/teachers` | For Teachers | Training pathway, Moodle vs Stadilearn split |
| `/institutions` | For Institutions | Offer, reporting, institution accounts, 6-step implementation |
| `/impact` | Partners & Funders | Theory of change, indicators, method, privacy |
| `/how-it-works` | How It Works | 5-step journey, responsibilities, FAQ |
| `/ai-support` | AI Support | Tutor, practice, support, trainer assistant, guardrails, limits |
| `/about` | About | Mission, audiences, approach, governance placeholders |
| `/verify-certificate` | Verify Certificate | Valid, revoked, not-found and error states. `?code=` prefill |
| `/help` | Help & Support | 7 topic groups, support routes |
| `/contact` | Contact | Enquiry routing form. `?type=` / `?course=` prefill |
| `/learning-space` | Open Learning Space | Moodle handoff for learners |
| `/trainer-workspace` | Trainer Workspace | Moodle handoff for trainers and authors |
| `/offline-toolkit` | Offline Sync Toolkit | Download-based offline support. No claim of offline assessment sync |
| `/privacy` `/terms` `/cookies` `/accessibility` `/ai-transparency` `/data-protection` `/safeguarding` `/security` | Trust & legal | Marked *draft pending legal review*. `/data-protection#request` holds the data request form |

### Authentication

| Route | Page | Notes |
| --- | --- | --- |
| `/login` | Sign in | Email, then 6-digit emailed OTP (passwordless) |
| `/signup` | Create account | Role: learner, teacher/trainer or institution. Consent capture, then OTP. `?role=` prefill |
| `/account-recovery` | Account recovery | For people who lost access to their email. Routes to human support |

### Landing page link map

The original landing page used `data-path` attributes. They map to routes in `src/lib/site.ts`:

| `data-path` | Route | | `data-path` | Route |
| --- | --- | --- | --- | --- |
| `home` | `/` | | `learners-students` | `/learners` |
| `courses`, `explore-courses` | `/learn` | | `partners-funders` | `/impact` |
| `how-it-works` | `/how-it-works` | | `open-learning-space` | `/learning-space` |
| `for-teachers` | `/teachers` | | `trainer-workspace` | `/trainer-workspace` |
| `for-institutions` | `/institutions` | | `offline-sync-toolkit` | `/offline-toolkit` |
| `verify-certificate` | `/verify-certificate` | | `ai-transparency` | `/ai-transparency` |
| `ai-support` | `/ai-support` | | `kenyan-data-protection` | `/data-protection` |
| `about` | `/about` | | `accessibility` | `/accessibility` |
| `sign-in` | `/login` | | `privacy-policy` / `terms-of-service` / `cookie-policy` | `/privacy` / `/terms` / `/cookies` |

---

## 6. API stubs (Phase 1)

Route handlers live under `/api/v1`. Each one validates input. None of them stores anything yet.

| Endpoint | Phase 1 behaviour | Next phase |
| --- | --- | --- |
| `POST /api/v1/auth/register` | Validates details. `202` with a generic message | Create pending account, record consent, send OTP |
| `POST /api/v1/auth/otp/request` | `202` with the same response for any valid email (no enumeration) | Rate limit, hashed CSPRNG code, expiry, email |
| `POST /api/v1/auth/otp/verify` | `501 Not Implemented`, shown in the UI | Verify hash, limit attempts, rotate session, set cookie |
| `POST /api/v1/certificates/verify` | Always `not_found`. In development only, demo codes `SL-DEMO-VALID` and `SL-DEMO-REVOKED` show the other states | Look up certificate records in the custom DB |
| `POST /api/v1/contact` | Validates. `202` with `stored: false` | Persist enquiry, queue email to the right team |

> The contact form shows a success message but **does not save or send messages yet**. Connect storage and email
> before this goes live.

---

## 6a. Database and AI assistant

### Setup

1. **Custom DB**: `mysql -u root -p < schema.sql` creates the `stadilearn` database (MariaDB 11.4+ / MySQL 8).
2. **DB users**: edit the passwords (and Moodle's DB name/prefix) in `db-grants.sql`, then run it as a DBA. On
   cPanel/DirectAdmin hosting, create the same users and privileges in the control panel.
3. **Env**: copy `.env.example` to `.env.local` and fill in the `CUSTOM_DB_*`, `MOODLE_DB_*` and `AI_*` values.
4. **Index course content**: `npm run ai:index`. Rerun after content changes (for example nightly by cron). It
   only embeds new or changed documents and withdraws anything hidden or deleted in Moodle.
5. **Try it before OTP sign-in exists**: `npm run dev:session -- you@example.com --type teacher`, add the printed
   `sl_session` cookie in the browser, and open `/app/assistant`.

### Roles in the schema

| Role | Where it lives |
| --- | --- |
| Learner, Teacher | `users.account_type` (self-signup) |
| Institution admin | `institution_members.member_role = 'admin'`: a teacher nominated by the super admin |
| Super admin | `users.account_type = 'super_admin'`: the database allows only one |

### How the assistant reaches data

- **Four DB pools** (`src/lib/db.ts`): the app (read/write), the AI on the custom DB (non-PII `ai_v_*` views and
  `rag_*` tables only), Moodle read-only, and the AI on Moodle (content and completion tables only, with no
  `mdl_user`, lesson passwords or enrolment keys). The code also rejects anything but a single `SELECT` on the
  read-only pools.
- **RAG** (`src/lib/ai/retrieval.ts`): embeddings are stored as normalised float32 BLOBs and searched in memory.
  This works for tens of thousands of chunks. On MariaDB 11.8+ it can move to a native `VECTOR` column.
- **Tools** (`src/lib/ai/tools.ts`): the model can call only fixed, parameterised queries: courses, my progress, my
  cohorts, cohort/institution/platform summaries. Scope is checked on the server, and the model never writes SQL.
  The summaries return counts, never names.
- **Guardrails**: daily quotas (`ai_quotas`), the `ai.enabled` kill switch (`app_settings`), a usage ledger,
  citations, answer flags (`ai_flags`) and escalation to a support ticket.

| Endpoint | Purpose |
| --- | --- |
| `POST /api/v1/ai/chat` | Send a message (`assistant`: tutor, support or trainer; optional `courseId`, `conversationId`) |
| `GET /api/v1/ai/conversations[/id]` | The user's own conversations and messages with citations |
| `POST /api/v1/ai/messages/:id/flag` | Flag an answer for review |
| `POST /api/v1/ai/conversations/:id/escalate` | Hand the conversation to the human support queue |
| `GET /api/v1/ai/courses` | Indexed courses, for scoping the tutor |

---

## 7. Design system notes

- `tailwind.config.ts` holds exactly the theme from `index.html`: colours (`primary`, `secondary-container`,
  `surface-*`…), spacing (`space-xs` … `space-xl`, `gutter`, `margin`), font families and type scale.
  **Change tokens there, not per page.**
- Interior pages use `src/components/ui` so they match the landing page: pill eyebrows, rounded-2xl cards,
  teal CTA band, orange accent buttons.
- Use `MoodleHandoffNotice` wherever a page sends users to Moodle, and `AiDisclosureNotice` wherever AI features
  are described (as required by `websitecontent.md`).
- Icons are Material Symbols: `<Icon name="school" />`.

---

## 8. Known gaps and follow-ups

**Landing page (kept exactly as approved, flagged for content review).** Some landing copy conflicts with
`websitecontent.md` §2 *Claims to avoid*:

- "automated single sign-on" and "One-click SSO": logins are separate at launch.
- "Register … with your email or phone": sign-up is email + OTP.
- Metrics (5,000+, 94%, 1450+) and testimonials: they must be verified and consented before launch.
- The footer link "Offline Sync Toolkit": the page itself explains that offline support is download-based only.
- The header has no mobile menu (`hidden lg:flex`). On phones, navigation relies on the footer links.
- The EN/Kiswahili switch is visual only. i18n (string externalisation) is still to do.
- Hero images load from `lh3.googleusercontent.com`. Replace them with owned, consented photography in `public/`.

**Not yet built (next phase):**

1. Wire signup/login/OTP routes to the DB (tables exist: `users`, `otp_codes`, `sessions`, `user_consents`).
2. Admin screens: institution approval, nominating institution admins, cohort management, AI flag review queue,
   support tickets, quotas.
3. Dashboards under `/app/*` for learners, teachers, institution admins and the super admin.
4. Moodle account linking (`users.moodle_user_id`) and scheduled `npm run ai:index`.
5. Certificate issuance, email notifications, CSV/PDF exports.
7. Kiswahili translations, analytics with consent, automated tests (unit, e2e, accessibility).
