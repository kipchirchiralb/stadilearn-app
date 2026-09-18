/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full flex-1 grid grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col px-margin-mobile sm:px-margin py-space-lg">
        <div className="flex items-center justify-between">
          <Link href="/">
            <img alt="Stadilearn" className="h-10 w-auto object-contain" src="/stadilearnlogo.png" />
          </Link>
          <Link className="inline-flex items-center gap-1 font-label-md text-label-md text-on-surface-variant hover:text-primary" href="/">
            <span aria-hidden="true" className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to site
          </Link>
        </div>
        <main className="flex-1 flex items-center justify-center py-space-xl">
          <div className="w-full max-w-md">{children}</div>
        </main>
        <nav className="flex flex-wrap gap-space-md font-label-sm text-label-sm text-on-surface-variant">
          <Link className="hover:text-primary" href="/privacy">Privacy</Link>
          <Link className="hover:text-primary" href="/terms">Terms</Link>
          <Link className="hover:text-primary" href="/help">Help</Link>
          <Link className="hover:text-primary" href="/contact">Contact</Link>
        </nav>
      </div>
      <aside className="hidden lg:flex relative overflow-hidden bg-primary text-on-primary p-space-xl flex-col justify-between">
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-primary-container/40 blur-3xl pointer-events-none"></div>
        <div className="absolute -left-24 -bottom-24 w-96 h-96 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex items-center gap-space-xs">
          <span className="font-headline-md text-headline-md font-bold">Stadilearn</span>
          <div className="w-2 h-2 rounded-full bg-secondary-container"></div>
        </div>
        <div className="relative z-10 max-w-lg space-y-space-lg">
          <h2 className="font-display-hero text-headline-lg">One account for everything around your learning.</h2>
          <ul className="space-y-space-md">
            {[
              ["psychology", "Learners", "AI learning assistant, progress summaries and certificates."],
              ["cast_for_education", "Teachers & trainers", "AI drafting tools, cohort statistics and certificates."],
              ["domain", "Institutions & organisations", "Summaries of your Moodle cohorts, learner reports and certification."],
            ].map(([icon, title, body]) => (
              <li className="flex items-start gap-space-sm" key={title}>
                <div className="w-10 h-10 rounded-xl bg-primary-container text-secondary-container flex items-center justify-center shrink-0">
                  <span aria-hidden="true" className="material-symbols-outlined text-[22px]">{icon}</span>
                </div>
                <div>
                  <p className="font-label-lg text-label-lg">{title}</p>
                  <p className="font-body-sm text-body-sm text-on-tertiary-container">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="relative z-10 font-body-sm text-body-sm text-on-tertiary-container">
          Courses are studied in Moodle at elearning.stadilearn.co.ke, which has its own separate login.
        </p>
      </aside>
    </div>
  );
}
