import React from "react";
import type { BlogPostMeta } from "@/lib/content";

interface JsonLdProps {
  post?: BlogPostMeta;
  url?: string;
  siteUrl?: string;
  faq?: { question: string; answer: string }[];
}

export function JsonLd({ post, url, siteUrl = "https://koulnersbubble.de", faq }: JsonLdProps) {
  const schemas: any[] = [];

  // 1. WebSite / Organization Schema (Standard Basis für die gesamte Bubble)
  if (!post) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Koulners Bubble",
      url: siteUrl,
      description: "Der geschützte Leseraum für Körper, Geist und holistische Entfaltung.",
      publisher: {
        "@type": "Organization",
        name: "Koulners Bubble",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/favicon.ico`,
        },
      },
    });
  }

  // 2. BlogPosting / Article Schema für spezifische Artikel
  if (post) {
    const articleUrl = url || `${siteUrl}/blog/${post.slug}`;
    const imageUrl = post.image?.startsWith("http") ? post.image : `${siteUrl}${post.image}`;

    schemas.push({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": articleUrl,
      },
      headline: post.title,
      description: post.excerpt,
      image: [imageUrl],
      datePublished: post.date,
      dateModified: post.date,
      author: {
        "@type": "Person",
        name: post.author || "Koulner",
        url: siteUrl,
      },
      publisher: {
        "@type": "Organization",
        name: "Koulners Bubble",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/favicon.ico`,
        },
      },
      keywords: [post.category, "Koulners Bubble", "Achtsamkeit", "Holistische Gesundheit"].join(", "),
    });

    // 3. BreadcrumbList Schema (Brotkrümel-Navigation für Google Rich Snippets)
    schemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: siteUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: post.category || "Journal",
          item: `${siteUrl}/#blog`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: post.title,
          item: articleUrl,
        },
      ],
    });
  }

  // 4. FAQPage Schema (Vorbereitet für zukünftige Artikel mit FAQ-Blöcken)
  if (faq && faq.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    });
  }

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
