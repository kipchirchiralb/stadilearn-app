import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://stadilearn.co.ke";
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/app/", "/api/", "/login", "/signup", "/account-recovery"] },
    sitemap: `${base}/sitemap.xml`,
  };
}
