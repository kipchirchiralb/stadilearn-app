import type { MetadataRoute } from "next";
import { COURSES } from "@/lib/courses";

const PUBLIC_ROUTES = [
  "/", "/learn", "/learners", "/teachers", "/institutions", "/how-it-works", "/ai-support", "/about", "/impact",
  "/verify-certificate", "/help", "/contact", "/learning-space", "/trainer-workspace", "/offline-toolkit",
  "/privacy", "/terms", "/cookies", "/accessibility", "/ai-transparency", "/data-protection", "/safeguarding", "/security",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://stadilearn.co.ke";
  return [...PUBLIC_ROUTES, ...COURSES.map((c) => `/learn/${c.slug}`)].map((path) => ({ url: `${base}${path}` }));
}
