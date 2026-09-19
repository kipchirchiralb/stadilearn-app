/**
 * Placeholder course catalogue.
 *
 * In the next phase this is replaced by a read model synchronised from the
 * Moodle database (read-only) and enriched with programme metadata from the
 * custom Stadilearn database. Titles and summaries match the landing page;
 * module outlines are drafts pending approval by the content owners.
 */

export type CourseLevel = "Beginner" | "Intermediate" | "All Levels" | "Specialization";
export type Availability = "Open" | "Upcoming" | "Institution-only";

export type Course = {
  slug: string;
  title: string;
  summary: string;
  level: CourseLevel;
  duration: string;
  topic: "AI literacy" | "AI builder" | "Teaching with technology" | "Digital skills" | "Responsible AI";
  languages: string[];
  delivery: "Self-paced" | "Cohort-based" | "Self-paced or cohort";
  certificate: boolean;
  availability: Availability;
  tags: string[];
  audience: string;
  outcomes: string[];
  modules: { title: string; lessons: string[] }[];
  prerequisites: string;
  connectivity: string;
  assessment: string;
  faq: { q: string; a: string }[];
};

export const COURSES: Course[] = [
  {
    slug: "foundations-of-practical-ai",
    title: "Foundations of Practical AI & Everyday Work",
    summary:
      "Learn prompt design, smart search, and workplace automation applied to Kenyan administrative tasks.",
    level: "Beginner",
    duration: "4 Weeks",
    topic: "AI literacy",
    languages: ["English"],
    delivery: "Self-paced or cohort",
    certificate: true,
    availability: "Open",
    tags: ["Low Data"],
    audience:
      "Anyone who wants to use AI tools confidently at work or in daily life. No technical background needed.",
    outcomes: [
      "Explain in plain language what AI tools can and cannot do.",
      "Write clear prompts that produce useful, checkable results.",
      "Use AI to draft, summarise and organise everyday documents.",
      "Check AI output for mistakes, bias and privacy risks.",
    ],
    modules: [
      { title: "What AI is (and is not)", lessons: ["AI in everyday Kenyan life", "Limits and mistakes", "Safe use basics"] },
      { title: "Prompting with purpose", lessons: ["Asking clear questions", "Giving context", "Improving a weak answer"] },
      { title: "AI for everyday work", lessons: ["Drafting letters and notices", "Summarising reports", "Planning with checklists"] },
      { title: "Checking and staying safe", lessons: ["Fact-checking output", "Protecting personal data", "Final practical task"] },
    ],
    prerequisites: "Basic smartphone or computer use.",
    connectivity: "Works on a mid-range Android phone. Lesson PDFs available for low-data study.",
    assessment: "Short quizzes per module and one practical task, completed in Moodle.",
    faq: [
      { q: "Do I need to pay for an AI tool?", a: "No. Activities use free tools where possible, and alternatives are suggested when a tool is unavailable." },
    ],
  },
  {
    slug: "ai-for-classroom-teachers",
    title: "AI for Classroom Teachers & Lesson Planning",
    summary:
      "Build CBC-aligned lesson plans, interactive assessment quizzes, and digital worksheets in half the time.",
    level: "Intermediate",
    duration: "3 Weeks",
    topic: "Teaching with technology",
    languages: ["English"],
    delivery: "Cohort-based",
    certificate: true,
    availability: "Open",
    tags: ["CBC Aligned", "Certificate"],
    audience: "Primary, junior and senior school teachers, and TVET trainers delivering CBC-aligned lessons.",
    outcomes: [
      "Use AI to draft lesson plans you then review and adapt.",
      "Create quiz items and worksheets aligned to learning outcomes.",
      "Give learners clear, fair feedback with AI-assisted drafts.",
      "Set classroom rules for responsible AI use by learners.",
    ],
    modules: [
      { title: "Planning with AI assistance", lessons: ["From outcome to lesson plan", "Adapting to your learners", "Reviewing AI drafts"] },
      { title: "Assessment and practice", lessons: ["Writing quiz items", "Rubrics and marking guides", "Differentiated worksheets"] },
      { title: "Responsible classroom use", lessons: ["Academic integrity", "Learner privacy", "Capstone lesson plan"] },
    ],
    prerequisites: "Current or trainee teacher. Comfortable using a laptop or smartphone.",
    connectivity: "Live sessions are optional and recorded. Materials downloadable as PDFs.",
    assessment: "A reviewed lesson plan and assessment pack submitted in Moodle.",
    faq: [
      { q: "Does the AI write my lessons for me?", a: "No. AI produces drafts that you must review, edit and approve. Your professional judgement stays in charge." },
      { q: "Is the certificate accredited?", a: "The certificate confirms completion on Stadilearn. It is not a formal accreditation unless stated for a specific programme." },
    ],
  },
  {
    slug: "digital-workplace-confidence",
    title: "Digital Workplace Confidence & Mobile Productivity",
    summary:
      "Master cloud spreadsheets, mobile documents, safe remote teamwork, and digital record keeping.",
    level: "All Levels",
    duration: "2 Weeks",
    topic: "Digital skills",
    languages: ["English"],
    delivery: "Self-paced",
    certificate: true,
    availability: "Open",
    tags: ["Mobile Optimized", "Offline PDFs"],
    audience: "Youth, job seekers, small business owners and office staff building everyday digital skills.",
    outcomes: [
      "Create and share documents and spreadsheets from a phone.",
      "Keep simple digital records organised and backed up.",
      "Work safely with others online.",
      "Recognise common scams and protect your accounts.",
    ],
    modules: [
      { title: "Documents and spreadsheets on mobile", lessons: ["Creating documents", "Simple spreadsheets", "Sharing files"] },
      { title: "Working safely together", lessons: ["Strong passwords and 2-step login", "Spotting scams", "Digital record keeping"] },
    ],
    prerequisites: "None.",
    connectivity: "Designed for phones on limited data. Every lesson has a downloadable PDF.",
    assessment: "Module quizzes and a short practical record-keeping task in Moodle.",
    faq: [
      { q: "Can I complete this on a phone only?", a: "Yes. The course is designed for mobile, although a larger screen helps for spreadsheets." },
    ],
  },
  {
    slug: "responsible-ai-and-ethics",
    title: "Responsible AI & Ethics in the African Context",
    summary:
      "Data governance, algorithmic fairness, IP rights, and safeguarding student privacy under Kenyan data laws.",
    level: "Specialization",
    duration: "4 Weeks",
    topic: "Responsible AI",
    languages: ["English"],
    delivery: "Cohort-based",
    certificate: true,
    availability: "Upcoming",
    tags: ["Data Protection", "Verifiable QR"],
    audience: "Education leaders, trainers, programme staff and anyone deploying AI with learners or the public.",
    outcomes: [
      "Explain key duties under the Kenya Data Protection Act, 2019.",
      "Identify bias and fairness risks in AI tools.",
      "Understand intellectual property questions around AI content.",
      "Draft a responsible-AI policy for a school or programme.",
    ],
    modules: [
      { title: "Data protection in practice", lessons: ["Data Protection Act, 2019", "Consent and minors", "Data requests"] },
      { title: "Fairness and bias", lessons: ["Where bias comes from", "Testing tools", "Local language considerations"] },
      { title: "Ownership and integrity", lessons: ["IP and AI output", "Attribution", "Academic integrity"] },
      { title: "Policy capstone", lessons: ["Risk assessment", "Writing a policy", "Peer review"] },
    ],
    prerequisites: "Recommended: Foundations of Practical AI & Everyday Work, or equivalent experience.",
    connectivity: "Cohort sessions recorded; readings downloadable.",
    assessment: "Case-study responses and a policy capstone graded by a trainer in Moodle.",
    faq: [
      { q: "Is this legal advice?", a: "No. The course builds awareness. Consult a qualified adviser for legal decisions." },
    ],
  },
  {
    slug: "ai-for-school-administrators",
    title: "AI for School Administrators",
    summary:
      "Use AI beyond the classroom to streamline school operations, communication, records, and administrative work.",
    level: "Intermediate",
    duration: "3 Weeks",
    topic: "Teaching with technology",
    languages: ["English"],
    delivery: "Self-paced or cohort",
    certificate: true,
    availability: "Open",
    tags: ["School Operations", "Certificate"],
    audience:
      "Head teachers, deputies, bursars, school secretaries, and teachers with administrative or management duties.",
    outcomes: [
      "Use AI to draft circulars, parent letters, minutes, and reports.",
      "Organise timetables, schedules, and school events with AI assistance.",
      "Summarise data on attendance, fees, and performance for decision making.",
      "Handle learner, staff, and parent data safely when using AI tools.",
    ],
    modules: [
      { title: "AI in school administration", lessons: ["Where AI helps in school operations", "Choosing suitable tools", "Setting boundaries"] },
      { title: "Communication and documents", lessons: ["Circulars and parent letters", "Meeting minutes and reports", "Board and ministry submissions"] },
      { title: "Planning and data", lessons: ["Timetables and calendars", "Attendance and fee summaries", "Performance dashboards"] },
      { title: "Safe and accountable use", lessons: ["Protecting learner and staff data", "Reviewing AI output", "School AI workflow capstone"] },
    ],
    prerequisites: "Working in or with school management. Comfortable using a computer or smartphone.",
    connectivity: "Live sessions are optional and recorded. Templates and lesson PDFs downloadable.",
    assessment: "Module quizzes and a practical administrative workflow submitted in Moodle.",
    faq: [
      { q: "Is this course for classroom teaching?", a: "No. It focuses on operations and administration. For lesson planning, see AI for Classroom Teachers & Lesson Planning." },
      { q: "Can I use AI with learner records?", a: "Only with care. The course shows how to remove or protect personal data in line with the Data Protection Act, 2019." },
    ],
  },
  {
    slug: "ai-essentials",
    title: "AI Essentials",
    summary:
      "Build solid background knowledge of how AI works, where it is used, and the safety and privacy issues every user should know.",
    level: "Beginner",
    duration: "2 Weeks",
    topic: "AI literacy",
    languages: ["English"],
    delivery: "Self-paced",
    certificate: true,
    availability: "Open",
    tags: ["No Experience Needed"],
    audience: "Anyone new to AI, including students, parents, professionals, and community leaders.",
    outcomes: [
      "Explain what AI is, how it learns from data, and its main types.",
      "Recognise how AI is used in daily life, work, and public services.",
      "Identify AI risks such as misinformation, deepfakes, and bias.",
      "Protect your personal data and privacy when using AI tools.",
    ],
    modules: [
      { title: "Understanding AI", lessons: ["A short history of AI", "How machines learn from data", "Generative AI and chatbots"] },
      { title: "AI around us", lessons: ["AI in daily life", "AI at work and in public services", "Benefits and limits"] },
      { title: "Safety and privacy", lessons: ["Misinformation and deepfakes", "Bias and fairness", "Protecting your personal data", "Final quiz"] },
    ],
    prerequisites: "None.",
    connectivity: "Works on a mid-range Android phone. Lesson PDFs available for low-data study.",
    assessment: "Short quizzes per module and a final quiz in Moodle.",
    faq: [
      { q: "Do I need a technical background?", a: "No. The course uses plain language and everyday examples." },
      { q: "How is this different from Foundations of Practical AI?", a: "AI Essentials builds background knowledge and awareness. Foundations of Practical AI focuses on using AI tools for everyday work." },
    ],
  },
  {
    slug: "ai-engineer",
    title: "AI Engineer",
    summary:
      "Build simple AI-powered apps: call model APIs, ground answers in your own documents, and ship a working chatbot.",
    level: "Intermediate",
    duration: "2 Weeks",
    topic: "AI builder",
    languages: ["English"],
    delivery: "Self-paced",
    certificate: true,
    availability: "Open",
    tags: ["Short Course", "Hands-on"],
    audience: "Developers, IT staff and technical students who want to build practical tools on top of AI models.",
    outcomes: [
      "Call an AI model API and handle its responses in code.",
      "Design prompts and system instructions that give reliable output.",
      "Ground answers in your own documents with retrieval.",
      "Evaluate, secure and deploy a small AI application.",
    ],
    modules: [
      { title: "Working with model APIs", lessons: ["Choosing a model", "Your first API call", "Prompts and system instructions"] },
      { title: "Building with your own data", lessons: ["Retrieval basics", "Tools and function calling", "Testing and evaluation"] },
      { title: "Shipping safely", lessons: ["Cost and rate limits", "Privacy and guardrails", "Capstone chatbot project"] },
    ],
    prerequisites: "Basic programming in Python or JavaScript.",
    connectivity: "Coding exercises need a laptop and internet access. Lesson notes downloadable as PDFs.",
    assessment: "Coding exercises and a capstone mini-app submitted in Moodle.",
    faq: [
      { q: "Do I need a paid API key?", a: "Free tiers or trainer-provided credits are used where possible. Alternatives are suggested for each exercise." },
    ],
  },
  {
    slug: "ai-analyst",
    title: "AI Analyst",
    summary:
      "Use AI to clean, analyse and visualise data, then turn findings into clear reports for decision makers.",
    level: "Beginner",
    duration: "2 Weeks",
    topic: "AI builder",
    languages: ["English"],
    delivery: "Self-paced",
    certificate: true,
    availability: "Open",
    tags: ["Short Course", "Data Skills"],
    audience: "Office staff, researchers, programme officers and job seekers who work with spreadsheets and reports.",
    outcomes: [
      "Use AI to clean and organise messy spreadsheet data.",
      "Ask analytical questions of data and check the answers.",
      "Create clear charts and dashboards with AI assistance.",
      "Write short, evidence-based reports and summaries.",
    ],
    modules: [
      { title: "Preparing data with AI", lessons: ["Cleaning spreadsheets", "Spotting errors and gaps", "Protecting sensitive data"] },
      { title: "Analysis and insight", lessons: ["Asking good questions of data", "Charts and dashboards", "Checking AI calculations"] },
      { title: "Reporting findings", lessons: ["Writing clear summaries", "Presenting to decision makers", "Final analysis task"] },
    ],
    prerequisites: "Comfortable using spreadsheets. No coding required.",
    connectivity: "Best on a laptop. Sample datasets and lesson PDFs available for download.",
    assessment: "Module quizzes and a practical analysis report submitted in Moodle.",
    faq: [
      { q: "Do I need to know how to code?", a: "No. The course uses spreadsheets and AI assistants. Optional extension activities introduce simple formulas." },
    ],
  },
];

export function getCourse(slug: string) {
  return COURSES.find((c) => c.slug === slug);
}
