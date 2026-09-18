import { aiDb } from "@/lib/db";
import { blobToVector, type AiProvider } from "./provider";

/**
 * Brute-force vector search over the active RAG index, using the AI's
 * restricted DB user (ai_v_rag_chunks only returns visible, non-withdrawn
 * content from the active index version).
 *
 * Vectors are cached in memory and refreshed every few minutes. At 768
 * dimensions this is ~3 KB per chunk, so tens of thousands of chunks fit
 * comfortably. Beyond that, move to MariaDB 11.8 VECTOR or a vector store.
 */

export type RetrievedChunk = {
  chunkId: number;
  documentId: number;
  moodleCourseId: number | null;
  title: string;
  courseTitle: string | null;
  sectionTitle: string | null;
  sourceUrl: string;
  sourceType: string;
  content: string;
  score: number;
};

type IndexEntry = { chunkId: number; courseId: number | null; vec: Float32Array };
type IndexCache = { versionId: number; loadedAt: number; entries: IndexEntry[] };

const REFRESH_MS = 5 * 60_000;
const store = globalThis as unknown as { __ragIndex?: IndexCache; __ragLoading?: Promise<IndexCache | null> };

async function loadIndex(): Promise<IndexCache | null> {
  const [version] = await aiDb.query<{ id: number }>(
    "SELECT id FROM rag_index_versions WHERE status = 'active' ORDER BY activated_at DESC LIMIT 1",
  );
  if (!version) return null;
  const rows = await aiDb.query<{ chunk_id: number; moodle_course_id: number | null; embedding: Buffer }>(
    "SELECT chunk_id, moodle_course_id, embedding FROM ai_v_rag_chunks WHERE index_version_id = ?",
    [version.id],
  );
  return {
    versionId: Number(version.id),
    loadedAt: Date.now(),
    entries: rows.map((r) => ({
      chunkId: Number(r.chunk_id),
      courseId: r.moodle_course_id === null ? null : Number(r.moodle_course_id),
      vec: blobToVector(r.embedding),
    })),
  };
}

async function getIndex() {
  const cached = store.__ragIndex;
  if (cached && Date.now() - cached.loadedAt < REFRESH_MS) return cached;
  store.__ragLoading ??= loadIndex().finally(() => (store.__ragLoading = undefined));
  const fresh = await store.__ragLoading;
  store.__ragIndex = fresh ?? undefined;
  return fresh;
}

export function invalidateRagCache() {
  store.__ragIndex = undefined;
}

export async function retrieve(
  provider: AiProvider,
  query: string,
  opts: { courseId?: number | null; k?: number; minScore?: number } = {},
): Promise<{ chunks: RetrievedChunk[]; indexVersionId: number | null; embedTokens: number }> {
  const index = await getIndex();
  if (!index || index.entries.length === 0) return { chunks: [], indexVersionId: null, embedTokens: 0 };

  const { vectors, inputTokens } = await provider.embed([query], "query");
  const q = vectors[0];
  if (q.length !== index.entries[0].vec.length) {
    throw new Error("Embedding dimensions do not match the active RAG index. Re-run the indexer.");
  }

  const k = opts.k ?? 6;
  const minScore = opts.minScore ?? 0.55;
  const scored: { chunkId: number; score: number }[] = [];
  for (const e of index.entries) {
    // Course-scoped tutor: that course's content plus general (non-course) material.
    if (opts.courseId && e.courseId !== null && e.courseId !== opts.courseId) continue;
    let dot = 0;
    for (let i = 0; i < q.length; i++) dot += q[i] * e.vec[i];
    if (dot >= minScore) scored.push({ chunkId: e.chunkId, score: dot });
  }
  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, k);
  if (top.length === 0) return { chunks: [], indexVersionId: index.versionId, embedTokens: inputTokens };

  const rows = await aiDb.query<{
    chunk_id: number;
    document_id: number;
    moodle_course_id: number | null;
    title: string;
    course_title: string | null;
    section_title: string | null;
    source_url: string;
    source_type: string;
    content: string;
  }>(
    `SELECT chunk_id, document_id, moodle_course_id, title, course_title, section_title, source_url, source_type, content
     FROM ai_v_rag_chunks WHERE chunk_id IN (?)`,
    [top.map((t) => t.chunkId)],
  );
  const byId = new Map(rows.map((r) => [Number(r.chunk_id), r]));

  return {
    indexVersionId: index.versionId,
    embedTokens: inputTokens,
    chunks: top.flatMap(({ chunkId, score }) => {
      const r = byId.get(chunkId);
      if (!r) return []; // withdrawn since the cache was loaded
      return [{
        chunkId,
        documentId: Number(r.document_id),
        moodleCourseId: r.moodle_course_id === null ? null : Number(r.moodle_course_id),
        title: r.title,
        courseTitle: r.course_title,
        sectionTitle: r.section_title,
        sourceUrl: r.source_url,
        sourceType: r.source_type,
        content: r.content,
        score,
      }];
    }),
  };
}
