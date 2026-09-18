import Link from "next/link";
import type { Course } from "@/lib/courses";

const LEVEL_CLASS: Record<Course["level"], string> = {
  Beginner: "bg-primary-container/10 text-primary-container",
  Intermediate: "bg-secondary-container/15 text-secondary-container",
  "All Levels": "bg-primary-container/10 text-primary-container",
  Specialization: "bg-tertiary/10 text-tertiary",
};

export function CourseCard({ course }: { course: Course }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm flex flex-col justify-between hover:shadow-lg transition-all group">
      <div>
        <div className="flex items-center justify-between gap-space-xs mb-space-sm">
          <span className={`${LEVEL_CLASS[course.level]} px-space-xs py-0.5 rounded-full font-label-sm text-label-sm font-bold`}>
            {course.level}
          </span>
          <span className="bg-surface-container text-on-surface-variant px-space-xs py-0.5 rounded-full font-label-sm text-label-sm">
            {course.duration}
          </span>
        </div>
        <h3 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors mb-space-xs">
          {course.title}
        </h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">{course.summary}</p>
        <dl className="grid grid-cols-2 gap-x-space-sm gap-y-1 mb-space-md text-[12px] text-on-surface-variant">
          <dt className="sr-only">Language</dt>
          <dd>{course.languages.join(" + ")}</dd>
          <dt className="sr-only">Delivery</dt>
          <dd>{course.delivery}</dd>
          <dt className="sr-only">Certificate</dt>
          <dd>{course.certificate ? "Certificate on completion" : "No certificate"}</dd>
          <dt className="sr-only">Availability</dt>
          <dd className={course.availability === "Open" ? "text-primary font-semibold" : "text-secondary font-semibold"}>
            {course.availability === "Open" ? "Enrolment open" : course.availability}
          </dd>
        </dl>
        <div className="flex flex-wrap gap-space-xs mb-space-md">
          {course.tags.map((t) => (
            <span className="text-[11px] font-label-sm font-semibold bg-surface-container px-2 py-0.5 rounded text-on-surface-variant" key={t}>
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="pt-space-sm bg-surface-container-low/50 -mx-space-md -mb-space-md p-space-md rounded-b-2xl">
        <p className="text-[11px] font-body-sm text-on-surface-variant mb-space-xs">Studies conducted in Moodle</p>
        <Link
          className="inline-flex items-center justify-between w-full font-label-sm text-label-sm text-primary font-bold group-hover:text-secondary-container transition-colors"
          href={`/learn/${course.slug}`}
        >
          <span>View course</span>
          <span aria-hidden="true" className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
}
