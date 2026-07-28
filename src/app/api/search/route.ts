import { NextResponse } from "next/server";
import { getAllPostsForSearch, BlogPostSearchItem } from "@/lib/content";
import Fuse from "fuse.js";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const categoryFilter = searchParams.get("category") || "";

    const allPosts = getAllPostsForSearch();

    // 1. Kategorie-Filter anwenden (vor der Fuse.js-Suche für maximale Performance)
    let filteredPosts = allPosts;
    if (categoryFilter && categoryFilter.toLowerCase() !== "alle" && categoryFilter.toLowerCase() !== "allgemein") {
      filteredPosts = allPosts.filter((post) => {
        const cats = Array.isArray(post.category) ? post.category : [String(post.category)];
        return cats.some((cat) => String(cat).toLowerCase() === categoryFilter.toLowerCase());
      });
    }

    // 2. Wenn keine Suchanfrage (q) eingegeben wurde, liefere einfach die gefilterten Artikel zurück
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
        snippet: post.excerpt || post.description,
        matchReason: "Kategorie-Filter",
      }));
      return NextResponse.json({ success: true, results, count: results.length });
    }

    // 3. Konfiguriere Fuse.js für Volltextsuche mit den geforderten Gewichtungen
    const fuse = new Fuse(filteredPosts, {
      keys: [
        { name: "title", weight: 0.5 },
        { name: "description", weight: 0.3 },
        { name: "content", weight: 0.2 },
      ],
      includeMatches: true,
      threshold: 0.4,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });

    const searchResults = fuse.search(query);

    // 4. Mappe Ergebnisse und extrahiere passenden Ausschnitt (Snippet)
    const results = searchResults.map((res) => {
      const post = res.item;
      let snippet = post.excerpt || post.description;
      let matchReason = "Titel";

      if (res.matches && res.matches.length > 0) {
        // Suche vorrangig nach einem Match im Content oder der Description
        const contentMatch = res.matches.find((m) => m.key === "content");
        const descMatch = res.matches.find((m) => m.key === "description");
        const match = contentMatch || descMatch || res.matches[0];
        matchReason = match.key === "content" ? "Im Text" : match.key === "description" ? "Beschreibung" : "Titel";

        if (match && match.indices && match.indices.length > 0 && match.value) {
          const [start, end] = match.indices[0];
          const text = match.value;
          const snippetStart = Math.max(0, start - 40);
          const snippetEnd = Math.min(text.length, end + 80);
          
          let excerptStr = text.substring(snippetStart, snippetEnd).replace(/\r?\n|\r|[#*`~>|_]/g, " ").replace(/\s+/g, " ").trim();
          if (snippetStart > 0) excerptStr = "..." + excerptStr;
          if (snippetEnd < text.length) excerptStr = excerptStr + "...";
          
          if (excerptStr.length > 20) {
            snippet = excerptStr;
          }
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
        matchReason,
      };
    });

    return NextResponse.json({ success: true, results, count: results.length });
  } catch (error: any) {
    console.error("[SEARCH API ERROR]", error);
    return NextResponse.json({ error: error?.message || "Internal Search Error" }, { status: 500 });
  }
}
