import { getSessionUser } from "@/lib/auth/session";
import { appDb } from "@/lib/db";

/** Messages (with citations) of one of the user's own conversations. */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Sign in to use the assistant." }, { status: 401 });

  const id = Number((await params).id);
  const [conv] = await appDb.query<{ id: number; assistant: string; title: string; moodle_course_id: number | null }>(
    "SELECT id, assistant, title, moodle_course_id FROM ai_conversations WHERE id = ? AND user_id = ? AND archived_at IS NULL",
    [Number.isSafeInteger(id) ? id : 0, user.id],
  );
  if (!conv) return Response.json({ error: "Conversation not found." }, { status: 404 });

  const [messages, citations] = await Promise.all([
    appDb.query<{ id: number; role: "user" | "assistant"; content: string }>(
      "SELECT id, role, content FROM ai_messages WHERE conversation_id = ? ORDER BY id",
      [conv.id],
    ),
    appDb.query<{ message_id: number; rank_no: number; title: string; course_title: string | null; section_title: string | null; source_url: string }>(
      `SELECT c.message_id, c.rank_no, d.title, d.course_title, d.section_title, d.source_url
       FROM ai_message_citations c
       JOIN ai_messages m ON m.id = c.message_id
       JOIN rag_documents d ON d.id = c.document_id
       WHERE m.conversation_id = ? ORDER BY c.message_id, c.rank_no`,
      [conv.id],
    ),
  ]);

  return Response.json({
    conversation: {
      id: Number(conv.id),
      assistant: conv.assistant,
      title: conv.title,
      courseId: conv.moodle_course_id === null ? null : Number(conv.moodle_course_id),
    },
    messages: messages.map((m) => ({
      id: Number(m.id),
      role: m.role,
      content: m.content,
      citations: citations
        .filter((c) => Number(c.message_id) === Number(m.id))
        .map((c) => ({ n: c.rank_no, title: c.title, course: c.course_title, section: c.section_title, url: c.source_url })),
    })),
  });
}
