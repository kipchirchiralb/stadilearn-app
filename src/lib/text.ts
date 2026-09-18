const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

/** Moodle HTML to readable plain text (keeps paragraph and list breaks). */
export function htmlToText(html: string | null | undefined) {
  if (!html) return "";
  return html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h[1-6]|li|tr|blockquote|section)>/gi, "\n")
    .replace(/<li[^>]*>/gi, "- ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(#\d+|#x[0-9a-f]+|[a-z]+);/gi, (m, e: string) => {
      if (e[0] === "#") {
        const code = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
        return Number.isFinite(code) ? String.fromCodePoint(code) : m;
      }
      return ENTITIES[e.toLowerCase()] ?? m;
    })
    .replace(/[ \t\f\v]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Split text into ~`size`-character chunks on paragraph/sentence boundaries,
 * with a small overlap so an idea cut at a boundary is still retrievable.
 */
export function chunkText(text: string, size = 1200, overlap = 150) {
  if (text.length <= size) return text ? [text] : [];
  const pieces = text.split(/(?<=\n\n)|(?<=[.!?])\s+/);
  const chunks: string[] = [];
  let current = "";
  for (const piece of pieces) {
    if (current && current.length + piece.length > size) {
      chunks.push(current.trim());
      current = current.slice(-overlap);
    }
    current += (current && !current.endsWith("\n") ? " " : "") + piece;
    while (current.length > size * 1.5) {
      chunks.push(current.slice(0, size).trim());
      current = current.slice(size - overlap);
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
}
