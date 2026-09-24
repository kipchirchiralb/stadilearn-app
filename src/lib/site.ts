export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://stadilearn.co.ke";

export const MOODLE_URL =
  process.env.NEXT_PUBLIC_MOODLE_URL ?? "https://elearning.stadilearn.co.ke";

export const MOODLE_HOST = MOODLE_URL.replace(/^https?:\/\//, "");

export const CONTACT = {
  location: "Nairobi, Kenya",
  email: "info@stadilearn.co.ke",
  phone: "+254 700 000000",
};

/**
 * Maps the `data-path` values used in the original landing page markup to real
 * routes. Keep this as the single source of truth for public navigation.
 */
export const ROUTES = {
  home: "/",
  courses: "/learn",
  "explore-courses": "/learn",
  "how-it-works": "/how-it-works",
  "for-teachers": "/teachers",
  "for-institutions": "/institutions",
  "verify-certificate": "/verify-certificate",
  "ai-support": "/ai-support",
  about: "/about",
  "sign-in": "/login",
  "create-account": "/signup",
  "learners-students": "/learners",
  "partners-funders": "/impact",
  "open-learning-space": "/learning-space",
  "trainer-workspace": "/trainer-workspace",
  "offline-sync-toolkit": "/offline-toolkit",
  "ai-transparency": "/ai-transparency",
  "kenyan-data-protection": "/data-protection",
  accessibility: "/accessibility",
  "privacy-policy": "/privacy",
  "terms-of-service": "/terms",
  "cookie-policy": "/cookies",
  help: "/help",
  contact: "/contact",
  safeguarding: "/safeguarding",
  security: "/security",
} as const;

export type RouteKey = keyof typeof ROUTES;
