/**
 * Provider-neutral AI adapter. Product code talks to `AiProvider`; switching to
 * another provider means adding an implementation here, not rewriting features.
 * API keys stay server-side in env and are never stored in the database.
 */

export type ToolDef = {
  name: string;
  description: string;
  /** JSON Schema (OpenAPI subset) for the arguments object. */
  parameters: { type: "object"; properties: Record<string, unknown>; required?: string[] };
};

export type ToolCall = { name: string; args: Record<string, unknown> };

export type ChatTurn =
  | { role: "user"; text: string }
  | { role: "assistant"; text: string }
  /** A model turn that requested tools. `raw` is the provider's own payload, replayed verbatim. */
  | { role: "tool_request"; calls: ToolCall[]; raw: unknown }
  | { role: "tool_result"; results: { name: string; result: unknown }[] };

export type ChatResult = {
  text: string;
  toolCalls: ToolCall[];
  raw: unknown;
  usage: { inputTokens: number; outputTokens: number };
};

export interface AiProvider {
  readonly name: string;
  readonly chatModel: string;
  readonly embedModel: string;
  readonly embedDimensions: number;
  chat(req: { system: string; turns: ChatTurn[]; tools?: ToolDef[]; temperature?: number }): Promise<ChatResult>;
  embed(texts: string[], kind: "query" | "document"): Promise<{ vectors: Float32Array[]; inputTokens: number }>;
}

export class AiProviderError extends Error {
  constructor(
    message: string,
    readonly code: "not_configured" | "rate_limited" | "blocked" | "provider_error",
  ) {
    super(message);
  }
}

// ---------------------------------------------------------------------------
// Gemini (REST: generativelanguage.googleapis.com)
// ---------------------------------------------------------------------------

const GEMINI_BASE = process.env.AI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta";

type GeminiPart = { text?: string; functionCall?: { name: string; args?: Record<string, unknown> }; thought?: boolean };
type GeminiContent = { role: "user" | "model"; parts: (GeminiPart | Record<string, unknown>)[] };

class GeminiProvider implements AiProvider {
  readonly name = "gemini";

  constructor(
    private readonly apiKey: string,
    readonly chatModel: string,
    readonly embedModel: string,
    readonly embedDimensions: number,
  ) {}

  private async call<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${GEMINI_BASE}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": this.apiKey },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) {
      const detail = (await res.text()).slice(0, 300);
      if (res.status === 429) throw new AiProviderError("AI provider quota or rate limit reached", "rate_limited");
      throw new AiProviderError(`Gemini ${res.status}: ${detail}`, "provider_error");
    }
    return (await res.json()) as T;
  }

  async chat({ system, turns, tools, temperature = 0.3 }: Parameters<AiProvider["chat"]>[0]): Promise<ChatResult> {
    const contents: GeminiContent[] = turns.map((t) => {
      switch (t.role) {
        case "user":
          return { role: "user", parts: [{ text: t.text }] };
        case "assistant":
          return { role: "model", parts: [{ text: t.text }] };
        case "tool_request":
          // Replay the model's own content so thought signatures are preserved.
          return t.raw as GeminiContent;
        case "tool_result":
          return {
            role: "user",
            parts: t.results.map((r) => ({ functionResponse: { name: r.name, response: { result: r.result } } })),
          };
      }
    });

    const data = await this.call<{
      candidates?: { content?: GeminiContent; finishReason?: string }[];
      promptFeedback?: { blockReason?: string };
      usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
    }>(`models/${this.chatModel}:generateContent`, {
      systemInstruction: { parts: [{ text: system }] },
      contents,
      tools: tools?.length ? [{ functionDeclarations: tools }] : undefined,
      generationConfig: { temperature },
    });

    if (data.promptFeedback?.blockReason) throw new AiProviderError("Request blocked by provider safety filters", "blocked");
    const content = data.candidates?.[0]?.content;
    const parts = (content?.parts ?? []) as GeminiPart[];
    return {
      text: parts.filter((p) => p.text && !p.thought).map((p) => p.text).join("").trim(),
      toolCalls: parts.filter((p) => p.functionCall).map((p) => ({ name: p.functionCall!.name, args: p.functionCall!.args ?? {} })),
      raw: content ?? { role: "model", parts: [] },
      usage: {
        inputTokens: data.usageMetadata?.promptTokenCount ?? 0,
        outputTokens: data.usageMetadata?.candidatesTokenCount ?? 0,
      },
    };
  }

  async embed(texts: string[], kind: "query" | "document") {
    const vectors: Float32Array[] = [];
    let inputTokens = 0;
    for (let i = 0; i < texts.length; i += 100) {
      const batch = texts.slice(i, i + 100);
      const data = await this.call<{ embeddings: { values: number[] }[] }>(`models/${this.embedModel}:batchEmbedContents`, {
        requests: batch.map((text) => ({
          model: `models/${this.embedModel}`,
          content: { parts: [{ text }] },
          taskType: kind === "query" ? "RETRIEVAL_QUERY" : "RETRIEVAL_DOCUMENT",
          outputDimensionality: this.embedDimensions,
        })),
      });
      for (const e of data.embeddings) vectors.push(normalise(Float32Array.from(e.values)));
      inputTokens += batch.reduce((n, t) => n + estimateTokens(t), 0);
    }
    return { vectors, inputTokens };
  }
}

// ---------------------------------------------------------------------------

export function estimateTokens(text: string) {
  return Math.ceil(text.length / 4);
}

/** L2-normalise so cosine similarity becomes a plain dot product. */
export function normalise(v: Float32Array) {
  let sum = 0;
  for (const x of v) sum += x * x;
  const norm = Math.sqrt(sum) || 1;
  for (let i = 0; i < v.length; i++) v[i] /= norm;
  return v;
}

export function vectorToBlob(v: Float32Array) {
  const buf = Buffer.alloc(v.length * 4);
  for (let i = 0; i < v.length; i++) buf.writeFloatLE(v[i], i * 4);
  return buf;
}

export function blobToVector(buf: Buffer) {
  const v = new Float32Array(buf.length / 4);
  for (let i = 0; i < v.length; i++) v[i] = buf.readFloatLE(i * 4);
  return v;
}

/** Estimated USD cost from optional per-million-token prices in env (0 on free tiers). */
export function estimateCost(inputTokens: number, outputTokens: number) {
  const inPrice = Number(process.env.AI_PRICE_INPUT_PER_MTOK ?? 0);
  const outPrice = Number(process.env.AI_PRICE_OUTPUT_PER_MTOK ?? 0);
  return (inputTokens * inPrice + outputTokens * outPrice) / 1_000_000;
}

let cached: AiProvider | undefined;

export function getProvider(): AiProvider {
  if (cached) return cached;
  const provider = process.env.AI_PROVIDER ?? "gemini";
  const apiKey = process.env.AI_API_KEY?.trim();
  if (!apiKey) throw new AiProviderError("AI_API_KEY is not set", "not_configured");
  const dims = Number(process.env.AI_EMBED_DIMENSIONS ?? 768);

  switch (provider) {
    case "gemini":
      cached = new GeminiProvider(
        apiKey,
        process.env.AI_MODEL ?? "gemini-3.8-flash",
        process.env.AI_EMBED_MODEL ?? "gemini-embedding-001",
        dims,
      );
      return cached;
    default:
      throw new AiProviderError(`Unsupported AI_PROVIDER "${provider}"`, "not_configured");
  }
}
