import { effectiveRole, type SessionUser } from "@/lib/auth/session";
import { appDb } from "@/lib/db";

/**
 * Daily AI limits from ai_quotas (most specific wins: user > institution >
 * role), checked against today's ai_usage_ledger. The global row caps the
 * whole platform, so a free provider tier cannot be overrun.
 */

export type QuotaCheck = { ok: true } | { ok: false; reason: "disabled" | "user_limit" | "platform_limit" };

type QuotaRow = { scope: string; scope_ref: string; daily_requests: number; daily_tokens: number | null };

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const [row] = await appDb.query<{ value: unknown }>("SELECT value FROM app_settings WHERE setting_key = ?", [key]);
  if (!row) return fallback;
  return (typeof row.value === "string" ? JSON.parse(row.value) : row.value) as T;
}

export async function checkQuota(user: SessionUser): Promise<QuotaCheck> {
  if (!(await getSetting("ai.enabled", true))) return { ok: false, reason: "disabled" };

  const quotas = await appDb.query<QuotaRow>("SELECT scope, scope_ref, daily_requests, daily_tokens FROM ai_quotas WHERE enabled = 1");
  const find = (scope: string, ref: string) => quotas.find((q) => q.scope === scope && q.scope_ref === ref);
  const personal =
    find("user", String(user.id)) ??
    user.adminOf.map((id) => find("institution", String(id))).find(Boolean) ??
    find("role", effectiveRole(user));
  const global = find("global", "");

  const [[mine], [all]] = await Promise.all([
    appDb.query<{ requests: number; tokens: number }>(
      `SELECT COUNT(*) AS requests, COALESCE(SUM(input_tokens + output_tokens), 0) AS tokens
       FROM ai_usage_ledger WHERE user_id = ? AND operation = 'chat' AND outcome = 'ok' AND created_at >= UTC_DATE()`,
      [user.id],
    ),
    appDb.query<{ requests: number; tokens: number }>(
      `SELECT COUNT(*) AS requests, COALESCE(SUM(input_tokens + output_tokens), 0) AS tokens
       FROM ai_usage_ledger WHERE operation = 'chat' AND outcome = 'ok' AND created_at >= UTC_DATE()`,
    ),
  ]);

  const over = (q: QuotaRow | undefined, used: { requests: number; tokens: number }) =>
    q !== undefined && (Number(used.requests) >= q.daily_requests || (q.daily_tokens !== null && Number(used.tokens) >= q.daily_tokens));

  if (over(global, all)) return { ok: false, reason: "platform_limit" };
  if (over(personal, mine)) return { ok: false, reason: "user_limit" };
  return { ok: true };
}

export async function recordUsage(entry: {
  userId: number | null;
  institutionId?: number | null;
  assistant: "tutor" | "support" | "trainer" | "indexer";
  operation: "chat" | "embed";
  provider: string;
  model: string;
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number;
  latencyMs?: number;
  outcome: "ok" | "error" | "quota_blocked" | "disabled";
  errorCode?: string;
}) {
  await appDb.execute(
    `INSERT INTO ai_usage_ledger
       (user_id, institution_id, assistant, operation, provider, model, input_tokens, output_tokens, est_cost_usd, latency_ms, outcome, error_code)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      entry.userId,
      entry.institutionId ?? null,
      entry.assistant,
      entry.operation,
      entry.provider,
      entry.model,
      entry.inputTokens ?? 0,
      entry.outputTokens ?? 0,
      entry.costUsd ?? 0,
      Math.round(entry.latencyMs ?? 0),
      entry.outcome,
      entry.errorCode ?? null,
    ],
  );
}
