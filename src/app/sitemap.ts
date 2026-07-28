import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://koulners-bubble.de";
  const baseUrl = siteUrl.replace(/\/$/, "");

  const posts = getAllPosts();

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => {
    let lastModified = new Date();
    try {
      const parsed = new Date(post.date);
      if (!isNaN(parsed.getTime())) {
        lastModified = parsed;
      }
    } catch {
      // Fallback zu now
    }

    return {
      url: `${baseUrl}/blog/${post.slug}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    };
  });

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...blogEntries,
  ];
}
