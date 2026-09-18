export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ROLES = ["learner", "trainer", "institution"] as const;
export type SignupRole = (typeof ROLES)[number];

export function isEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 254 && EMAIL_PATTERN.test(value.trim());
}
