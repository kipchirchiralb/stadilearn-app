"use client";

import Link from "next/link";
import { useState } from "react";
import { Field, FormAlert, inputClass, submitClass } from "@/components/forms/fields";
import { KENYA_COUNTIES } from "@/lib/counties";
import type { SignupRole } from "@/lib/validation";
import { OtpStep, requestOtp } from "./OtpStep";

const ROLE_OPTIONS: { value: SignupRole; icon: string; title: string; body: string }[] = [
  { value: "learner", icon: "person", title: "Learner", body: "Use the AI assistant, track progress and get certificates." },
  { value: "trainer", icon: "cast_for_education", title: "Teacher / trainer", body: "Create learning content with AI, see cohorts and certificates." },
  { value: "institution", icon: "domain", title: "Institution / organisation", body: "See Moodle cohort summaries, learner reports and certification." },
];

export function SignupForm({ initialRole }: { initialRole?: string }) {
  const [role, setRole] = useState<SignupRole>(
    ROLE_OPTIONS.some((r) => r.value === initialRole) ? (initialRole as SignupRole) : "learner",
  );
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"details" | "otp">("details");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    setErrors({});
    setFailure("");
    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...Object.fromEntries(form),
          role,
          acceptTerms: form.get("acceptTerms") === "on",
          ageConfirmed: form.get("ageConfirmed") === "on",
          demographicsConsent: form.get("demographicsConsent") === "on",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.errors ?? {});
        return;
      }
      setStep("otp");
    } catch {
      setFailure("We could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (step === "otp") {
    return <OtpStep email={email} onBack={() => setStep("details")} onResend={() => requestOtp(email, "signup")} />;
  }

  const err = (k: string) => errors[k] && <span className="mt-1 block font-body-sm text-body-sm text-error">{errors[k]}</span>;

  return (
    <form className="space-y-space-md" noValidate onSubmit={onSubmit}>
      <div>
        <h1 className="font-headline-lg text-headline-lg-mobile sm:text-headline-lg text-on-surface">Create your account</h1>
        <p className="mt-space-xs font-body-md text-body-md text-on-surface-variant">
          Free to join. We will confirm your email with a one-time code.
        </p>
      </div>
      {failure && <FormAlert tone="error">{failure}</FormAlert>}

      <fieldset>
        <legend className="font-label-md text-label-md text-on-surface mb-space-xs">I am joining as</legend>
        <div className="space-y-space-xs">
          {ROLE_OPTIONS.map((r) => (
            <label
              className={`flex items-start gap-space-sm rounded-xl p-space-sm cursor-pointer ring-1 transition-colors ${
                role === r.value ? "ring-2 ring-primary-container bg-primary-container/5" : "ring-outline-variant hover:bg-surface-container-low"
              }`}
              key={r.value}
            >
              <input checked={role === r.value} className="sr-only" name="roleOption" onChange={() => setRole(r.value)} type="radio" value={r.value} />
              <span aria-hidden="true" className="material-symbols-outlined text-primary text-[24px]">{r.icon}</span>
              <span>
                <span className="block font-label-lg text-label-lg text-on-surface">{r.title}</span>
                <span className="block font-body-sm text-body-sm text-on-surface-variant">{r.body}</span>
              </span>
            </label>
          ))}
        </div>
        {err("role")}
      </fieldset>

      <Field label="Full name">
        <input autoComplete="name" className={inputClass} name="fullName" required />
        {err("fullName")}
      </Field>
      <Field label={role === "institution" ? "Work email address" : "Email address"}>
        <input autoComplete="email" className={inputClass} name="email" onChange={(e) => setEmail(e.target.value)} required type="email" value={email} />
        {err("email")}
      </Field>

      {role !== "learner" && (
        <Field
          hint={role === "institution" ? "We verify institution accounts before showing any learner data." : undefined}
          label={role === "institution" ? "Institution or organisation" : "School or organisation"}
          optional={role === "trainer"}
        >
          <input autoComplete="organization" className={inputClass} name="organization" required={role === "institution"} />
          {err("organization")}
        </Field>
      )}
      {role === "institution" && (
        <Field label="Your role" optional>
          <input className={inputClass} name="jobTitle" placeholder="e.g. Programme coordinator" />
        </Field>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
        <Field label="County" optional>
          <select className={inputClass} defaultValue="" name="county">
            <option value="">Select county</option>
            {KENYA_COUNTIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field label="Preferred language">
          <select className={inputClass} defaultValue="en" name="language">
            <option value="en">English</option>
            <option value="sw">Kiswahili</option>
          </select>
        </Field>
      </div>

      <div className="space-y-space-sm font-body-sm text-body-sm text-on-surface">
        <label className="flex items-start gap-space-sm">
          <input className="mt-1 h-4 w-4 accent-primary-container" name="acceptTerms" type="checkbox" />
          <span>
            I accept the{" "}
            <Link className="text-primary underline" href="/terms" target="_blank">
              Terms of Service
            </Link>{" "}
            and have read the{" "}
            <Link className="text-primary underline" href="/privacy" target="_blank">
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {err("acceptTerms")}
        <label className="flex items-start gap-space-sm">
          <input className="mt-1 h-4 w-4 accent-primary-container" name="ageConfirmed" type="checkbox" />
          <span>I am 18 or older, or my parent or guardian has consented to my use of Stadilearn.</span>
        </label>
        {err("ageConfirmed")}
        <label className="flex items-start gap-space-sm">
          <input className="mt-1 h-4 w-4 accent-primary-container" name="demographicsConsent" type="checkbox" />
          <span className="text-on-surface-variant">
            Optional: use my county and profile details in anonymised programme reports.
          </span>
        </label>
      </div>

      <button className={`${submitClass} sm:w-full`} disabled={loading} type="submit">
        {loading ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center font-label-md text-label-md text-on-surface-variant">
        Already have an account?{" "}
        <Link className="text-primary font-bold" href="/login">
          Sign in
        </Link>
      </p>
    </form>
  );
}
