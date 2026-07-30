import React from "react";
import { normalizeCategories } from "@/lib/categories";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface JsonLdProps {
  post: {
    title: string;
    excerpt?: string;
    date: string;
    author?: string;
    image?: string;
    category?: string | string[];
    slug: string;
  };
  siteUrl?: string;
  faqs?: FAQItem[];
}

// Hilfsfunktion zur Generierung eines validen ISO-Datum-Strings für Schema.org
function parseToIsoDate(dateStr?: string): string {
  if (!dateStr) return new Date().toISOString();

  // Versuch 1: Direkter ISO-/Standard-Date-Parse
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }

  // Versuch 2: Deutschsprachiges Datum parsieren (z.B. "14. Mai 2026" oder "14.05.2026")
  try {
    const months: Record<string, string> = {
      januar: "01", jan: "01",
      februar: "02", feb: "02",
      märz: "03", maerz: "03", mär: "03",
      april: "04", apr: "04",
      mai: "05",
      juni: "06", jun: "06",
      juli: "07", jul: "07",
      august: "08", aug: "08",
      september: "09", sep: "09",
      oktober: "10", okt: "10",
      november: "11", nov: "11",
      dezember: "12", dez: "12",
    };

    const clean = dateStr.toLowerCase().replace(/[^a-z0-9\s.]/g, "").trim();
    const parts = clean.split(/[\s.]+/).filter(Boolean);

    if (parts.length === 3) {
      const day = parts[0].padStart(2, "0");
      const monthStr = parts[1];
      const year = parts[2];
      const month = months[monthStr] || (isNaN(Number(monthStr)) ? "01" : monthStr.padStart(2, "0"));

      const isoTry = new Date(`${year}-${month}-${day}T12:00:00Z`);
      if (!isNaN(isoTry.getTime())) {
        return isoTry.toISOString();
      }
    }
  } catch {
    // Silent Fallback
  }

  return new Date().toISOString();
}

export default function JsonLd({
  post,
  siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://koulners-bubble.de",
  faqs = [],
}: JsonLdProps) {
  const articleUrl = `${siteUrl.replace(/\/$/, "")}/blog/${post.slug}`;
  const isoDate = parseToIsoDate(post.date);
  const categories = normalizeCategories(post.category);
  const mainCategory = categories[0] || "Gedanken";

  // Bild-URL berechnen (Entweder S3/External Image oder Fallback auf unsere neue OG-Route)
  const imageUrl = post.image && post.image.startsWith("http")
    ? post.image
    : `${siteUrl.replace(/\/$/, "")}${post.image?.startsWith("/") ? "" : "/"}${post.image || `/api/og?title=${encodeURIComponent(post.title)}&category=${encodeURIComponent(mainCategory)}`}`;

  // 1. Article / BlogPosting Schema
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${articleUrl}#article`,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    "headline": post.title,
    "description": post.excerpt || `${post.title} - Ein geschützter Gedankenraum auf Koulners Bubbles.`,
    "image": [imageUrl],
    "datePublished": isoDate,
    "dateModified": isoDate,
    "author": {
      "@type": "Person",
      "name": post.author || "Koulner",
      "url": siteUrl,
    },
    "publisher": {
      "@type": "Organization",
      "name": "Koulners Bubbles",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl.replace(/\/$/, "")}/favicon.ico`,
      },
    },
    "keywords": categories.join(", "),
  };

  // 2. BreadcrumbList Schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": siteUrl.replace(/\/$/, ""),
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": mainCategory,
        "item": `${siteUrl.replace(/\/$/, "")}/?category=${encodeURIComponent(mainCategory)}`,
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": post.title,
        "item": articleUrl,
      },
    ],
  };

  // 3. Optionales FAQPage Schema (falls im Artikel FAQs existieren)
  const faqSchema = faqs && faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer,
      },
    })),
  } : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </>
  );
}
