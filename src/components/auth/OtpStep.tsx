"use client";

import { useEffect, useState } from "react";
import { FormAlert, inputClass, submitClass } from "@/components/forms/fields";

const RESEND_SECONDS = 60;

export function OtpStep({
  email,
  purpose,
  next,
  onBack,
  onResend,
}: {
  email: string;
  purpose: "login" | "signup" | "recovery";
  next?: string;
  onBack: () => void;
  onResend: () => Promise<void>;
}) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_SECONDS);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, purpose, next }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "That code did not work. Try again.");
      else window.location.assign(data.redirectTo ?? "/app/dashboard");
    } catch {
      setError("We could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setResent(false);
    await onResend();
    setResent(true);
    setCooldown(RESEND_SECONDS);
  }

  return (
    <form className="space-y-space-md" onSubmit={verify}>
      <div>
        <h1 className="font-headline-lg text-headline-lg-mobile text-on-surface">Check your email</h1>
        <p className="mt-space-xs font-body-md text-body-md text-on-surface-variant">
          If <strong className="text-on-surface">{email}</strong> can be used, we have sent a 6-digit code to it. The code expires in 10 minutes.
        </p>
      </div>
      {error && <FormAlert tone="error">{error}</FormAlert>}
      {resent && <FormAlert tone="success">A new code is on its way.</FormAlert>}
      <label className="block">
        <span className="font-label-md text-label-md text-on-surface">One-time code</span>
        <input
          autoComplete="one-time-code"
          autoFocus
          className={`${inputClass} text-center font-mono text-headline-md tracking-[0.5em]`}
          inputMode="numeric"
          maxLength={6}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          pattern="\d{6}"
          required
          value={code}
        />
      </label>
      <button className={`${submitClass} sm:w-full`} disabled={loading || code.length !== 6} type="submit">
        {loading ? "Verifying…" : "Verify and continue"}
      </button>
      <div className="flex items-center justify-between font-label-md text-label-md">
        <button className="text-on-surface-variant hover:text-primary" onClick={onBack} type="button">
          Use a different email
        </button>
        <button className="text-primary disabled:text-on-surface-variant disabled:cursor-not-allowed" disabled={cooldown > 0} onClick={resend} type="button">
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
        </button>
      </div>
    </form>
  );
}

export async function requestOtp(email: string, purpose: "login" | "signup" | "recovery") {
  const res = await fetch("/api/v1/auth/otp/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, purpose }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
}
