import { effectiveRole, type SessionUser } from "@/lib/auth/session";
import { COURSES } from "@/lib/courses";
import { aiDb, moodleAiDb, mt } from "@/lib/db";
import { MOODLE_URL } from "@/lib/site";
import { htmlToText } from "@/lib/text";
import type { ToolDef } from "./provider";

/**
 * The assistant's only route to data beyond course content: a fixed set of
 * pre-written, parameterised, read-only queries. The model picks a tool and
 * supplies IDs; it never writes SQL. Every tool:
 *   - runs on the restricted AI DB users (no PII tables, see db-grants.sql),
 *   - checks the signed-in user's scope on the server before reading,
 *   - returns aggregates or the user's own records, never other people's details.
 */

type Tool = ToolDef & {
  allowed: (user: SessionUser) => boolean;
  run: (user: SessionUser, args: Record<string, unknown>) => Promise<unknown>;
};

const MAX_ROWS = 50;

const idArg = (args: Record<string, unknown>, key: string) => {
  const n = Number(args[key]);
  return Number.isSafeInteger(n) && n > 0 ? n : null;
};

async function canSeeCohort(user: SessionUser, cohortId: number) {
  if (user.accountType === "super_admin") return true;
  const [row] = await aiDb.query<{ ok: number }>(
    `SELECT 1 AS ok FROM ai_v_cohorts c
     WHERE c.cohort_id = ? AND (
       c.institution_id IN (SELECT institution_id FROM ai_v_institution_memberships WHERE user_id = ? AND member_role = 'admin')
       OR EXISTS (SELECT 1 FROM ai_v_cohort_memberships m WHERE m.cohort_id = c.cohort_id AND m.user_id = ? AND m.member_role = 'teacher')
     )`,
    [cohortId, user.id, user.id],
  );
  return Boolean(row);
}

async function cohortStats(cohortId: number) {
  const [cohort] = await aiDb.query<{ name: string; status: string; moodle_cohort_id: number | null; institution: string }>(
    `SELECT c.name, c.status, c.moodle_cohort_id, i.name AS institution
     FROM ai_v_cohorts c JOIN ai_v_institutions i ON i.institution_id = c.institution_id WHERE c.cohort_id = ?`,
    [cohortId],
  );
  if (!cohort) return null;

  const members = await aiDb.query<{ member_role: string; moodle_user_id: number | null }>(
    "SELECT member_role, moodle_user_id FROM ai_v_cohort_memberships WHERE cohort_id = ?",
    [cohortId],
  );
  const learners = members.filter((m) => m.member_role === "learner");
  const moodleIds = new Set(learners.flatMap((m) => (m.moodle_user_id ? [Number(m.moodle_user_id)] : [])));
  if (cohort.moodle_cohort_id) {
    const rows = await moodleAiDb.query<{ userid: number }>(`SELECT userid FROM ${mt("cohort_members")} WHERE cohortid = ?`, [
      cohort.moodle_cohort_id,
    ]);
    rows.forEach((r) => moodleIds.add(Number(r.userid)));
  }

  const courses = await aiDb.query<{ moodle_course_id: number }>(
    "SELECT moodle_course_id FROM ai_v_cohort_courses WHERE cohort_id = ?",
    [cohortId],
  );
  const ids = [...moodleIds];
  const perCourse = [];
  for (const { moodle_course_id: courseId } of courses) {
    const [course] = await moodleAiDb.query<{ fullname: string }>(`SELECT fullname FROM ${mt("course")} WHERE id = ?`, [courseId]);
    if (!ids.length) {
      perCourse.push({ course: course?.fullname ?? `Course ${courseId}`, enrolled: 0, started: 0, completed: 0 });
      continue;
    }
    const [enrolled] = await moodleAiDb.query<{ n: number }>(
      `SELECT COUNT(DISTINCT ue.userid) AS n FROM ${mt("user_enrolments")} ue
       JOIN ${mt("enrol")} e ON e.id = ue.enrolid
       WHERE e.courseid = ? AND ue.userid IN (?) AND ue.status = 0 AND e.status = 0`,
      [courseId, ids],
    );
    const [completion] = await moodleAiDb.query<{ started: number; completed: number }>(
      `SELECT COUNT(CASE WHEN timestarted > 0 OR timecompleted IS NOT NULL THEN 1 END) AS started,
              COUNT(timecompleted) AS completed
       FROM ${mt("course_completions")} WHERE course = ? AND userid IN (?)`,
      [courseId, ids],
    );
    perCourse.push({
      course: course?.fullname ?? `Course ${courseId}`,
      enrolled: Number(enrolled?.n ?? 0),
      started: Number(completion?.started ?? 0),
      completed: Number(completion?.completed ?? 0),
    });
  }

  return {
    cohort: cohort.name,
    institution: cohort.institution,
    status: cohort.status,
    learnersOnStadilearn: learners.length,
    teachersOnStadilearn: members.length - learners.length,
    // Stadilearn learners with a linked Moodle account plus members of the mirrored Moodle cohort.
    learnersCountedInMoodle: ids.length,
    courses: perCourse,
    note: "Counts only. Individual learner details are not available to the assistant.",
  };
}

const TOOLS: Tool[] = [
  {
    name: "list_courses",
    description:
      "List Stadilearn courses: the public catalogue (level, duration, topic, link) and the visible Moodle courses with their IDs.",
    parameters: { type: "object", properties: {} },
    allowed: () => true,
    async run() {
      const moodle = await moodleAiDb.query<{ id: number; fullname: string; summary: string | null }>(
        `SELECT id, fullname, summary FROM ${mt("course")} WHERE visible = 1 AND id <> 1 ORDER BY sortorder LIMIT ${MAX_ROWS}`,
      );
      return {
        catalogue: COURSES.map((c) => ({
          title: c.title,
          topic: c.topic,
          level: c.level,
          duration: c.duration,
          availability: c.availability,
          url: `/learn/${c.slug}`,
        })),
        moodleCourses: moodle.map((c) => ({
          moodleCourseId: Number(c.id),
          title: c.fullname,
          summary: htmlToText(c.summary).slice(0, 300),
          url: `${MOODLE_URL}/course/view.php?id=${c.id}`,
        })),
      };
    },
  },
  {
    name: "get_my_progress",
    description: "Get the signed-in user's own Moodle enrolments, activity completion and course completion.",
    parameters: { type: "object", properties: {} },
    allowed: () => true,
    async run(user) {
      if (!user.moodleUserId) {
        return { linked: false, message: "This Stadilearn account is not yet linked to a Moodle account, so progress is unavailable." };
      }
      const uid = user.moodleUserId;
      const rows = await moodleAiDb.query<{
        id: number;
        fullname: string;
        timecompleted: number | null;
        total: number;
        done: number;
      }>(
        `SELECT c.id, c.fullname, cc.timecompleted,
           (SELECT COUNT(*) FROM ${mt("course_modules")} cm
             WHERE cm.course = c.id AND cm.completion > 0 AND cm.visible = 1 AND cm.deletioninprogress = 0) AS total,
           (SELECT COUNT(*) FROM ${mt("course_modules_completion")} cmc
             JOIN ${mt("course_modules")} cm ON cm.id = cmc.coursemoduleid
             WHERE cm.course = c.id AND cmc.userid = ? AND cmc.completionstate IN (1, 2)) AS done
         FROM ${mt("user_enrolments")} ue
         JOIN ${mt("enrol")} e ON e.id = ue.enrolid AND e.status = 0
         JOIN ${mt("course")} c ON c.id = e.courseid
         LEFT JOIN ${mt("course_completions")} cc ON cc.course = c.id AND cc.userid = ue.userid
         WHERE ue.userid = ? AND ue.status = 0
         GROUP BY c.id, c.fullname, cc.timecompleted
         LIMIT ${MAX_ROWS}`,
        [uid, uid],
      );
      return {
        linked: true,
        courses: rows.map((r) => ({
          moodleCourseId: Number(r.id),
          title: r.fullname,
          activitiesCompleted: Number(r.done),
          activitiesTracked: Number(r.total),
          courseCompletedOn: r.timecompleted ? new Date(Number(r.timecompleted) * 1000).toISOString().slice(0, 10) : null,
          url: `${MOODLE_URL}/course/view.php?id=${r.id}`,
        })),
      };
    },
  },
  {
    name: "get_my_cohorts",
    description: "List the cohorts the signed-in user belongs to (as learner or teacher) and their institutions.",
    parameters: { type: "object", properties: {} },
    allowed: () => true,
    async run(user) {
      const rows = await aiDb.query<{ cohort_id: number; name: string; status: string; member_role: string; institution: string }>(
        `SELECT c.cohort_id, c.name, c.status, m.member_role, i.name AS institution
         FROM ai_v_cohort_memberships m
         JOIN ai_v_cohorts c ON c.cohort_id = m.cohort_id
         JOIN ai_v_institutions i ON i.institution_id = c.institution_id
         WHERE m.user_id = ? LIMIT ${MAX_ROWS}`,
        [user.id],
      );
      return { cohorts: rows.map((r) => ({ ...r, cohort_id: Number(r.cohort_id) })) };
    },
  },
  {
    name: "get_cohort_summary",
    description:
      "Aggregated statistics for one cohort: learner and teacher counts, and per-course enrolment, started and completed counts. Only for cohorts the user teaches or administers.",
    parameters: { type: "object", properties: { cohort_id: { type: "integer", description: "Cohort ID from get_my_cohorts or get_institution_summary" } }, required: ["cohort_id"] },
    allowed: (u) => u.accountType !== "learner",
    async run(user, args) {
      const cohortId = idArg(args, "cohort_id");
      if (!cohortId) return { error: "A valid cohort_id is required." };
      if (!(await canSeeCohort(user, cohortId))) return { error: "You do not have access to that cohort." };
      return (await cohortStats(cohortId)) ?? { error: "Cohort not found." };
    },
  },
  {
    name: "get_institution_summary",
    description:
      "Summary of an institution the user administers: cohorts with learner counts, and certificates issued. The super admin may ask about any institution.",
    parameters: { type: "object", properties: { institution_id: { type: "integer", description: "Optional. Defaults to the user's institution." } } },
    allowed: (u) => u.accountType === "super_admin" || u.adminOf.length > 0,
    async run(user, args) {
      const requested = idArg(args, "institution_id");
      const institutionId = requested ?? user.adminOf[0];
      if (!institutionId) return { error: "Specify an institution_id." };
      if (user.accountType !== "super_admin" && !user.adminOf.includes(institutionId)) {
        return { error: "You do not administer that institution." };
      }
      const [inst] = await aiDb.query<{ name: string; type: string; county: string | null; status: string }>(
        "SELECT name, type, county, status FROM ai_v_institutions WHERE institution_id = ?",
        [institutionId],
      );
      if (!inst) return { error: "Institution not found." };
      const cohorts = await aiDb.query<{ cohort_id: number; name: string; status: string; learners: number; teachers: number; certificates: number }>(
        `SELECT c.cohort_id, c.name, c.status,
           (SELECT COUNT(*) FROM ai_v_cohort_memberships m WHERE m.cohort_id = c.cohort_id AND m.member_role = 'learner') AS learners,
           (SELECT COUNT(*) FROM ai_v_cohort_memberships m WHERE m.cohort_id = c.cohort_id AND m.member_role = 'teacher') AS teachers,
           (SELECT COALESCE(SUM(issued), 0) FROM ai_v_certificate_counts k WHERE k.cohort_id = c.cohort_id) AS certificates
         FROM ai_v_cohorts c WHERE c.institution_id = ? ORDER BY c.name LIMIT ${MAX_ROWS}`,
        [institutionId],
      );
      return {
        institution: inst,
        cohorts: cohorts.map((c) => ({
          cohortId: Number(c.cohort_id),
          name: c.name,
          status: c.status,
          learners: Number(c.learners),
          teachers: Number(c.teachers),
          certificates: Number(c.certificates),
        })),
      };
    },
  },
  {
    name: "get_platform_summary",
    description: "Platform-wide totals for the Stadilearn admin: accounts by type, institutions, cohorts, Moodle courses and completions, certificates.",
    parameters: { type: "object", properties: {} },
    allowed: (u) => u.accountType === "super_admin",
    async run() {
      const [users, institutions, [cohorts], [certs], [courses], [completions]] = await Promise.all([
        aiDb.query("SELECT account_type, status, users FROM ai_v_user_counts"),
        aiDb.query("SELECT status, COUNT(*) AS n FROM ai_v_institutions GROUP BY status"),
        aiDb.query<{ n: number }>("SELECT COUNT(*) AS n FROM ai_v_cohorts"),
        aiDb.query<{ n: number }>("SELECT COALESCE(SUM(issued), 0) AS n FROM ai_v_certificate_counts"),
        moodleAiDb.query<{ n: number }>(`SELECT COUNT(*) AS n FROM ${mt("course")} WHERE visible = 1 AND id <> 1`),
        moodleAiDb.query<{ n: number }>(`SELECT COUNT(*) AS n FROM ${mt("course_completions")} WHERE timecompleted IS NOT NULL`),
      ]);
      return {
        accounts: users,
        institutions,
        cohorts: Number(cohorts.n),
        visibleMoodleCourses: Number(courses.n),
        moodleCourseCompletions: Number(completions.n),
        certificatesIssued: Number(certs.n),
      };
    },
  },
];

export function toolsFor(user: SessionUser): ToolDef[] {
  return TOOLS.filter((t) => t.allowed(user)).map(({ name, description, parameters }) => ({ name, description, parameters }));
}

export async function runTool(user: SessionUser, name: string, args: Record<string, unknown>) {
  const tool = TOOLS.find((t) => t.name === name);
  if (!tool || !tool.allowed(user)) return { error: `Tool ${name} is not available to a ${effectiveRole(user)}.` };
  try {
    return await tool.run(user, args);
  } catch (err) {
    console.error(`[ai] tool ${name} failed`, err);
    return { error: "That information is temporarily unavailable." };
  }
}
