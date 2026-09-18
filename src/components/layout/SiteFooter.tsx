import Link from "next/link";
import { CONTACT, MOODLE_URL, ROUTES, type RouteKey } from "@/lib/site";

type FooterLink = { path: RouteKey; label: string };

const QUICK_LINKS: FooterLink[] = [
  { path: "home", label: "Home" },
  { path: "courses", label: "Learn Courses" },
  { path: "for-teachers", label: "For Teachers" },
  { path: "for-institutions", label: "For Institutions" },
  { path: "how-it-works", label: "How It Works" },
  { path: "ai-support", label: "AI Support" },
  { path: "verify-certificate", label: "Certificate Verification" },
];

const AUDIENCES: FooterLink[] = [
  { path: "learners-students", label: "Learners & Students" },
  { path: "for-teachers", label: "Teachers & Trainers" },
  { path: "for-institutions", label: "Institutions & Schools" },
  { path: "partners-funders", label: "Programme Partners & Funders" },
];

const MOODLE_LINKS: FooterLink[] = [
  { path: "open-learning-space", label: "Open Learning Space" },
  { path: "trainer-workspace", label: "Trainer Workspace" },
  { path: "offline-sync-toolkit", label: "Offline Sync Toolkit" },
];

const TRUST: FooterLink[] = [
  { path: "ai-transparency", label: "AI Transparency & Safeguarding" },
  { path: "kenyan-data-protection", label: "Kenyan Data Protection" },
  { path: "accessibility", label: "Accessibility (WCAG 2.1 AA)" },
];

const LEGAL: FooterLink[] = [
  { path: "privacy-policy", label: "Privacy Policy" },
  { path: "terms-of-service", label: "Terms of Service" },
  { path: "cookie-policy", label: "Cookie Policy" },
];

function FooterLinkItem({ link }: { link: FooterLink }) {
  return (
    <li>
      <Link className="hover:text-on-primary transition-colors" data-path={link.path} href={ROUTES[link.path]}>
        {link.label}
      </Link>
    </li>
  );
}

export function SiteFooter() {
  return (
    <footer className="w-full bg-primary text-on-primary pt-space-xl pb-space-lg shadow-[0_-4px_24px_rgba(0,77,97,0.12)]">
      <div className="max-w-7xl mx-auto px-margin">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-space-xl pb-space-xl">
          <div className="lg:col-span-1 space-y-space-md">
            <div className="flex items-center gap-space-xs">
              <span className="font-headline-md text-headline-md text-on-primary font-bold">Stadilearn</span>
              <div className="w-2 h-2 rounded-full bg-secondary-container"></div>
            </div>
            <p className="font-body-sm text-body-sm text-on-tertiary-container">
              Practical digital and AI learning for Kenya. Shaped by Kenyan classrooms and everyday learning
              experiences.
            </p>
            <div className="flex items-center gap-space-xs pt-space-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              <span className="font-label-sm text-label-sm text-on-primary-container">
                Moodle: Online | AI Assistant: Active
              </span>
            </div>
          </div>
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-primary mb-space-md">Quick Links</h3>
            <ul className="space-y-space-xs font-body-sm text-body-sm text-on-tertiary-container">
              {QUICK_LINKS.map((l) => (
                <FooterLinkItem key={l.label} link={l} />
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-primary mb-space-md">Key Audiences</h3>
            <ul className="space-y-space-xs font-body-sm text-body-sm text-on-tertiary-container">
              {AUDIENCES.map((l) => (
                <FooterLinkItem key={l.label} link={l} />
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-primary mb-space-md">Moodle Space</h3>
            <ul className="space-y-space-xs font-body-sm text-body-sm text-on-tertiary-container">
              <li>
                <a
                  className="text-primary-fixed hover:text-on-primary transition-colors inline-flex items-center gap-space-xs"
                  href={MOODLE_URL}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  elearning.stadilearn.co.ke
                  <span className="material-symbols-outlined text-[14px]">launch</span>
                </a>
              </li>
              {MOODLE_LINKS.map((l) => (
                <FooterLinkItem key={l.label} link={l} />
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-primary mb-space-md">Contact &amp; Trust</h3>
            <div className="space-y-space-xs font-body-sm text-body-sm text-on-tertiary-container">
              <p className="text-on-primary font-label-md text-label-md">{CONTACT.location}</p>
              <p>{CONTACT.email}</p>
              <p>{CONTACT.phone}</p>
            </div>
            <ul className="mt-space-md space-y-space-xs font-label-sm text-label-sm text-on-tertiary-container">
              {TRUST.map((l) => (
                <FooterLinkItem key={l.label} link={l} />
              ))}
            </ul>
          </div>
        </div>
        <div className="pt-space-lg flex flex-col md:flex-row items-center justify-between gap-space-md text-label-sm font-label-sm text-on-tertiary-container">
          <p>© 2025 Stadilearn Kenya. All rights reserved. Practical digital &amp; AI literacy platform.</p>
          <div className="flex flex-wrap items-center gap-space-md">
            {LEGAL.map((l) => (
              <Link className="hover:text-on-primary transition-colors" data-path={l.path} href={ROUTES[l.path]} key={l.path}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
