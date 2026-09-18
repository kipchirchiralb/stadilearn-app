import { getSessionUser } from "@/lib/auth/session";
import { aiDb } from "@/lib/db";

/** Courses that have indexed content, for scoping the tutor. */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Sign in to use the assistant." }, { status: 401 });

  const rows = await aiDb.query<{ moodle_course_id: number; course_title: string }>(
    `SELECT moodle_course_id, MAX(course_title) AS course_title FROM rag_documents
     WHERE moodle_course_id IS NOT NULL AND withdrawn_at IS NULL
     GROUP BY moodle_course_id ORDER BY course_title`,
  );
  return Response.json({ courses: rows.map((r) => ({ id: Number(r.moodle_course_id), title: r.course_title })) });
}
