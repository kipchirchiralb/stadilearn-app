import { readFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { SITE_URL } from "@/lib/site";

const TEAL = rgb(0, 102 / 255, 128 / 255);
const INK = rgb(23 / 255, 29 / 255, 30 / 255);
const MUTED = rgb(63 / 255, 72 / 255, 76 / 255);
const ACCENT = rgb(253 / 255, 102 / 255, 4 / 255);
const PAPER = rgb(1, 1, 1);

export type CertificatePdfInput = {
  code: string;
  displayName: string;
  courseTitle: string;
  courseSummary: string;
  completedOn: string;
  issuedAt: string;
  programme: string;
};

function wrap(font: PDFFont, text: string, size: number, maxWidth: number) {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= maxWidth) {
      line = next;
      continue;
    }
    if (line) lines.push(line);
    if (font.widthOfTextAtSize(word, size) <= maxWidth) {
      line = word;
      continue;
    }
    let chunk = "";
    for (const ch of word) {
      const trial = chunk + ch;
      if (font.widthOfTextAtSize(trial, size) <= maxWidth) chunk = trial;
      else {
        if (chunk) lines.push(chunk);
        chunk = ch;
      }
    }
    line = chunk;
  }
  if (line) lines.push(line);
  return lines;
}

function center(page: PDFPage, font: PDFFont, text: string, size: number, y: number, color = INK) {
  const { width } = page.getSize();
  page.drawText(text, { x: (width - font.widthOfTextAtSize(text, size)) / 2, y, size, font, color });
}

function formatLong(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-KE", { dateStyle: "long", timeZone: "UTC" });
}

async function loadLogo() {
  try {
    return await readFile(path.join(process.cwd(), "public", "stadilearnlogo.png"));
  } catch {
    return null;
  }
}

export async function buildCertificatePdf(input: CertificatePdfInput) {
  const doc = await PDFDocument.create();
  doc.setTitle(`Stadilearn certificate of proficiency — ${input.code}`);
  doc.setAuthor("Stadilearn");
  doc.setSubject(input.courseTitle);
  doc.setCreator("Stadilearn");

  const page = doc.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();
  const serif = await doc.embedFont(StandardFonts.TimesRoman);
  const serifBold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const serifItalic = await doc.embedFont(StandardFonts.TimesRomanItalic);
  const sans = await doc.embedFont(StandardFonts.Helvetica);
  const sansBold = await doc.embedFont(StandardFonts.HelveticaBold);

  page.drawRectangle({ x: 0, y: 0, width, height, color: PAPER });
  page.drawRectangle({ x: 22, y: 22, width: width - 44, height: height - 44, borderColor: TEAL, borderWidth: 3 });
  page.drawRectangle({ x: 32, y: 32, width: width - 64, height: height - 64, borderColor: TEAL, borderWidth: 0.8 });
  page.drawRectangle({ x: 42, y: height - 48, width: width - 84, height: 4, color: ACCENT });

  const logoBytes = await loadLogo();
  let y = height - 118;
  if (logoBytes) {
    try {
      const logo = await doc.embedPng(logoBytes);
      const scaled = logo.scaleToFit(220, 52);
      page.drawImage(logo, { x: (width - scaled.width) / 2, y: height - 108, width: scaled.width, height: scaled.height });
      y = height - 128;
    } catch {
      center(page, sansBold, "STADILEARN", 18, height - 90, TEAL);
    }
  } else {
    center(page, sansBold, "STADILEARN", 18, height - 90, TEAL);
  }

  center(page, sansBold, "CERTIFICATE OF PROFICIENCY", 22, y, TEAL);
  y -= 28;
  center(page, serifItalic, "This is to certify that", 14, y, MUTED);
  y -= 36;

  const nameLines = wrap(serifBold, input.displayName, 28, width - 160);
  for (const line of nameLines) {
    center(page, serifBold, line, 28, y);
    y -= 34;
  }

  y -= 4;
  center(page, serif, "has successfully completed the course of study", 13, y, MUTED);
  y -= 28;
  for (const line of wrap(serifBold, input.courseTitle, 16, width - 160)) {
    center(page, serifBold, line, 16, y, TEAL);
    y -= 20;
  }

  y -= 8;
  const summary = input.courseSummary.trim() || `A Stadilearn programme in ${input.courseTitle}.`;
  for (const line of wrap(serifItalic, summary, 11, width - 200).slice(0, 4)) {
    center(page, serifItalic, line, 11, y, MUTED);
    y -= 15;
  }

  y -= 10;
  center(page, sans, input.programme, 11, y, INK);
  y -= 18;
  center(page, sans, `Completed ${formatLong(input.completedOn)}  ·  Issued ${formatLong(input.issuedAt)}`, 10, y, MUTED);

  page.drawRectangle({ x: 42, y: 56, width: width - 84, height: 1.2, color: TEAL });
  page.drawText("Certificate number", {
    x: 56,
    y: 78,
    size: 8,
    font: sans,
    color: MUTED,
  });
  page.drawText(input.code, {
    x: 56,
    y: 62,
    size: 13,
    font: sansBold,
    color: TEAL,
  });

  const verify = `Verify at ${SITE_URL.replace(/\/$/, "")}/verify-certificate`;
  page.drawText(verify, {
    x: width - 56 - sans.widthOfTextAtSize(verify, 9),
    y: 66,
    size: 9,
    font: sans,
    color: MUTED,
  });

  return doc.save();
}
