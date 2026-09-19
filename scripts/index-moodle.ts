/**
 * Build or refresh the RAG index from approved Moodle content + the public catalogue.
 *
 *   npm run ai:index            incremental: only new or changed documents are embedded
 *   npm run ai:index -- --full  re-embed everything
 *
 * Safe to rerun and resumable: documents are hashed, so an interrupted run
 * picks up where it stopped. Changing AI_EMBED_MODEL or AI_EMBED_DIMENSIONS
 * builds a new index version alongside the active one and switches over
 * only when it is complete.
 *
 * Moodle access is SELECT-only through the restricted AI user. Only visible
 * content in visible sections of visible courses is indexed. Quizzes,
 * assignments and lesson question pages are never indexed.
 */
import { createHash } from "node:crypto";
import { COURSES } from "@/lib/courses";
import { appDb, closePools, moodleAiDb, mt } from "@/lib/db";
import { PLATFORM_HELP_DOCS } from "@/lib/ai/platform-knowledge";
import { AiProviderError, estimateTokens, getProvider, vectorToBlob, type AiProvider } from "@/lib/ai/provider";
import { recordUsage } from "@/lib/ai/quota";
import { MOODLE_URL } from "@/lib/site";
import { chunkText, htmlToText } from "@/lib/text";

const JOB = "rag_index";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://stadilearn.co.ke";
const full = process.argv.includes("--full");

type SourceDoc = {
  sourceType: "moodle_course" | "moodle_section" | "moodle_page" | "moodle_label" | "moodle_book_chapter" | "moodle_lesson_page" | "site_course" | "site_help";
  sourceKey: string;
  moodleCourseId: number | null;
  moodleCmId: number | null;
  courseTitle: string | null;
  sectionTitle: string | null;
  title: string;
  language: "en" | "sw";
  url: string;
  text: string;
  modifiedAt: Date | null;
};

const lang = (...codes: (string | null | undefined)[]): "en" | "sw" => (codes.find((c) => c)?.toLowerCase().startsWith("sw") ? "sw" : "en");
const fromUnix = (t: number | null | undefined) => (t ? new Date(Number(t) * 1000) : null);
const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

// ---------------------------------------------------------------------------
// 1. Read sources
// ---------------------------------------------------------------------------

async function readMoodle(): Promise<SourceDoc[]> {
  const docs: SourceDoc[] = [];
  const courses = await moodleAiDb.query<{ id: number; fullname: string; summary: string | null; lang: string; timemodified: number }>(
    `SELECT id, fullname, summary, lang, timemodified FROM ${mt("course")} WHERE visible = 1 AND id <> 1`,
  );
  const courseById = new Map(courses.map((c) => [Number(c.id), c]));
  if (!courses.length) return docs;
  const courseIds = [...courseById.keys()];

  for (const c of courses) {
    docs.push({
      sourceType: "moodle_course", sourceKey: `course:${c.id}`, moodleCourseId: Number(c.id), moodleCmId: null,
      courseTitle: c.fullname, sectionTitle: null, title: `${c.fullname}: course overview`, language: lang(c.lang),
      url: `${MOODLE_URL}/course/view.php?id=${c.id}`, text: htmlToText(c.summary), modifiedAt: fromUnix(c.timemodified),
    });
  }

  const sections = await moodleAiDb.query<{ id: number; course: number; section: number; name: string | null; summary: string | null; timemodified: number }>(
    `SELECT id, course, section, name, summary, timemodified FROM ${mt("course_sections")}
     WHERE visible = 1 AND course IN (?)`,
    [courseIds],
  );
  const sectionTitle = (s: { section: number; name: string | null }) => s.name || (Number(s.section) === 0 ? "General" : `Section ${s.section}`);
  for (const s of sections) {
    const c = courseById.get(Number(s.course))!;
    docs.push({
      sourceType: "moodle_section", sourceKey: `section:${s.id}`, moodleCourseId: Number(s.course), moodleCmId: null,
      courseTitle: c.fullname, sectionTitle: sectionTitle(s), title: sectionTitle(s), language: lang(c.lang),
      url: `${MOODLE_URL}/course/view.php?id=${s.course}#section-${s.section}`, text: htmlToText(s.summary), modifiedAt: fromUnix(s.timemodified),
    });
  }

  // Visible activities in visible sections.
  const cms = await moodleAiDb.query<{ cmid: number; course: number; instance: number; modname: string; lang: string | null; section_no: number; section_name: string | null }>(
    `SELECT cm.id AS cmid, cm.course, cm.instance, m.name AS modname, cm.lang, cs.section AS section_no, cs.name AS section_name
     FROM ${mt("course_modules")} cm
     JOIN ${mt("modules")} m ON m.id = cm.module
     JOIN ${mt("course_sections")} cs ON cs.id = cm.section AND cs.visible = 1
     WHERE cm.course IN (?) AND cm.visible = 1 AND cm.deletioninprogress = 0
       AND m.name IN ('page', 'label', 'book', 'lesson')`,
    [courseIds],
  );
  const byMod = (name: string) => cms.filter((cm) => cm.modname === name);
  const ctx = (cm: (typeof cms)[number]) => {
    const c = courseById.get(Number(cm.course))!;
    return {
      moodleCourseId: Number(cm.course), moodleCmId: Number(cm.cmid), courseTitle: c.fullname,
      sectionTitle: sectionTitle({ section: cm.section_no, name: cm.section_name }), language: lang(cm.lang, c.lang),
    };
  };

  const pageCms = byMod("page");
  if (pageCms.length) {
    const pages = await moodleAiDb.query<{ id: number; name: string; intro: string | null; content: string | null; timemodified: number }>(
      `SELECT id, name, intro, content, timemodified FROM ${mt("page")} WHERE id IN (?)`,
      [pageCms.map((cm) => cm.instance)],
    );
    for (const cm of pageCms) {
      const p = pages.find((x) => Number(x.id) === Number(cm.instance));
      if (!p) continue;
      docs.push({
        sourceType: "moodle_page", sourceKey: `page:${p.id}`, ...ctx(cm), title: p.name,
        url: `${MOODLE_URL}/mod/page/view.php?id=${cm.cmid}`,
        text: [htmlToText(p.intro), htmlToText(p.content)].filter(Boolean).join("\n\n"), modifiedAt: fromUnix(p.timemodified),
      });
    }
  }

  const labelCms = byMod("label");
  if (labelCms.length) {
    const labels = await moodleAiDb.query<{ id: number; name: string; intro: string | null; timemodified: number }>(
      `SELECT id, name, intro, timemodified FROM ${mt("label")} WHERE id IN (?)`,
      [labelCms.map((cm) => cm.instance)],
    );
    for (const cm of labelCms) {
      const l = labels.find((x) => Number(x.id) === Number(cm.instance));
      if (!l) continue;
      const c = ctx(cm);
      docs.push({
        sourceType: "moodle_label", sourceKey: `label:${l.id}`, ...c, title: c.sectionTitle,
        url: `${MOODLE_URL}/course/view.php?id=${cm.course}#section-${cm.section_no}`,
        text: htmlToText(l.intro), modifiedAt: fromUnix(l.timemodified),
      });
    }
  }

  const bookCms = byMod("book");
  if (bookCms.length) {
    const [books, chapters] = await Promise.all([
      moodleAiDb.query<{ id: number; name: string }>(`SELECT id, name FROM ${mt("book")} WHERE id IN (?)`, [bookCms.map((cm) => cm.instance)]),
      moodleAiDb.query<{ id: number; bookid: number; title: string; content: string | null; timemodified: number }>(
        `SELECT id, bookid, title, content, timemodified FROM ${mt("book_chapters")} WHERE hidden = 0 AND bookid IN (?)`,
        [bookCms.map((cm) => cm.instance)],
      ),
    ]);
    for (const cm of bookCms) {
      const book = books.find((b) => Number(b.id) === Number(cm.instance));
      for (const ch of chapters.filter((x) => Number(x.bookid) === Number(cm.instance))) {
        docs.push({
          sourceType: "moodle_book_chapter", sourceKey: `book_chapter:${ch.id}`, ...ctx(cm),
          title: book ? `${book.name}: ${ch.title}` : ch.title,
          url: `${MOODLE_URL}/mod/book/view.php?id=${cm.cmid}&chapterid=${ch.id}`,
          text: htmlToText(ch.content), modifiedAt: fromUnix(ch.timemodified),
        });
      }
    }
  }

  const lessonCms = byMod("lesson");
  if (lessonCms.length) {
    // qtype 20 = content ("branch table") pages only; question pages are assessments.
    const pages = await moodleAiDb.query<{ id: number; lessonid: number; title: string; contents: string | null; timemodified: number }>(
      `SELECT id, lessonid, title, contents, timemodified FROM ${mt("lesson_pages")} WHERE qtype = 20 AND lessonid IN (?)`,
      [lessonCms.map((cm) => cm.instance)],
    );
    for (const cm of lessonCms) {
      for (const p of pages.filter((x) => Number(x.lessonid) === Number(cm.instance))) {
        docs.push({
          sourceType: "moodle_lesson_page", sourceKey: `lesson_page:${p.id}`, ...ctx(cm), title: p.title,
          url: `${MOODLE_URL}/mod/lesson/view.php?id=${cm.cmid}&pageid=${p.id}`,
          text: htmlToText(p.contents), modifiedAt: fromUnix(p.timemodified),
        });
      }
    }
  }

  return docs;
}

function readSiteCatalogue(): SourceDoc[] {
  return COURSES.map((c) => ({
    sourceType: "site_course",
    sourceKey: `site:${c.slug}`,
    moodleCourseId: null,
    moodleCmId: null,
    courseTitle: c.title,
    sectionTitle: null,
    title: `${c.title} (Stadilearn course catalogue)`,
    language: "en",
    url: `${SITE_URL}/learn/${c.slug}`,
    modifiedAt: null,
    text: [
      c.summary,
      `Topic: ${c.topic}. Level: ${c.level}. Duration: ${c.duration}. Delivery: ${c.delivery}. Languages: ${c.languages.join(", ")}. Availability: ${c.availability}. Certificate: ${c.certificate ? "yes" : "no"}.`,
      `Who it is for: ${c.audience}`,
      `You will be able to:\n${c.outcomes.map((o) => `- ${o}`).join("\n")}`,
      `Modules:\n${c.modules.map((m) => `- ${m.title}: ${m.lessons.join(", ")}`).join("\n")}`,
      `Prerequisites: ${c.prerequisites}\nConnectivity: ${c.connectivity}\nAssessment: ${c.assessment}`,
      c.faq.map((f) => `Q: ${f.q}\nA: ${f.a}`).join("\n"),
    ].join("\n\n"),
  }));
}

function readSiteHelp(): SourceDoc[] {
  return PLATFORM_HELP_DOCS.map((d) => ({
    sourceType: "site_help",
    sourceKey: `help:${d.key}`,
    moodleCourseId: null,
    moodleCmId: null,
    courseTitle: "Stadilearn help",
    sectionTitle: null,
    title: d.title,
    language: "en",
    url: d.url.startsWith("http") ? d.url : `${SITE_URL}${d.url}`,
    modifiedAt: null,
    text: d.text,
  }));
}

// ---------------------------------------------------------------------------
// 2. Index versions
// ---------------------------------------------------------------------------

async function targetVersion(provider: AiProvider) {
  const versions = await appDb.query<{ id: number; embed_model: string; dimensions: number; status: string }>(
    "SELECT id, embed_model, dimensions, status FROM rag_index_versions WHERE status IN ('active', 'building') ORDER BY id DESC",
  );
  const matches = (v: (typeof versions)[number]) => v.embed_model === provider.embedModel && Number(v.dimensions) === provider.embedDimensions;
  const active = versions.find((v) => v.status === "active");
  if (active && matches(active)) return { id: Number(active.id), building: false };
  const building = versions.find((v) => v.status === "building" && matches(v));
  if (building) return { id: Number(building.id), building: true };
  const res = await appDb.execute("INSERT INTO rag_index_versions (embed_model, dimensions) VALUES (?, ?)", [
    provider.embedModel,
    provider.embedDimensions,
  ]);
  console.log(`Building new index version ${res.insertId} (${provider.embedModel}, ${provider.embedDimensions} dims)`);
  return { id: res.insertId, building: true };
}

async function embedWithRetry(provider: AiProvider, texts: string[]) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await provider.embed(texts, "document");
    } catch (err) {
      if (!(err instanceof AiProviderError && err.code === "rate_limited") || attempt >= 5) throw err;
      const wait = 2 ** attempt * 5_000;
      console.log(`  rate limited, waiting ${wait / 1000}s`);
      await new Promise((r) => setTimeout(r, wait));
    }
  }
}

// ---------------------------------------------------------------------------
// 3. Run
// ---------------------------------------------------------------------------

async function main() {
  const provider = getProvider();
  const run = await appDb.execute("INSERT INTO sync_runs (job_name) VALUES (?)", [JOB]);
  let read = 0, written = 0, skipped = 0, embedTokens = 0;

  try {
    const version = await targetVersion(provider);
    let moodleDocs: SourceDoc[] = [];
    try {
      moodleDocs = await readMoodle();
    } catch (err) {
      console.error("Moodle read failed; indexing site content only.", err);
    }
    const docs = [...moodleDocs, ...readSiteCatalogue(), ...readSiteHelp()].filter((d) => d.text.trim().length >= 20);
    read = docs.length;
    console.log(`Read ${docs.length} documents with content`);

    const existing = await appDb.query<{ id: number; source_type: string; source_key: string; content_hash: string; withdrawn_at: Date | null }>(
      "SELECT id, source_type, source_key, content_hash, withdrawn_at FROM rag_documents",
    );
    const existingByKey = new Map(existing.map((d) => [`${d.source_type}|${d.source_key}`, d]));
    const chunkCounts = new Map(
      (await appDb.query<{ document_id: number; n: number }>(
        "SELECT document_id, COUNT(*) AS n FROM rag_chunks WHERE index_version_id = ? GROUP BY document_id",
        [version.id],
      )).map((r) => [Number(r.document_id), Number(r.n)]),
    );

    const seen = new Set<string>();
    for (const doc of docs) {
      const key = `${doc.sourceType}|${doc.sourceKey}`;
      seen.add(key);
      const hash = sha256(`${doc.title}\n${doc.url}\n${doc.text}`);
      const prev = existingByKey.get(key);
      if (!full && prev && prev.content_hash === hash && !prev.withdrawn_at && chunkCounts.get(Number(prev.id))) {
        skipped++;
        continue;
      }

      await appDb.execute(
        `INSERT INTO rag_documents
           (source_type, source_key, moodle_course_id, moodle_cm_id, course_title, section_title, title, language, source_url, content_hash, source_modified_at, indexed_at, withdrawn_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(3), NULL)
         ON DUPLICATE KEY UPDATE moodle_course_id = VALUES(moodle_course_id), moodle_cm_id = VALUES(moodle_cm_id),
           course_title = VALUES(course_title), section_title = VALUES(section_title), title = VALUES(title),
           language = VALUES(language), source_url = VALUES(source_url), content_hash = VALUES(content_hash),
           source_modified_at = VALUES(source_modified_at), indexed_at = UTC_TIMESTAMP(3), withdrawn_at = NULL`,
        [doc.sourceType, doc.sourceKey, doc.moodleCourseId, doc.moodleCmId, doc.courseTitle?.slice(0, 255) ?? null,
         doc.sectionTitle?.slice(0, 255) ?? null, doc.title.slice(0, 255), doc.language, doc.url.slice(0, 500), hash, doc.modifiedAt],
      );
      const [row] = await appDb.query<{ id: number }>("SELECT id FROM rag_documents WHERE source_type = ? AND source_key = ?", [
        doc.sourceType,
        doc.sourceKey,
      ]);
      const docId = Number(row.id);

      // Heading goes into the embedding so chunks keep their context.
      const heading = [doc.courseTitle, doc.sectionTitle, doc.title].filter(Boolean).join(" > ");
      const chunks = chunkText(doc.text);
      const { vectors, inputTokens } = await embedWithRetry(provider, chunks.map((c) => `${heading}\n\n${c}`));
      embedTokens += inputTokens;

      await appDb.execute("DELETE FROM rag_chunks WHERE document_id = ? AND index_version_id = ?", [docId, version.id]);
      await appDb.execute(
        `INSERT INTO rag_chunks (document_id, index_version_id, chunk_no, content, token_estimate, embedding)
         VALUES ${chunks.map(() => "(?, ?, ?, ?, ?, ?)").join(", ")}`,
        chunks.flatMap((c, i) => [docId, version.id, i, c, Math.min(estimateTokens(c), 65535), vectorToBlob(vectors[i])]),
      );
      written++;
      console.log(`  indexed ${doc.sourceKey} (${chunks.length} chunks): ${doc.title}`);
    }

    // Anything no longer visible in Moodle (or removed from the catalogue) is withdrawn.
    const gone = existing.filter((d) => !d.withdrawn_at && !seen.has(`${d.source_type}|${d.source_key}`)).map((d) => Number(d.id));
    if (gone.length) {
      await appDb.execute("UPDATE rag_documents SET withdrawn_at = UTC_TIMESTAMP(3) WHERE id IN (?)", [gone]);
      await appDb.execute("DELETE FROM rag_chunks WHERE document_id IN (?)", [gone]);
      console.log(`Withdrew ${gone.length} documents that are hidden, deleted or unpublished`);
    }

    if (version.building) {
      await appDb.execute("UPDATE rag_index_versions SET status = 'retired' WHERE status = 'active'");
      await appDb.execute("UPDATE rag_index_versions SET status = 'active', activated_at = UTC_TIMESTAMP(3) WHERE id = ?", [version.id]);
      await appDb.execute(
        "DELETE c FROM rag_chunks c JOIN rag_index_versions v ON v.id = c.index_version_id WHERE v.status = 'retired'",
      );
      console.log(`Activated index version ${version.id}`);
    }
    await appDb.execute(
      "UPDATE rag_index_versions SET chunk_count = (SELECT COUNT(*) FROM rag_chunks WHERE index_version_id = ?) WHERE id = ?",
      [version.id, version.id],
    );
    await appDb.execute(
      `INSERT INTO sync_cursors (job_name, last_success_at) VALUES (?, UTC_TIMESTAMP(3))
       ON DUPLICATE KEY UPDATE last_success_at = UTC_TIMESTAMP(3)`,
      [JOB],
    );
    await appDb.execute(
      "UPDATE sync_runs SET status = 'succeeded', records_read = ?, records_written = ?, records_skipped = ?, finished_at = UTC_TIMESTAMP(3) WHERE id = ?",
      [read, written, skipped, run.insertId],
    );
    console.log(`Done: ${written} embedded, ${skipped} unchanged.`);
  } catch (err) {
    await appDb.execute(
      "UPDATE sync_runs SET status = ?, records_read = ?, records_written = ?, records_skipped = ?, error_message = ?, finished_at = UTC_TIMESTAMP(3) WHERE id = ?",
      [written ? "partial" : "failed", read, written, skipped, String(err).slice(0, 2000), run.insertId],
    );
    throw err;
  } finally {
    if (embedTokens) {
      await recordUsage({
        userId: null, assistant: "indexer", operation: "embed", provider: provider.name, model: provider.embedModel,
        inputTokens: embedTokens, outcome: "ok",
      });
    }
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(closePools);
