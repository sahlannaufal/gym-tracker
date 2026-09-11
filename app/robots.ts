import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/aplikasi-tracking-gym", "/blog", "/blog/"],
      disallow: ["/account", "/auth/", "/forgot-password", "/progress", "/today", "/workout/"],
    },
    sitemap: "https://gym.abadikan.com/sitemap.xml",
  };
}
