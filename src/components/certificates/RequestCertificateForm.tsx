"use client";

import { useActionState } from "react";
import { FormAlert, submitClass } from "@/components/forms/fields";
import { requestCertificateAction } from "@/lib/certificates/actions";
import type { RequestableCourse } from "@/lib/certificates";

const selectClass =
  "mt-1 w-full rounded-lg bg-surface-container-lowest px-space-sm py-space-sm font-body-md text-body-md text-on-surface ring-1 ring-outline-variant focus:outline-none focus:ring-2 focus:ring-primary-container";

export function RequestCertificateForm({ courses }: { courses: RequestableCourse[] }) {
  const [state, formAction, pending] = useActionState(requestCertificateAction, null);
  const available = courses.filter((c) => c.state === "available");

  if (!available.length) {
    return (
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        There is no enrolled course left to request. Issued and pending courses are listed above.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-space-sm">
      <label className="block">
        <span className="font-label-md text-label-md text-on-surface">Course</span>
        <select className={selectClass} defaultValue={available[0].courseId} name="courseId" required>
          {available.map((course) => (
            <option key={course.courseId} value={course.courseId}>
              {course.title}
              {course.completedOn ? " (Moodle completed)" : ""}
            </option>
          ))}
        </select>
      </label>
      <button className={submitClass} disabled={pending} type="submit">
        {pending ? "Sending request…" : "Request certificate"}
      </button>
      {state?.error ? <FormAlert tone="error">{state.error}</FormAlert> : null}
      {state?.ok ? <FormAlert tone="success">Your request is with Stadilearn for review.</FormAlert> : null}
    </form>
  );
}
