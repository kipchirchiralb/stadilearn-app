import { canUseTrainerAssistant, type SessionUser } from "@/lib/auth/session";
import { appDb } from "@/lib/db";
import { systemPrompt, PROMPT_VERSION, type AssistantKind } from "./prompts";
import { AiProviderError, estimateCost, getProvider, type ChatTurn } from "./provider";
import { checkQuota, getSetting, recordUsage } from "./quota";
import { retrieve, type RetrievedChunk } from "./retrieval";
import { runTool, toolsFor } from "./tools";

/**
 * One assistant turn: scope + quota checks, RAG retrieval, a bounded tool
 * loop, then persistence of messages, citations and usage.
 *
 * Data access: retrieval and tools use the restricted AI DB users; this file
 * uses the app pool only to store the user's own conversation and usage.
 */

export class AssistantError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

export type Citation = { n: number; title: string; course: string | null; section: string | null; url: string };

export type AssistantReply = {
  conversationId: number;
  messageId: number;
  reply: string;
  citations: Citation[];
  grounded: boolean;
};

const HISTORY_MESSAGES = 12;
const MAX_TOOL_ROUNDS = 4;
const MAX_MESSAGE_CHARS = 4000;

const QUOTA_MESSAGES = {
  disabled: "The AI assistant is paused right now. Your Moodle courses still work as normal.",
  user_limit: "You have reached today's AI assistant limit. It resets at midnight (UTC).",
  platform_limit: "The AI assistant has reached its daily capacity. Please try again tomorrow. Moodle still works as normal.",
};

export async function askAssistant(input: {
  user: SessionUser;
  assistant: AssistantKind;
  message: string;
  conversationId?: number | null;
  courseId?: number | null;
}): Promise<AssistantReply> {
  const { user } = input;
  const message = input.message.trim();
  if (!message) throw new AssistantError("Type a question first.", 400);
  if (message.length > MAX_MESSAGE_CHARS) throw new AssistantError("That message is too long. Please shorten it.", 400);

  // 1. Conversation (must belong to this user).
  let conversationId = input.conversationId ?? null;
  let assistant = input.assistant;
  let courseId = input.courseId ?? null;
  if (conversationId) {
    const [conv] = await appDb.query<{ assistant: AssistantKind; moodle_course_id: number | null }>(
      "SELECT assistant, moodle_course_id FROM ai_conversations WHERE id = ? AND user_id = ? AND archived_at IS NULL",
      [conversationId, user.id],
    );
    if (!conv) throw new AssistantError("Conversation not found.", 404);
    assistant = conv.assistant;
    courseId = conv.moodle_course_id === null ? null : Number(conv.moodle_course_id);
  }
  if (assistant === "trainer" && !canUseTrainerAssistant(user)) {
    throw new AssistantError("The trainer assistant is for teachers and institution admins.", 403);
  }

  // 2. Quota.
  let provider;
  try {
    provider = getProvider();
  } catch {
    throw new AssistantError(QUOTA_MESSAGES.disabled, 503);
  }
  const institutionId = user.adminOf[0] ?? null;
  const quota = await checkQuota(user);
  if (!quota.ok) {
    await recordUsage({
      userId: user.id, institutionId, assistant, operation: "chat", provider: provider.name, model: provider.chatModel,
      outcome: quota.reason === "disabled" ? "disabled" : "quota_blocked", errorCode: quota.reason,
    });
    throw new AssistantError(QUOTA_MESSAGES[quota.reason], 429);
  }

  // 3. Persist the conversation and the user's message.
  if (!conversationId) {
    const res = await appDb.execute(
      "INSERT INTO ai_conversations (user_id, assistant, moodle_course_id, title) VALUES (?, ?, ?, ?)",
      [user.id, assistant, courseId, message.replace(/\s+/g, " ").slice(0, 80)],
    );
    conversationId = res.insertId;
  }
  const convId: number = conversationId;
  const history = await appDb.query<{ role: "user" | "assistant"; content: string }>(
    `SELECT role, content FROM (
       SELECT id, role, content FROM ai_messages WHERE conversation_id = ? ORDER BY id DESC LIMIT ${HISTORY_MESSAGES}
     ) recent ORDER BY id`,
    [convId],
  );
  await appDb.execute("INSERT INTO ai_messages (conversation_id, role, content) VALUES (?, 'user', ?)", [convId, message]);

  // 4. Retrieve. Short follow-ups ("explain more") borrow the previous question for context.
  const previousQuestion = [...history].reverse().find((h) => h.role === "user")?.content ?? "";
  const searchText = message.length < 60 && previousQuestion ? `${previousQuestion}\n${message}` : message;

  const started = Date.now();
  let inputTokens = 0;
  let outputTokens = 0;
  const toolsUsed: { name: string; args: Record<string, unknown> }[] = [];

  try {
    const [k, minScore] = await Promise.all([getSetting("ai.tutor.top_k", 6), getSetting("ai.tutor.min_score", 0.55)]);
    const retrieval = await retrieve(provider, searchText, { courseId, k: Number(k), minScore: Number(minScore) });
    const chunks: RetrievedChunk[] = retrieval.chunks;
    inputTokens += retrieval.embedTokens;

    // 5. Model call with a bounded tool loop.
    const turns: ChatTurn[] = [...history.map((h) => ({ role: h.role, text: h.content }) as ChatTurn), { role: "user", text: message }];
    const tools = toolsFor(user);
    const system = systemPrompt(assistant, user, chunks);
    let reply = "";

    for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
      const result = await provider.chat({ system, turns, tools: round < MAX_TOOL_ROUNDS ? tools : undefined });
      inputTokens += result.usage.inputTokens;
      outputTokens += result.usage.outputTokens;
      if (!result.toolCalls.length) {
        reply = result.text;
        break;
      }
      const results = [];
      for (const call of result.toolCalls) {
        toolsUsed.push(call);
        results.push({ name: call.name, result: await runTool(user, call.name, call.args) });
      }
      turns.push({ role: "tool_request", calls: result.toolCalls, raw: result.raw }, { role: "tool_result", results });
    }
    if (!reply) reply = "Sorry, I could not put together an answer. Please try rephrasing your question.";

    // 6. Keep only the sources the answer actually cites.
    const citedNumbers = [...new Set([...reply.matchAll(/\[(\d{1,2})\]/g)].map((m) => Number(m[1])))].filter(
      (n) => n >= 1 && n <= chunks.length,
    );
    const citations: Citation[] = citedNumbers.map((n) => {
      const c = chunks[n - 1];
      return { n, title: c.title, course: c.courseTitle, section: c.sectionTitle, url: c.sourceUrl };
    });

    // Grounded = backed by course material or by a data tool, not the model's general knowledge.
    const grounded = chunks.length > 0 || toolsUsed.length > 0;
    const saved = await appDb.execute(
      `INSERT INTO ai_messages
         (conversation_id, role, content, provider, model, prompt_version, index_version_id, tools_used, grounded)
       VALUES (?, 'assistant', ?, ?, ?, ?, ?, ?, ?)`,
      [
        convId, reply, provider.name, provider.chatModel, PROMPT_VERSION, retrieval.indexVersionId,
        toolsUsed.length ? JSON.stringify(toolsUsed) : null, grounded,
      ],
    );
    if (citedNumbers.length) {
      await appDb.execute(
        `INSERT INTO ai_message_citations (message_id, rank_no, chunk_id, document_id, score)
         VALUES ${citedNumbers.map(() => "(?, ?, ?, ?, ?)").join(", ")}`,
        citedNumbers.flatMap((n) => {
          const c = chunks[n - 1];
          return [saved.insertId, n, c.chunkId, c.documentId, c.score];
        }),
      );
    }
    await appDb.execute("UPDATE ai_conversations SET updated_at = UTC_TIMESTAMP(3) WHERE id = ?", [convId]);
    await recordUsage({
      userId: user.id, institutionId, assistant, operation: "chat", provider: provider.name, model: provider.chatModel,
      inputTokens, outputTokens, costUsd: estimateCost(inputTokens, outputTokens), latencyMs: Date.now() - started, outcome: "ok",
    });

    return { conversationId: convId, messageId: saved.insertId, reply, citations, grounded };
  } catch (err) {
    const code = err instanceof AiProviderError ? err.code : "internal";
    await recordUsage({
      userId: user.id, institutionId, assistant, operation: "chat", provider: provider.name, model: provider.chatModel,
      inputTokens, outputTokens, latencyMs: Date.now() - started, outcome: "error", errorCode: code,
    }).catch(() => {});
    console.error("[ai] assistant turn failed", err);
    if (err instanceof AiProviderError && err.code === "rate_limited") {
      throw new AssistantError("The AI service is busy right now. Please try again in a minute.", 503);
    }
    if (err instanceof AiProviderError && err.code === "blocked") {
      throw new AssistantError("I can't help with that request. Try asking in a different way.", 422);
    }
    throw new AssistantError("The assistant is unavailable right now. Please try again shortly.", 503);
  }
}
