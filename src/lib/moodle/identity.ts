import { normalizeEmail } from "@/lib/auth/hash";
import type { SessionUser } from "@/lib/auth/session";
import { appDb, moodleDb, mt } from "@/lib/db";
import { MOODLE_URL } from "@/lib/site";

/**
 * Match a Stadilearn account to Moodle by email, then read related Moodle rows.
 *
 * Moodle 5.x compatibility notes:
 *   - mdl_user.email is indexed; collation is case-insensitive.
 *   - contextlevel 50 = course (CONTEXT_COURSE).
 *   - Teacher roles are matched by role archetype (editingteacher / teacher /
 *     manager), not by hardcoded role ids.
 *
 * All Moodle access is SELECT-only through moodleDb. Never write to Moodle.
 * The numeric Moodle user id is stored on users.moodle_user_id so the rest of
 * the app (dashboards, AI) can query completion without reading mdl_user.
 */

const n = (value: unknown) => {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
};

export type MoodleLinkStatus = "linked" | "not_found" | "ambiguous" | "conflict" | "unavailable";

export type MoodleLinkResult = {
  moodleUserId: number | null;
  status: MoodleLinkStatus;
};

export type TaughtMoodleCourse = {
  courseId: number;
  title: string;
  shortname: string;
  role: string;
  url: string;
  enrolled: number;
  started: number;
  completed: number;
  notStarted: number;
  inProgress: number;
};

export type MoodleCohortMembership = { id: number; name: string };

export type MoodleGroupMembership = {
  id: number;
  name: string;
  courseId: number;
  courseTitle: string;
};

export type MoodleTeacherRelated = {
  coursesTaught: TaughtMoodleCourse[];
  cohorts: MoodleCohortMembership[];
  groups: MoodleGroupMembership[];
};

type MoodleUserRow = {
  id: number;
  confirmed: number;
  suspended: number;
  lastaccess: number;
};

function isDuplicateKey(err: unknown) {
  return Boolean(err && typeof err === "object" && "code" in err && err.code === "ER_DUP_ENTRY");
}

async function recordQualityIssue(kind: string, userId: number, details: Record<string, unknown>) {
  try {
    await appDb.execute(
      `INSERT INTO data_quality_issues (kind, entity_type, entity_id, details)
       VALUES (?, 'user', ?, ?)
       ON DUPLICATE KEY UPDATE details = VALUES(details), status = 'open',
         detected_at = UTC_TIMESTAMP(3), resolved_at = NULL, resolved_by = NULL`,
      [kind, String(userId), JSON.stringify(details)],
    );
  } catch (err) {
    console.error("[moodle] data quality insert failed", err);
  }
}

/**
 * Find the Moodle user for an email. Returns null when none, several, or Moodle
 * cannot be read. Never returns the guest account (id 1).
 */
export async function findMoodleUserByEmail(email: string): Promise<MoodleLinkResult> {
  const normalised = normalizeEmail(email);
  if (!normalised) return { moodleUserId: null, status: "not_found" };

  try {
    const rows = await moodleDb.query<MoodleUserRow>(
      `SELECT id, confirmed, suspended, lastaccess
       FROM ${mt("user")}
       WHERE deleted = 0 AND id <> 1 AND email = ?
       ORDER BY confirmed DESC, suspended ASC, lastaccess DESC
       LIMIT 5`,
      [normalised],
    );
    const usable = rows.filter((r) => n(r.confirmed) === 1 && n(r.suspended) === 0);
    if (usable.length === 1) return { moodleUserId: n(usable[0].id), status: "linked" };
    if (usable.length > 1) return { moodleUserId: null, status: "ambiguous" };
    return { moodleUserId: null, status: "not_found" };
  } catch (err) {
    console.error("[moodle] user lookup by email failed", err);
    return { moodleUserId: null, status: "unavailable" };
  }
}

/**
 * Persist users.moodle_user_id when a unique confirmed Moodle user shares this
 * email. Safe to call on every login: a stored link is left as-is.
 */
export async function linkStadilearnUserToMoodle(userId: number, email: string): Promise<MoodleLinkResult> {
  const [existing] = await appDb.query<{ moodle_user_id: number | null }>(
    "SELECT moodle_user_id FROM users WHERE id = ?",
    [userId],
  );
  if (!existing) return { moodleUserId: null, status: "not_found" };
  if (existing.moodle_user_id) {
    return { moodleUserId: n(existing.moodle_user_id), status: "linked" };
  }

  const found = await findMoodleUserByEmail(email);
  if (found.status === "ambiguous") {
    await recordQualityIssue("moodle_email_ambiguous", userId, { emailDomain: email.split("@")[1] ?? "" });
    return found;
  }
  if (!found.moodleUserId) return found;

  const [taken] = await appDb.query<{ id: number }>("SELECT id FROM users WHERE moodle_user_id = ? AND id <> ?", [
    found.moodleUserId,
    userId,
  ]);
  if (taken) {
    await recordQualityIssue("moodle_user_already_linked", userId, { otherUserId: n(taken.id) });
    return { moodleUserId: null, status: "conflict" };
  }

  try {
    await appDb.execute(
      `UPDATE users
       SET moodle_user_id = ?, moodle_linked_at = UTC_TIMESTAMP(3)
       WHERE id = ? AND moodle_user_id IS NULL`,
      [found.moodleUserId, userId],
    );
  } catch (err) {
    if (isDuplicateKey(err)) {
      await recordQualityIssue("moodle_user_already_linked", userId, { moodleUserId: found.moodleUserId });
      return { moodleUserId: null, status: "conflict" };
    }
    throw err;
  }

  return { moodleUserId: found.moodleUserId, status: "linked" };
}

/** Link by email when the session does not yet have a Moodle user id. */
export async function ensureMoodleLinked(user: SessionUser): Promise<SessionUser> {
  if (user.moodleUserId) return user;
  const [row] = await appDb.query<{ email: string; moodle_user_id: number | null }>(
    "SELECT email, moodle_user_id FROM users WHERE id = ?",
    [user.id],
  );
  if (!row) return user;
  if (row.moodle_user_id) return { ...user, moodleUserId: n(row.moodle_user_id) };

  try {
    const linked = await linkStadilearnUserToMoodle(user.id, row.email);
    return { ...user, moodleUserId: linked.moodleUserId };
  } catch (err) {
    console.error("[moodle] ensure link failed", err);
    return user;
  }
}

const emptyRelated = (): MoodleTeacherRelated => ({ coursesTaught: [], cohorts: [], groups: [] });

/**
 * Courses this Moodle user teaches, plus their Moodle cohorts and groups.
 * Aggregates only — no learner names from Moodle.
 */
export async function getMoodleTeacherRelated(moodleUserId: number): Promise<MoodleTeacherRelated> {
  if (!moodleUserId) return emptyRelated();

  try {
    const taught = await moodleDb.query<{ id: number; fullname: string; shortname: string; role_name: string }>(
      `SELECT c.id, c.fullname, c.shortname, r.shortname AS role_name
       FROM ${mt("role_assignments")} ra
       JOIN ${mt("role")} r ON r.id = ra.roleid
       JOIN ${mt("context")} ctx ON ctx.id = ra.contextid AND ctx.contextlevel = 50
       JOIN ${mt("course")} c ON c.id = ctx.instanceid AND c.id <> 1
       WHERE ra.userid = ? AND r.archetype IN ('editingteacher', 'teacher', 'manager')
       ORDER BY c.fullname
       LIMIT 30`,
      [moodleUserId],
    );

    const courseIds = [...new Set(taught.map((c) => n(c.id)))];
    const stats = new Map<number, { enrolled: number; started: number; completed: number }>();
    if (courseIds.length) {
      const rows = await moodleDb.query<{ courseid: number; enrolled: number; started: number; completed: number }>(
        `SELECT e.courseid,
                COUNT(DISTINCT ue.userid) AS enrolled,
                COUNT(DISTINCT CASE WHEN cc.timestarted > 0 OR cc.timecompleted IS NOT NULL THEN cc.userid END) AS started,
                COUNT(DISTINCT CASE WHEN cc.timecompleted IS NOT NULL THEN cc.userid END) AS completed
         FROM ${mt("enrol")} e
         JOIN ${mt("user_enrolments")} ue ON ue.enrolid = e.id AND ue.status = 0
         JOIN ${mt("context")} ctx ON ctx.instanceid = e.courseid AND ctx.contextlevel = 50
         JOIN ${mt("role_assignments")} ra ON ra.contextid = ctx.id AND ra.userid = ue.userid
         JOIN ${mt("role")} r ON r.id = ra.roleid AND r.archetype = 'student'
         LEFT JOIN ${mt("course_completions")} cc ON cc.course = e.courseid AND cc.userid = ue.userid
         WHERE e.status = 0 AND e.courseid IN (?)
         GROUP BY e.courseid`,
        [courseIds],
      );
      for (const row of rows) {
        stats.set(n(row.courseid), {
          enrolled: n(row.enrolled),
          started: n(row.started),
          completed: n(row.completed),
        });
      }
    }

    const [cohorts, groups] = await Promise.all([
      moodleDb.query<{ id: number; name: string }>(
        `SELECT co.id, co.name
         FROM ${mt("cohort_members")} cm
         JOIN ${mt("cohort")} co ON co.id = cm.cohortid
         WHERE cm.userid = ?
         ORDER BY co.name
         LIMIT 30`,
        [moodleUserId],
      ),
      moodleDb.query<{ id: number; name: string; courseid: number; fullname: string }>(
        `SELECT g.id, g.name, g.courseid, c.fullname
         FROM ${mt("groups_members")} gm
         JOIN ${mt("groups")} g ON g.id = gm.groupid
         JOIN ${mt("course")} c ON c.id = g.courseid
         WHERE gm.userid = ?
         ORDER BY c.fullname, g.name
         LIMIT 30`,
        [moodleUserId],
      ),
    ]);

    const coursesTaught: TaughtMoodleCourse[] = taught.map((c) => {
      const id = n(c.id);
      const s = stats.get(id) ?? { enrolled: 0, started: 0, completed: 0 };
      return {
        courseId: id,
        title: c.fullname,
        shortname: c.shortname,
        role: c.role_name,
        url: `${MOODLE_URL}/course/view.php?id=${id}`,
        enrolled: s.enrolled,
        started: s.started,
        completed: s.completed,
        notStarted: Math.max(0, s.enrolled - s.started),
        inProgress: Math.max(0, s.started - s.completed),
      };
    });

    return {
      coursesTaught,
      cohorts: cohorts.map((c) => ({ id: n(c.id), name: c.name })),
      groups: groups.map((g) => ({
        id: n(g.id),
        name: g.name,
        courseId: n(g.courseid),
        courseTitle: g.fullname,
      })),
    };
  } catch (err) {
    console.error("[moodle] teacher related data failed", err);
    return emptyRelated();
  }
}
