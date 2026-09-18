import { getSessionUser } from "@/lib/auth/session";
import { appDb } from "@/lib/db";

/** Hand a conversation to the human support queue. */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Sign in to contact support." }, { status: 401 });

  const id = Number((await params).id);
  const [conv] = await appDb.query<{ id: number; title: string }>(
    "SELECT id, title FROM ai_conversations WHERE id = ? AND user_id = ?",
    [Number.isSafeInteger(id) ? id : 0, user.id],
  );
  if (!conv) return Response.json({ error: "Conversation not found." }, { status: 404 });

  const [open] = await appDb.query<{ id: number }>(
    "SELECT id FROM support_tickets WHERE ai_conversation_id = ? AND status NOT IN ('resolved','closed')",
    [conv.id],
  );
  if (open) return Response.json({ ok: true, ticketId: Number(open.id), message: "This conversation is already with our support team." });

  const body = await request.json().catch(() => null);
  const note = typeof body?.note === "string" ? body.note.trim().slice(0, 2000) : "";

  const ticket = await appDb.execute(
    "INSERT INTO support_tickets (user_id, source, ai_conversation_id, subject, category) VALUES (?, 'ai_escalation', ?, ?, 'ai')",
    [user.id, conv.id, `Assistant escalation: ${conv.title}`.slice(0, 200)],
  );
  await appDb.execute("INSERT INTO support_messages (ticket_id, author_id, body) VALUES (?, ?, ?)", [
    ticket.insertId,
    user.id,
    note || "Escalated from the AI assistant. See the linked conversation.",
  ]);
  await appDb.execute(
    "INSERT INTO audit_events (actor_id, action, entity_type, entity_id) VALUES (?, 'support.escalated_from_ai', 'support_ticket', ?)",
    [user.id, String(ticket.insertId)],
  );

  return Response.json({ ok: true, ticketId: ticket.insertId, message: "A member of our support team will follow up by email." });
}
