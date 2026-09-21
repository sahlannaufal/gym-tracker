import type { MetadataRoute } from "next";
import { MARKETING_ORIGIN } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/aplikasi-tracking-gym", "/blog", "/blog/", "/terms", "/privacy"],
      disallow: ["/account", "/auth/", "/forgot-password", "/progress", "/today", "/workout/"],
    },
    sitemap: `${MARKETING_ORIGIN}/sitemap.xml`,
  };
}
