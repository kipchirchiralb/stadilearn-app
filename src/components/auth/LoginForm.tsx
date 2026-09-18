"use client";

import Link from "next/link";
import { useState } from "react";
import { Field, FormAlert, inputClass, submitClass } from "@/components/forms/fields";
import { MOODLE_HOST } from "@/lib/site";
import { OtpStep, requestOtp } from "./OtpStep";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await requestOtp(email, "login");
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "otp") {
    return <OtpStep email={email} onBack={() => setStep("email")} onResend={() => requestOtp(email, "login")} />;
  }

  return (
    <form className="space-y-space-md" onSubmit={onSubmit}>
      <div>
        <h1 className="font-headline-lg text-headline-lg-mobile sm:text-headline-lg text-on-surface">Sign in</h1>
        <p className="mt-space-xs font-body-md text-body-md text-on-surface-variant">
          Enter your email and we will send you a one-time code. No password needed.
        </p>
      </div>
      {error && <FormAlert tone="error">{error}</FormAlert>}
      <Field label="Email address">
        <input autoComplete="email" autoFocus className={inputClass} onChange={(e) => setEmail(e.target.value)} required type="email" value={email} />
      </Field>
      <button className={`${submitClass} sm:w-full`} disabled={loading} type="submit">
        {loading ? "Sending code…" : "Send sign-in code"}
      </button>
      <div className="flex flex-wrap items-center justify-between gap-space-xs font-label-md text-label-md">
        <Link className="text-on-surface-variant hover:text-primary" href="/account-recovery">
          Can&apos;t access your email?
        </Link>
        <span className="text-on-surface-variant">
          New here?{" "}
          <Link className="text-primary font-bold" href="/signup">
            Create account
          </Link>
        </span>
      </div>
      <FormAlert tone="info">
        This signs you in to Stadilearn only. To study, sign in to Moodle separately at {MOODLE_HOST}.
      </FormAlert>
    </form>
  );
}
