import { CourseCatalogue } from "@/components/courses/CourseCatalogue";
import { CtaBand, MoodleHandoffNotice, PageHero, Section } from "@/components/ui";
import { COURSES } from "@/lib/courses";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Find your next skill",
  description: "Explore practical courses for digital confidence, AI literacy, and teaching with technology.",
  path: "/learn",
});

type Props = { searchParams: Promise<{ q?: string | string[] }> };

export default async function LearnPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const initialQuery = Array.isArray(q) ? q[0] ?? "" : q ?? "";

  return (
    <>
      <PageHero
        eyebrow="Course catalogue"
        intro="Explore practical courses for digital confidence, AI literacy, and teaching with technology."
        title="Find your"
        highlight="next skill."
      />
      <Section tone="low">
        <CourseCatalogue courses={COURSES} initialQuery={initialQuery} />
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
