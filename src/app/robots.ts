import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://koulnersbubble.de";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/api/og", "/api/search"],
      disallow: ["/studio", "/api/*"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
