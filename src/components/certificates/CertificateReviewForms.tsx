"use client";

import { useActionState } from "react";
import { declineCertificateAction, issueCertificateAction } from "@/lib/certificates/actions";

const primary =
  "inline-flex items-center justify-center bg-primary-container text-on-primary font-label-md text-label-md px-space-md py-space-xs rounded-lg hover:bg-primary transition-all disabled:opacity-60 disabled:cursor-not-allowed";
const secondary =
  "inline-flex items-center justify-center bg-surface-container-lowest text-on-surface font-label-md text-label-md px-space-md py-space-xs rounded-lg ring-1 ring-outline-variant hover:bg-surface-container transition-all disabled:opacity-60 disabled:cursor-not-allowed";
const inputClass =
  "mt-1 w-full rounded-lg bg-surface-container-lowest px-space-sm py-space-xs font-body-sm text-body-sm text-on-surface ring-1 ring-outline-variant placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-primary-container";

export function IssueCertificateForm({ requestId, warn }: { requestId: number; warn?: boolean }) {
  const [state, formAction, pending] = useActionState(issueCertificateAction, null);
  return (
    <form action={formAction} className="flex flex-col items-start gap-1">
      <input name="requestId" type="hidden" value={requestId} />
      <button className={primary} disabled={pending} type="submit">
        {pending ? "Issuing…" : warn ? "Issue anyway" : "Issue certificate"}
      </button>
      {state?.error ? <p className="font-body-sm text-body-sm text-error">{state.error}</p> : null}
    </form>
  );
}

export function DeclineCertificateForm({ requestId }: { requestId: number }) {
  const [state, formAction, pending] = useActionState(declineCertificateAction, null);
  return (
    <form action={formAction} className="flex flex-col items-stretch gap-1 min-w-[12rem]">
      <input name="requestId" type="hidden" value={requestId} />
      <input className={inputClass} maxLength={255} name="reason" placeholder="Reason (optional)" />
      <button className={secondary} disabled={pending} type="submit">
        {pending ? "Saving…" : "Decline"}
      </button>
      {state?.error ? <p className="font-body-sm text-body-sm text-error">{state.error}</p> : null}
    </form>
  );
}
