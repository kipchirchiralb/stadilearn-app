import { randomBytes } from "node:crypto";
import type { SessionUser } from "@/lib/auth/session";
import { sha256 } from "@/lib/auth/hash";
import { COURSES } from "@/lib/courses";
import { getOwnMoodleProgress } from "@/lib/dashboard";
import { appDb, moodleAiDb, mt, type DbTx } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { findMoodleUserByEmail } from "@/lib/moodle/identity";
import { SITE_URL } from "@/lib/site";
import { htmlToText } from "@/lib/text";

export type CertificateResult =
  | { status: "valid"; displayName: string; course: string; completedOn: string; programme: string; code: string }
  | { status: "revoked"; code: string }
  | { status: "not_found" };

export type IssuedCertificate = {
  id: number;
  code: string;
  courseId: number;
  courseTitle: string;
  courseSummary: string;
  completedOn: string;
  issuedAt: string;
  status: "valid" | "revoked";
};

export type CertificateRequestRow = {
  id: number;
  courseId: number;
  courseTitle: string;
  status: "pending" | "issued" | "declined";
  requestedAt: string;
  declineReason: string | null;
  code: string | null;
};

export type RequestableCourse = {
  courseId: number;
  title: string;
  completedOn: string | null;
  state: "available" | "pending" | "issued";
};

export type MoodleCompletionSnapshot = {
  linked: boolean;
  enrolled: boolean;
  completed: boolean;
  completedOn: string | null;
  note: string;
};

export type CertificateApprovalRow = {
  requestId: number;
  userId: number;
  fullName: string;
  email: string;
  courseId: number;
  courseTitle: string;
  courseSummary: string;
  requestedAt: string;
  moodle: MoodleCompletionSnapshot;
};

const DEMO: Record<string, CertificateResult> = {
  "SL-DEMO-VALID": {
    status: "valid",
    displayName: "Demo Learner",
    course: "Foundations of Practical AI & Everyday Work",
    completedOn: "2026-08-01",
    programme: "Stadilearn Digital & AI Literacy Programme",
    code: "SL-DEMO-VALID",
  },
  "SL-DEMO-REVOKED": { status: "revoked", code: "SL-DEMO-REVOKED" },
};

const DEFAULT_PROGRAMME = "Stadilearn Digital & AI Literacy Programme";

function n(value: unknown) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

function isoDate(value: Date | string | null | undefined) {
  if (!value) return "";
  if (typeof value === "string") {
    const m = value.match(/^(\d{4}-\d{2}-\d{2})/);
    if (m) return m[1];
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
  }
  if (Number.isNaN(value.getTime())) return "";
  return value.toISOString().slice(0, 10);
}

function whenIso(value: Date | string | null | undefined) {
  if (!value) return "";
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

function todayNairobi() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Nairobi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function unixDay(ts: number) {
  return new Date(ts * 1000).toISOString().slice(0, 10);
}

function isDuplicate(err: unknown) {
  return Boolean(err && typeof err === "object" && "code" in err && err.code === "ER_DUP_ENTRY");
}

export function normaliseCode(input: string) {
  return input.trim().toUpperCase().replace(/\s+/g, "");
}

function newCertificateNumber() {
  const year = new Date().getUTCFullYear();
  const raw = randomBytes(5).toString("hex").toUpperCase();
  return `SL-${year}-${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
}

function catalogueSummary(title: string) {
  const needle = title.trim().toLowerCase();
  return COURSES.find((c) => c.title.toLowerCase() === needle)?.summary ?? "";
}

async function courseCopy(courseId: number, fallbackTitle: string) {
  let title = fallbackTitle;
  let summary = catalogueSummary(fallbackTitle);
  try {
    const [row] = await moodleAiDb.query<{ fullname: string; summary: string | null }>(
      `SELECT fullname, summary FROM ${mt("course")} WHERE id = ?`,
      [courseId],
    );
    if (row?.fullname) title = row.fullname;
    const fromMoodle = htmlToText(row?.summary).replace(/\s+/g, " ").trim();
    if (fromMoodle) summary = fromMoodle;
    else if (!summary) summary = catalogueSummary(title);
  } catch (err) {
    console.error("[certificates] Moodle course copy failed", err);
  }
  if (!summary) {
    summary = `A Stadilearn course of proficiency covering the skills taught in ${title}.`;
  }
  return { title, summary: summary.slice(0, 1000) };
}

async function moodleCompletion(email: string, courseId: number): Promise<MoodleCompletionSnapshot> {
  const found = await findMoodleUserByEmail(email);
  if (found.status === "unavailable") {
    return { linked: false, enrolled: false, completed: false, completedOn: null, note: "Moodle could not be read." };
  }
  if (found.status === "ambiguous") {
    return {
      linked: false,
      enrolled: false,
      completed: false,
      completedOn: null,
      note: "More than one Moodle user shares this email.",
    };
  }
  if (!found.moodleUserId) {
    return {
      linked: false,
      enrolled: false,
      completed: false,
      completedOn: null,
      note: "No confirmed Moodle user has this signup email.",
    };
  }

  const uid = found.moodleUserId;
  try {
    const [[enrolled], [completion]] = await Promise.all([
      moodleAiDb.query<{ n: number }>(
        `SELECT COUNT(*) AS n FROM ${mt("user_enrolments")} ue
         JOIN ${mt("enrol")} e ON e.id = ue.enrolid
         WHERE e.courseid = ? AND ue.userid = ? AND ue.status = 0 AND e.status = 0`,
        [courseId, uid],
      ),
      moodleAiDb.query<{ timecompleted: number | null }>(
        `SELECT timecompleted FROM ${mt("course_completions")} WHERE course = ? AND userid = ?`,
        [courseId, uid],
      ),
    ]);
    const isEnrolled = n(enrolled?.n) > 0;
    const completedOn = n(completion?.timecompleted) ? unixDay(n(completion.timecompleted)) : null;
    if (completedOn) {
      return {
        linked: true,
        enrolled: true,
        completed: true,
        completedOn,
        note: `Moodle shows completion on ${completedOn}.`,
      };
    }
    if (isEnrolled) {
      return {
        linked: true,
        enrolled: true,
        completed: false,
        completedOn: null,
        note: "Enrolled in Moodle, but course completion is not recorded.",
      };
    }
    return {
      linked: true,
      enrolled: false,
      completed: false,
      completedOn: null,
      note: "A Moodle user matches this email, but they are not enrolled on this course.",
    };
  } catch (err) {
    console.error("[certificates] Moodle completion check failed", err);
    return { linked: true, enrolled: false, completed: false, completedOn: null, note: "Moodle could not be read." };
  }
}

export async function lookupCertificate(code: string): Promise<CertificateResult> {
  const normalised = normaliseCode(code);
  if (process.env.NODE_ENV !== "production" && DEMO[normalised]) return DEMO[normalised];

  const [row] = await appDb.query<{
    verification_code: string;
    display_name: string;
    course_title: string;
    completed_on: Date | string;
    status: "valid" | "revoked";
    programme: string | null;
  }>(
    `SELECT c.verification_code, c.display_name, c.course_title, c.completed_on, c.status, p.name AS programme
     FROM certificates c
     LEFT JOIN programmes p ON p.id = c.programme_id
     WHERE c.verification_code = ?`,
    [normalised],
  );
  if (!row) return { status: "not_found" };
  if (row.status === "revoked") return { status: "revoked", code: row.verification_code };
  return {
    status: "valid",
    displayName: row.display_name,
    course: row.course_title,
    completedOn: isoDate(row.completed_on) || todayNairobi(),
    programme: row.programme || DEFAULT_PROGRAMME,
    code: row.verification_code,
  };
}

export async function getCertificateForPdf(code: string, user: SessionUser) {
  const normalised = normaliseCode(code);
  const [row] = await appDb.query<{
    id: number;
    user_id: number;
    verification_code: string;
    display_name: string;
    course_title: string;
    course_summary: string;
    completed_on: Date | string;
    issued_at: Date | string;
    status: "valid" | "revoked";
    programme: string | null;
  }>(
    `SELECT c.id, c.user_id, c.verification_code, c.display_name, c.course_title, c.course_summary,
            c.completed_on, c.issued_at, c.status, p.name AS programme
     FROM certificates c
     LEFT JOIN programmes p ON p.id = c.programme_id
     WHERE c.verification_code = ?`,
    [normalised],
  );
  if (!row || row.status !== "valid") return null;
  if (user.accountType !== "super_admin" && n(row.user_id) !== user.id) return null;
  return {
    code: row.verification_code,
    displayName: row.display_name,
    courseTitle: row.course_title,
    courseSummary: row.course_summary || catalogueSummary(row.course_title),
    completedOn: isoDate(row.completed_on) || todayNairobi(),
    issuedAt: isoDate(row.issued_at) || todayNairobi(),
    programme: row.programme || DEFAULT_PROGRAMME,
  };
}

export async function listMyCertificates(userId: number) {
  const [issued, requests] = await Promise.all([
    appDb.query<{
      id: number;
      verification_code: string;
      moodle_course_id: number;
      course_title: string;
      course_summary: string;
      completed_on: Date | string;
      issued_at: Date | string;
      status: "valid" | "revoked";
    }>(
      `SELECT id, verification_code, moodle_course_id, course_title, course_summary, completed_on, issued_at, status
       FROM certificates WHERE user_id = ? ORDER BY issued_at DESC`,
      [userId],
    ),
    appDb.query<{
      id: number;
      moodle_course_id: number;
      course_title: string;
      status: "pending" | "issued" | "declined";
      requested_at: Date | string;
      decline_reason: string | null;
      verification_code: string | null;
    }>(
      `SELECT r.id, r.moodle_course_id, r.course_title, r.status, r.requested_at, r.decline_reason,
              c.verification_code
       FROM certificate_requests r
       LEFT JOIN certificates c ON c.id = r.certificate_id
       WHERE r.user_id = ?
       ORDER BY r.requested_at DESC`,
      [userId],
    ),
  ]);

  return {
    issued: issued.map(
      (row): IssuedCertificate => ({
        id: n(row.id),
        code: row.verification_code,
        courseId: n(row.moodle_course_id),
        courseTitle: row.course_title,
        courseSummary: row.course_summary,
        completedOn: isoDate(row.completed_on),
        issuedAt: whenIso(row.issued_at),
        status: row.status,
      }),
    ),
    requests: requests.map(
      (row): CertificateRequestRow => ({
        id: n(row.id),
        courseId: n(row.moodle_course_id),
        courseTitle: row.course_title,
        status: row.status,
        requestedAt: whenIso(row.requested_at),
        declineReason: row.decline_reason,
        code: row.verification_code,
      }),
    ),
  };
}

export async function listRequestableCourses(user: SessionUser): Promise<{
  moodleLinked: boolean;
  courses: RequestableCourse[];
}> {
  const progress = await getOwnMoodleProgress(user);
  const mine = await listMyCertificates(user.id);
  const issuedCourseIds = new Set([
    ...mine.issued.filter((c) => c.status === "valid").map((c) => c.courseId),
    ...mine.requests.filter((r) => r.status === "issued").map((r) => r.courseId),
  ]);
  const pendingIds = new Set(mine.requests.filter((r) => r.status === "pending").map((r) => r.courseId));

  const courses = progress.courses.map((course): RequestableCourse => {
    let state: RequestableCourse["state"] = "available";
    if (pendingIds.has(course.courseId)) state = "pending";
    else if (issuedCourseIds.has(course.courseId)) state = "issued";
    return { courseId: course.courseId, title: course.title, completedOn: course.completedOn, state };
  });

  return { moodleLinked: progress.moodleLinked, courses };
}

export async function requestCertificate(user: SessionUser, courseId: number): Promise<{ ok: true } | { error: string }> {
  if (user.accountType === "super_admin") {
    return { error: "Use certificate approvals to issue certificates." };
  }
  if (!Number.isSafeInteger(courseId) || courseId < 1) return { error: "Choose a course." };

  const [existing] = await appDb.query<{ id: number }>(
    "SELECT id FROM certificates WHERE user_id = ? AND moodle_course_id = ? AND status = 'valid'",
    [user.id, courseId],
  );
  if (existing) return { error: "You already have a certificate for this course." };

  const [pending] = await appDb.query<{ id: number }>(
    "SELECT id FROM certificate_requests WHERE user_id = ? AND moodle_course_id = ? AND status = 'pending'",
    [user.id, courseId],
  );
  if (pending) return { error: "This request is already with Stadilearn for review." };

  const eligible = await listRequestableCourses(user);
  const course = eligible.courses.find((c) => c.courseId === courseId);
  if (!course) {
    return { error: "Request a certificate for a Moodle course you are enrolled in with this email." };
  }

  const copy = await courseCopy(courseId, course.title);
  try {
    await appDb.execute(
      `INSERT INTO certificate_requests (user_id, moodle_course_id, course_title, course_summary)
       VALUES (?, ?, ?, ?)`,
      [user.id, courseId, copy.title, copy.summary],
    );
  } catch (err) {
    if (isDuplicate(err)) return { error: "This request is already with Stadilearn for review." };
    throw err;
  }
  return { ok: true };
}

export async function listCertificateApprovals(): Promise<CertificateApprovalRow[]> {
  const rows = await appDb.query<{
    id: number;
    user_id: number;
    full_name: string;
    email: string;
    moodle_course_id: number;
    course_title: string;
    course_summary: string;
    requested_at: Date | string;
  }>(
    `SELECT r.id, r.user_id, u.full_name, u.email, r.moodle_course_id, r.course_title, r.course_summary, r.requested_at
     FROM certificate_requests r
     JOIN users u ON u.id = r.user_id
     WHERE r.status = 'pending'
     ORDER BY r.requested_at ASC
     LIMIT 80`,
  );

  return Promise.all(
    rows.map(async (row) => ({
      requestId: n(row.id),
      userId: n(row.user_id),
      fullName: row.full_name,
      email: row.email,
      courseId: n(row.moodle_course_id),
      courseTitle: row.course_title,
      courseSummary: row.course_summary,
      requestedAt: whenIso(row.requested_at),
      moodle: await moodleCompletion(row.email, n(row.moodle_course_id)),
    })),
  );
}

async function resolveCohort(tx: DbTx, userId: number, courseId: number) {
  const [row] = await tx.query<{ id: number; programme_id: number | null }>(
    `SELECT c.id, c.programme_id
     FROM cohorts c
     JOIN cohort_members m ON m.cohort_id = c.id AND m.user_id = ? AND m.removed_at IS NULL
     JOIN cohort_courses cc ON cc.cohort_id = c.id AND cc.moodle_course_id = ?
     ORDER BY c.id DESC LIMIT 1`,
    [userId, courseId],
  );
  return row ? { cohortId: n(row.id), programmeId: row.programme_id ? n(row.programme_id) : null } : { cohortId: null, programmeId: null };
}

async function notifyIssued(opts: { email: string; name: string; course: string; code: string }) {
  const verifyUrl = `${SITE_URL.replace(/\/$/, "")}/verify-certificate?code=${encodeURIComponent(opts.code)}`;
  try {
    await sendMail({
      to: opts.email,
      subject: "Your Stadilearn certificate is ready",
      text: `Congratulations ${opts.name}! Your certificate of proficiency for ${opts.course} is ready. Certificate number ${opts.code}. Verify it at ${verifyUrl}. Sign in to download the PDF from Your certificates.`,
    });
  } catch (err) {
    console.error("[certificates] issue email failed", err);
  }
}

export async function issueCertificate(
  actor: SessionUser,
  requestId: number,
  ip?: string,
): Promise<{ ok: true; code: string } | { error: string }> {
  if (actor.accountType !== "super_admin") return { error: "Only a Stadilearn admin can issue certificates." };
  if (!Number.isSafeInteger(requestId) || requestId < 1) return { error: "Choose a request to issue." };

  try {
    const issued = await appDb.transaction(async (tx) => {
      const [req] = await tx.query<{
        id: number;
        user_id: number;
        moodle_course_id: number;
        course_title: string;
        course_summary: string;
        status: string;
        email: string;
        full_name: string;
      }>(
        `SELECT r.id, r.user_id, r.moodle_course_id, r.course_title, r.course_summary, r.status,
                u.email, u.full_name
         FROM certificate_requests r JOIN users u ON u.id = r.user_id
         WHERE r.id = ?`,
        [requestId],
      );
      if (!req) return { error: "That request was not found." } as const;
      if (req.status !== "pending") return { error: "This request has already been reviewed." } as const;

      const [already] = await tx.query<{ verification_code: string }>(
        "SELECT verification_code FROM certificates WHERE user_id = ? AND moodle_course_id = ? AND status = 'valid'",
        [req.user_id, req.moodle_course_id],
      );
      if (already) return { error: "A certificate for this course is already on file." } as const;

      const moodle = await moodleCompletion(req.email, n(req.moodle_course_id));
      const completedOn = moodle.completedOn || todayNairobi();
      const link = await resolveCohort(tx, n(req.user_id), n(req.moodle_course_id));

      let code = newCertificateNumber();
      let certId = 0;
      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          const inserted = await tx.execute(
            `INSERT INTO certificates
               (verification_code, user_id, moodle_course_id, course_title, course_summary, programme_id, cohort_id,
                display_name, completed_on, status, issued_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'valid', ?)`,
            [
              code,
              req.user_id,
              req.moodle_course_id,
              req.course_title,
              req.course_summary,
              link.programmeId,
              link.cohortId,
              req.full_name,
              completedOn,
              actor.id,
            ],
          );
          certId = n(inserted.insertId);
          break;
        } catch (err) {
          if (!isDuplicate(err) || attempt === 4) throw err;
          code = newCertificateNumber();
        }
      }

      await tx.execute(
        `UPDATE certificate_requests
         SET status = 'issued', reviewed_at = CURRENT_TIMESTAMP(3), reviewed_by = ?, certificate_id = ?
         WHERE id = ?`,
        [actor.id, certId, req.id],
      );
      await tx.execute("INSERT INTO certificate_events (certificate_id, action, actor_id, note) VALUES (?, 'issued', ?, ?)", [
        certId,
        actor.id,
        moodle.completed ? "Issued after Moodle completion check." : moodle.note,
      ]);
      const [cohort] = link.cohortId
        ? await tx.query<{ institution_id: number }>("SELECT institution_id FROM cohorts WHERE id = ?", [link.cohortId])
        : [];
      await tx.execute(
        `INSERT INTO audit_events (actor_id, action, entity_type, entity_id, institution_id, ip_hash, details)
         VALUES (?, 'certificate.issued', 'certificate', ?, ?, ?, ?)`,
        [
          actor.id,
          String(certId),
          cohort?.institution_id ? n(cohort.institution_id) : null,
          ip ? sha256(ip) : null,
          JSON.stringify({ requestId: req.id, courseId: n(req.moodle_course_id), moodleCompleted: moodle.completed }),
        ],
      );

      return {
        ok: true as const,
        code,
        email: req.email,
        name: req.full_name,
        course: req.course_title,
        userId: n(req.user_id),
      };
    });

    if ("error" in issued) return issued;
    await notifyIssued({ email: issued.email, name: issued.name, course: issued.course, code: issued.code });
    return { ok: true, code: issued.code };
  } catch (err) {
    if (isDuplicate(err)) return { error: "A certificate for this course is already on file." };
    throw err;
  }
}

export async function declineCertificate(
  actor: SessionUser,
  requestId: number,
  reason: string,
  ip?: string,
): Promise<{ ok: true } | { error: string }> {
  if (actor.accountType !== "super_admin") return { error: "Only a Stadilearn admin can decline a request." };
  if (!Number.isSafeInteger(requestId) || requestId < 1) return { error: "Choose a request to decline." };
  const note = reason.trim().slice(0, 255);

  const [req] = await appDb.query<{ id: number; status: string }>(
    "SELECT id, status FROM certificate_requests WHERE id = ?",
    [requestId],
  );
  if (!req) return { error: "That request was not found." };
  if (req.status !== "pending") return { error: "This request has already been reviewed." };

  await appDb.execute(
    `UPDATE certificate_requests
     SET status = 'declined', reviewed_at = CURRENT_TIMESTAMP(3), reviewed_by = ?, decline_reason = ?
     WHERE id = ? AND status = 'pending'`,
    [actor.id, note || null, requestId],
  );
  await appDb.execute(
    `INSERT INTO audit_events (actor_id, action, entity_type, entity_id, ip_hash, details)
     VALUES (?, 'certificate.declined', 'certificate_request', ?, ?, ?)`,
    [actor.id, String(requestId), ip ? sha256(ip) : null, JSON.stringify({ reason: note || null })],
  );
  return { ok: true };
}

export async function countAssociatedCertificates(institutionIds: number[]) {
  const ids = institutionIds.filter((id) => Number.isSafeInteger(id) && id > 0);
  if (!ids.length) return 0;
  const [row] = await appDb.query<{ n: number }>(
    `SELECT COUNT(DISTINCT c.id) AS n
     FROM certificates c
     WHERE c.status = 'valid'
       AND (
         c.cohort_id IN (SELECT id FROM cohorts WHERE institution_id IN (?))
         OR c.user_id IN (
           SELECT user_id FROM institution_members WHERE institution_id IN (?) AND status = 'active'
         )
       )`,
    [ids, ids],
  );
  return n(row?.n);
}
