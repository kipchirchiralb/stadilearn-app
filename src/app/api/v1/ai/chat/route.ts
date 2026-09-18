import { getSessionUser } from "@/lib/auth/session";
import { askAssistant, AssistantError } from "@/lib/ai/assistant";

const KINDS = ["tutor", "support", "trainer"] as const;

/** Send a message to an AI assistant. Requires a signed-in Stadilearn account. */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return Response.json({ error: "Sign in to use the assistant." }, { status: 401 });

  const body = await request.json().catch(() => null);
  const assistant = KINDS.find((k) => k === body?.assistant) ?? "tutor";
  const toId = (v: unknown) => (Number.isSafeInteger(Number(v)) && Number(v) > 0 ? Number(v) : null);

  try {
    const result = await askAssistant({
      user,
      assistant,
      message: typeof body?.message === "string" ? body.message : "",
      conversationId: toId(body?.conversationId),
      courseId: toId(body?.courseId),
    });
    return Response.json(result);
  } catch (err) {
    if (err instanceof AssistantError) return Response.json({ error: err.message }, { status: err.status });
    console.error("[ai] chat route failed", err);
    return Response.json({ error: "The assistant is unavailable right now." }, { status: 500 });
  }
}
