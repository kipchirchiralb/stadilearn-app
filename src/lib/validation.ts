export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ROLES = ["learner", "trainer", "institution"] as const;
export type SignupRole = (typeof ROLES)[number];

export const INSTITUTION_TYPES = [
  "primary_school",
  "secondary_school",
  "tvet",
  "university",
  "ngo",
  "government",
  "company",
  "other",
] as const;
export type InstitutionType = (typeof INSTITUTION_TYPES)[number];

export const INSTITUTION_TYPE_LABELS: Record<InstitutionType, string> = {
  primary_school: "Primary school",
  secondary_school: "Secondary school",
  tvet: "TVET",
  university: "University",
  ngo: "NGO",
  government: "Government",
  company: "Company",
  other: "Other",
};

export function isEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 254 && EMAIL_PATTERN.test(value.trim());
}

export function isInstitutionType(value: unknown): value is InstitutionType {
  return typeof value === "string" && (INSTITUTION_TYPES as readonly string[]).includes(value);
}
