import { appDb, type DbTx } from "@/lib/db";
import { normalizeEmail } from "@/lib/auth/hash";
import { issueOtp, type OtpPurpose } from "@/lib/auth/otp";
import { isInstitutionType, type InstitutionType, type SignupRole } from "@/lib/validation";

export const POLICY_VERSION = "1.0";

const ACCOUNT_TYPE: Record<SignupRole, "learner" | "teacher"> = {
  learner: "learner",
  trainer: "teacher",
  institution: "teacher",
};

export type RegistrationInput = {
  fullName: string;
  email: string;
  role: SignupRole;
  organization?: string;
  institutionType?: string;
  jobTitle?: string;
  county?: string;
  demographicsConsent: boolean;
  ip?: string;
};

async function countyId(tx: DbTx, name: string | undefined) {
  const trimmed = name?.trim();
  if (!trimmed) return null;
  const [row] = await tx.query<{ id: number }>("SELECT id FROM counties WHERE name = ?", [trimmed]);
  return row ? Number(row.id) : null;
}

async function recordConsents(tx: DbTx, userId: number, demographics: boolean) {
  const purposes: Array<"terms" | "privacy" | "age_or_guardian" | "demographics"> = [
    "terms",
    "privacy",
    "age_or_guardian",
  ];
  if (demographics) purposes.push("demographics");
  for (const purpose of purposes) {
    await tx.execute(
      "INSERT INTO user_consents (user_id, purpose, policy_version) VALUES (?, ?, ?)",
      [userId, purpose, POLICY_VERSION],
    );
  }
}

/** Queue the signup user as an invited admin. Super admin later activates this. */
async function inviteInstitutionAdmin(tx: DbTx, institutionId: number, userId: number) {
  await tx.execute(
    `INSERT INTO institution_members (institution_id, user_id, member_role, status)
     VALUES (?, ?, 'admin', 'invited')
     ON DUPLICATE KEY UPDATE
       member_role = IF(status = 'removed', 'admin', member_role),
       status = IF(status = 'removed', 'invited', status)`,
    [institutionId, userId],
  );
}

async function attachInstitutionRequest(
  tx: DbTx,
  userId: number,
  organization: string,
  type: InstitutionType,
  county: number | null,
) {
  try {
    const created = await tx.execute(
      `INSERT INTO institutions (name, type, county_id, status, requested_by)
       VALUES (?, ?, ?, 'pending', ?)`,
      [organization, type, county, userId],
    );
    await inviteInstitutionAdmin(tx, Number(created.insertId), userId);
    return;
  } catch (err) {
    const code = err && typeof err === "object" && "code" in err ? String(err.code) : "";
    if (code !== "ER_DUP_ENTRY") throw err;
  }

  const [existing] = await tx.query<{ id: number }>("SELECT id FROM institutions WHERE name = ?", [organization]);
  if (existing) await inviteInstitutionAdmin(tx, Number(existing.id), userId);
}

/**
 * Create a pending account (or reuse one) and email a signup OTP.
 * Always resolves without revealing whether the email was new.
 */
export async function startRegistration(input: RegistrationInput): Promise<void> {
  const email = normalizeEmail(input.email);
  const fullName = input.fullName.trim();
  const accountType = ACCOUNT_TYPE[input.role];
  const jobTitle = input.jobTitle?.trim().slice(0, 120) || null;
  const organization = input.organization?.trim().slice(0, 160) || "";

  const existing = await appDb.query<{ id: number; status: string }>(
    "SELECT id, status FROM users WHERE email = ?",
    [email],
  );

  if (existing[0]) {
    if (existing[0].status === "pending") {
      try {
        await issueOtp({ email, purpose: "signup", ip: input.ip });
      } catch (err) {
        console.error("[auth] signup OTP resend failed", err);
      }
    }
    return;
  }

  try {
    await appDb.transaction(async (tx) => {
      const county = await countyId(tx, input.county);
      const created = await tx.execute(
        `INSERT INTO users (email, full_name, account_type, status, preferred_language, county_id, job_title)
         VALUES (?, ?, ?, 'pending', ?, ?, ?)`,
        [email, fullName, accountType, "en", county, jobTitle],
      );
      const userId = Number(created.insertId);
      await recordConsents(tx, userId, input.demographicsConsent);

      if (input.role === "institution" && organization.length >= 2) {
        const type = isInstitutionType(input.institutionType) ? input.institutionType : "other";
        await attachInstitutionRequest(tx, userId, organization, type, county);
      }
    });
  } catch (err) {
    const code = err && typeof err === "object" && "code" in err ? String(err.code) : "";
    if (code !== "ER_DUP_ENTRY") throw err;
  }

  try {
    await issueOtp({ email, purpose: "signup" satisfies OtpPurpose, ip: input.ip });
  } catch (err) {
    console.error("[auth] signup OTP send failed", err);
  }
}
