import { appDb, moodleDb, mt } from "@/lib/db";
import { MOODLE_URL } from "@/lib/site";

function n(value: unknown) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

function asDay(value: unknown) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const text = String(value ?? "");
  return text.length >= 10 ? text.slice(0, 10) : text;
}

function pretty(value: string) {
  return LABELS[value] ?? value.replace(/_/g, " ");
}

const LABELS: Record<string, string> = {
  learner: "Learners",
  teacher: "Teachers",
  super_admin: "Super admins",
  pending: "Pending",
  active: "Active",
  locked: "Locked",
  disabled: "Disabled",
  suspended: "Suspended",
  invited: "Invited",
  removed: "Removed",
  planned: "Planned",
  completed: "Completed",
  archived: "Archived",
  draft: "Draft",
  valid: "Valid",
  revoked: "Revoked",
  open: "Open",
  assigned: "Assigned",
  waiting_on_user: "Waiting on user",
  resolved: "Resolved",
  closed: "Closed",
  reviewing: "Reviewing",
  dismissed: "Dismissed",
  queued: "Queued",
  sending: "Sending",
  sent: "Sent",
  failed: "Failed",
  cancelled: "Cancelled",
  running: "Running",
  succeeded: "Succeeded",
  partial: "Partial",
  ignored: "Ignored",
  building: "Building",
  retired: "Retired",
  primary_school: "Primary school",
  secondary_school: "Secondary school",
  tvet: "TVET",
  university: "University",
  ngo: "NGO",
  government: "Government",
  company: "Company",
  other: "Other",
  female: "Female",
  male: "Male",
  prefer_not: "Prefer not to say",
  under_18: "Under 18",
  "18_24": "18–24",
  "25_34": "25–34",
  "35_44": "35–44",
  "45_54": "45–54",
  "55_plus": "55+",
  tutor: "Tutor",
  support: "Support",
  trainer: "Trainer",
  indexer: "Indexer",
  chat: "Chat",
  embed: "Embed",
  ok: "Succeeded",
  error: "Error",
  quota_blocked: "Quota blocked",
  contact_form: "Contact form",
  ai_escalation: "AI escalation",
  dashboard: "Dashboard",
  account: "Account",
  enrolment: "Enrolment",
  course: "Course",
  certificate: "Certificate",
  ai: "AI",
  institution: "Institution",
  student: "Students",
  editingteacher: "Editing teachers",
  manager: "Managers",
  coursecreator: "Course creators",
  guest: "Guests",
  finished: "Finished",
  inprogress: "In progress",
  abandoned: "Abandoned",
  overdue: "Overdue",
  submitted: "Submitted",
  new: "Draft",
  terms: "Terms",
  privacy: "Privacy",
  age_or_guardian: "Age or guardian",
  demographics: "Demographics",
  marketing: "Marketing",
};

export type NamedCount = { label: string; key: string; n: number };
export type SeriesPoint = { date: string; n: number };

export type InstitutionRow = {
  id: number;
  name: string;
  type: string;
  status: string;
  members: number;
  cohorts: number;
};

export type QualityRow = {
  kind: string;
  entityType: string;
  entityId: string;
  detectedAt: string;
};

export type SyncRow = {
  jobName: string;
  status: string;
  recordsRead: number;
  recordsWritten: number;
  recordsSkipped: number;
  startedAt: string;
  finishedAt: string | null;
};

export type MoodleCourseRow = {
  id: number;
  title: string;
  shortname: string;
  category: string;
  visible: boolean;
  enrolled: number;
  completed: number;
  url: string;
};

export type MoodleCohortRow = { name: string; members: number };

export type SuperAdminDashboardData = {
  generatedAt: string;
  platform: {
    users: {
      total: number;
      linked: number;
      unlinked: number;
      loggedIn30d: number;
      activeSessions: number;
      byType: NamedCount[];
      byStatus: NamedCount[];
      byCounty: NamedCount[];
      byGender: NamedCount[];
      byAgeBand: NamedCount[];
      signups30d: SeriesPoint[];
    };
    institutions: {
      total: number;
      admins: number;
      members: number;
      byStatus: NamedCount[];
      byType: NamedCount[];
      top: InstitutionRow[];
    };
    programmes: number;
    cohorts: {
      total: number;
      linkedToMoodle: number;
      courseLinks: number;
      byStatus: NamedCount[];
      learners: number;
      teachers: number;
    };
    certificates: { total: number; byStatus: NamedCount[]; issued30d: SeriesPoint[] };
    ai: {
      requests30d: number;
      tokens30d: number;
      costUsd30d: number;
      byAssistant: NamedCount[];
      byOutcome: NamedCount[];
      daily: SeriesPoint[];
      conversations: NamedCount[];
      flags: NamedCount[];
    };
    support: { byStatus: NamedCount[]; byCategory: NamedCount[]; bySource: NamedCount[] };
    notifications: NamedCount[];
    consents: NamedCount[];
    quality: { open: number; byKind: NamedCount[]; recent: QualityRow[] };
    sync: SyncRow[];
    rag: { documents: number; withdrawn: number; chunks: number; versions: NamedCount[] };
    reports: number;
    audit7d: number;
  };
  moodle: {
    available: boolean;
    error?: string;
    users: {
      total: number;
      confirmed: number;
      suspended: number;
      neverLoggedIn: number;
      active7d: number;
      active30d: number;
      new30d: SeriesPoint[];
    };
    roles: NamedCount[];
    courses: {
      total: number;
      visible: number;
      hidden: number;
      completionEnabled: number;
      byCategory: NamedCount[];
      top: MoodleCourseRow[];
    };
    enrolments: {
      active: number;
      completed: number;
      started: number;
      completions30d: SeriesPoint[];
    };
    activity: {
      assignmentsSubmitted: number;
      assignmentsUngraded: number;
      quizFinished: number;
      quizInProgress: number;
      forumDiscussions: number;
      forumPosts: number;
      groups: number;
      badgesIssued: number;
      modules: number;
      actions24h: number | null;
    };
    cohorts: { total: number; members: number; top: MoodleCohortRow[] };
  };
};

type CountRow = { k: string; n: number | string };
type DayRow = { d: unknown; n: number | string };
type ScalarRow = { n: number | string };

function named(rows: CountRow[]): NamedCount[] {
  return rows.map((row) => ({ key: String(row.k), label: pretty(String(row.k)), n: n(row.n) }));
}

function lastNDates(days: number) {
  const out: string[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function fillSeries(rows: DayRow[], days = 30): SeriesPoint[] {
  const map = new Map<string, number>();
  for (const row of rows) map.set(asDay(row.d), n(row.n));
  return lastNDates(days).map((date) => ({ date, n: map.get(date) ?? 0 }));
}

async function scalar(sql: string, params: (string | number)[] = []) {
  const [row] = await appDb.query<ScalarRow>(sql, params);
  return n(row?.n);
}

async function tryMoodle<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.error("[admin-dashboard] Moodle query failed", err);
    return fallback;
  }
}

async function moodleScalar(sql: string, params: (string | number)[] = []) {
  const [row] = await moodleDb.query<ScalarRow>(sql, params);
  return n(row?.n);
}

function formatWhen(value: Date | string | null) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export async function getSuperAdminDashboard(): Promise<SuperAdminDashboardData> {
  const [platform, moodle] = await Promise.all([loadPlatform(), loadMoodle()]);
  return { generatedAt: new Date().toISOString(), platform, moodle };
}

async function loadPlatform(): Promise<SuperAdminDashboardData["platform"]> {
  const [
    byType,
    byStatus,
    linkedRow,
    loggedIn30d,
    activeSessions,
    byCounty,
    byGender,
    byAgeBand,
    signups,
    instStatus,
    instType,
    instTotal,
    instAdmins,
    instMembers,
    instTop,
    programmes,
    cohortStatus,
    cohortTotal,
    cohortLinked,
    courseLinks,
    cohortLearners,
    cohortTeachers,
    certStatus,
    certIssued,
    aiAssistant,
    aiOutcome,
    aiDaily,
    aiTotals,
    conversations,
    flags,
    ticketStatus,
    ticketCategory,
    ticketSource,
    notifications,
    consents,
    dqOpen,
    dqKind,
    dqRecent,
    syncRuns,
    ragDocs,
    ragWithdrawn,
    ragChunks,
    ragVersions,
    reports,
    audit7d,
  ] = await Promise.all([
    appDb.query<CountRow>("SELECT account_type AS k, COUNT(*) AS n FROM users GROUP BY account_type"),
    appDb.query<CountRow>("SELECT status AS k, COUNT(*) AS n FROM users GROUP BY status"),
    appDb.query<ScalarRow>("SELECT COUNT(*) AS n FROM users WHERE moodle_user_id IS NOT NULL"),
    scalar("SELECT COUNT(*) AS n FROM users WHERE last_login_at >= UTC_TIMESTAMP(3) - INTERVAL 30 DAY"),
    scalar(
      `SELECT COUNT(*) AS n FROM sessions
       WHERE revoked_at IS NULL AND idle_expires_at > UTC_TIMESTAMP(3) AND absolute_expires_at > UTC_TIMESTAMP(3)`,
    ),
    appDb.query<CountRow>(
      `SELECT COALESCE(c.name, 'Not set') AS k, COUNT(*) AS n
       FROM users u LEFT JOIN counties c ON c.id = u.county_id
       GROUP BY COALESCE(c.name, 'Not set') ORDER BY n DESC LIMIT 12`,
    ),
    appDb.query<CountRow>("SELECT gender AS k, COUNT(*) AS n FROM users WHERE gender IS NOT NULL GROUP BY gender"),
    appDb.query<CountRow>("SELECT age_band AS k, COUNT(*) AS n FROM users WHERE age_band IS NOT NULL GROUP BY age_band"),
    appDb.query<DayRow>(
      `SELECT DATE(created_at) AS d, COUNT(*) AS n FROM users
       WHERE created_at >= UTC_DATE() - INTERVAL 29 DAY GROUP BY DATE(created_at) ORDER BY d`,
    ),
    appDb.query<CountRow>("SELECT status AS k, COUNT(*) AS n FROM institutions GROUP BY status"),
    appDb.query<CountRow>("SELECT type AS k, COUNT(*) AS n FROM institutions GROUP BY type"),
    scalar("SELECT COUNT(*) AS n FROM institutions"),
    scalar("SELECT COUNT(*) AS n FROM institution_members WHERE member_role = 'admin' AND status = 'active'"),
    scalar("SELECT COUNT(*) AS n FROM institution_members WHERE status = 'active'"),
    appDb.query<{
      id: number;
      name: string;
      type: string;
      status: string;
      members: number;
      cohorts: number;
    }>(
      `SELECT i.id, i.name, i.type, i.status,
              COUNT(DISTINCT CASE WHEN im.status = 'active' THEN im.user_id END) AS members,
              COUNT(DISTINCT coh.id) AS cohorts
       FROM institutions i
       LEFT JOIN institution_members im ON im.institution_id = i.id
       LEFT JOIN cohorts coh ON coh.institution_id = i.id
       GROUP BY i.id, i.name, i.type, i.status
       ORDER BY members DESC, i.name ASC
       LIMIT 10`,
    ),
    scalar("SELECT COUNT(*) AS n FROM programmes"),
    appDb.query<CountRow>("SELECT status AS k, COUNT(*) AS n FROM cohorts GROUP BY status"),
    scalar("SELECT COUNT(*) AS n FROM cohorts"),
    scalar("SELECT COUNT(*) AS n FROM cohorts WHERE moodle_cohort_id IS NOT NULL"),
    scalar("SELECT COUNT(*) AS n FROM cohort_courses"),
    scalar("SELECT COUNT(*) AS n FROM cohort_members WHERE member_role = 'learner' AND removed_at IS NULL"),
    scalar("SELECT COUNT(*) AS n FROM cohort_members WHERE member_role = 'teacher' AND removed_at IS NULL"),
    appDb.query<CountRow>("SELECT status AS k, COUNT(*) AS n FROM certificates GROUP BY status"),
    appDb.query<DayRow>(
      `SELECT DATE(issued_at) AS d, COUNT(*) AS n FROM certificates
       WHERE issued_at >= UTC_DATE() - INTERVAL 29 DAY GROUP BY DATE(issued_at) ORDER BY d`,
    ),
    appDb.query<CountRow>(
      `SELECT assistant AS k, COUNT(*) AS n FROM ai_usage_ledger
       WHERE created_at >= UTC_TIMESTAMP(3) - INTERVAL 30 DAY GROUP BY assistant`,
    ),
    appDb.query<CountRow>(
      `SELECT outcome AS k, COUNT(*) AS n FROM ai_usage_ledger
       WHERE created_at >= UTC_TIMESTAMP(3) - INTERVAL 30 DAY GROUP BY outcome`,
    ),
    appDb.query<DayRow>(
      `SELECT DATE(created_at) AS d, COUNT(*) AS n FROM ai_usage_ledger
       WHERE operation = 'chat' AND created_at >= UTC_DATE() - INTERVAL 29 DAY
       GROUP BY DATE(created_at) ORDER BY d`,
    ),
    appDb.query<{ requests: number; tokens: number; cost: number }>(
      `SELECT COUNT(*) AS requests,
              COALESCE(SUM(input_tokens + output_tokens), 0) AS tokens,
              COALESCE(SUM(est_cost_usd), 0) AS cost
       FROM ai_usage_ledger
       WHERE created_at >= UTC_TIMESTAMP(3) - INTERVAL 30 DAY`,
    ),
    appDb.query<CountRow>(
      "SELECT assistant AS k, COUNT(*) AS n FROM ai_conversations WHERE archived_at IS NULL GROUP BY assistant",
    ),
    appDb.query<CountRow>("SELECT status AS k, COUNT(*) AS n FROM ai_flags GROUP BY status"),
    appDb.query<CountRow>("SELECT status AS k, COUNT(*) AS n FROM support_tickets GROUP BY status"),
    appDb.query<CountRow>("SELECT category AS k, COUNT(*) AS n FROM support_tickets GROUP BY category"),
    appDb.query<CountRow>("SELECT source AS k, COUNT(*) AS n FROM support_tickets GROUP BY source"),
    appDb.query<CountRow>("SELECT status AS k, COUNT(*) AS n FROM notification_jobs GROUP BY status"),
    appDb.query<CountRow>(
      `SELECT purpose AS k, COUNT(*) AS n FROM user_consents
       WHERE withdrawn_at IS NULL GROUP BY purpose`,
    ),
    scalar("SELECT COUNT(*) AS n FROM data_quality_issues WHERE status = 'open'"),
    appDb.query<CountRow>(
      `SELECT kind AS k, COUNT(*) AS n FROM data_quality_issues
       WHERE status = 'open' GROUP BY kind ORDER BY n DESC LIMIT 8`,
    ),
    appDb.query<{ kind: string; entity_type: string; entity_id: string; detected_at: Date | string }>(
      `SELECT kind, entity_type, entity_id, detected_at
       FROM data_quality_issues WHERE status = 'open'
       ORDER BY detected_at DESC LIMIT 8`,
    ),
    appDb.query<{
      job_name: string;
      status: string;
      records_read: number;
      records_written: number;
      records_skipped: number;
      started_at: Date | string;
      finished_at: Date | string | null;
    }>("SELECT job_name, status, records_read, records_written, records_skipped, started_at, finished_at FROM sync_runs ORDER BY started_at DESC LIMIT 8"),
    scalar("SELECT COUNT(*) AS n FROM rag_documents"),
    scalar("SELECT COUNT(*) AS n FROM rag_documents WHERE withdrawn_at IS NOT NULL"),
    scalar("SELECT COUNT(*) AS n FROM rag_chunks"),
    appDb.query<CountRow>("SELECT status AS k, COUNT(*) AS n FROM rag_index_versions GROUP BY status"),
    scalar("SELECT COUNT(*) AS n FROM report_runs"),
    scalar("SELECT COUNT(*) AS n FROM audit_events WHERE occurred_at >= UTC_TIMESTAMP(3) - INTERVAL 7 DAY"),
  ]);

  const totals = aiTotals[0];
  const userTotal = named(byType).reduce((sum, row) => sum + row.n, 0);
  const linked = n(linkedRow[0]?.n);

  return {
    users: {
      total: userTotal,
      linked,
      unlinked: Math.max(0, userTotal - linked),
      loggedIn30d,
      activeSessions,
      byType: named(byType),
      byStatus: named(byStatus),
      byCounty: named(byCounty),
      byGender: named(byGender),
      byAgeBand: named(byAgeBand),
      signups30d: fillSeries(signups),
    },
    institutions: {
      total: instTotal,
      admins: instAdmins,
      members: instMembers,
      byStatus: named(instStatus),
      byType: named(instType),
      top: instTop.map((row) => ({
        id: n(row.id),
        name: row.name,
        type: pretty(row.type),
        status: pretty(row.status),
        members: n(row.members),
        cohorts: n(row.cohorts),
      })),
    },
    programmes,
    cohorts: {
      total: cohortTotal,
      linkedToMoodle: cohortLinked,
      courseLinks,
      byStatus: named(cohortStatus),
      learners: cohortLearners,
      teachers: cohortTeachers,
    },
    certificates: {
      total: named(certStatus).reduce((sum, row) => sum + row.n, 0),
      byStatus: named(certStatus),
      issued30d: fillSeries(certIssued),
    },
    ai: {
      requests30d: n(totals?.requests),
      tokens30d: n(totals?.tokens),
      costUsd30d: n(totals?.cost),
      byAssistant: named(aiAssistant),
      byOutcome: named(aiOutcome),
      daily: fillSeries(aiDaily),
      conversations: named(conversations),
      flags: named(flags),
    },
    support: {
      byStatus: named(ticketStatus),
      byCategory: named(ticketCategory),
      bySource: named(ticketSource),
    },
    notifications: named(notifications),
    consents: named(consents),
    quality: {
      open: dqOpen,
      byKind: named(dqKind),
      recent: dqRecent.map((row) => ({
        kind: pretty(row.kind),
        entityType: row.entity_type,
        entityId: row.entity_id,
        detectedAt: formatWhen(row.detected_at) ?? "",
      })),
    },
    sync: syncRuns.map((row) => ({
      jobName: row.job_name,
      status: pretty(row.status),
      recordsRead: n(row.records_read),
      recordsWritten: n(row.records_written),
      recordsSkipped: n(row.records_skipped),
      startedAt: formatWhen(row.started_at) ?? "",
      finishedAt: formatWhen(row.finished_at),
    })),
    rag: {
      documents: ragDocs,
      withdrawn: ragWithdrawn,
      chunks: ragChunks,
      versions: named(ragVersions),
    },
    reports,
    audit7d,
  };
}

const emptyMoodle = (): SuperAdminDashboardData["moodle"] => ({
  available: false,
  users: {
    total: 0,
    confirmed: 0,
    suspended: 0,
    neverLoggedIn: 0,
    active7d: 0,
    active30d: 0,
    new30d: fillSeries([]),
  },
  roles: [],
  courses: { total: 0, visible: 0, hidden: 0, completionEnabled: 0, byCategory: [], top: [] },
  enrolments: { active: 0, completed: 0, started: 0, completions30d: fillSeries([]) },
  activity: {
    assignmentsSubmitted: 0,
    assignmentsUngraded: 0,
    quizFinished: 0,
    quizInProgress: 0,
    forumDiscussions: 0,
    forumPosts: 0,
    groups: 0,
    badgesIssued: 0,
    modules: 0,
    actions24h: null,
  },
  cohorts: { total: 0, members: 0, top: [] },
});

async function loadMoodle(): Promise<SuperAdminDashboardData["moodle"]> {
  try {
    await moodleDb.query(`SELECT id FROM ${mt("course")} WHERE id = 1 LIMIT 1`);
  } catch (err) {
    console.error("[admin-dashboard] Moodle database unavailable", err);
    return { ...emptyMoodle(), error: "Moodle database is temporarily unavailable. Stadilearn figures below are still live." };
  }

  try {
    return await loadMoodleSummaries();
  } catch (err) {
    console.error("[admin-dashboard] Moodle summaries failed", err);
    return { ...emptyMoodle(), error: "Some Moodle summaries could not be loaded. Stadilearn figures below are still live." };
  }
}

async function loadMoodleSummaries(): Promise<SuperAdminDashboardData["moodle"]> {

  const user = mt("user");
  const role = mt("role");
  const ra = mt("role_assignments");
  const course = mt("course");
  const cat = mt("course_categories");
  const enrol = mt("enrol");
  const ue = mt("user_enrolments");
  const completions = mt("course_completions");
  const cohort = mt("cohort");
  const cm = mt("cohort_members");

  const weekAgo = Math.floor(Date.now() / 1000) - 7 * 86400;
  const monthAgo = Math.floor(Date.now() / 1000) - 30 * 86400;
  const dayAgo = Math.floor(Date.now() / 1000) - 86400;
  const start30 = Math.floor(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate() - 29) / 1000);

  const [
    usersTotal,
    usersConfirmed,
    usersSuspended,
    neverLoggedIn,
    active7d,
    active30d,
    newUsers,
    roles,
    coursesTotal,
    coursesVisible,
    coursesHidden,
    completionEnabled,
    byCategory,
    topCourses,
    enrolments,
    completed,
    started,
    completionsDaily,
    assignmentsSubmitted,
    assignmentsUngraded,
    quizFinished,
    quizInProgress,
    forumDiscussions,
    forumPosts,
    groups,
    badgesIssued,
    modules,
    actions24h,
    moodleCohorts,
    moodleCohortMembers,
    topCohorts,
  ] = await Promise.all([
    moodleScalar(`SELECT COUNT(*) AS n FROM ${user} WHERE deleted = 0 AND id <> 1`),
    moodleScalar(`SELECT COUNT(*) AS n FROM ${user} WHERE deleted = 0 AND id <> 1 AND confirmed = 1`),
    moodleScalar(`SELECT COUNT(*) AS n FROM ${user} WHERE deleted = 0 AND id <> 1 AND suspended = 1`),
    moodleScalar(`SELECT COUNT(*) AS n FROM ${user} WHERE deleted = 0 AND id <> 1 AND lastaccess = 0`),
    moodleScalar(`SELECT COUNT(*) AS n FROM ${user} WHERE deleted = 0 AND id <> 1 AND lastaccess >= ?`, [weekAgo]),
    moodleScalar(`SELECT COUNT(*) AS n FROM ${user} WHERE deleted = 0 AND id <> 1 AND lastaccess >= ?`, [monthAgo]),
    moodleDb.query<DayRow>(
      `SELECT FROM_UNIXTIME(timecreated, '%Y-%m-%d') AS d, COUNT(*) AS n
       FROM ${user}
       WHERE deleted = 0 AND id <> 1 AND timecreated >= ?
       GROUP BY FROM_UNIXTIME(timecreated, '%Y-%m-%d') ORDER BY d`,
      [start30],
    ),
    moodleDb.query<CountRow>(
      `SELECT COALESCE(NULLIF(r.archetype, ''), r.shortname) AS k, COUNT(DISTINCT ra.userid) AS n
       FROM ${ra} ra
       JOIN ${role} r ON r.id = ra.roleid
       JOIN ${user} u ON u.id = ra.userid AND u.deleted = 0 AND u.id <> 1
       GROUP BY COALESCE(NULLIF(r.archetype, ''), r.shortname)
       ORDER BY n DESC`,
    ),
    moodleScalar(`SELECT COUNT(*) AS n FROM ${course} WHERE id <> 1`),
    moodleScalar(`SELECT COUNT(*) AS n FROM ${course} WHERE id <> 1 AND visible = 1`),
    moodleScalar(`SELECT COUNT(*) AS n FROM ${course} WHERE id <> 1 AND visible = 0`),
    moodleScalar(`SELECT COUNT(*) AS n FROM ${course} WHERE id <> 1 AND enablecompletion = 1`),
    moodleDb.query<CountRow>(
      `SELECT cat.name AS k, COUNT(c.id) AS n
       FROM ${cat} cat
       LEFT JOIN ${course} c ON c.category = cat.id AND c.id <> 1
       WHERE cat.visible = 1
       GROUP BY cat.id, cat.name
       HAVING n > 0
       ORDER BY n DESC
       LIMIT 12`,
    ),
    moodleDb.query<{
      id: number;
      fullname: string;
      shortname: string;
      category: string;
      visible: number;
      enrolled: number;
      completed: number;
    }>(
      `SELECT c.id, c.fullname, c.shortname, cat.name AS category, c.visible,
              COUNT(DISTINCT CASE WHEN e.status = 0 AND ue.status = 0 AND u.deleted = 0 THEN ue.userid END) AS enrolled,
              COUNT(DISTINCT CASE WHEN cc.timecompleted IS NOT NULL THEN cc.userid END) AS completed
       FROM ${course} c
       JOIN ${cat} cat ON cat.id = c.category
       LEFT JOIN ${enrol} e ON e.courseid = c.id
       LEFT JOIN ${ue} ue ON ue.enrolid = e.id
       LEFT JOIN ${user} u ON u.id = ue.userid
       LEFT JOIN ${completions} cc ON cc.course = c.id AND cc.userid = ue.userid
       WHERE c.id <> 1
       GROUP BY c.id, c.fullname, c.shortname, cat.name, c.visible
       ORDER BY enrolled DESC, c.fullname ASC
       LIMIT 12`,
    ),
    moodleScalar(
      `SELECT COUNT(*) AS n
       FROM ${ue} ue
       JOIN ${enrol} e ON e.id = ue.enrolid AND e.status = 0 AND e.courseid <> 1
       JOIN ${user} u ON u.id = ue.userid AND u.deleted = 0
       WHERE ue.status = 0`,
    ),
    moodleScalar(`SELECT COUNT(*) AS n FROM ${completions} WHERE timecompleted IS NOT NULL AND course <> 1`),
    moodleScalar(`SELECT COUNT(*) AS n FROM ${completions} WHERE timestarted > 0 AND course <> 1`),
    moodleDb.query<DayRow>(
      `SELECT FROM_UNIXTIME(timecompleted, '%Y-%m-%d') AS d, COUNT(*) AS n
       FROM ${completions}
       WHERE timecompleted IS NOT NULL AND timecompleted >= ? AND course <> 1
       GROUP BY FROM_UNIXTIME(timecompleted, '%Y-%m-%d') ORDER BY d`,
      [start30],
    ),
    tryMoodle(
      () => moodleScalar(`SELECT COUNT(*) AS n FROM ${mt("assign_submission")} WHERE latest = 1 AND status = 'submitted'`),
      0,
    ),
    tryMoodle(
      () =>
        moodleScalar(
          `SELECT COUNT(*) AS n
           FROM ${mt("assign_submission")} s
           LEFT JOIN ${mt("assign_grades")} g
             ON g.assignment = s.assignment AND g.userid = s.userid AND g.attemptnumber = s.attemptnumber
           WHERE s.latest = 1 AND s.status = 'submitted' AND (g.id IS NULL OR g.grade IS NULL OR g.grade < 0)`,
        ),
      0,
    ),
    tryMoodle(() => moodleScalar(`SELECT COUNT(*) AS n FROM ${mt("quiz_attempts")} WHERE state = 'finished'`), 0),
    tryMoodle(() => moodleScalar(`SELECT COUNT(*) AS n FROM ${mt("quiz_attempts")} WHERE state = 'inprogress'`), 0),
    tryMoodle(() => moodleScalar(`SELECT COUNT(*) AS n FROM ${mt("forum_discussions")}`), 0),
    tryMoodle(() => moodleScalar(`SELECT COUNT(*) AS n FROM ${mt("forum_posts")}`), 0),
    tryMoodle(() => moodleScalar(`SELECT COUNT(*) AS n FROM ${mt("groups")}`), 0),
    tryMoodle(() => moodleScalar(`SELECT COUNT(*) AS n FROM ${mt("badge_issued")}`), 0),
    tryMoodle(() => moodleScalar(`SELECT COUNT(*) AS n FROM ${mt("course_modules")} WHERE deletioninprogress = 0`), 0),
    tryMoodle(
      () => moodleScalar(`SELECT COUNT(*) AS n FROM ${mt("logstore_standard_log")} WHERE timecreated >= ?`, [dayAgo]),
      null,
    ),
    tryMoodle(() => moodleScalar(`SELECT COUNT(*) AS n FROM ${cohort}`), 0),
    tryMoodle(() => moodleScalar(`SELECT COUNT(*) AS n FROM ${cm}`), 0),
    tryMoodle(
      () =>
        moodleDb.query<{ name: string; members: number }>(
          `SELECT c.name, COUNT(m.userid) AS members
           FROM ${cohort} c
           LEFT JOIN ${cm} m ON m.cohortid = c.id
           GROUP BY c.id, c.name
           ORDER BY members DESC
           LIMIT 8`,
        ),
      [],
    ),
  ]);

  return {
    available: true,
    users: {
      total: usersTotal,
      confirmed: usersConfirmed,
      suspended: usersSuspended,
      neverLoggedIn,
      active7d,
      active30d,
      new30d: fillSeries(newUsers),
    },
    roles: named(roles),
    courses: {
      total: coursesTotal,
      visible: coursesVisible,
      hidden: coursesHidden,
      completionEnabled,
      byCategory: named(byCategory),
      top: topCourses.map((row) => ({
        id: n(row.id),
        title: row.fullname,
        shortname: row.shortname,
        category: row.category,
        visible: n(row.visible) === 1,
        enrolled: n(row.enrolled),
        completed: n(row.completed),
        url: `${MOODLE_URL}/course/view.php?id=${n(row.id)}`,
      })),
    },
    enrolments: {
      active: enrolments,
      completed,
      started,
      completions30d: fillSeries(completionsDaily),
    },
    activity: {
      assignmentsSubmitted,
      assignmentsUngraded,
      quizFinished,
      quizInProgress,
      forumDiscussions,
      forumPosts,
      groups,
      badgesIssued,
      modules,
      actions24h,
    },
    cohorts: {
      total: moodleCohorts,
      members: moodleCohortMembers,
      top: topCohorts.map((row) => ({ name: row.name, members: n(row.members) })),
    },
  };
}
