import type { SessionUser } from "@/lib/auth/session";
import { sha256 } from "@/lib/auth/hash";
import { getCohortsForUser, type CohortInsight } from "@/lib/dashboard";
import { appDb, type DbTx } from "@/lib/db";
import { INSTITUTION_TYPE_LABELS, type InstitutionType } from "@/lib/validation";

export type InstitutionStatus = "pending" | "active" | "suspended";
export type InstitutionAccessLevel = "full" | "pending_verification" | "pending_grant";

export type InstitutionAffiliation = {
  id: number;
  name: string;
  type: InstitutionType;
  typeLabel: string;
  status: InstitutionStatus;
  county: string | null;
  memberRole: "admin" | "teacher" | "learner" | "requester";
  memberStatus: "invited" | "active" | "removed" | "requested";
  access: InstitutionAccessLevel;
};

export type InstitutionStaffRow = {
  fullName: string;
  role: string;
  status: string;
};

export type InstitutionProgrammeRow = {
  name: string;
  status: string;
};

export type InstitutionDashboardData = {
  roleLabel: string;
  approved: boolean;
  institutions: InstitutionAffiliation[];
  cohorts: CohortInsight[];
  staff: InstitutionStaffRow[];
  programmes: InstitutionProgrammeRow[];
  totals: { learners: number; completed: number; certificates: number; notStarted: number; staff: number; programmes: number };
};

export type InstitutionApprovalRow = {
  institutionId: number;
  name: string;
  typeLabel: string;
  institutionStatus: InstitutionStatus;
  createdAt: string;
  userId: number | null;
  userName: string | null;
  userEmail: string | null;
  membershipStatus: "invited" | "active" | "none";
  isRequester: boolean;
  action: "approve" | "grant_admin";
};

type AffiliationRow = {
  id: number;
  name: string;
  type: InstitutionType;
  status: InstitutionStatus;
  county: string | null;
  member_role: "admin" | "teacher" | "learner" | null;
  member_status: "invited" | "active" | "removed" | null;
  is_requester: number;
};

function n(value: unknown) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

function typeLabel(type: string) {
  return INSTITUTION_TYPE_LABELS[type as InstitutionType] ?? type.replace(/_/g, " ");
}

function accessFor(row: AffiliationRow): InstitutionAccessLevel {
  if (row.status === "active" && row.member_role === "admin" && row.member_status === "active") return "full";
  if (row.status === "pending") return "pending_verification";
  return "pending_grant";
}

function affiliationFrom(row: AffiliationRow): InstitutionAffiliation {
  const requester = n(row.is_requester) === 1;
  return {
    id: n(row.id),
    name: row.name,
    type: row.type,
    typeLabel: typeLabel(row.type),
    status: row.status,
    county: row.county,
    memberRole: row.member_role ?? (requester ? "requester" : "teacher"),
    memberStatus: row.member_status ?? (requester ? "requested" : "invited"),
    access: accessFor(row),
  };
}

/** Active admin of an active institution, or Stadilearn super admin. */
export function canSeeInstitution(user: SessionUser, institutionId: number) {
  if (user.accountType === "super_admin") return true;
  return user.adminOf.includes(institutionId);
}

export function wantsInstitutionDashboard(affiliations: InstitutionAffiliation[]) {
  return affiliations.some((row) => row.memberRole === "admin" || row.memberRole === "requester");
}

export async function listInstitutionAffiliations(userId: number): Promise<InstitutionAffiliation[]> {
  const rows = await appDb.query<AffiliationRow>(
    `SELECT i.id, i.name, i.type, i.status, co.name AS county,
            m.member_role, m.status AS member_status,
            CASE WHEN i.requested_by = ? THEN 1 ELSE 0 END AS is_requester
     FROM institutions i
     LEFT JOIN institution_members m ON m.institution_id = i.id AND m.user_id = ?
     LEFT JOIN counties co ON co.id = i.county_id
     WHERE i.requested_by = ? OR m.user_id = ?
     ORDER BY i.name`,
    [userId, userId, userId, userId],
  );
  return rows
    .map(affiliationFrom)
    .filter((row) => row.memberRole === "admin" || row.memberRole === "requester" || row.memberStatus !== "removed");
}

export async function getInstitutionDashboard(user: SessionUser): Promise<InstitutionDashboardData | null> {
  const affiliations = (await listInstitutionAffiliations(user.id)).filter(
    (row) => row.memberRole === "admin" || row.memberRole === "requester",
  );
  if (!affiliations.length) return null;

  const approvedIds = affiliations.filter((row) => row.access === "full").map((row) => row.id);
  const approved = approvedIds.length > 0;
  const [cohorts, staff, programmes] = approved
    ? await Promise.all([getCohortsForUser(user, approvedIds), loadStaff(approvedIds), loadProgrammes(approvedIds)])
    : [[], [], []];

  const totals = cohorts.reduce(
    (acc, cohort) => {
      acc.learners += cohort.learners;
      acc.certificates += cohort.certificates;
      for (const course of cohort.courses) {
        acc.completed += course.completed;
        acc.notStarted += course.notStarted;
      }
      return acc;
    },
    { learners: 0, completed: 0, certificates: 0, notStarted: 0, staff: staff.length, programmes: programmes.length },
  );

  return {
    roleLabel: approved ? "Institution admin" : "Institution account",
    approved,
    institutions: affiliations,
    cohorts,
    staff,
    programmes,
    totals,
  };
}

async function loadStaff(institutionIds: number[]): Promise<InstitutionStaffRow[]> {
  if (!institutionIds.length) return [];
  const rows = await appDb.query<{ full_name: string; member_role: string; status: string }>(
    `SELECT u.full_name, m.member_role, m.status
     FROM institution_members m
     JOIN users u ON u.id = m.user_id
     WHERE m.institution_id IN (?) AND m.status <> 'removed' AND u.status = 'active'
     ORDER BY m.member_role, u.full_name
     LIMIT 80`,
    [institutionIds],
  );
  return rows.map((row) => ({
    fullName: row.full_name,
    role: row.member_role.replace(/_/g, " "),
    status: row.status.replace(/_/g, " "),
  }));
}

async function loadProgrammes(institutionIds: number[]): Promise<InstitutionProgrammeRow[]> {
  if (!institutionIds.length) return [];
  const rows = await appDb.query<{ name: string; status: string }>(
    `SELECT DISTINCT p.name, p.status
     FROM programmes p
     LEFT JOIN cohorts c ON c.programme_id = p.id
     WHERE p.institution_id IN (?) OR c.institution_id IN (?)
     ORDER BY p.name
     LIMIT 40`,
    [institutionIds, institutionIds],
  );
  return rows.map((row) => ({ name: row.name, status: row.status.replace(/_/g, " ") }));
}

function formatWhen(value: Date | string | null) {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Nairobi" });
}

export async function listInstitutionApprovals(): Promise<InstitutionApprovalRow[]> {
  const pending = await appDb.query<{
    id: number;
    name: string;
    type: string;
    status: InstitutionStatus;
    created_at: Date | string;
    requester_id: number | null;
    requester_name: string | null;
    requester_email: string | null;
    membership_status: "invited" | "active" | "removed" | null;
  }>(
    `SELECT i.id, i.name, i.type, i.status, i.created_at,
            u.id AS requester_id, u.full_name AS requester_name, u.email AS requester_email,
            m.status AS membership_status
     FROM institutions i
     LEFT JOIN users u ON u.id = i.requested_by
     LEFT JOIN institution_members m ON m.institution_id = i.id AND m.user_id = i.requested_by
     WHERE i.status = 'pending'
     ORDER BY i.created_at`,
  );

  const invited = await appDb.query<{
    institution_id: number;
    name: string;
    type: string;
    status: InstitutionStatus;
    created_at: Date | string;
    user_id: number;
    full_name: string;
    email: string;
    is_requester: number;
  }>(
    `SELECT i.id AS institution_id, i.name, i.type, i.status, i.created_at,
            u.id AS user_id, u.full_name, u.email,
            CASE WHEN i.requested_by = u.id THEN 1 ELSE 0 END AS is_requester
     FROM institution_members m
     JOIN institutions i ON i.id = m.institution_id
     JOIN users u ON u.id = m.user_id
     WHERE m.member_role = 'admin' AND m.status = 'invited' AND i.status <> 'suspended'
     ORDER BY i.name, u.full_name`,
  );

  const rows: InstitutionApprovalRow[] = pending.map((row) => ({
    institutionId: n(row.id),
    name: row.name,
    typeLabel: typeLabel(row.type),
    institutionStatus: row.status,
    createdAt: formatWhen(row.created_at),
    userId: row.requester_id ? n(row.requester_id) : null,
    userName: row.requester_name,
    userEmail: row.requester_email,
    membershipStatus: row.membership_status === "invited" || row.membership_status === "active" ? row.membership_status : "none",
    isRequester: Boolean(row.requester_id),
    action: "approve",
  }));

  for (const row of invited) {
    if (row.status === "pending") continue;
    rows.push({
      institutionId: n(row.institution_id),
      name: row.name,
      typeLabel: typeLabel(row.type),
      institutionStatus: row.status,
      createdAt: formatWhen(row.created_at),
      userId: n(row.user_id),
      userName: row.full_name,
      userEmail: row.email,
      membershipStatus: "invited",
      isRequester: n(row.is_requester) === 1,
      action: "grant_admin",
    });
  }

  return rows;
}

async function writeAudit(
  tx: DbTx,
  input: {
    actorId: number;
    action: string;
    entityType: string;
    entityId: string;
    institutionId: number;
    ip?: string;
    details?: Record<string, unknown>;
  },
) {
  await tx.execute(
    `INSERT INTO audit_events (actor_id, action, entity_type, entity_id, institution_id, ip_hash, details)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      input.actorId,
      input.action,
      input.entityType,
      input.entityId,
      input.institutionId,
      input.ip ? sha256(input.ip) : null,
      input.details ? JSON.stringify(input.details) : null,
    ],
  );
}

export async function approveInstitution(
  actor: SessionUser,
  institutionId: number,
  ip?: string,
): Promise<{ ok: true } | { error: string }> {
  if (actor.accountType !== "super_admin") {
    return { error: "Only Stadilearn admins can approve institutions." };
  }

  return appDb.transaction(async (tx) => {
    const [inst] = await tx.query<{
      id: number;
      name: string;
      status: InstitutionStatus;
      requested_by: number | null;
    }>("SELECT id, name, status, requested_by FROM institutions WHERE id = ?", [institutionId]);
    if (!inst) return { error: "Institution not found." };
    if (inst.status === "suspended") return { error: "A suspended institution cannot be approved from here." };

    if (inst.status === "pending") {
      await tx.execute(
        `UPDATE institutions
         SET status = 'active', approved_by = ?, approved_at = UTC_TIMESTAMP(3)
         WHERE id = ? AND status = 'pending'`,
        [actor.id, institutionId],
      );
      await writeAudit(tx, {
        actorId: actor.id,
        action: "institution.approved",
        entityType: "institution",
        entityId: String(institutionId),
        institutionId,
        ip,
        details: { name: inst.name },
      });
    }

    if (inst.requested_by) {
      const granted = await nominateAdminTx(tx, actor, institutionId, n(inst.requested_by), ip);
      if ("error" in granted) return granted;
    }

    return { ok: true as const };
  });
}

export async function grantInstitutionAdmin(
  actor: SessionUser,
  institutionId: number,
  userId: number,
  ip?: string,
): Promise<{ ok: true } | { error: string }> {
  if (actor.accountType !== "super_admin") {
    return { error: "Only Stadilearn admins can grant institution admin access." };
  }
  return appDb.transaction(async (tx) => nominateAdminTx(tx, actor, institutionId, userId, ip));
}

async function nominateAdminTx(
  tx: DbTx,
  actor: SessionUser,
  institutionId: number,
  userId: number,
  ip?: string,
): Promise<{ ok: true } | { error: string }> {
  const [inst] = await tx.query<{ id: number; status: InstitutionStatus }>(
    "SELECT id, status FROM institutions WHERE id = ?",
    [institutionId],
  );
  if (!inst) return { error: "Institution not found." };
  if (inst.status !== "active") return { error: "Approve the institution before granting admin access." };

  const [user] = await tx.query<{ id: number; account_type: string; status: string }>(
    "SELECT id, account_type, status FROM users WHERE id = ?",
    [userId],
  );
  if (!user) return { error: "That account was not found." };
  if (user.account_type !== "teacher") return { error: "Institution admins must have a teacher account." };
  if (user.status !== "active") return { error: "That account is not active yet." };

  await tx.execute(
    `INSERT INTO institution_members (institution_id, user_id, member_role, status, nominated_by, nominated_at)
     VALUES (?, ?, 'admin', 'active', ?, UTC_TIMESTAMP(3))
     ON DUPLICATE KEY UPDATE
       member_role = 'admin',
       status = 'active',
       nominated_by = VALUES(nominated_by),
       nominated_at = UTC_TIMESTAMP(3)`,
    [institutionId, userId, actor.id],
  );
  await writeAudit(tx, {
    actorId: actor.id,
    action: "institution.admin_nominated",
    entityType: "user",
    entityId: String(userId),
    institutionId,
    ip,
    details: { nominatedUserId: userId },
  });
  return { ok: true };
}
