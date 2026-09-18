"use client";

import Link from "next/link";
import { useState } from "react";
import type { CertificateResult } from "@/lib/certificates";
import { Field, FormAlert, inputClass, submitClass } from "./fields";

export function VerifyCertificateForm({ initialCode = "" }: { initialCode?: string }) {
  const [code, setCode] = useState(initialCode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<CertificateResult | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/v1/certificates/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Something went wrong. Please try again.");
      else setResult(data);
    } catch {
      setError("We could not reach the verification service. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-space-md">
      <form className="space-y-space-md" onSubmit={onSubmit}>
        <Field hint="Codes are not case-sensitive." label="Verification code">
          <input
            autoComplete="off"
            className={`${inputClass} font-mono uppercase tracking-wider`}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. SL-XXXX-XXXX"
            required
            value={code}
          />
        </Field>
        <button className={submitClass} disabled={loading} type="submit">
          {loading ? "Checking…" : "Verify certificate"}
        </button>
      </form>

      {error && <FormAlert tone="error">{error}</FormAlert>}

      {result?.status === "valid" && (
        <div className="rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm ring-2 ring-primary-container" role="status">
          <div className="flex items-center gap-space-xs text-primary-container mb-space-md">
            <span aria-hidden="true" className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: '"FILL" 1' }}>
              verified
            </span>
            <span className="font-headline-sm text-headline-sm">Valid certificate</span>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
            {[
              ["Learner", result.displayName],
              ["Course", result.course],
              ["Completion date", new Date(result.completedOn).toLocaleDateString("en-KE", { dateStyle: "long" })],
              ["Issuing programme", result.programme],
              ["Verification code", result.code],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="font-label-sm text-label-sm text-on-surface-variant">{k}</dt>
                <dd className="font-body-md text-body-md text-on-surface">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {result?.status === "revoked" && (
        <FormAlert tone="error">
          <strong>This certificate has been revoked.</strong> If you believe this is a mistake,{" "}
          <Link className="underline font-semibold" href="/contact?type=certificate">
            contact support
          </Link>
          .
        </FormAlert>
      )}

      {result?.status === "not_found" && (
        <FormAlert tone="info">
          <strong>We could not verify this code.</strong> Check it matches the certificate exactly. If it still fails,{" "}
          <Link className="underline font-semibold" href="/contact?type=certificate">
            contact support
          </Link>
          .
        </FormAlert>
      )}
    </div>
  );
}
