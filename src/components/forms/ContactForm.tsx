"use client";

import { useState } from "react";
import { KENYA_COUNTIES } from "@/lib/counties";
import { Field, FormAlert, inputClass, submitClass } from "./fields";

const TYPES = [
  ["learning", "Learning"],
  ["teacher-training", "Teacher training"],
  ["institution", "Institution partnership"],
  ["support", "Technical support"],
  ["certificate", "Certificate"],
  ["media", "Media"],
  ["other", "Other"],
] as const;

export function ContactForm({ initialType = "", initialMessage = "" }: { initialType?: string; initialMessage?: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setStatus("sending");
    setErrors({});
    setFailure("");
    try {
      const res = await fetch("/api/v1/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...Object.fromEntries(form), consent: form.get("consent") === "on" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors(data.errors ?? {});
        setStatus("idle");
        return;
      }
      setStatus("sent");
    } catch {
      setFailure("We could not send your message. Check your connection and try again.");
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return (
      <FormAlert tone="success">
        Thank you. Your message has been received. We will respond using the email address you provided.
      </FormAlert>
    );
  }

  const err = (k: string) => errors[k] && <span className="mt-1 block font-body-sm text-body-sm text-error">{errors[k]}</span>;

  return (
    <form className="space-y-space-md" noValidate onSubmit={onSubmit}>
      {failure && <FormAlert tone="error">{failure}</FormAlert>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
        <Field label="Name">
          <input autoComplete="name" className={inputClass} name="name" required />
          {err("name")}
        </Field>
        <Field label="Email">
          <input autoComplete="email" className={inputClass} name="email" required type="email" />
          {err("email")}
        </Field>
        <Field label="Organisation" optional>
          <input autoComplete="organization" className={inputClass} name="organization" />
        </Field>
        <Field label="County" optional>
          <select className={inputClass} defaultValue="" name="county">
            <option value="">Select county</option>
            {KENYA_COUNTIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Enquiry type">
        <select className={inputClass} defaultValue={initialType} name="type" required>
          <option disabled value="">
            Choose one
          </option>
          {TYPES.map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
        {err("type")}
      </Field>
      <Field label="Message">
        <textarea className={`${inputClass} min-h-40`} defaultValue={initialMessage} name="message" required />
        {err("message")}
      </Field>
      <label className="flex items-start gap-space-sm font-body-sm text-body-sm text-on-surface">
        <input className="mt-1 h-4 w-4 accent-primary-container" name="consent" type="checkbox" />
        <span>I agree that Stadilearn may use these details to respond to my enquiry, as described in the privacy notice.</span>
      </label>
      {err("consent")}
      <button className={submitClass} disabled={status === "sending"} type="submit">
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
