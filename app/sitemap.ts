import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blog";
import { MARKETING_ORIGIN } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: MARKETING_ORIGIN,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${MARKETING_ORIGIN}/blog`,
      lastModified: new Date("2026-09-11"),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${MARKETING_ORIGIN}/privacy`,
      lastModified: new Date("2026-09-21"),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    ...BLOG_POSTS.map((post) => ({
      url: `${MARKETING_ORIGIN}/blog/${post.slug}`,
      lastModified: new Date(post.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
