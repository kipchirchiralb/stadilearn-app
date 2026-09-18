import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AiDisclosureNotice,
  ButtonLink,
  Card,
  CheckList,
  Eyebrow,
  Faq,
  Icon,
  MoodleHandoffNotice,
  Section,
  SectionHeader,
} from "@/components/ui";
import { COURSES, getCourse } from "@/lib/courses";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return COURSES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const course = getCourse((await params).slug);
  if (!course) return { title: "Course not found" };
  return { title: course.title, description: course.summary };
}

export default async function CourseDetailPage({ params }: Props) {
  const course = getCourse((await params).slug);
  if (!course) notFound();

  const facts = [
    { icon: "signal_cellular_alt", label: "Level", value: course.level },
    { icon: "schedule", label: "Estimated time", value: course.duration },
    { icon: "groups", label: "Delivery", value: course.delivery },
    { icon: "translate", label: "Language", value: course.languages.join(", ") },
    { icon: "workspace_premium", label: "Certificate", value: course.certificate ? "Yes, on completion" : "No" },
    { icon: "event_available", label: "Availability", value: course.availability === "Open" ? "Enrolment open" : course.availability },
  ];

  return (
    <>
      <section className="w-full bg-surface py-space-xl lg:py-20">
        <div className="max-w-7xl mx-auto px-margin">
          <nav aria-label="Breadcrumb" className="mb-space-md font-body-sm text-body-sm text-on-surface-variant">
            <Link className="hover:text-primary" href="/learn">
              Courses
            </Link>{" "}
            / <span className="text-on-surface">{course.title}</span>
          </nav>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter lg:gap-space-xl items-start">
            <div className="lg:col-span-7 flex flex-col space-y-space-md">
              <Eyebrow>{course.topic}</Eyebrow>
              <h1 className="font-display-hero text-headline-lg-mobile sm:text-headline-lg text-on-surface tracking-tight">
                {course.title}
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant">{course.summary}</p>
              <p className="font-body-md text-body-md text-on-surface">
                <strong>Who it is for:</strong> {course.audience}
              </p>
              <div className="flex flex-wrap gap-space-sm pt-space-xs">
                {course.availability === "Open" ? (
                  <>
                    <ButtonLink cta={{ href: `/signup?course=${course.slug}`, label: "Create account" }} />
                    <ButtonLink cta={{ href: `/login?next=/learn/${course.slug}`, label: "Sign in to enrol" }} variant="secondary" />
                  </>
                ) : course.availability === "Upcoming" ? (
                  <>
                    <ButtonLink cta={{ href: `/contact?type=learning&course=${course.slug}`, label: "Join interest list" }} />
                    <ButtonLink cta={{ href: "/login", label: "Sign in" }} variant="secondary" />
                  </>
                ) : (
                  <ButtonLink cta={{ href: "/institutions", label: "Talk to your institution" }} />
                )}
              </div>
            </div>
            <Card className="lg:col-span-5">
              <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-md">Course at a glance</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                {facts.map((f) => (
                  <div className="flex items-start gap-space-sm" key={f.label}>
                    <Icon className="text-primary text-[22px]" name={f.icon} />
                    <div>
                      <dt className="font-label-sm text-label-sm text-on-surface-variant">{f.label}</dt>
                      <dd className="font-body-md text-body-md text-on-surface">{f.value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </Card>
          </div>
        </div>
      </section>

      <Section tone="low">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter lg:gap-space-xl">
          <div>
            <SectionHeader align="left" eyebrow="Outcomes" title="What you will be able to do" />
            <CheckList items={course.outcomes.map((o) => ({ title: o }))} />
          </div>
          <div>
            <SectionHeader align="left" eyebrow="Structure" title="Modules and lesson themes" />
            <ol className="space-y-space-sm">
              {course.modules.map((m, i) => (
                <li className="bg-surface-container-lowest rounded-xl p-space-md shadow-sm" key={m.title}>
                  <p className="font-label-sm text-label-sm text-secondary-container uppercase tracking-wider">Module {i + 1}</p>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">{m.title}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{m.lessons.join(" · ")}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Section>

      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {[
            { icon: "checklist", title: "Prerequisites", body: course.prerequisites },
            { icon: "smartphone", title: "Device and connectivity", body: course.connectivity },
            { icon: "quiz", title: "Assessment and completion", body: course.assessment },
            {
              icon: "workspace_premium",
              title: "Certificate",
              body: course.certificate
                ? "Meet the Moodle completion requirements to receive a certificate with a public verification code."
                : "This course does not issue a certificate.",
            },
          ].map((b) => (
            <Card key={b.title}>
              <Icon className="text-primary text-[28px]" name={b.icon} />
              <h3 className="font-headline-sm text-headline-sm text-on-surface mt-space-sm mb-space-xs">{b.title}</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{b.body}</p>
            </Card>
          ))}
        </div>
        <div className="mt-space-lg space-y-space-sm">
          <MoodleHandoffNotice />
          <AiDisclosureNotice />
        </div>
      </Section>

      {course.faq.length > 0 && (
        <Section tone="low">
          <SectionHeader eyebrow="FAQ" title="Questions about this course" />
          <Faq items={course.faq} />
        </Section>
      )}
    </>
  );
}
