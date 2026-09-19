import {
  ButtonLink,
  Card,
  CheckList,
  Icon,
  MoodleHandoffNotice,
  Notice,
} from "@/components/ui";
import type { CohortInsight, CourseProgressStatus, LearnerCourse, TeacherDashboardData, TaughtMoodleCourse } from "@/lib/dashboard";
import { MOODLE_HOST, MOODLE_URL } from "@/lib/site";

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

function Stat({ icon, label, value }: { icon: string; label: string; value: string | number }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex items-start gap-space-sm">
      <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
        <Icon className="text-[22px]" name={icon} />
      </div>
      <div>
        <p className="font-headline-sm text-headline-sm text-on-surface">{value}</p>
        <p className="font-body-sm text-body-sm text-on-surface-variant">{label}</p>
      </div>
    </div>
  );
}

function roleLabel(role: string) {
  if (role === "editingteacher") return "Teacher";
  if (role === "teacher") return "Non-editing teacher";
  if (role === "manager") return "Manager";
  return role.replace(/_/g, " ");
}

function TaughtMoodleCourses({ courses }: { courses: TaughtMoodleCourse[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
      {courses.map((course) => {
        const completion = pct(course.completed, course.enrolled);
        return (
          <Card key={course.courseId}>
            <p className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">{roleLabel(course.role)}</p>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mt-1">{course.title}</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              {course.enrolled} learner{course.enrolled === 1 ? "" : "s"} enrolled
              {course.enrolled > 0 ? ` · ${completion}% completed` : ""}
            </p>
            <dl className="mt-space-sm grid grid-cols-3 gap-space-xs">
              <div>
                <dt className="font-label-sm text-label-sm text-on-surface-variant">Started</dt>
                <dd className="font-headline-sm text-on-surface">{course.started}</dd>
              </div>
              <div>
                <dt className="font-label-sm text-label-sm text-on-surface-variant">Completed</dt>
                <dd className="font-headline-sm text-on-surface">{course.completed}</dd>
              </div>
              <div>
                <dt className="font-label-sm text-label-sm text-on-surface-variant">Not started</dt>
                <dd className="font-headline-sm text-on-surface">{course.notStarted}</dd>
              </div>
            </dl>
            <div className="mt-space-sm">
              <ButtonLink cta={{ href: course.url, label: "Open in Moodle", external: true }} variant="text" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function TrainingCourses({ courses }: { courses: LearnerCourse[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
      {courses.map((course) => {
        const progress = pct(course.activitiesCompleted, course.activitiesTracked);
        return (
          <Card key={course.courseId}>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">{course.title}</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              {course.completedOn
                ? `Completed ${course.completedOn}`
                : `${course.activitiesCompleted} of ${course.activitiesTracked} tracked activities done`}
            </p>
            {course.activitiesTracked > 0 && (
              <div className="mt-space-sm h-2 rounded-full bg-surface-container-high">
                <div className="h-2 rounded-full bg-primary-container" style={{ width: `${progress}%` }} />
              </div>
            )}
            <div className="mt-space-sm">
              <ButtonLink cta={{ href: course.url, label: "Open in Moodle", external: true }} variant="text" />
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function CohortCard({ cohort }: { cohort: CohortInsight }) {
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

export function TeacherDashboard({ firstName, data }: { firstName: string; data: TeacherDashboardData }) {
  return (
    <div className="space-y-space-lg">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-space-md">
        <div className="max-w-2xl">
          <p className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">{data.roleLabel}</p>
          <h1 className="font-headline-md text-headline-md text-on-surface">Welcome, {firstName}</h1>
          <p className="mt-space-xs font-body-md text-body-md text-on-surface-variant">
            Two tracks on one dashboard: complete your own teacher training, and see named learners on the cohorts you
            teach. Grading and course content stay in Moodle at {MOODLE_HOST}.
          </p>
        </div>
        <div className="flex flex-wrap gap-space-sm shrink-0">
          <ButtonLink cta={{ href: MOODLE_URL, label: "Open teaching workspace", external: true }} />
          <ButtonLink cta={{ href: "/app/assistant?kind=trainer", label: "Draft with AI" }} variant="secondary" />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter">
        <Stat icon="groups" label="Learners in your cohorts" value={data.totals.learners} />
        <Stat icon="task_alt" label="Course completions" value={data.totals.completed} />
        <Stat icon="trending_down" label="Not yet started" value={data.totals.notStarted} />
        <Stat icon="workspace_premium" label="Certificates issued" value={data.totals.certificates} />
      </div>

      {data.alerts.length > 0 && (
        <div className="space-y-space-sm">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Alerts</h2>
          {data.alerts.map((alert) => (
            <Notice icon={alert.icon} key={alert.title} tone={alert.tone === "warning" ? "warning" : "info"}>
              <strong className="text-on-surface">{alert.title}. </strong>
              {alert.body}
            </Notice>
          ))}
        </div>
      )}

      <section>
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">Your training</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md max-w-3xl">
          Your pathway as a trainer: enrolments and completion on your Moodle account. This is separate from the
          cohorts you teach.
        </p>
        {!data.moodleLinked ? (
          <Card>
            <Icon className="text-primary text-[28px]" name="school" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface mt-space-sm">Training lives in Moodle</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Use the same email on Moodle and Stadilearn. We look that address up in Moodle (read-only) to show
              activity completion here. You can still open the teacher training course and draft with AI.
            </p>
            <div className="mt-space-sm flex flex-wrap gap-space-sm">
              <ButtonLink cta={{ href: "/learn/ai-for-classroom-teachers", label: "Teacher training pathway" }} />
              <ButtonLink cta={{ href: MOODLE_URL, label: "Open Moodle", external: true }} variant="secondary" />
            </div>
          </Card>
        ) : data.training.courses.length === 0 ? (
          <Card>
            <Icon className="text-primary text-[28px]" name="school" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface mt-space-sm">Not enrolled in training yet</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Join the teacher training pathway in Moodle. When you are enrolled, progress will appear in this
              section.
            </p>
            <div className="mt-space-sm">
              <ButtonLink cta={{ href: "/learn/ai-for-classroom-teachers", label: "Explore teacher training" }} />
            </div>
          </Card>
        ) : (
          <TrainingCourses courses={data.training.courses} />
        )}
      </section>

      <section>
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">Courses you teach in Moodle</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md max-w-3xl">
          Found from your Moodle account when the email matches. Counts are read-only from Moodle — grade and enrol in
          Moodle itself.
        </p>
        {!data.moodleLinked ? (
          <Card>
            <Icon className="text-primary text-[28px]" name="menu_book" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface mt-space-sm">Waiting for a matching Moodle email</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              When a Moodle teacher uses this same email, the courses they teach will appear here.
            </p>
          </Card>
        ) : data.taughtCourses.length === 0 ? (
          <Card>
            <Icon className="text-primary text-[28px]" name="menu_book" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface mt-space-sm">No Moodle teaching roles yet</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              We found your Moodle account, but you are not assigned as a teacher on a course. Your programme
              administrator assigns teaching roles in Moodle.
            </p>
            <div className="mt-space-sm">
              <ButtonLink cta={{ href: MOODLE_URL, label: "Open Moodle", external: true }} variant="secondary" />
            </div>
          </Card>
        ) : (
          <div className="space-y-space-md">
            <TaughtMoodleCourses courses={data.taughtCourses} />
            {data.moodleCohorts.length > 0 && (
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Moodle cohorts: {data.moodleCohorts.map((c) => c.name).join(", ")}
              </p>
            )}
            {data.moodleGroups.length > 0 && (
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Moodle groups: {data.moodleGroups.map((g) => `${g.name} (${g.courseTitle})`).join(", ")}
              </p>
            )}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-xs">Cohorts you teach</h2>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md max-w-3xl">
          Named roster and per-learner completion for assigned cohorts. Read-only here — add or remove people, and
          grade work, in Moodle or through your programme administrator.
        </p>
        {data.cohorts.length === 0 ? (
          <Card>
            <Icon className="text-primary text-[28px]" name="group_add" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface mt-space-sm">Waiting for a cohort</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Your programme administrator assigns you to cohorts. Until then, follow your training pathway and use
              the trainer assistant for labelled drafts.
            </p>
            <div className="mt-space-sm">
              <ButtonLink cta={{ href: "/app/assistant?kind=trainer", label: "Open trainer assistant" }} variant="secondary" />
            </div>
          </Card>
        ) : (
          <div className="space-y-space-md">
            {data.cohorts.map((cohort) => (
              <CohortCard cohort={cohort} key={cohort.id} />
            ))}
          </div>
        )}
      </section>

      <div>
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-md">Around your teaching</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          <Card>
            <Icon className="text-primary text-[28px]" name="edit_note" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface mt-space-sm">AI-assisted drafts</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Request lesson plans, quiz ideas, hints and feedback comments. Every draft is labelled and needs your
              review before you copy it into Moodle.
            </p>
            <div className="mt-space-sm">
              <ButtonLink cta={{ href: "/app/assistant?kind=trainer", label: "Open trainer assistant" }} variant="text" />
            </div>
          </Card>
          <Card>
            <Icon className="text-primary text-[28px]" name="support_agent" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface mt-space-sm">Support</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Ask the support assistant about Stadilearn and Moodle, or contact the team if a roster or certificate
              looks wrong.
            </p>
            <div className="mt-space-sm flex flex-wrap gap-space-xs">
              <ButtonLink cta={{ href: "/app/assistant?kind=support", label: "Support assistant" }} variant="text" />
              <ButtonLink cta={{ href: "/contact?type=support", label: "Contact Stadilearn" }} variant="text" />
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <Card>
          <div className="flex items-center gap-space-sm mb-space-md">
            <Icon className="text-secondary-container text-[28px]" name="school" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Do this in Moodle</h3>
          </div>
          <CheckList
            items={[
              { title: "Course content, announcements and forums" },
              { title: "Grading, feedback and the gradebook" },
              { title: "Adding learners to groups and cohorts" },
            ]}
          />
        </Card>
        <Card>
          <div className="flex items-center gap-space-sm mb-space-md">
            <Icon className="text-primary text-[28px]" name="dashboard" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Do this on Stadilearn</h3>
          </div>
          <CheckList
            items={[
              { title: "Named roster, completion and drop-off" },
              { title: "Your own trainer pathway progress" },
              { title: "AI drafting you review before use" },
            ]}
          />
        </Card>
      </div>

      <MoodleHandoffNotice />
    </div>
  );
}
