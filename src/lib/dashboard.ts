import type { SessionUser } from "@/lib/auth/session";
import { effectiveRole } from "@/lib/auth/session";
import { appDb, moodleAiDb, mt } from "@/lib/db";
import {
  getMoodleTeacherRelated,
  linkStadilearnUserToMoodle,
  type MoodleCohortMembership,
  type MoodleGroupMembership,
  type MoodleLinkStatus,
  type TaughtMoodleCourse,
} from "@/lib/moodle/identity";
import { MOODLE_URL } from "@/lib/site";

const MAX_COHORTS = 30;
const MAX_ROSTER = 80;

function n(value: unknown) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

function formatDay(value: Date | string | null) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-KE", { dateStyle: "medium", timeZone: "Africa/Nairobi" });
}

export type CourseProgressStatus = "not_linked" | "not_enrolled" | "not_started" | "in_progress" | "completed";

export type CourseInsight = {
  courseId: number;
  title: string;
  url: string;
  enrolled: number;
  started: number;
  completed: number;
  notStarted: number;
  inProgress: number;
};

export type RosterLearner = {
  userId: number;
  fullName: string;
  moodleLinked: boolean;
  certificates: number;
  courses: { courseId: number; status: CourseProgressStatus }[];
};

export type RosterTrainer = { userId: number; fullName: string };

export type CohortInsight = {
  id: number;
  name: string;
  institution: string;
  programme: string | null;
  status: string;
  startsOn: string | null;
  endsOn: string | null;
  learners: number;
  teachers: number;
  learnersInMoodle: number;
  unlinkedLearners: number;
  unnamedMoodleMembers: number;
  certificates: number;
  courses: CourseInsight[];
  trainers: RosterTrainer[];
  roster: RosterLearner[];
  rosterTruncated: boolean;
  moodleUnavailable?: boolean;
};

export type TeacherAlert = {
  icon: string;
  title: string;
  body: string;
  tone: "info" | "warning";
};

export type LearnerCourse = {
  courseId: number;
  title: string;
  url: string;
  activitiesCompleted: number;
  activitiesTracked: number;
  completedOn: string | null;
};

export type LearnerDashboardData = {
  moodleLinked: boolean;
  moodleLinkStatus: MoodleLinkStatus | "unlinked";
  courses: LearnerCourse[];
};

export type TeacherDashboardData = {
  roleLabel: string;
  training: LearnerDashboardData;
  cohorts: CohortInsight[];
  taughtCourses: TaughtMoodleCourse[];
  moodleCohorts: MoodleCohortMembership[];
  moodleGroups: MoodleGroupMembership[];
  alerts: TeacherAlert[];
  moodleLinked: boolean;
  moodleLinkStatus: MoodleLinkStatus | "unlinked";
  totals: { learners: number; completed: number; certificates: number; notStarted: number };
};

export type { MoodleCohortMembership, MoodleGroupMembership, TaughtMoodleCourse };

type CohortRow = {
  id: number;
  institution_id: number;
  name: string;
  status: string;
  starts_on: Date | string | null;
  ends_on: Date | string | null;
  moodle_cohort_id: number | null;
  institution: string;
  programme: string | null;
};

type MemberRow = {
  user_id: number;
  full_name: string;
  member_role: "learner" | "teacher";
  moodle_user_id: number | null;
};

async function listVisibleCohorts(user: SessionUser): Promise<CohortRow[]> {
  const select = `SELECT c.id, c.institution_id, c.name, c.status, c.starts_on, c.ends_on, c.moodle_cohort_id,
        i.name AS institution, p.name AS programme
     FROM cohorts c
     JOIN institutions i ON i.id = c.institution_id
     LEFT JOIN programmes p ON p.id = c.programme_id`;

  if (user.accountType === "super_admin") {
    return appDb.query<CohortRow>(`${select} WHERE c.status <> 'archived' ORDER BY i.name, c.name LIMIT ${MAX_COHORTS}`);
  }

  const taught = await appDb.query<CohortRow>(
    `${select}
     JOIN cohort_members m ON m.cohort_id = c.id AND m.user_id = ? AND m.member_role = 'teacher' AND m.removed_at IS NULL
     WHERE c.status <> 'archived'
     ORDER BY i.name, c.name LIMIT ${MAX_COHORTS}`,
    [user.id],
  );

  const admin =
    user.adminOf.length > 0
      ? await appDb.query<CohortRow>(
          `${select} WHERE c.status <> 'archived' AND c.institution_id IN (?) ORDER BY i.name, c.name LIMIT ${MAX_COHORTS}`,
          [user.adminOf],
        )
      : [];

  const byId = new Map<number, CohortRow>();
  for (const row of [...taught, ...admin]) byId.set(n(row.id), row);
  return [...byId.values()].sort((a, b) => a.institution.localeCompare(b.institution) || a.name.localeCompare(b.name));
}

async function moodleProgressMaps(courseId: number, userIds: number[]) {
  const enrolled = new Set<number>();
  const started = new Set<number>();
  const completed = new Set<number>();
  if (!userIds.length) return { enrolled, started, completed };
  const enrolledRows = await moodleAiDb.query<{ userid: number }>(
    `SELECT DISTINCT ue.userid FROM ${mt("user_enrolments")} ue
     JOIN ${mt("enrol")} e ON e.id = ue.enrolid
     WHERE e.courseid = ? AND ue.userid IN (?) AND ue.status = 0 AND e.status = 0`,
    [courseId, userIds],
  );
  enrolledRows.forEach((r) => enrolled.add(n(r.userid)));
  const completionRows = await moodleAiDb.query<{ userid: number; timestarted: number | null; timecompleted: number | null }>(
    `SELECT userid, timestarted, timecompleted FROM ${mt("course_completions")} WHERE course = ? AND userid IN (?)`,
    [courseId, userIds],
  );
  for (const r of completionRows) {
    const id = n(r.userid);
    if (n(r.timecompleted)) completed.add(id);
    if (n(r.timestarted) || n(r.timecompleted)) started.add(id);
  }
  return { enrolled, started, completed };
}

function statusFor(moodleUserId: number | null, maps: Awaited<ReturnType<typeof moodleProgressMaps>>): CourseProgressStatus {
  if (!moodleUserId) return "not_linked";
  if (!maps.enrolled.has(moodleUserId)) return "not_enrolled";
  if (maps.completed.has(moodleUserId)) return "completed";
  if (maps.started.has(moodleUserId)) return "in_progress";
  return "not_started";
}

async function loadCohortInsight(row: CohortRow): Promise<CohortInsight> {
  const cohortId = n(row.id);
  const members = await appDb.query<MemberRow>(
    `SELECT u.id AS user_id, u.full_name, m.member_role, u.moodle_user_id
     FROM cohort_members m JOIN users u ON u.id = m.user_id
     WHERE m.cohort_id = ? AND m.removed_at IS NULL AND u.status = 'active'
     ORDER BY m.member_role DESC, u.full_name`,
    [cohortId],
  );
  const learners = members.filter((m) => m.member_role === "learner");
  const teachers = members.filter((m) => m.member_role === "teacher");
  const linkedIds = learners.flatMap((m) => (m.moodle_user_id ? [n(m.moodle_user_id)] : []));
  const moodleIds = new Set(linkedIds);

  if (row.moodle_cohort_id) {
    try {
      const extra = await moodleAiDb.query<{ userid: number }>(`SELECT userid FROM ${mt("cohort_members")} WHERE cohortid = ?`, [
        n(row.moodle_cohort_id),
      ]);
      extra.forEach((r) => moodleIds.add(n(r.userid)));
    } catch (err) {
      console.error("[dashboard] Moodle cohort members failed", err);
    }
  }

  const certRows = await appDb.query<{ user_id: number; n: number }>(
    "SELECT user_id, COUNT(*) AS n FROM certificates WHERE cohort_id = ? AND status = 'valid' GROUP BY user_id",
    [cohortId],
  );
  const certsByUser = new Map(certRows.map((r) => [n(r.user_id), n(r.n)]));

  const linkedCourses = await appDb.query<{ moodle_course_id: number }>(
    "SELECT moodle_course_id FROM cohort_courses WHERE cohort_id = ?",
    [cohortId],
  );

  let moodleUnavailable = false;
  const courses: CourseInsight[] = [];
  const progressByCourse = new Map<number, Awaited<ReturnType<typeof moodleProgressMaps>>>();
  const ids = [...moodleIds];

  for (const { moodle_course_id: courseId } of linkedCourses) {
    const id = n(courseId);
    let title = `Course ${id}`;
    try {
      const [course] = await moodleAiDb.query<{ fullname: string }>(`SELECT fullname FROM ${mt("course")} WHERE id = ?`, [id]);
      if (course?.fullname) title = course.fullname;
      const maps = await moodleProgressMaps(id, ids);
      progressByCourse.set(id, maps);
      const enrolled = maps.enrolled.size;
      const started = maps.started.size;
      const completed = maps.completed.size;
      courses.push({
        courseId: id,
        title,
        url: `${MOODLE_URL}/course/view.php?id=${id}`,
        enrolled,
        started,
        completed,
        notStarted: Math.max(0, enrolled - started),
        inProgress: Math.max(0, started - completed),
      });
    } catch (err) {
      console.error("[dashboard] Moodle course stats failed", err);
      moodleUnavailable = true;
      progressByCourse.set(id, { enrolled: new Set(), started: new Set(), completed: new Set() });
      courses.push({
        courseId: id,
        title,
        url: `${MOODLE_URL}/course/view.php?id=${id}`,
        enrolled: 0,
        started: 0,
        completed: 0,
        notStarted: 0,
        inProgress: 0,
      });
    }
  }

  const rosterLearners = learners.slice(0, MAX_ROSTER);
  const roster: RosterLearner[] = rosterLearners.map((m) => {
    const moodleUserId = m.moodle_user_id ? n(m.moodle_user_id) : null;
    return {
      userId: n(m.user_id),
      fullName: m.full_name,
      moodleLinked: Boolean(moodleUserId),
      certificates: certsByUser.get(n(m.user_id)) ?? 0,
      courses: courses.map((course) => ({
        courseId: course.courseId,
        status: statusFor(moodleUserId, progressByCourse.get(course.courseId)!),
      })),
    };
  });

  return {
    id: cohortId,
    name: row.name,
    institution: row.institution,
    programme: row.programme,
    status: row.status,
    startsOn: formatDay(row.starts_on),
    endsOn: formatDay(row.ends_on),
    learners: learners.length,
    teachers: teachers.length,
    learnersInMoodle: moodleIds.size,
    unlinkedLearners: learners.filter((m) => !m.moodle_user_id).length,
    unnamedMoodleMembers: Math.max(0, moodleIds.size - linkedIds.length),
    certificates: certRows.reduce((sum, r) => sum + n(r.n), 0),
    courses,
    trainers: teachers.map((t) => ({ userId: n(t.user_id), fullName: t.full_name })),
    roster,
    rosterTruncated: learners.length > MAX_ROSTER,
    moodleUnavailable,
  };
}

function linkAlert(status: MoodleLinkStatus | "unlinked"): TeacherAlert | null {
  if (status === "linked") return null;
  if (status === "unavailable") {
    return {
      icon: "cloud_off",
      title: "Moodle could not be reached",
      body: "We could not look up your Moodle account just now. Teaching, grading and forums still happen in Moodle with a separate login.",
      tone: "warning",
    };
  }
  if (status === "ambiguous" || status === "conflict") {
    return {
      icon: "link_off",
      title: "Your Moodle account needs a check",
      body: "More than one Moodle record matches this email, or it is already linked to another Stadilearn account. Contact support so we can match you without guessing.",
      tone: "warning",
    };
  }
  return {
    icon: "link_off",
    title: "No Moodle user with this email",
    body: "Sign up to Moodle with the same email you use on Stadilearn. We read Moodle by that address (never write to it) to show your training and the courses you teach.",
    tone: "info",
  };
}

function buildAlerts(
  cohorts: CohortInsight[],
  linkStatus: MoodleLinkStatus | "unlinked",
  taughtCourseCount: number,
): TeacherAlert[] {
  const alerts: TeacherAlert[] = [];
  const link = linkAlert(linkStatus);
  if (link) alerts.push(link);
  if (!cohorts.length) {
    if (!taughtCourseCount) {
      alerts.push({
        icon: "groups",
        title: "No cohorts assigned yet",
        body: "Your programme administrator assigns you to cohorts. Until then you can follow your own training pathway and draft with the trainer assistant.",
        tone: "info",
      });
    }
    return alerts;
  }
  const unlinked = cohorts.reduce((sum, c) => sum + c.unlinkedLearners, 0);
  if (unlinked) {
    alerts.push({
      icon: "person_off",
      title: `${unlinked} learner${unlinked === 1 ? "" : "s"} not linked to Moodle`,
      body: "They appear on the roster, but enrolment and completion stay blank until they sign up to Stadilearn with the same email they use in Moodle.",
      tone: "warning",
    });
  }
  const notStarted = cohorts.reduce((sum, c) => sum + c.courses.reduce((s, course) => s + course.notStarted, 0), 0);
  if (notStarted) {
    alerts.push({
      icon: "trending_down",
      title: `${notStarted} enrolment${notStarted === 1 ? "" : "s"} not yet started`,
      body: "Named on the roster as not started. Follow up in Moodle, or draft a reminder with the trainer assistant.",
      tone: "warning",
    });
  }
  if (cohorts.some((c) => !c.courses.length)) {
    alerts.push({
      icon: "sync_problem",
      title: "A cohort has no Moodle courses linked",
      body: "Ask your programme administrator to attach the Moodle courses this cohort should take.",
      tone: "warning",
    });
  }
  if (cohorts.some((c) => c.moodleUnavailable)) {
    alerts.push({
      icon: "cloud_off",
      title: "Some Moodle figures could not be read",
      body: "Names from Stadilearn are shown; live enrolment and completion from Moodle is temporarily unavailable.",
      tone: "warning",
    });
  }
  return alerts;
}

const ROLE_LABEL: Record<string, string> = {
  learner: "Learner",
  teacher: "Teacher / trainer",
  institution_admin: "Institution admin",
  super_admin: "Stadilearn admin",
};

async function resolveMoodleLink(user: SessionUser): Promise<{
  user: SessionUser;
  status: MoodleLinkStatus | "unlinked";
}> {
  if (user.moodleUserId) return { user, status: "linked" };
  const [row] = await appDb.query<{ email: string }>("SELECT email FROM users WHERE id = ?", [user.id]);
  if (!row) return { user, status: "unlinked" };
  try {
    const linked = await linkStadilearnUserToMoodle(user.id, row.email);
    return { user: { ...user, moodleUserId: linked.moodleUserId }, status: linked.status };
  } catch (err) {
    console.error("[dashboard] Moodle email link failed", err);
    return { user, status: "unavailable" };
  }
}

async function loadOwnMoodleCourses(uid: number): Promise<LearnerCourse[]> {
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
     LIMIT 30`,
    [uid, uid],
  );
  return rows.map((r) => ({
    courseId: n(r.id),
    title: r.fullname,
    url: `${MOODLE_URL}/course/view.php?id=${r.id}`,
    activitiesCompleted: n(r.done),
    activitiesTracked: n(r.total),
    completedOn: r.timecompleted ? formatDay(new Date(n(r.timecompleted) * 1000)) : null,
  }));
}

export async function getOwnMoodleProgress(user: SessionUser): Promise<LearnerDashboardData> {
  const resolved = await resolveMoodleLink(user);
  if (!resolved.user.moodleUserId) {
    return { moodleLinked: false, moodleLinkStatus: resolved.status, courses: [] };
  }
  try {
    return {
      moodleLinked: true,
      moodleLinkStatus: "linked",
      courses: await loadOwnMoodleCourses(resolved.user.moodleUserId),
    };
  } catch (err) {
    console.error("[dashboard] Moodle progress failed", err);
    return { moodleLinked: true, moodleLinkStatus: "linked", courses: [] };
  }
}

export async function getCohortsForUser(user: SessionUser, institutionIds?: number[]): Promise<CohortInsight[]> {
  const allowed = institutionIds
    ?.map(n)
    .filter((id) => id > 0 && (user.accountType === "super_admin" || user.adminOf.includes(id)));
  const rows = await listVisibleCohorts(user);
  const scoped = allowed ? rows.filter((row) => allowed.includes(n(row.institution_id))) : rows;
  return Promise.all(scoped.map(loadCohortInsight));
}

export async function getTeacherDashboard(user: SessionUser): Promise<TeacherDashboardData> {
  const resolved = await resolveMoodleLink(user);
  user = resolved.user;
  const trainingPromise: Promise<LearnerDashboardData> = user.moodleUserId
    ? loadOwnMoodleCourses(user.moodleUserId)
        .then((courses) => ({ moodleLinked: true, moodleLinkStatus: "linked" as const, courses }))
        .catch((err) => {
          console.error("[dashboard] Moodle progress failed", err);
          return { moodleLinked: true, moodleLinkStatus: "linked" as const, courses: [] };
        })
    : Promise.resolve({ moodleLinked: false, moodleLinkStatus: resolved.status, courses: [] });
  const [cohorts, training, related] = await Promise.all([
    getCohortsForUser(user),
    trainingPromise,
    user.moodleUserId
      ? getMoodleTeacherRelated(user.moodleUserId)
      : Promise.resolve({ coursesTaught: [], cohorts: [], groups: [] }),
  ]);
  const totals = cohorts.reduce(
    (acc, c) => {
      acc.learners += c.learners;
      acc.certificates += c.certificates;
      for (const course of c.courses) {
        acc.completed += course.completed;
        acc.notStarted += course.notStarted;
      }
      return acc;
    },
    { learners: 0, completed: 0, certificates: 0, notStarted: 0 },
  );
  for (const course of related.coursesTaught) {
    if (!cohorts.some((c) => c.courses.some((cc) => cc.courseId === course.courseId))) {
      totals.completed += course.completed;
      totals.notStarted += course.notStarted;
    }
  }
  const linkStatus = training.moodleLinkStatus !== "unlinked" ? training.moodleLinkStatus : resolved.status;
  return {
    roleLabel: ROLE_LABEL[effectiveRole(user)] ?? "Teacher / trainer",
    training,
    cohorts,
    taughtCourses: related.coursesTaught,
    moodleCohorts: related.cohorts,
    moodleGroups: related.groups,
    alerts: buildAlerts(cohorts, linkStatus, related.coursesTaught.length),
    moodleLinked: Boolean(user.moodleUserId),
    moodleLinkStatus: linkStatus,
    totals,
  };
}

export function getLearnerDashboard(user: SessionUser) {
  return getOwnMoodleProgress(user);
}
