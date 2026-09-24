import type { CohortInsight, CourseProgressStatus } from "@/lib/dashboard";
import { Card } from "@/components/ui";

function pct(part: number, whole: number) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}

function statusLabel(status: string) {
  return status.replace(/_/g, " ");
}

const COURSE_STATUS: Record<CourseProgressStatus, string> = {
  not_linked: "Not linked",
  not_enrolled: "Not enrolled",
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
};

export function CohortRoster({ cohort }: { cohort: CohortInsight }) {
  const enrolled = cohort.courses.reduce((s, c) => s + c.enrolled, 0);
  const completed = cohort.courses.reduce((s, c) => s + c.completed, 0);
  const completion = pct(completed, enrolled);

  return (
    <Card>
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-space-sm mb-space-md">
        <div>
          <p className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">
            {cohort.institution}
            {cohort.programme ? ` · ${cohort.programme}` : ""}
          </p>
          <h3 className="font-headline-sm text-headline-sm text-on-surface">{cohort.name}</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 capitalize">
            {statusLabel(cohort.status)}
            {cohort.startsOn || cohort.endsOn
              ? ` · ${cohort.startsOn ?? "No start"} – ${cohort.endsOn ?? "No end"}`
              : ""}
          </p>
          {cohort.trainers.length > 0 && (
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Trainers: {cohort.trainers.map((t) => t.fullName).join(", ")}
            </p>
          )}
        </div>
        {enrolled > 0 && (
          <div className="md:w-48 shrink-0">
            <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">{completion}% completed</p>
            <div className="h-2 rounded-full bg-surface-container-high">
              <div className="h-2 rounded-full bg-primary-container" style={{ width: `${completion}%` }} />
            </div>
          </div>
        )}
      </div>

      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-space-sm mb-space-md">
        <div>
          <dt className="font-label-sm text-label-sm text-on-surface-variant">Learners</dt>
          <dd className="font-headline-sm text-on-surface">{cohort.learners}</dd>
        </div>
        <div>
          <dt className="font-label-sm text-label-sm text-on-surface-variant">In Moodle</dt>
          <dd className="font-headline-sm text-on-surface">{cohort.learnersInMoodle}</dd>
        </div>
        <div>
          <dt className="font-label-sm text-label-sm text-on-surface-variant">Not started</dt>
          <dd className="font-headline-sm text-on-surface">{cohort.courses.reduce((s, c) => s + c.notStarted, 0)}</dd>
        </div>
        <div>
          <dt className="font-label-sm text-label-sm text-on-surface-variant">Certificates</dt>
          <dd className="font-headline-sm text-on-surface">{cohort.certificates}</dd>
        </div>
      </dl>

      {cohort.unnamedMoodleMembers > 0 && (
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
          {cohort.unnamedMoodleMembers} Moodle cohort member{cohort.unnamedMoodleMembers === 1 ? "" : "s"} have no
          Stadilearn account, so they are counted in Moodle totals but not named here.
        </p>
      )}

      {cohort.roster.length === 0 ? (
        <p className="font-body-sm text-body-sm text-on-surface-variant">No learners are on this cohort yet.</p>
      ) : (
        <div className="overflow-x-auto min-w-0 -mx-space-lg px-space-lg">
          <table className="w-full min-w-[32rem] border-collapse text-body-sm">
            <thead>
              <tr className="text-left font-label-sm text-label-sm text-on-surface-variant">
                <th className="pb-space-xs pr-space-sm font-label-sm">Learner</th>
                {cohort.courses.map((course) => (
                  <th className="pb-space-xs pr-space-sm font-label-sm" key={course.courseId}>
                    <a className="text-primary hover:underline" href={course.url} rel="noopener noreferrer" target="_blank">
                      {course.title}
                    </a>
                  </th>
                ))}
                {cohort.courses.length === 0 && <th className="pb-space-xs pr-space-sm font-label-sm">Moodle course</th>}
                <th className="pb-space-xs font-label-sm">Certificates</th>
              </tr>
            </thead>
            <tbody>
              {cohort.roster.map((learner) => (
                <tr className="border-t border-outline-variant/40" key={learner.userId}>
                  <td className="py-space-xs pr-space-sm text-on-surface">
                    {learner.fullName}
                    {!learner.moodleLinked && (
                      <span className="block font-body-sm text-on-surface-variant">Moodle not linked</span>
                    )}
                  </td>
                  {learner.courses.map((course) => (
                    <td className="py-space-xs pr-space-sm capitalize text-on-surface-variant" key={course.courseId}>
                      {COURSE_STATUS[course.status]}
                    </td>
                  ))}
                  {cohort.courses.length === 0 && (
                    <td className="py-space-xs pr-space-sm text-on-surface-variant">No Moodle course linked</td>
                  )}
                  <td className="py-space-xs">{learner.certificates}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {cohort.rosterTruncated && (
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-sm">
          Showing the first {cohort.roster.length} learners. Ask Stadilearn if you need a full export.
        </p>
      )}
    </Card>
  );
}
