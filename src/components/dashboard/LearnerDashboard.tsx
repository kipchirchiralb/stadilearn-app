import { ButtonLink, Card, Icon, MoodleHandoffNotice, Notice } from "@/components/ui";
import type { LearnerDashboardData } from "@/lib/dashboard";
import { MOODLE_HOST, MOODLE_URL } from "@/lib/site";

function pct(part: number, whole: number) {
  if (!whole) return 0;
  return Math.round((part / whole) * 100);
}

export function LearnerDashboard({ firstName, data }: { firstName: string; data: LearnerDashboardData }) {
  return (
    <div className="space-y-space-lg">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-space-md">
        <div className="max-w-2xl">
          <p className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">Learner</p>
          <h1 className="font-headline-md text-headline-md text-on-surface">Welcome, {firstName}</h1>
          <p className="mt-space-xs font-body-md text-body-md text-on-surface-variant">
            Study in Moodle at {MOODLE_HOST}. Use this dashboard for a progress summary and the AI assistant — Moodle
            is a separate sign-in.
          </p>
        </div>
        <div className="flex flex-wrap gap-space-sm shrink-0">
          <ButtonLink cta={{ href: "/app/assistant", label: "Open AI assistant" }} />
          <ButtonLink cta={{ href: MOODLE_URL, label: "Open learning space", external: true }} variant="secondary" />
        </div>
      </div>

      {!data.moodleLinked && (
        <Notice icon="link_off">
          No Moodle user has this email yet, so course progress cannot be shown here. Sign up to Moodle with the same
          address, then refresh this dashboard. You can still study in Moodle and use the assistant.
        </Notice>
      )}

      <div>
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-md">Your courses</h2>
        {!data.moodleLinked ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            <Card>
              <Icon className="text-primary text-[28px]" name="auto_stories" />
              <h3 className="font-headline-sm text-headline-sm text-on-surface mt-space-sm">Explore courses</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                See what you can study, then enrol in Moodle using this same email.
              </p>
              <div className="mt-space-sm">
                <ButtonLink cta={{ href: "/learn", label: "Browse catalogue" }} variant="text" />
              </div>
            </Card>
            <Card>
              <Icon className="text-primary text-[28px]" name="psychology" />
              <h3 className="font-headline-sm text-headline-sm text-on-surface mt-space-sm">Ask the tutor</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Get explanations and hints from approved course material.
              </p>
              <div className="mt-space-sm">
                <ButtonLink cta={{ href: "/app/assistant", label: "Open assistant" }} variant="text" />
              </div>
            </Card>
          </div>
        ) : data.courses.length === 0 ? (
          <Card>
            <Icon className="text-primary text-[28px]" name="menu_book" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface mt-space-sm">No Moodle enrolments yet</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              When you are enrolled in a Moodle course, completion will appear here. Browse the catalogue or open
              Moodle to get started.
            </p>
            <div className="mt-space-sm">
              <ButtonLink cta={{ href: "/learn", label: "Explore courses" }} variant="text" />
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {data.courses.map((course) => {
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
        )}
      </div>

      <MoodleHandoffNotice />
    </div>
  );
}
