"use client";

import { useMemo, useState } from "react";
import type { Course } from "@/lib/courses";
import { CourseCard } from "./CourseCard";

const selectClass =
  "w-full rounded-lg bg-surface-container-lowest px-space-sm py-space-sm font-body-sm text-body-sm text-on-surface ring-1 ring-outline-variant focus:outline-none focus:ring-2 focus:ring-primary-container";

export function CourseCatalogue({ courses }: { courses: Course[] }) {
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("");
  const [topic, setTopic] = useState("");
  const [language, setLanguage] = useState("");
  const [delivery, setDelivery] = useState("");
  const [availability, setAvailability] = useState("");

  const unique = (pick: (c: Course) => string | string[]) =>
    Array.from(new Set(courses.flatMap((c) => pick(c)))).sort();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return courses.filter(
      (c) =>
        (!q || `${c.title} ${c.summary} ${c.topic}`.toLowerCase().includes(q)) &&
        (!level || c.level === level) &&
        (!topic || c.topic === topic) &&
        (!language || c.languages.includes(language)) &&
        (!delivery || c.delivery === delivery) &&
        (!availability || c.availability === availability),
    );
  }, [courses, query, level, topic, language, delivery, availability]);

  const clear = () => {
    setQuery("");
    setLevel("");
    setTopic("");
    setLanguage("");
    setDelivery("");
    setAvailability("");
  };

  const filters: [string, string, (v: string) => void, string[]][] = [
    ["Level", level, setLevel, unique((c) => c.level)],
    ["Topic", topic, setTopic, unique((c) => c.topic)],
    ["Language", language, setLanguage, unique((c) => c.languages)],
    ["Delivery mode", delivery, setDelivery, unique((c) => c.delivery)],
    ["Availability", availability, setAvailability, unique((c) => c.availability)],
  ];

  return (
    <div>
      <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm mb-space-lg">
        <label className="block">
          <span className="font-label-md text-label-md text-on-surface">Search courses</span>
          <div className="mt-1 flex items-center gap-space-xs rounded-lg bg-surface px-space-sm ring-1 ring-outline-variant focus-within:ring-2 focus-within:ring-primary-container">
            <span aria-hidden="true" className="material-symbols-outlined text-on-surface-variant text-[20px]">search</span>
            <input
              className="w-full bg-transparent py-space-sm font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/70 focus:outline-none"
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. AI, lesson planning, spreadsheets"
              type="search"
              value={query}
            />
          </div>
        </label>
        <div className="mt-space-md grid grid-cols-2 md:grid-cols-5 gap-space-sm">
          {filters.map(([label, value, set, options]) => (
            <label className="block" key={label}>
              <span className="font-label-sm text-label-sm text-on-surface-variant">{label}</span>
              <select className={`${selectClass} mt-1`} onChange={(e) => set(e.target.value)} value={value}>
                <option value="">All</option>
                {options.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </div>

      <p aria-live="polite" className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
        {filtered.length} {filtered.length === 1 ? "course" : "courses"} found
      </p>

      {filtered.length === 0 ? (
        <div className="bg-surface-container-lowest rounded-2xl p-space-xl text-center shadow-sm">
          <span aria-hidden="true" className="material-symbols-outlined text-[40px] text-on-surface-variant">search_off</span>
          <p className="font-headline-sm text-headline-sm text-on-surface mt-space-sm">No courses match</p>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">Try a broader search or clear a filter.</p>
          <button
            className="mt-space-md inline-flex items-center gap-space-xs font-label-md text-label-md text-primary font-bold hover:text-secondary-container"
            onClick={clear}
            type="button"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {filtered.map((c) => (
            <CourseCard course={c} key={c.slug} />
          ))}
        </div>
      )}
    </div>
  );
}
