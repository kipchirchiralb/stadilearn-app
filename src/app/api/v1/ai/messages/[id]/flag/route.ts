import { getSessionUser } from "@/lib/auth/session";
import { appDb } from "@/lib/db";

const REASONS = ["incorrect", "unsafe", "unhelpful", "assessment_help", "other"] as const;

/** Flag an assistant answer for human review. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Sign in to flag an answer." }, { status: 401 });

  const id = Number((await params).id);
  const body = await request.json().catch(() => null);
  const reason = REASONS.find((r) => r === body?.reason);
  if (!reason) return Response.json({ error: "Choose a reason." }, { status: 400 });
  const comment = typeof body?.comment === "string" ? body.comment.trim().slice(0, 1000) || null : null;

  // Only assistant messages in the user's own conversations can be flagged.
  const [msg] = await appDb.query<{ id: number }>(
    `SELECT m.id FROM ai_messages m JOIN ai_conversations c ON c.id = m.conversation_id
     WHERE m.id = ? AND m.role = 'assistant' AND c.user_id = ?`,
    [Number.isSafeInteger(id) ? id : 0, user.id],
  );
  if (!msg) return Response.json({ error: "Message not found." }, { status: 404 });

  await appDb.execute(
    `INSERT INTO ai_flags (message_id, flagged_by, reason, comment) VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE reason = VALUES(reason), comment = VALUES(comment), status = 'open'`,
    [msg.id, user.id, reason, comment],
  );
  return Response.json({ ok: true, message: "Thanks. The Stadilearn team will review this answer." });
}
