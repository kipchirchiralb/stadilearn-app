/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { MOODLE_URL, ROUTES } from "@/lib/site";

// Landing page — ported 1:1 from the approved index.html design.
// Markup and classes are unchanged; only `href="#"` links now point at real routes.

const FILL = { fontVariationSettings: '"FILL" 1' };

function Stars({ size }: { size: 16 | 18 }) {
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <span className={`material-symbols-outlined ${size === 16 ? "text-[16px]" : "text-[18px]"}`} key={i} style={FILL}>
          star
        </span>
      ))}
    </>
  );
}

const METRICS = [
  { icon: "groups", value: "5,000+", label: "Learners", box: "w-12 h-12" },
  { icon: "task_alt", value: "94%", label: "Completion Rate", box: "w-10 h-10 sm:w-12 sm:h-12" },
  { icon: "school", value: "1450+", label: "Educators", box: "w-10 h-10 sm:w-12 sm:h-12" },
  { icon: "cell_tower", value: "47", label: "Counties", box: "w-10 h-10 sm:w-12 sm:h-12" },
];

const PATHS = [
  {
    icon: "person_check",
    kicker: "For Learners & Youth",
    title: "Self-Paced & Career Ready",
    body: "Start where you are. Learn on mobile, practise with guided AI hints that never spoonfeed answers, and earn verifiable certificates you can share on LinkedIn and CVs.",
    path: "courses" as const,
    cta: "Start Learning",
  },
  {
    icon: "cast_for_education",
    kicker: "For Teachers & Trainers",
    title: "Classroom AI Integration",
    body: "Build your teaching practice. Master confident technology delivery, draft lesson plans with responsible AI assistance, and monitor learner cohorts with precision.",
    path: "for-teachers" as const,
    cta: "Explore Teacher Training",
  },
  {
    icon: "domain",
    kicker: "For Institutions & NGOs",
    title: "Visible Cohort Impact",
    body: "Turn learning into visible institutional progress. School, county, TVET, and partner cohort dashboards with exportable progress reports and verifiable audit trails.",
    path: "for-institutions" as const,
    cta: "Request a Conversation",
  },
];

const FEATURED = [
  {
    slug: "foundations-of-practical-ai",
    level: "Beginner",
    levelClass: "bg-primary-container/10 text-primary-container",
    duration: "4 Weeks",
    title: "Foundations of Practical AI & Everyday Work",
    body: "Learn prompt design, smart search, and workplace automation applied to Kenyan administrative tasks.",
    tags: ["EN + Kiswahili", "Low Data"],
  },
  {
    slug: "ai-for-classroom-teachers",
    level: "Intermediate",
    levelClass: "bg-secondary-container/15 text-secondary-container",
    duration: "3 Weeks",
    title: "AI for Classroom Teachers & Lesson Planning",
    body: "Build CBC-aligned lesson plans, interactive assessment quizzes, and digital worksheets in half the time.",
    tags: ["CBC Aligned", "Certificate"],
  },
  {
    slug: "digital-workplace-confidence",
    level: "All Levels",
    levelClass: "bg-primary-container/10 text-primary-container",
    duration: "2 Weeks",
    title: "Digital Workplace Confidence & Mobile Productivity",
    body: "Master cloud spreadsheets, mobile documents, safe remote teamwork, and digital record keeping.",
    tags: ["Mobile Optimized", "Offline PDFs"],
  },
  {
    slug: "responsible-ai-and-ethics",
    level: "Specialization",
    levelClass: "bg-tertiary/10 text-tertiary",
    duration: "4 Weeks",
    title: "Responsible AI & Ethics in the African Context",
    body: "Data governance, algorithmic fairness, IP rights, and safeguarding student privacy under Kenyan data laws.",
    tags: ["Data Protection", "Verifiable QR"],
  },
];

const WHY = [
  {
    title: "Mobile-First & Low-Bandwidth Friendly",
    body: "Lightweight web architecture, low-data diagrams, and offline-compatible guides that function on 3G connections.",
  },
  {
    title: "Responsible AI Guidance, Not Cheating",
    body: "Our AI tutor provides progressive hints and conceptual clarity strictly grounded in approved curriculum — it never writes assignments for you.",
  },
  {
    title: "Tamper-Proof Verifiable Certificates",
    body: "Every completed course yields an instant digital credential with verifiable QR code compliant with institutional audits.",
  },
  {
    title: "Seamless Dual-Platform Integration",
    body: "One Stadilearn account unlocks structured guidance, AI support, and automated single sign-on directly into our Moodle learning engine.",
  },
];

const AI_POINTS = [
  { icon: "translate", title: "Bilingual Guidance", body: "Ask questions in English or everyday Kiswahili. Receive contextual examples tailored to local realities." },
  { icon: "menu_book", title: "Curriculum Grounded", body: "Every answer references specific lesson readings and Moodle resources — avoiding hallucinations." },
  { icon: "shield", title: "Anti-Cheating Safeguards", body: "Offers progressive hints and troubleshooting steps. Never provides direct copy-paste solutions." },
  { icon: "support_agent", title: "Trainer Escalation", body: "Stuck? Seamlessly flag complex roadblocks for human instructor feedback during weekly live office hours." },
];

const TESTIMONIALS = [
  {
    quote:
      '"The mobile-friendly modules allowed our rural secondary school teachers in Machakos to master digital lesson prep without broadband issues. The offline summaries were a lifesaver."',
    initials: "GM",
    avatar: "bg-primary-container text-on-primary",
    name: "Grace M.",
    role: "Lead Teacher, Eastern Region",
  },
  {
    quote:
      "\"Stadilearn's AI tutor helped me understand data queries in plain terms. Returning to Moodle to submit my final project was seamless and the certificate verified instantly on LinkedIn.\"",
    initials: "BO",
    avatar: "bg-secondary-container text-on-secondary",
    name: "Brian O.",
    role: "ICT Diploma Student, Nairobi",
  },
  {
    quote:
      '"Our youth cohort achieved a 92% completion rate thanks to lightweight downloads and structured weekly checkpoints. Exporting progress analytics for our partners was effortless."',
    initials: "SK",
    avatar: "bg-tertiary-container text-on-tertiary",
    name: "Sarah K.",
    role: "Youth Programme Coordinator, Kisumu",
  },
];

function Kicker({ children, className = "mb-space-xs" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`inline-flex items-center gap-space-xs bg-surface-container px-space-md py-space-xs rounded-full ${className}`}>
      <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
      <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">{children}</span>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      {/* ========================================================================= */}
      {/* HERO SECTION                                                              */}
      {/* ========================================================================= */}
      <section className="relative w-full bg-surface py-space-xl lg:py-24">
        <div className="max-w-7xl mx-auto px-margin">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-space-xl items-center">
            {/* Hero Text Content (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col space-y-space-md">
              {/* Kicker Pill / Eyebrow */}
              <Kicker className="w-fit">Digital &amp; AI Learning for Kenya</Kicker>
              {/* Main Headline */}
              <h1 className="font-display-hero text-headline-lg lg:text-display-hero text-on-surface tracking-tight">
                Build skills that <span className="text-primary-container">move with you.</span>
              </h1>
              {/* Supporting Text */}
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
                Stadilearn helps learners and teachers build practical digital and AI skills through structured,
                mobile-friendly learning and guided practice. Shaped by Kenyan classrooms and everyday learning
                experiences.
              </p>
              {/* Primary Actions */}
              <div className="flex flex-wrap items-center gap-space-sm pt-space-xs">
                <Link
                  className="inline-flex items-center gap-space-xs bg-primary-container text-on-primary font-label-lg text-label-lg px-space-lg py-space-sm rounded-lg hover:bg-primary transition-all shadow-[0_4px_16px_rgba(0,102,128,0.2)] hover:shadow-none"
                  data-path="courses"
                  href={ROUTES.courses}
                >
                  <span>Explore Courses</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
                <Link
                  className="inline-flex items-center gap-space-xs bg-surface-container-lowest text-primary font-label-lg text-label-lg px-space-lg py-space-sm rounded-lg shadow-sm hover:bg-surface-container-high transition-colors"
                  data-path="how-it-works"
                  href={ROUTES["how-it-works"]}
                >
                  <span className="material-symbols-outlined text-[20px] text-secondary-container">play_circle</span>
                  <span>See How It Works</span>
                </Link>
                <Link
                  className="inline-flex items-center gap-space-xs font-label-md text-label-md text-primary hover:text-primary-container transition-colors ml-space-xs py-space-sm"
                  data-path="for-institutions"
                  href={ROUTES["for-institutions"]}
                >
                  <span>For Institutions</span>
                  <span className="material-symbols-outlined text-[16px]">trending_flat</span>
                </Link>
              </div>
              {/* Social Proof Badge */}
              <div className="pt-space-md flex flex-wrap items-center gap-space-md">
                <div className="flex -space-x-2">
                  <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-sm text-label-sm shadow-sm">
                    JK
                  </div>
                  <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary flex items-center justify-center font-label-sm text-label-sm shadow-sm">
                    MN
                  </div>
                  <div className="w-10 h-10 rounded-full bg-tertiary-container text-on-tertiary flex items-center justify-center font-label-sm text-label-sm shadow-sm">
                    AO
                  </div>
                  <div className="w-10 h-10 rounded-full bg-surface-container-highest text-primary font-bold flex items-center justify-center font-label-sm text-label-sm shadow-sm">
                    +47
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 text-secondary-container">
                    <Stars size={16} />
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
                    Help shape learning for <strong className="text-on-surface font-semibold">5,000+</strong> Kenyan
                    learners and teachers across 47 counties in 2027
                  </span>
                </div>
              </div>
            </div>
            {/* Hero Visual (5 Cols) */}
            <div className="lg:col-span-5 relative mt-space-lg lg:mt-0">
              <div className="relative rounded-2xl overflow-hidden shadow-xl bg-surface-container-high">
                <img
                  alt="Kenyan university learners collaborating with modern laptops and digital tools"
                  className="w-full h-[420px] lg:h-[480px] object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuADtduxFNNlxedV0O_cli2EeyLlqp4cKSB6bZxIXFIYuG-4yTkTcVxFZ1diirejEs-l5zEBj7X-F-VC1fm2Mc6SVC5-2oDStYnouSYch_2s-b3nJ4tbZz2Rle3Gsr82Th9m9wIEyrO3iDuhC85FjpTJO0taQDGmxD_ZtTlZ0H1gpvvuw78JLB1th6W8ESc_bDCbkowh0uec5lrOI3kzzymuqDtyy8gy8sLFYGd6ijSNeeRyxfbYhrgj"
                />
                {/* Bottom Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-on-surface/70 via-transparent to-transparent"></div>
                {/* Floating Platform Badge Top-Right */}
                <div className="absolute top-4 right-4 bg-surface-container-lowest/95 backdrop-blur-md rounded-xl p-space-sm shadow-md flex items-center gap-space-sm">
                  <img
                    alt="Stadilearn Logo Icon"
                    className="w-8 h-8 object-contain rounded-md"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBjqBbTkPrAKGdl5s6QZTljHOLdu9H-lWVP5LxXd9e1LwUA8OS3xwZ52AxQkQ7EZ9meZs8-vgj344fJ8vGPNDqQpRsvWhW2IIPmGRbBFFx31FHhixL4L-AJh7aRUEdLRgEjiRoYJIEv0bcvzPeC7nljy4J-6oyLbOgsMYNoHfMLI1w_o85HfrooTvxp8OgKTvxt7STqVG5qeoeWL4fUW_ufbn-oi3WXjrdxwnQBmEFgK4c-2Ol9OSVTpdsQfIo8_BVY3w"
                  />
                  <div className="flex flex-col pr-space-xs">
                    <span className="font-label-sm text-label-sm text-primary font-bold">Stadilearn + Moodle</span>
                    <span className="text-[11px] text-on-surface-variant leading-none">Dual-engine platform</span>
                  </div>
                </div>
                {/* Floating Pill Bottom Banner */}
                <div className="absolute bottom-4 inset-x-4 bg-surface/95 backdrop-blur-md rounded-xl p-space-sm shadow-lg flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-lg bg-secondary-container text-on-secondary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">bolt</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface font-bold">
                      100% Practical AI &amp; Digital Literacy
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Optimized for Kenyan classrooms, learners, and Network
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* KEY METRICS STRIP (HIGH-CONTRAST DEEP TEAL/PETROL)                        */}
      {/* ========================================================================= */}
      <section className="relative w-full overflow-hidden bg-primary py-space-lg shadow-md">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center select-none font-display-hero text-[clamp(6rem,18vw,14rem)] font-extrabold leading-none tracking-[-0.06em] text-primary-container/30"
        >
          2027
        </span>
        <div className="relative z-10 max-w-7xl mx-auto px-margin">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter text-on-primary">
            {METRICS.map((m) => (
              <div
                className="flex min-w-0 flex-col items-center justify-center gap-space-sm p-space-sm text-center sm:flex-row sm:gap-space-md sm:text-left"
                key={m.label}
              >
                <div className={`${m.box} rounded-xl bg-primary-container text-secondary-container flex items-center justify-center shrink-0`}>
                  <span className="material-symbols-outlined text-[28px]">{m.icon}</span>
                </div>
                <div className="flex flex-col items-center sm:items-start">
                  <span className="font-headline-lg text-[clamp(2rem,6vw,36px)] font-extrabold text-on-primary tracking-tight">
                    {m.value}
                  </span>
                  <span className="font-body-sm text-body-sm text-on-tertiary-container">{m.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 1: CHOOSE YOUR PATH (AUDIENCE PATHWAYS)                           */}
      {/* ========================================================================= */}
      <section className="w-full bg-surface py-space-xl">
        <div className="max-w-7xl mx-auto px-margin">
          <div className="text-center max-w-2xl mx-auto mb-space-xl">
            <Kicker>Purpose-Built Tracks</Kicker>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Choose Your Learning Path</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
              Whether you are an individual wanting digital job readiness, a teacher modernising classrooms, or an
              institution scaling digital skills.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {PATHS.map((p) => (
              <div
                className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
                key={p.title}
              >
                <div className="flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary mb-space-md">
                    <span className="material-symbols-outlined text-[28px]">{p.icon}</span>
                  </div>
                  <div className="inline-block text-secondary-container font-label-sm text-label-sm uppercase tracking-wider font-bold mb-space-xs">
                    {p.kicker}
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-sm">{p.title}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-space-md">{p.body}</p>
                </div>
                <div className="pt-space-md">
                  <Link
                    className="inline-flex items-center gap-space-xs font-label-md text-label-md text-primary font-bold hover:text-secondary-container transition-colors"
                    data-path={p.path}
                    href={ROUTES[p.path]}
                  >
                    <span>{p.cta}</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: FEATURED COURSES (GRID CARDS WITH MOODLE NOTE)                 */}
      {/* ========================================================================= */}
      <section className="w-full bg-surface-container-low py-space-xl">
        <div className="max-w-7xl mx-auto px-margin">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-space-xl gap-space-md">
            <div>
              <Kicker>Practical Curriculum</Kicker>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Featured Learning</h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mt-space-xs">
                Find practical courses for digital confidence, AI literacy, and teaching with modern technology.
              </p>
            </div>
            <Link
              className="inline-flex items-center gap-space-xs font-label-md text-label-md text-primary font-bold hover:text-secondary-container transition-colors"
              data-path="courses"
              href={ROUTES.courses}
            >
              <span>View All Courses</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>
          {/* Course Cards 4-Col Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {FEATURED.map((c) => (
              <div
                className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col justify-between hover:shadow-lg transition-all group"
                key={c.slug}
              >
                <div>
                  <div className="flex items-center justify-between gap-space-xs mb-space-sm">
                    <span className={`${c.levelClass} px-space-xs py-0.5 rounded-full font-label-sm text-label-sm font-bold`}>
                      {c.level}
                    </span>
                    <span className="bg-surface-container text-on-surface-variant px-space-xs py-0.5 rounded-full font-label-sm text-label-sm">
                      {c.duration}
                    </span>
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors mb-space-xs">
                    {c.title}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">{c.body}</p>
                  <div className="flex flex-wrap gap-space-xs mb-space-md">
                    {c.tags.map((t) => (
                      <span
                        className="text-[11px] font-label-sm font-semibold bg-surface-container px-2 py-0.5 rounded text-on-surface-variant"
                        key={t}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="pt-space-sm bg-surface-container-low/50 -mx-space-md -mb-space-md p-space-md rounded-b-2xl">
                  <p className="text-[11px] font-body-sm text-on-surface-variant mb-space-xs">Studies conducted in Moodle</p>
                  <Link
                    className="inline-flex items-center justify-between w-full font-label-sm text-label-sm text-primary font-bold group-hover:text-secondary-container transition-colors"
                    data-path="courses"
                    href={`${ROUTES.courses}/${c.slug}`}
                  >
                    <span>View Course Details</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          {/* Notice Banner on Moodle Workspace */}
          <div className="mt-space-lg bg-surface p-space-md rounded-xl flex flex-col sm:flex-row items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary text-[24px]">info</span>
              <span className="font-body-sm text-body-sm text-on-surface">
                All course modules, quizzes, and live submissions run on our dedicated Moodle portal at{" "}
                <code className="font-mono text-primary font-bold">elearning.stadilearn.co.ke</code>.
              </span>
            </div>
            <a
              className="font-label-sm text-label-sm text-primary-container hover:text-primary font-bold inline-flex items-center gap-1 shrink-0"
              href={MOODLE_URL}
              rel="noopener noreferrer"
              target="_blank"
            >
              <span>Go to Moodle Portal</span>
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            </a>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: WHY STADILEARN / REAL CONDITIONS (SPLIT SECTION)               */}
      {/* ========================================================================= */}
      <section className="w-full bg-surface py-space-xl">
        <div className="max-w-7xl mx-auto px-margin">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-space-xl items-center">
            {/* Left Side: Image with highlight pill */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl bg-surface-container">
                <img
                  alt="Kenyan educator training workshop guiding adult teachers with laptops and tablets"
                  className="w-full h-[400px] lg:h-[460px] object-cover"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuC6eRxMv3fThEBoeBHxBMt2KLC8t_g3fxzEXp4zXbVCegUAbMwNJkEeHC4nJi9msVzMRv0u3-eFnt5dGPQkJ1K9QdfilyoY6UpQgO1JiEKtcEPXQuGtxMHvGgWPj7y_Aipb6_8fpCkct5e0Wcjfi-ug-gpk2J3kDPTL1SmwfrQ0gL6wUPQkeG9ocXMUUU5uxE6_p4uUDQeAaIXbX6rkrKZdQ0SXeXKLbETRgNkb9DdkwKE9DGqDp4DN"
                />
                {/* Highlight Float Badge */}
                <div className="absolute bottom-6 left-6 bg-surface-container-lowest/95 backdrop-blur-md rounded-xl p-space-md shadow-lg max-w-xs">
                  <div className="flex items-center gap-space-xs text-secondary-container mb-1">
                    <span className="material-symbols-outlined text-[20px]">verified</span>
                    <span className="font-label-sm text-label-sm font-bold">Shaped by Kenyan Classrooms</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Tested across public schools, TVET institutions, and county training workshops.
                  </p>
                </div>
              </div>
            </div>
            {/* Right Side: Content & Feature Checklist */}
            <div className="lg:col-span-6 flex flex-col space-y-space-md">
              <div>
                <Kicker>Why Choose Stadilearn</Kicker>
                <h2 className="font-headline-lg text-headline-lg text-on-surface">
                  We Don&apos;t Just Teach Tech. <span className="text-primary">We Build Practical Capability.</span>
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
                  Education built for real environments. Clear progress tracking in Stadilearn paired with robust,
                  dependable coursework in Moodle.
                </p>
              </div>
              {/* Feature List */}
              <div className="space-y-space-sm pt-space-xs">
                {WHY.map((w) => (
                  <div className="flex items-start gap-space-sm" key={w.title}>
                    <div className="w-8 h-8 rounded-full bg-primary-container/10 text-primary-container flex items-center justify-center shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    </div>
                    <div>
                      <h4 className="font-headline-sm text-headline-sm text-on-surface text-[18px]">{w.title}</h4>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{w.body}</p>
                    </div>
                  </div>
                ))}
              </div>
              {/* Action */}
              <div className="pt-space-xs">
                <Link
                  className="inline-flex items-center gap-space-xs bg-primary text-on-primary font-label-md text-label-md px-space-lg py-space-sm rounded-lg hover:bg-primary-container transition-all shadow-sm"
                  data-path="how-it-works"
                  href={ROUTES["how-it-works"]}
                >
                  <span>Learn About Our Methodology</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: RESPONSIBLE AI LEARNING SUPPORT                                */}
      {/* ========================================================================= */}
      <section className="w-full bg-surface-container-high py-space-xl">
        <div className="max-w-7xl mx-auto px-margin">
          <div className="bg-surface-container-lowest rounded-3xl p-space-lg lg:p-space-xl shadow-md">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-space-xl items-center">
              <div className="lg:col-span-7 flex flex-col space-y-space-md">
                <div className="inline-flex items-center gap-space-xs bg-surface-container px-space-md py-space-xs rounded-full w-fit">
                  <span className="material-symbols-outlined text-primary text-[18px]">psychology</span>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
                    Responsible AI Assistant
                  </span>
                </div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface">
                  An AI tutor that helps you learn — <span className="text-primary-container">not shortcut the process.</span>
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  In Kenyan classrooms and remote study circles, learning happens when you solve problems yourself. Our
                  embedded AI companion is engineered with pedagogic guardrails:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-space-xs">
                  {AI_POINTS.map((a) => (
                    <div className="bg-surface-container-low p-space-md rounded-xl" key={a.title}>
                      <div className="flex items-center gap-space-xs text-primary font-bold font-label-md text-label-md mb-1">
                        <span className="material-symbols-outlined text-[20px]">{a.icon}</span>
                        <span>{a.title}</span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">{a.body}</p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Interactive AI Demo Simulation Preview Card */}
              <div className="lg:col-span-5 bg-surface-container p-space-md rounded-2xl shadow-sm">
                <div className="flex items-center justify-between pb-space-sm mb-space-sm bg-surface-container-lowest p-space-sm rounded-xl">
                  <div className="flex items-center gap-space-xs">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-[12px]">
                      AI
                    </div>
                    <span className="font-label-md text-label-md text-on-surface font-bold">Stadilearn Study Buddy</span>
                  </div>
                  <span className="text-[11px] font-label-sm font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Safe Mode
                  </span>
                </div>
                {/* Simulated Chat Messages */}
                <div className="space-y-space-sm text-body-sm">
                  <div className="bg-surface-container-lowest p-space-sm rounded-xl ml-auto max-w-[85%] text-on-surface">
                    <p className="font-semibold text-[11px] text-on-surface-variant mb-1">Learner (Makueni County)</p>
                    Can you write my lesson plan introduction for Grade 7 Agriculture on soil moisture conservation?
                  </div>
                  <div className="bg-primary/10 p-space-sm rounded-xl mr-auto max-w-[90%] text-on-surface">
                    <p className="font-semibold text-[11px] text-primary mb-1">Stadilearn AI</p>
                    I cannot write the full plan for you, but let us build it together! What local farming practices
                    (like mulching or zai pits) have your learners observed in Eastern Kenya? We can frame your hook
                    around that.
                  </div>
                  <div className="bg-surface-container-lowest p-space-sm rounded-xl ml-auto max-w-[85%] text-on-surface">
                    <p className="font-semibold text-[11px] text-on-surface-variant mb-1">Learner</p>
                    Most of their families use dry grass mulching after weeding.
                  </div>
                  <div className="bg-primary/10 p-space-sm rounded-xl mr-auto max-w-[90%] text-on-surface">
                    <p className="font-semibold text-[11px] text-primary mb-1">Stadilearn AI</p>
                    Spot on! Use that in Step 1: &quot;Ask learners why soil under grass stays moist at midday.&quot; Now,
                    open Module 2 in Moodle to fill in the CBC competence criteria.
                  </div>
                </div>
                <div className="mt-space-md pt-space-xs flex items-center justify-between text-[12px] text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-primary">lock</span>
                    Audited by Stadilearn Pedagogy Team
                  </span>
                  <Link className="text-primary font-bold hover:underline" data-path="ai-support" href={ROUTES["ai-support"]}>
                    Read Safeguards →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: HOW IT WORKS (4-STEP DUAL-PLATFORM PIPELINE)                   */}
      {/* ========================================================================= */}
      <section className="w-full bg-surface py-space-xl">
        <div className="max-w-7xl mx-auto px-margin">
          <div className="text-center max-w-2xl mx-auto mb-space-xl">
            <Kicker>Clear Learning Journey</Kicker>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">How Learning Flows</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
              A seamless loop between Stadilearn&apos;s responsive guidance portal and our dedicated Moodle coursework
              engine.
            </p>
          </div>
          {/* 4-Step Process Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter relative">
            {/* Step 1 */}
            <div className="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center font-headline-sm font-bold mb-space-md">
                  1
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">Create Free Account</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Register in seconds with your email or phone. Choose your learner track: self-study, teacher, or cohort
                  member.
                </p>
              </div>
              <div className="pt-space-md text-[12px] font-semibold text-primary">Step 01 • Fast Enrollment</div>
            </div>
            {/* Step 2 */}
            <div className="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center font-headline-sm font-bold mb-space-md">
                  2
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">Enrol in Course</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Browse practical digital and AI curriculum tailored for Kenyan education, business, and administrative
                  needs.
                </p>
              </div>
              <div className="pt-space-md text-[12px] font-semibold text-primary">Step 02 • Immediate Access</div>
            </div>
            {/* Step 3 */}
            <div className="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-secondary-container text-on-secondary flex items-center justify-center font-headline-sm font-bold mb-space-md">
                  3
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">Open Moodle Study Space</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  One-click SSO to <code className="font-mono text-primary text-[13px]">elearning.stadilearn.co.ke</code> to
                  complete reading, quizzes, and labs.
                </p>
              </div>
              <div className="pt-space-md text-[12px] font-semibold text-secondary-container">Step 03 • Deep Practice</div>
            </div>
            {/* Step 4 */}
            <div className="bg-surface-container-lowest p-space-md rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center font-headline-sm font-bold mb-space-md">
                  4
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">Verify &amp; Share Credential</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Submit your final capstone and claim a tamper-proof digital certificate with instant QR code
                  verification.
                </p>
              </div>
              <div className="pt-space-md text-[12px] font-semibold text-primary">Step 04 • Verifiable Proof</div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 6: REAL VOICES / TESTIMONIALS                                     */}
      {/* ========================================================================= */}
      <section className="w-full bg-surface-container-low py-space-xl">
        <div className="max-w-7xl mx-auto px-margin">
          <div className="text-center max-w-2xl mx-auto mb-space-xl">
            <Kicker>Learner Success Stories</Kicker>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">What Our Learners &amp; Educators Say</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
              Real feedback from secondary school teachers, TVET students, and regional program directors.
            </p>
          </div>
          {/* 3 Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            {TESTIMONIALS.map((t) => (
              <div className="bg-surface-container-lowest p-space-lg rounded-2xl shadow-sm flex flex-col justify-between" key={t.name}>
                <div>
                  <div className="flex items-center gap-1 text-secondary-container mb-space-sm">
                    <Stars size={18} />
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface leading-relaxed mb-space-md italic">{t.quote}</p>
                </div>
                <div className="flex items-center gap-space-sm pt-space-xs">
                  <div className={`w-10 h-10 rounded-full ${t.avatar} flex items-center justify-center font-bold text-label-sm`}>
                    {t.initials}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface font-bold">{t.name}</span>
                    <span className="text-[12px] text-on-surface-variant">{t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 7: BOTTOM CTA BANNER                                              */}
      {/* ========================================================================= */}
      <section className="w-full bg-surface py-space-xl">
        <div className="max-w-7xl mx-auto px-margin">
          <div className="bg-primary rounded-3xl p-space-lg lg:p-space-xl text-on-primary shadow-xl relative overflow-hidden">
            {/* Ambient decorative shapes */}
            <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-primary-container/30 blur-3xl pointer-events-none"></div>
            <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none"></div>
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-space-lg">
              <div className="flex items-center gap-space-md">
                <div className="w-16 h-16 rounded-2xl bg-primary-container flex items-center justify-center text-secondary-container shrink-0 shadow-sm">
                  <span className="material-symbols-outlined text-[36px]">auto_stories</span>
                </div>
                <div className="flex flex-col">
                  <h2 className="font-headline-lg text-headline-lg text-on-primary font-bold">
                    Ready to build practical digital &amp; AI skills?
                  </h2>
                  <p className="font-body-md text-body-md text-on-tertiary-container mt-1 max-w-xl">
                    Join individual learners, schools, and institutional partners across Kenya today. Start free with our
                    introductory modules.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-space-sm shrink-0">
                <Link
                  className="inline-flex items-center gap-space-xs bg-secondary-container text-on-secondary font-label-lg text-label-lg px-space-lg py-space-sm rounded-lg hover:bg-secondary transition-all shadow-md"
                  data-path="courses"
                  href={ROUTES.courses}
                >
                  <span>Explore Courses Now</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
                <Link
                  className="inline-flex items-center gap-space-xs bg-surface-container-lowest text-primary font-label-lg text-label-lg px-space-lg py-space-sm rounded-lg hover:bg-surface-container-high transition-colors shadow-sm"
                  data-path="for-institutions"
                  href={ROUTES["for-institutions"]}
                >
                  <span>Book an Institutional Demo</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
