import type { Metadata, MetadataRoute } from "next";
import { COURSES, getCourse, type Course } from "@/lib/courses";
import { HELP_TOPICS, plainAnswer } from "@/lib/help-faq";
import { CONTACT, MOODLE_HOST, MOODLE_URL, SITE_URL } from "@/lib/site";

export const SITE_NAME = "Stadilearn";

export const DEFAULT_TITLE = "Stadilearn - Practical Digital & AI Learning in Kenya";

export const SITE_DESCRIPTION =
  "Build practical digital and AI skills with mobile-friendly learning, guided practice, teacher training, and verifiable certificates from Stadilearn.";

export const SITE_KEYWORDS = [
  "Stadilearn",
  "digital skills Kenya",
  "AI literacy Kenya",
  "AI courses Kenya",
  "teacher training Kenya",
  "CBC lesson planning",
  "verifiable certificates",
  "Moodle learning Kenya",
  "low-data learning",
  "responsible AI",
];

const INDEXABLE: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

const HIDDEN: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: { index: false, follow: false, noimageindex: true },
};

export function absoluteUrl(path: string) {
  const base = SITE_URL.replace(/\/$/, "");
  if (!path || path === "/") return `${base}/`;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

function socialTitle(title?: string) {
  return title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
}

const SHARE_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Stadilearn — practical digital and AI learning in Kenya",
};

/** Canonical URL, Open Graph, Twitter card, and index rules for a public page. */
export function pageMeta({
  title,
  description,
  path,
  keywords,
}: {
  title?: string;
  description: string;
  path: string;
  keywords?: string[];
}): Metadata {
  const url = absoluteUrl(path);
  const shareTitle = socialTitle(title);
  return {
    title: title ? title : { absolute: DEFAULT_TITLE },
    description,
    keywords,
    alternates: {
      canonical: url,
      languages: { "en-KE": url, "x-default": url },
      types: { "text/plain": absoluteUrl("/llms.txt") },
    },
    robots: INDEXABLE,
    openGraph: {
      title: shareTitle,
      description,
      url,
      siteName: SITE_NAME,
      locale: "en_KE",
      type: "website",
      images: [SHARE_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: shareTitle,
      description,
      images: ["/twitter-image"],
    },
  };
}

export function noIndexMeta(title: string): Metadata {
  return { title, robots: HIDDEN };
}

type ChangeFreq = "weekly" | "monthly" | "yearly";

type PublicPage = {
  path: string;
  title: string;
  description: string;
  changeFrequency: ChangeFreq;
  priority: number;
  dateModified?: string;
  type?: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage" | "FAQPage";
};

export const PUBLIC_PAGES: PublicPage[] = [
  { path: "/", title: DEFAULT_TITLE, description: SITE_DESCRIPTION, changeFrequency: "weekly", priority: 1, type: "WebPage" },
  {
    path: "/learn",
    title: "Find your next skill",
    description: "Explore practical courses for digital confidence, AI literacy, and teaching with technology.",
    changeFrequency: "weekly",
    priority: 0.9,
    type: "CollectionPage",
  },
  {
    path: "/learners",
    title: "For Learners",
    description: "Learn useful digital and AI skills one step at a time, on your phone, with guided practice and verifiable certificates.",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/teachers",
    title: "For Teachers",
    description: "Teacher training for confident digital and AI literacy delivery, with cohort insights and AI-assisted drafting that you review.",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/institutions",
    title: "For Institutions",
    description:
      "Deliver digital and AI learning programmes through Moodle and see cohort participation, completion and certification in institution-scoped Stadilearn dashboards.",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/how-it-works",
    title: "How It Works",
    description: "How Stadilearn and Moodle work together: separate accounts, studying in Moodle, and progress, AI help and certificates on Stadilearn.",
    changeFrequency: "monthly",
    priority: 0.8,
  },
  {
    path: "/ai-support",
    title: "AI Learning Support",
    description: "How Stadilearn's AI tutor, practice, support and trainer assistants work, and the guardrails that keep learning honest.",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/about",
    title: "About Stadilearn",
    description: "Stadilearn's mission is to expand practical AI and technology literacy in Kenya through structured learning, teacher enablement and responsible AI.",
    changeFrequency: "monthly",
    priority: 0.7,
    type: "AboutPage",
  },
  {
    path: "/impact",
    title: "Impact & Reporting",
    description: "What Stadilearn measures, how data is collected and interpreted, and how partners and funders receive programme evidence.",
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    path: "/verify-certificate",
    title: "Verify a Stadilearn certificate",
    description: "Enter the verification code shown on a Stadilearn certificate to confirm it is genuine.",
    changeFrequency: "monthly",
    priority: 0.7,
  },
  {
    path: "/help",
    title: "Help & Support",
    description: "Answers about accounts, one-time codes, Moodle access, downloads, AI assistance, certificates, privacy and institution support.",
    changeFrequency: "monthly",
    priority: 0.6,
    type: "FAQPage",
  },
  {
    path: "/contact",
    title: "Contact",
    description: "Contact Stadilearn about learning, teacher training, institution partnerships, support, certificates or media.",
    changeFrequency: "yearly",
    priority: 0.6,
    type: "ContactPage",
  },
  {
    path: "/learning-space",
    title: "Open Learning Space",
    description: "Your Moodle learning space is where lessons, quizzes and submissions happen. Here is what to expect before you go.",
    changeFrequency: "monthly",
    priority: 0.5,
  },
  {
    path: "/trainer-workspace",
    title: "Trainer Workspace",
    description: "Trainer and author tools in Moodle for teaching, grading and content creation, plus cohort insights and AI drafting on Stadilearn.",
    changeFrequency: "monthly",
    priority: 0.5,
  },
  {
    path: "/offline-toolkit",
    title: "Offline & Low-Data Toolkit",
    description: "How to study with limited connectivity: downloadable PDFs, low-data settings and what still needs a connection.",
    changeFrequency: "monthly",
    priority: 0.6,
  },
  {
    path: "/privacy",
    title: "Privacy Policy",
    description: "How Stadilearn collects, uses and protects personal data.",
    changeFrequency: "yearly",
    priority: 0.3,
    dateModified: "2026-09-14",
  },
  {
    path: "/terms",
    title: "Terms of Service",
    description: "The terms for using Stadilearn.",
    changeFrequency: "yearly",
    priority: 0.3,
    dateModified: "2026-09-14",
  },
  {
    path: "/cookies",
    title: "Cookie Policy",
    description: "Cookies and session technologies used by Stadilearn.",
    changeFrequency: "yearly",
    priority: 0.2,
    dateModified: "2026-09-14",
  },
  {
    path: "/accessibility",
    title: "Accessibility",
    description: "Stadilearn's accessibility commitment (WCAG 2.1 AA) and how to report a barrier.",
    changeFrequency: "yearly",
    priority: 0.3,
    dateModified: "2026-09-14",
  },
  {
    path: "/ai-transparency",
    title: "AI Transparency & Safeguarding",
    description: "How Stadilearn uses AI, its limits, data handling and human oversight.",
    changeFrequency: "yearly",
    priority: 0.4,
    dateModified: "2026-09-14",
  },
  {
    path: "/data-protection",
    title: "Kenyan Data Protection",
    description: "Stadilearn's responsibilities under the Kenya Data Protection Act, 2019 and how to make a data request.",
    changeFrequency: "yearly",
    priority: 0.4,
    dateModified: "2026-09-14",
  },
  {
    path: "/safeguarding",
    title: "Safeguarding",
    description: "How Stadilearn protects learners, including under-18s, and how to raise a concern.",
    changeFrequency: "yearly",
    priority: 0.4,
    dateModified: "2026-09-14",
  },
  {
    path: "/security",
    title: "Security",
    description: "How Stadilearn protects the platform and how to report a vulnerability.",
    changeFrequency: "yearly",
    priority: 0.3,
    dateModified: "2026-09-14",
  },
];

const FEATURED_SLUGS = [
  "foundations-of-practical-ai",
  "ai-for-classroom-teachers",
  "digital-workplace-confidence",
  "responsible-ai-and-ethics",
];

export const HOME_FAQ: { q: string; a: string }[] = [
  {
    q: "What is Stadilearn?",
    a: "Stadilearn helps learners and teachers in Kenya build practical digital and AI skills through structured, mobile-friendly courses, guided practice, and verifiable certificates. Lessons and quizzes are studied in Moodle. Accounts, AI help, progress and certificates are on Stadilearn.",
  },
  {
    q: "Who is Stadilearn for?",
    a: "Learners and youth, teachers and trainers, and schools, TVETs, NGOs and county programmes. Partners and funders can also use institution reporting to see participation and completion.",
  },
  {
    q: "Where do lessons and quizzes happen?",
    a: `Lessons, quizzes and submissions happen in Moodle at ${MOODLE_HOST}. Stadilearn is where you manage your account, get AI help, see progress and receive certificates.`,
  },
  {
    q: "Does the AI tutor complete assignments?",
    a: "No. The AI tutor explains concepts, gives progressive hints and points to course material. It does not write assignments or complete graded work.",
  },
  {
    q: "Can I study on a phone with limited data?",
    a: "Yes. Pages are built to stay light on mid-range Android phones and slower connections, and many lessons include downloadable PDFs. Quizzes and submissions still need a connection to Moodle.",
  },
  {
    q: "How can someone check a Stadilearn certificate?",
    a: "Each certificate has a unique code. Anyone can enter that code on the Verify Certificate page to confirm the certificate is genuine.",
  },
];

export function howItWorksSteps() {
  return [
    {
      title: "Create your Stadilearn account",
      body: "Verify your email with a one-time code. Use the same email as Moodle so we can match your accounts. Logins stay separate.",
      tag: "Stadilearn",
    },
    { title: "Find your learning pathway", body: "Browse available courses or join through your institution.", tag: "Stadilearn" },
    {
      title: "Study in Moodle",
      body: "Lessons, quizzes, assignments, discussions and grading take place in Moodle.",
      tag: "Moodle",
      accent: true,
    },
    {
      title: "Use Stadilearn around your learning",
      body: "View progress summaries, ask the AI assistants for help, receive emails, and see certificates and reports where permitted.",
      tag: "Stadilearn",
    },
    {
      title: "Complete and verify",
      body: "Meet the course requirements, receive certificate status and share a verification link.",
      tag: "Stadilearn",
    },
  ];
}

export function howItWorksFaq() {
  return [
    { q: "Why are there two websites?", a: "Moodle is a proven learning system for lessons, assessments and grading. Stadilearn adds what Moodle does not: AI assistance, progress summaries, certificates, and reporting for institutions and partners." },
    { q: "Do I need two accounts?", a: "Yes. Your Stadilearn account and your Moodle account are separate, and signing in to one does not sign you in to the other. Use the same email on both so Stadilearn can match you and show progress or teaching data." },
    { q: "Where do I study?", a: `In Moodle at ${MOODLE_HOST}. Stadilearn links you to the right course or activity.` },
    { q: "Where do I see progress?", a: "In your Stadilearn dashboard. Progress is read from Moodle and shows when it was last updated." },
    { q: "What happens if I forget my Moodle password?", a: "Use the “Forgotten password” link on the Moodle login page. Stadilearn cannot reset Moodle passwords. Stadilearn itself signs you in with an emailed one-time code." },
    { q: "Does the AI tutor complete assignments?", a: "No. It explains concepts, gives hints and points to course material, but it will not complete graded work for you." },
    { q: "Can I learn with limited data?", a: "Yes. Pages are lightweight and many lessons have downloadable PDFs. Quizzes and submissions still need a connection to Moodle." },
    { q: "How are certificates verified?", a: "Each certificate has a unique code. Anyone can check it on the Verify Certificate page." },
  ];
}

const ORG_ID = `${absoluteUrl("/")}#organization`;
const WEBSITE_ID = `${absoluteUrl("/")}#website`;

function organizationNode() {
  return {
    "@type": ["EducationalOrganization", "Organization"],
    "@id": ORG_ID,
    name: SITE_NAME,
    url: absoluteUrl("/"),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/stadilearnlogo.png"),
    },
    image: absoluteUrl("/stadilearnlogo.png"),
    description: SITE_DESCRIPTION,
    email: CONTACT.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Nairobi",
      addressCountry: "KE",
    },
    areaServed: { "@type": "Country", name: "Kenya" },
    knowsAbout: [
      "Digital skills",
      "AI literacy",
      "Teacher training",
      "Competency-Based Curriculum",
      "Responsible AI",
      "Kenya Data Protection Act",
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: CONTACT.email,
        areaServed: "KE",
        availableLanguage: ["English"],
        url: absoluteUrl("/contact"),
      },
    ],
  };
}

function websiteNode() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: absoluteUrl("/"),
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    inLanguage: "en-KE",
    publisher: { "@id": ORG_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl("/learn")}?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

function faqNode(id: string, url: string, items: { q: string; a: string }[]) {
  return {
    "@type": "FAQPage",
    "@id": id,
    url,
    isPartOf: { "@id": WEBSITE_ID },
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

function breadcrumbNode(id: string, crumbs: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    "@id": id,
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

function webPageNode(page: { path: string; title: string; description: string; dateModified?: string; type?: PublicPage["type"] }, extra: Record<string, unknown> = {}) {
  return {
    "@type": page.type ?? "WebPage",
    "@id": `${absoluteUrl(page.path)}#webpage`,
    url: absoluteUrl(page.path),
    name: page.title.includes(SITE_NAME) ? page.title : `${page.title} | ${SITE_NAME}`,
    description: page.description,
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    inLanguage: "en-KE",
    ...(page.dateModified ? { dateModified: page.dateModified } : {}),
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "[data-speakable]"],
    },
    ...extra,
  };
}

function isoDuration(duration: string) {
  const weeks = duration.match(/(\d+)\s*weeks?/i);
  return weeks ? `P${weeks[1]}W` : undefined;
}

function courseNodes(course: Course) {
  const path = `/learn/${course.slug}`;
  const url = absoluteUrl(path);
  const timeRequired = isoDuration(course.duration);
  const availability =
    course.availability === "Open"
      ? "https://schema.org/InStock"
      : course.availability === "Upcoming"
        ? "https://schema.org/PreOrder"
        : "https://schema.org/LimitedAvailability";

  const page = webPageNode(
    { path, title: course.title, description: course.summary },
    { breadcrumb: { "@id": `${url}#breadcrumb` } },
  );

  const courseNode = {
    "@type": "Course",
    "@id": `${url}#course`,
    name: course.title,
    description: course.summary,
    url,
    provider: { "@id": ORG_ID },
    inLanguage: "en",
    educationalLevel: course.level,
    keywords: [course.topic, ...course.tags].join(", "),
    teaches: course.outcomes,
    coursePrerequisites: course.prerequisites,
    ...(timeRequired ? { timeRequired } : {}),
    ...(course.certificate ? { educationalCredentialAwarded: "Stadilearn certificate of completion" } : {}),
    audience: {
      "@type": "EducationalAudience",
      educationalRole: course.audience,
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      courseWorkload: course.duration,
      inLanguage: "en",
    },
    offers: {
      "@type": "Offer",
      url,
      availability,
      category: course.availability,
    },
    syllabusSections: course.modules.map((module, index) => ({
      "@type": "Syllabus",
      name: module.title,
      position: index + 1,
      description: module.lessons.join(", "),
    })),
  };

  const nodes: Record<string, unknown>[] = [
    page,
    courseNode,
    breadcrumbNode(`${url}#breadcrumb`, [
      { name: "Home", path: "/" },
      { name: "Courses", path: "/learn" },
      { name: course.title, path },
    ]),
  ];

  if (course.faq.length > 0) {
    nodes.push(faqNode(`${url}#faq`, `${url}#faq`, course.faq));
  }
  return nodes;
}

function courseListNode(id: string, courses: Course[]) {
  return {
    "@type": "ItemList",
    "@id": id,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    numberOfItems: courses.length,
    itemListElement: courses.map((course, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/learn/${course.slug}`),
      name: course.title,
      description: course.summary,
    })),
  };
}

function pageNodes(path: string): Record<string, unknown>[] {
  if (path.startsWith("/learn/")) {
    const course = getCourse(decodeURIComponent(path.slice("/learn/".length)));
    return course ? courseNodes(course) : [];
  }

  const page = PUBLIC_PAGES.find((entry) => entry.path === path);
  if (!page) return [];

  const url = absoluteUrl(page.path);
  const crumbs =
    page.path === "/"
      ? [{ name: "Home", path: "/" }]
      : [
          { name: "Home", path: "/" },
          { name: page.title, path: page.path },
        ];

  if (page.path === "/") {
    const featured = FEATURED_SLUGS.map((slug) => getCourse(slug)).filter((course): course is Course => Boolean(course));
    return [
      webPageNode(page, { hasPart: { "@id": `${url}#faq` } }),
      breadcrumbNode(`${url}#breadcrumb`, crumbs),
      faqNode(`${url}#faq`, `${url}#faq`, HOME_FAQ),
      courseListNode(`${url}#featured-courses`, featured),
    ];
  }

  if (page.path === "/learn") {
    return [
      webPageNode(page, { mainEntity: { "@id": `${url}#courses` } }),
      breadcrumbNode(`${url}#breadcrumb`, crumbs),
      courseListNode(`${url}#courses`, COURSES),
    ];
  }

  if (page.path === "/help") {
    const items = HELP_TOPICS.flatMap((topic) => topic.items.map((item) => ({ q: item.q, a: plainAnswer(item.a) })));
    return [
      webPageNode(page, { mainEntity: items.map((item) => ({ "@type": "Question", name: item.q, acceptedAnswer: { "@type": "Answer", text: item.a } })) }),
      breadcrumbNode(`${url}#breadcrumb`, crumbs),
    ];
  }

  if (page.path === "/how-it-works") {
    const steps = howItWorksSteps();
    return [
      webPageNode(page, { hasPart: [{ "@id": `${url}#howto` }, { "@id": `${url}#faq` }] }),
      breadcrumbNode(`${url}#breadcrumb`, crumbs),
      {
        "@type": "HowTo",
        "@id": `${url}#howto`,
        name: "How learning works on Stadilearn and Moodle",
        description: page.description,
        inLanguage: "en-KE",
        step: steps.map((step, index) => ({
          "@type": "HowToStep",
          position: index + 1,
          name: step.title,
          text: step.body,
        })),
      },
      faqNode(`${url}#faq`, `${url}#faq`, howItWorksFaq()),
    ];
  }

  if (page.path === "/contact") {
    return [
      webPageNode(page, { mainEntity: { "@id": ORG_ID } }),
      breadcrumbNode(`${url}#breadcrumb`, crumbs),
    ];
  }

  return [webPageNode(page), breadcrumbNode(`${url}#breadcrumb`, crumbs)];
}

/** Organization, website, and page schema for the current request path. */
export function jsonLdForRequest(rawPath: string) {
  const pathOnly = (rawPath.split("?")[0] || "").replace(/\/$/, "") || "/";
  if (pathOnly.startsWith("/app") || pathOnly.startsWith("/api")) {
    return { "@context": "https://schema.org", "@graph": [organizationNode(), websiteNode()] };
  }
  return {
    "@context": "https://schema.org",
    "@graph": [organizationNode(), websiteNode(), ...pageNodes(pathOnly)],
  };
}

const PRIVATE_PREFIXES = ["/app/", "/api/", "/login", "/signup", "/account-recovery"];

const AI_AGENTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "Google-Extended",
  "GoogleOther",
  "ClaudeBot",
  "Claude-SearchBot",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Applebot-Extended",
  "Amazonbot",
  "cohere-ai",
  "Meta-ExternalAgent",
  "Bytespider",
];

export function robotsConfig(): MetadataRoute.Robots {
  const rule = { allow: "/", disallow: PRIVATE_PREFIXES };
  return {
    rules: [{ userAgent: "*", ...rule }, ...AI_AGENTS.map((userAgent) => ({ userAgent, ...rule }))],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: new URL(SITE_URL).host,
  };
}

export function sitemapEntries(): MetadataRoute.Sitemap {
  const pages = PUBLIC_PAGES.map((page) => ({
    url: absoluteUrl(page.path),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
    ...(page.dateModified ? { lastModified: page.dateModified } : {}),
  }));
  const courses = COURSES.map((course) => ({
    url: absoluteUrl(`/learn/${course.slug}`),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
  return [...pages, ...courses];
}

function pageLine(page: { path: string; title: string; description: string }) {
  return `- [${page.title}](${absoluteUrl(page.path)}): ${page.description}`;
}

export function llmsTxt() {
  const guides = PUBLIC_PAGES.filter((page) => page.path !== "/");
  const lines = [
    `# ${SITE_NAME}`,
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    "Stadilearn is a Kenyan learning platform for practical digital skills, AI literacy and teacher training. Lessons, quizzes and grading happen in Moodle. Stadilearn handles accounts, AI learning support, progress summaries, verifiable certificates and institution reporting.",
    "",
    `Moodle learning space: ${MOODLE_URL}`,
    `Contact: ${CONTACT.email}, ${CONTACT.location}`,
    "",
    "## Pages",
    pageLine({ path: "/", title: "Home", description: SITE_DESCRIPTION }),
    ...guides.map(pageLine),
    "",
    "## Courses",
    ...COURSES.map((course) => `- [${course.title}](${absoluteUrl(`/learn/${course.slug}`)}): ${course.summary} Level: ${course.level}. Duration: ${course.duration}. Availability: ${course.availability}.`),
    "",
    "## Optional",
    `- [Expanded site guide](${absoluteUrl("/llms-full.txt")}): course outlines, outcomes and common questions in plain text.`,
    "",
  ];
  return lines.join("\n");
}

export function llmsFullTxt() {
  const sections = [
    llmsTxt().trimEnd(),
    "",
    "# Full guide",
    "",
    "## How learning works",
    ...howItWorksSteps().map((step, index) => `${index + 1}. ${step.title}: ${step.body}`),
    "",
    "## Common questions",
    ...HOME_FAQ.flatMap((item) => [`### ${item.q}`, item.a, ""]),
    ...howItWorksFaq().flatMap((item) => [`### ${item.q}`, item.a, ""]),
    "## Help",
    ...HELP_TOPICS.flatMap((topic) => [
      `### ${topic.title}`,
      ...topic.items.flatMap((item) => [`- ${item.q}`, `  ${plainAnswer(item.a)}`]),
      "",
    ]),
    "## Course detail",
    ...COURSES.flatMap((course) => [
      `### ${course.title}`,
      course.summary,
      `URL: ${absoluteUrl(`/learn/${course.slug}`)}`,
      `Level: ${course.level}. Duration: ${course.duration}. Delivery: ${course.delivery}. Availability: ${course.availability}. Certificate: ${course.certificate ? "yes, on completion" : "no"}.`,
      `Who it is for: ${course.audience}`,
      "Outcomes:",
      ...course.outcomes.map((outcome) => `- ${outcome}`),
      "Modules:",
      ...course.modules.map((module) => `- ${module.title}: ${module.lessons.join("; ")}`),
      `Prerequisites: ${course.prerequisites}`,
      `Connectivity: ${course.connectivity}`,
      `Assessment: ${course.assessment}`,
      ...course.faq.flatMap((item) => [`Q: ${item.q}`, `A: ${item.a}`]),
      "",
    ]),
  ];
  return `${sections.join("\n").trim()}\n`;
}
