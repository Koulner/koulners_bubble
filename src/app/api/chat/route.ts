import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

// Cache für das Blog-Wissen (RAG-Optimierung)
interface ArticleKnowledge {
  slug: string;
  title: string;
  category: string;
  description: string;
  fullContent: string;
  compactSummary: string;
}

let cachedArticles: ArticleKnowledge[] | null = null;

function loadArticles(): ArticleKnowledge[] {
  if (cachedArticles && process.env.NODE_ENV === "production") return cachedArticles;

  const contentDirs = [
    path.join(process.cwd(), "content/blog"),
    path.join(process.cwd(), "content"),
  ];
  const seenSlugs = new Set<string>();
  const articles: ArticleKnowledge[] = [];

  for (const dir of contentDirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));

    for (const file of files) {
      const slug = file.replace(/\.mdx?$/, "");
      if (seenSlugs.has(slug)) continue;
      seenSlugs.add(slug);

      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const { data, content } = matter(raw);
      const title = data.title || slug;
      const category = data.category || "Allgemein";
      const description = data.description || data.excerpt || "";
      const cleanContent = content.replace(/\r?\n+/g, " ").trim();
      const shortSummary = description || (cleanContent.length > 250 ? cleanContent.substring(0, 250) + "..." : cleanContent);

      articles.push({
        slug,
        title,
        category,
        description,
        fullContent: content.trim(),
        compactSummary: `- **Titel:** ${title} *(Kategorie: ${category})*\n  **Zusammenfassung:** ${shortSummary}`,
      });
    }
  }
  cachedArticles = articles;
  return articles;
}

/**
 * 1. Hybrides RAG-System (Kontext-Bewusstsein)
 * Wenn der Pfad zu einem Markdown-Artikel im /content Ordner passt, lade den kompletten Inhalt
 * dieses einen Artikels in den Kontext. Von allen anderen Artikeln wird nur Titel und
 * description (Zusammenfassung) geladen, um Token zu sparen und 429-Fehler zu vermeiden.
 */
function getHybridBlogKnowledge(pathname?: string): { knowledgeText: string; activeArticle?: ArticleKnowledge } {
  const articles = loadArticles();
  const activeArticles: string[] = [];
  const otherArticles: string[] = [];
  let activeArticle: ArticleKnowledge | undefined = undefined;

  for (const art of articles) {
    const isCurrentArticle = pathname && (
      pathname === `/blog/${art.slug}` ||
      pathname === `/${art.slug}` ||
      pathname.endsWith(`/${art.slug}`) ||
      pathname.toLowerCase().endsWith(`/${art.slug.toLowerCase()}`)
    );

    if (isCurrentArticle) {
      activeArticle = art;
      activeArticles.push(
        `[AKTUELL VOM NUTZER GELESENER ARTIKEL - VOLLSTÄNDIGER TEXT]\n- **Titel:** ${art.title} *(Kategorie: ${art.category})*\n- **Beschreibung:** ${art.description}\n**Vollständiger Inhalt:**\n${art.fullContent}`
      );
    } else {
      otherArticles.push(art.compactSummary);
    }
  }

  let knowledgeText = "";
  if (activeArticles.length > 0) {
    knowledgeText += `=== AKTUELL GELESENER ARTIKEL ===\n${activeArticles.join("\n\n")}\n=================================\n\n`;
  }
  knowledgeText += `--- WEITERE ARTIKEL IM BLOG (KOMPAKTE ÜBERSICHT) ---\n${otherArticles.join("\n\n")}`;

  return { knowledgeText, activeArticle };
}

// Empathischer Fallback-Generator, falls beide API-Provider (Groq & OpenRouter) nicht erreichbar sind oder Schlüssel fehlen
function generateFallbackResponse(userMessage: string, knowledgeText: string, activeArticle?: ArticleKnowledge): string {
  const query = userMessage.toLowerCase();
  const articles = loadArticles();

  if (activeArticle) {
    const paragraphs = activeArticle.fullContent.split(/\n\s*\n/).filter((p) => p.trim().length > 40 && !p.startsWith("#"));
    const bestQuote = paragraphs.find((p) => query.split(" ").some((w) => w.length > 3 && p.toLowerCase().includes(w))) || paragraphs[0] || activeArticle.description;

    return `Hallo du, schön, dass du in Koulners Bubble verweilst. 🌿

Wie Koulners Bubble im Artikel **"${activeArticle.title}"** beschreibt:

> ${bestQuote.replace(/\n/g, " ")}

Ich bin hier, um dich sanft auf deiner Reise zu begleiten. Was möchtest du noch zu diesem Thema oder unseren anderen Titeln erfahren?

*(Hinweis: Um freie LLM-Antworten zu erhalten, hinterlege einfach deinen \`GROQ_API_KEY\` oder \`OPENROUTER_API_KEY\` in der \`.env.local\` Datei deines Projekts.)*`;
  }

  let bestMatchTitle = "";
  let bestMatchExcerpt = "";
  let bestMatchCategory = "";

  for (const art of articles) {
    const fullText = `${art.title} ${art.category} ${art.description} ${art.fullContent}`.toLowerCase();
    const keywords = query.split(" ").filter((w) => w.length > 3);
    const matchCount = keywords.filter((k) => fullText.includes(k)).length;

    if (matchCount > 0 || fullText.includes(query)) {
      bestMatchTitle = art.title;
      bestMatchExcerpt = art.description;
      bestMatchCategory = art.category;
      break;
    }
  }

  if (bestMatchTitle) {
    return `Hallo du, schön, dass du in Koulners Bubble verweilst. 🌿

Wie Koulners Bubble im Artikel **"${bestMatchTitle}"** beschreibt:

> ${bestMatchExcerpt}

Wenn du möchtest, kannst du dir diesen Beitrag direkt in unserer Ruhe-Oase durchlesen. Ich bin hier, um dich sanft auf deiner Reise zu begleiten. Was möchtest du noch erfahren?

*(Hinweis: Um freie LLM-Antworten zu erhalten, hinterlege einfach deinen \`GROQ_API_KEY\` oder \`OPENROUTER_API_KEY\` in der \`.env.local\` Datei deines Projekts.)*`;
  }

  return `Herzlich willkommen in Koulners Bubble! ✨ Ich bin dein sanfter Bubble Guide. 

Ich kenne all unsere ${articles.length} Artikel zu Natur, Philosophie, Gesundheit, Kosmetik, Ernährung, Frequenzen und Funktionellem Training. Frag mich gerne nach Tipps für dein Nervensystem, nach einem Rezept oder nach Übungen für innere Ruhe!

*(Hinweis: Um freie LLM-Antworten zu erhalten, hinterlege einfach deinen \`GROQ_API_KEY\` oder \`OPENROUTER_API_KEY\` in der \`.env.local\` Datei deines Projekts.)*`;
}

// Provider Konfigurationen via @ai-sdk/openai
const groq = createOpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.GROQ_API_KEY || "",
});

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, pathname } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Keine Nachrichten erhalten" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1].content;
    const { knowledgeText, activeArticle } = getHybridBlogKnowledge(pathname);

    // 3. Der neue System-Prompt (Personality Upgrade & tiefgündiges Zitieren)
    const systemPrompt = `Du bist der 'Bubble Guide', ein weiser, empathischer und heilsamer Begleiter auf der Website 'Koulners Bubble'. Du hilfst Besuchern bei Fragen zu Natur, Philosophie, Gesundheit und Kosmetik. Dir liegt als Kontext das Wissen der Blog-Artikel vor. Beachte besonders den Artikel, den der Nutzer gerade liest (vollständiger Text im Kontext).
Deine Vorgaben:
- Strahle Ruhe und Zuneigung aus. Nutze eine erdende, bildhafte Sprache.
- Wenn du Wissen aus den Artikeln nutzt, zitiere die schönsten und wichtigsten Sätze wörtlich, indem du Markdown-Blockzitate (>) verwendest.
- Nenne immer den Titel des Artikels, auf den du dich beziehst (z.B. 'Wie Koulners Bubble im Artikel [Titel] beschreibt...').
- Antworte präzise, aber tiefgründig. Vermeide KI-Floskeln.

--- WISSENS-DATENBANK & AKTUELLER KONTEXT ---
${knowledgeText}
---------------------------------------------`;

    // 2. Fallback-Logik: Primary Provider (Groq -> OpenRouter -> Lokaler Fallback)
    try {
      if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY nicht in .env.local gefunden");
      }

      console.log(`Starte Chat-Aufruf über Primary Provider (Groq)${activeArticle ? ` [Aktiver Kontext: ${activeArticle.title}]` : ""}...`);
      const result = await streamText({
        model: groq.chat("llama-3.3-70b-versatile"),
        system: systemPrompt,
        messages: messages,
        temperature: 0.7,
        maxOutputTokens: 800,
      });

      // 3. Stream-Handling: Text-Stream direkt an das Frontend zurückgeben
      return result.toTextStreamResponse();
    } catch (groqError: any) {
      console.warn("Groq Aufruf fehlgeschlagen (z.B. Error 429 oder fehlender Key), wechsle zu OpenRouter:", groqError?.message || groqError);

      try {
        if (!process.env.OPENROUTER_API_KEY) {
          throw new Error("OPENROUTER_API_KEY nicht in .env.local gefunden");
        }

        console.log(`Starte Fallback-Aufruf über OpenRouter (openai/gpt-oss-20b:free)${activeArticle ? ` [Aktiver Kontext: ${activeArticle.title}]` : ""}...`);
        const result = await streamText({
          model: openrouter.chat("openai/gpt-oss-20b:free"),
          system: systemPrompt,
          messages: messages,
          temperature: 0.7,
          maxOutputTokens: 800,
        });

        // Stream über Fallback-Provider zurückgeben
        return result.toTextStreamResponse();
      } catch (openRouterError: any) {
        console.error("OpenRouter Aufruf ebenfalls fehlgeschlagen, nutze lokalen Fallback:", openRouterError?.message || openRouterError);

        // Letzte Sicherheitsstufe: Empathische lokale JSON-Antwort, damit der Chat niemals abstürzt
        const fallbackReply = generateFallbackResponse(lastMessage, knowledgeText, activeArticle);
        return NextResponse.json({ reply: fallbackReply });
      }
    }
  } catch (err: any) {
    console.error("Schwerwiegender Chat API Fehler:", err);
    return NextResponse.json(
      { error: "Ein sanfter Fehler ist aufgetreten. Bitte versuche es gleich erneut." },
      { status: 500 }
    );
  }
}
