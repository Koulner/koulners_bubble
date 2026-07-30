import { NextResponse } from "next/server";
import { getAllPostsForSearch, BlogPostSearchItem } from "@/lib/content";
import Fuse from "fuse.js";
import { z } from "zod";
import rateLimit from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

// Zod Schema for search parameters
const searchParamsSchema = z.object({
  q: z.string().max(100).optional().default(""),
  category: z.string().max(50).optional().default(""),
});

export async function GET(req: Request) {
  try {
    // 1. Rate Limiting
    const ip = req.headers.get("x-forwarded-for") || "unknown-ip";
    try {
      await limiter.check(30, ip); // 30 requests per IP per minute
    } catch {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // 1.5 Turnstile Validation
    const turnstileToken = req.headers.get("x-turnstile-token");
    const isHuman = await verifyTurnstileToken(turnstileToken);
    if (!isHuman) {
      return NextResponse.json(
        { error: "Security check failed (Turnstile). Please try again." },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const rawQ = searchParams.get("q") || "";
    const rawCategory = searchParams.get("category") || "";

    // 2. Input Validation & Sanitization (Zod)
    const result = searchParamsSchema.safeParse({ q: rawQ, category: rawCategory });
    if (!result.success) {
      return NextResponse.json(
        { error: "Ungültige Suchanfrage. Maximal 100 Zeichen erlaubt." },
        { status: 400 }
      );
    }

    // Sanitize basic HTML tags if any (strip < and >)
    let query = result.data.q.replace(/</g, "").replace(/>/g, "");
    let categoryFilter = result.data.category.replace(/</g, "").replace(/>/g, "");

    const allPosts = getAllPostsForSearch();

    // 3. Kategorie-Filter anwenden
    let filteredPosts = allPosts;
    if (categoryFilter && categoryFilter.toLowerCase() !== "alle" && categoryFilter.toLowerCase() !== "allgemein") {
      filteredPosts = allPosts.filter((post) => {
        const cats = Array.isArray(post.category) ? post.category : [String(post.category)];
        return cats.some((cat) => String(cat).toLowerCase() === categoryFilter.toLowerCase());
      });
    }

    // 4. Wenn keine Suchanfrage (q) eingegeben wurde, liefere einfach die gefilterten Artikel zurück
    if (!query.trim()) {
      const results = filteredPosts.slice(0, 20).map((post) => ({
        slug: post.slug,
        title: post.title,
        category: post.category,
        level: post.level,
        date: post.date,
        description: post.description,
        excerpt: post.excerpt,
        image: post.image,
        readTime: post.readTime,
        author: post.author,
      }));
      return NextResponse.json({ results });
    }

    // 5. Volltextsuche mit Fuse.js
    const fuse = new Fuse(filteredPosts, {
      keys: [
        { name: "title", weight: 3 },
        { name: "category", weight: 2 },
        { name: "description", weight: 1.5 },
        { name: "excerpt", weight: 1 },
        { name: "body", weight: 0.5 },
      ],
      threshold: 0.3,
      ignoreLocation: true,
      includeMatches: true,
      minMatchCharLength: 2,
    });

    const searchResults = fuse.search(query).slice(0, 10);

    const formattedResults = searchResults.map((result) => {
      const post = result.item;
      let snippet = post.excerpt;

      if (result.matches) {
        const bodyMatch = result.matches.find((m) => m.key === "body");
        if (bodyMatch && bodyMatch.value) {
          const matchIndex = bodyMatch.indices[0][0];
          const start = Math.max(0, matchIndex - 60);
          const end = Math.min(bodyMatch.value.length, matchIndex + 60);
          snippet = "..." + bodyMatch.value.substring(start, end).replace(/\n/g, " ").trim() + "...";
        }
      }

      return {
        slug: post.slug,
        title: post.title,
        category: post.category,
        level: post.level,
        date: post.date,
        description: post.description,
        excerpt: post.excerpt,
        image: post.image,
        readTime: post.readTime,
        author: post.author,
        snippet,
        matchReason: result.matches ? result.matches[0]?.key : undefined,
      };
    });

    return NextResponse.json({ results: formattedResults });
  } catch (error) {
    console.error("Search API Error:", error);
    return NextResponse.json({ error: "Interner Server Fehler" }, { status: 500 });
  }
}
