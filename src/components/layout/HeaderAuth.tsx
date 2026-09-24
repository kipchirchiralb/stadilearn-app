"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { HeaderUser } from "@/lib/header";

const avatarClass =
  "w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary hover:bg-primary-container transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-container";

export function HeaderAuth({ user }: { user: HeaderUser | null }) {
  const pathname = usePathname() ?? "/";

  async function signOut() {
    await fetch("/api/v1/auth/logout", { method: "POST" });
    window.location.assign("/");
  }

  const initial = user?.fullName.trim().charAt(0).toUpperCase() || "";
  const onProfile = pathname === "/app/profile" || pathname.startsWith("/app/profile/");

  return (
    <div className="flex items-center gap-space-xs">
      {user ? (
        <button
          className="hidden lg:inline-flex text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors px-space-xs py-space-xs"
          onClick={signOut}
          type="button"
        >
          Sign out
        </button>
      ) : (
        <Link
          className="hidden lg:inline-flex text-label-md font-label-md text-on-surface-variant hover:text-primary transition-colors px-space-xs py-space-xs"
          data-path="sign-in"
          href="/login"
        >
          Sign in
        </Link>
      )}

      {user ? (
        <Link
          aria-current={onProfile ? "page" : undefined}
          aria-label={`${user.fullName} — your profile`}
          className={`${avatarClass} ${onProfile ? "ring-2 ring-primary-container ring-offset-2 ring-offset-surface" : ""}`}
          href="/app/profile"
          title="Your profile"
        >
          <span className="font-label-md text-label-md leading-none">{initial}</span>
        </Link>
      ) : (
        <Link aria-label="Sign in" className={avatarClass} href="/login" title="Sign in">
          <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
        </Link>
      )}
    </div>
  );
}
