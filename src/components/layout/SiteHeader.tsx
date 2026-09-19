"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { HeaderAuth } from "@/components/layout/HeaderAuth";
import { MOODLE_URL, ROUTES } from "@/lib/site";

const ACTIVE =
  "px-space-sm py-space-xs transition-colors bg-primary-container text-on-primary-container font-semibold rounded-lg shadow-sm";
const INACTIVE =
  "px-space-sm py-space-xs text-label-md font-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors rounded-lg";
const MENU_ITEM =
  "block rounded-lg px-space-sm py-space-xs font-label-md text-label-md text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors";
const MENU_ITEM_ACTIVE =
  "block rounded-lg px-space-sm py-space-xs font-label-md text-label-md bg-surface-container text-on-surface transition-colors";

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

export function SiteHeader({ user }: { user: { fullName: string } | null }) {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const topLink = (path: "courses" | "ai-support" | "about", label: string) => {
    const href = ROUTES[path];
    const active = isActive(pathname, href);
    return (
      <Link aria-current={active ? "page" : undefined} className={active ? ACTIVE : INACTIVE} data-path={path} href={href}>
        {label}
      </Link>
    );
  };

  const sheetLink = (href: string, label: string, opts?: { path?: string; external?: boolean }) => {
    const active = !opts?.external && isActive(pathname, href);
    const className = active ? MENU_ITEM_ACTIVE : MENU_ITEM;
    if (opts?.external) {
      return (
        <a className={className} href={href} rel="noopener noreferrer" target="_blank">
          {label}
          <span aria-hidden="true" className="material-symbols-outlined text-[16px] align-middle ml-1">
            open_in_new
          </span>
        </a>
      );
    }
    return (
      <Link aria-current={active ? "page" : undefined} className={className} data-path={opts?.path} href={href} onClick={() => setOpen(false)}>
        {label}
      </Link>
    );
  };

  async function signOut() {
    setOpen(false);
    await fetch("/api/v1/auth/logout", { method: "POST" });
    window.location.assign("/");
  }

  return (
    <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,102,128,0.06)]">
      <div className="h-24 max-w-7xl mx-auto px-margin flex items-center justify-between gap-gutter">
        <div className="flex items-center gap-space-md min-w-0">
          <Link className="flex items-center gap-space-sm focus:outline-none shrink-0" data-path="home" href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="stadilearnlogo.png" className="h-10 w-auto object-contain" src="/stadilearnlogo.png" />
          </Link>
        </div>
        <nav
          className="hidden lg:flex items-center gap-space-xs"
          data-active-classes="bg-primary-container text-on-primary-container font-semibold rounded-lg shadow-sm"
        >
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
        <div className="flex items-center gap-space-sm shrink-0">
          <HeaderAuth user={user} />
          <button
            aria-controls={menuId}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
            onClick={() => setOpen((v) => !v)}
            type="button"
          >
            <span aria-hidden="true" className="material-symbols-outlined text-[24px]">
              {open ? "close" : "menu"}
            </span>
          </button>
          <a
            className="hidden lg:inline-flex items-center gap-space-xs text-label-sm font-label-sm text-primary hover:text-primary-container px-space-xs py-space-xs"
            href={MOODLE_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            Open Moodle<span className="material-symbols-outlined text-[16px]">open_in_new</span>
          </a>
        </div>
      </div>

      {open && (
        <div className="lg:hidden">
          <button
            aria-label="Close menu"
            className="fixed inset-0 top-24 z-40 bg-on-surface/20"
            onClick={() => setOpen(false)}
            type="button"
          />
          <nav
            className="relative z-50 max-h-[calc(100dvh-6rem)] overflow-y-auto border-t border-outline-variant/40 bg-surface px-margin py-space-md shadow-lg"
            id={menuId}
          >
            <div className="flex flex-col gap-1 pb-space-md">
              {sheetLink(ROUTES.courses, "Learn", { path: "courses" })}
            </div>
            <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant px-space-sm mb-1">
              The Learning Hub
            </p>
            <div className="flex flex-col gap-1 pb-space-md">
              {HUB.map((item) => (
                <span key={item.path}>{sheetLink(ROUTES[item.path], item.label, { path: item.path })}</span>
              ))}
            </div>
            <div className="flex flex-col gap-1 pb-space-md">
              {sheetLink(ROUTES["ai-support"], "AI Support", { path: "ai-support" })}
              {sheetLink(ROUTES.about, "About", { path: "about" })}
            </div>
            <div className="flex flex-col gap-1 border-t border-outline-variant/40 pt-space-md">
              {sheetLink(MOODLE_URL, "Open Moodle", { external: true })}
              {user ? (
                <>
                  {sheetLink("/app/dashboard", "Dashboard")}
                  {sheetLink("/app/assistant", "Assistant")}
                  {sheetLink("/app/profile", "Your profile")}
                  <button className={`${MENU_ITEM} w-full text-left`} onClick={signOut} type="button">
                    Sign out
                  </button>
                </>
              ) : (
                sheetLink("/login", "Sign in", { path: "sign-in" })
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
