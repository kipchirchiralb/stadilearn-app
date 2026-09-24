"use client";

import { useActionState } from "react";
import { approveInstitutionAction, grantInstitutionAdminAction } from "@/lib/institutions/actions";

const buttonClass =
  "inline-flex items-center justify-center bg-primary-container text-on-primary font-label-md text-label-md px-space-md py-space-xs rounded-lg hover:bg-primary transition-all disabled:opacity-60 disabled:cursor-not-allowed";

export function InstitutionApprovalForm({
  action,
  institutionId,
  userId,
  label,
}: {
  action: "approve" | "grant_admin";
  institutionId: number;
  userId: number | null;
  label: string;
}) {
  const actionFn = action === "approve" ? approveInstitutionAction : grantInstitutionAdminAction;
  const [state, formAction, pending] = useActionState(actionFn, null);

  return (
    <form action={formAction} className="flex flex-col items-start gap-1">
      <input name="institutionId" type="hidden" value={institutionId} />
      {userId ? <input name="userId" type="hidden" value={userId} /> : null}
      <button className={buttonClass} disabled={pending} type="submit">
        {pending ? "Saving…" : label}
      </button>
      {state?.error ? <p className="font-body-sm text-body-sm text-error">{state.error}</p> : null}
    </form>
  );
}
