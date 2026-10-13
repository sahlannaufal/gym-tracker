import type { MetadataRoute } from "next";
import { getPublishedPosts } from "@/lib/blogPosts";
import { MARKETING_ORIGIN } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts();

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
    ...posts.map((post) => ({
      url: `${MARKETING_ORIGIN}/blog/${post.slug}`,
      lastModified: new Date(post.published_at ?? post.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
