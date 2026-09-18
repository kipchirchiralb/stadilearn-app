import { getSessionUser } from "@/lib/auth/session";
import { appDb } from "@/lib/db";

/** The signed-in user's recent conversations. */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Sign in to use the assistant." }, { status: 401 });

  const rows = await appDb.query<{ id: number; assistant: string; title: string; moodle_course_id: number | null; updated_at: Date }>(
    `SELECT id, assistant, title, moodle_course_id, updated_at FROM ai_conversations
     WHERE user_id = ? AND archived_at IS NULL ORDER BY updated_at DESC LIMIT 30`,
    [user.id],
  );
  return Response.json({
    conversations: rows.map((r) => ({
      id: Number(r.id),
      assistant: r.assistant,
      title: r.title,
      courseId: r.moodle_course_id === null ? null : Number(r.moodle_course_id),
      updatedAt: r.updated_at,
    })),
  });
}
