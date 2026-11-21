import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — practical digital and AI learning`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#f5fafb",
    theme_color: "#004d61",
    lang: "en-KE",
    icons: [{ src: "/icon.png", sizes: "500x500", type: "image/png", purpose: "any" }],
  };
}
