import type { Metadata } from "next";
import { CourseCatalogue } from "@/components/courses/CourseCatalogue";
import { CtaBand, MoodleHandoffNotice, PageHero, Section } from "@/components/ui";
import { COURSES } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Find your next skill",
  description: "Explore practical courses for digital confidence, AI literacy, and teaching with technology.",
};

export default function LearnPage() {
  return (
    <>
      <PageHero
        eyebrow="Course catalogue"
        intro="Explore practical courses for digital confidence, AI literacy, and teaching with technology."
        title="Find your"
        highlight="next skill."
      />
      <Section tone="low">
        <CourseCatalogue courses={COURSES} />
        <div className="mt-space-lg">
          <MoodleHandoffNotice />
        </div>
      </Section>
      <CtaBand
        body="Create a free Stadilearn account to track progress, use the AI learning assistant, and receive certificates."
        primary={{ href: "/signup", label: "Create account" }}
        secondary={{ href: "/institutions", label: "Enrol through your institution" }}
        title="Ready to begin?"
      />
    </>
  );
}
