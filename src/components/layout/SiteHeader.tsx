"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MOODLE_URL, ROUTES } from "@/lib/site";

const ACTIVE =
  "px-space-sm py-space-xs transition-colors bg-primary-container text-on-primary-container font-semibold rounded-lg shadow-sm";
const INACTIVE =
  "px-space-sm py-space-xs text-label-md font-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors rounded-lg";
const MENU_ITEM =
  "block rounded-lg px-space-sm py-space-xs text-label-md font-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors";
const MENU_ITEM_ACTIVE =
  "block rounded-lg px-space-sm py-space-xs text-label-md font-label-md bg-surface-container text-on-surface transition-colors";

const HUB = [
  { path: "how-it-works", label: "How It Works" },
  { path: "for-teachers", label: "For Teachers" },
  { path: "for-institutions", label: "For Institutions" },
  { path: "verify-certificate", label: "Verify Certificate" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteHeader() {
  const pathname = usePathname() ?? "/";

  const topLink = (path: "home" | "courses" | "ai-support" | "about", label: string) => {
    const href = ROUTES[path];
    const active = isActive(pathname, href);
    return (
      <Link
        aria-current={active ? "page" : undefined}
        className={active ? ACTIVE : INACTIVE}
        data-path={path}
        href={href}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,102,128,0.06)]">
      <div className="h-24 max-w-7xl mx-auto px-margin flex items-center justify-between gap-gutter">
        <div className="flex items-center gap-space-md">
          <Link className="flex items-center gap-space-sm focus:outline-none" data-path="home" href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="stadilearnlogo.png" className="h-10 w-auto object-contain" src="/stadilearnlogo.png" />
          </Link>
          <div className="hidden xl:flex items-center bg-surface-container-high rounded-full px-space-xs py-space-xs text-label-sm font-label-sm">
            <span>EN</span>
            <span className="px-space-xs py-space-xs text-on-surface-variant hover:text-on-surface cursor-pointer">
              Kiswahili
            </span>
          </div>
        </div>
        <nav
          className="hidden lg:flex items-center gap-space-xs"
          data-active-classes="bg-primary-container text-on-primary-container font-semibold rounded-lg shadow-sm"
        >
          {topLink("home", "Home")}
          {topLink("courses", "Learn")}
          <div className="relative group">
            <button aria-expanded="false" className={`inline-flex items-center gap-1 ${INACTIVE}`} type="button">
              The Learning Hub
              <span className="material-symbols-outlined text-[16px]">expand_more</span>
            </button>
            <div className="invisible absolute left-0 top-full z-50 w-56 pt-space-xs opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="rounded-xl bg-surface-container-lowest p-space-xs shadow-lg ring-1 ring-outline-variant/40">
                {HUB.map((item) => {
                  const href = ROUTES[item.path];
                  const active = isActive(pathname, href);
                  return (
                    <Link
                      aria-current={active ? "page" : undefined}
                      className={active ? MENU_ITEM_ACTIVE : MENU_ITEM}
                      data-path={item.path}
                      href={href}
                      key={item.path}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
          {topLink("ai-support", "AI Support")}
          {topLink("about", "About")}
        </nav>
        <div className="flex items-center gap-space-sm">
          <Link
            className="hidden md:inline-flex text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors px-space-xs py-space-xs"
            data-path="sign-in"
            href={ROUTES["sign-in"]}
          >
            Sign in
          </Link>
          <a
            className="hidden sm:inline-flex items-center gap-space-xs text-label-sm font-label-sm text-primary hover:text-primary-container px-space-xs py-space-xs"
            href={MOODLE_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            Open Moodle<span className="material-symbols-outlined text-[16px]">open_in_new</span>
          </a>
          <Link
            className="inline-flex items-center justify-center bg-secondary-container text-on-secondary font-label-md text-label-md px-space-md py-space-sm rounded-lg hover:bg-secondary transition-all shadow-[0_2px_8px_rgba(253,102,4,0.25)] hover:shadow-none"
            data-path="explore-courses"
            href={ROUTES["explore-courses"]}
          >
            Explore Courses
          </Link>
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
        </div>
      </div>
    </header>
  );
}
