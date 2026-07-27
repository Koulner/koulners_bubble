import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

// Cache für das reduzierte Blog-Wissen im Arbeitsspeicher (RAG-Optimierung)
let cachedCompactKnowledge: string | null = null;

/**
 * 1. Kontext-Reduzierung (RAG-Optimierung)
 * Extrahiert pro Datei nur den Titel aus dem Frontmatter/Dateinamen
 * und maximal die ersten 250 Zeichen des Textbodys.
 */
function getCompactBlogKnowledge(): string {
  if (cachedCompactKnowledge) return cachedCompactKnowledge;

  const contentDir = path.join(process.cwd(), "content/blog");
  if (!fs.existsSync(contentDir)) return "Keine Artikel gefunden.";

  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));
  
  const knowledgeChunks = files.map((file) => {
    const raw = fs.readFileSync(path.join(contentDir, file), "utf8");
    const { data, content } = matter(raw);
    
    // Titel aus Frontmatter oder Dateiname
    const title = data.title || file.replace(/\.mdx?$/, "");
    const category = data.category || "Allgemein";
    
    // Bereinige den Textbody von Zeilenumbrüchen und überschüssigen Leerzeichen
    const cleanContent = content.replace(/\r?\n+/g, " ").trim();
    // Maximal die ersten 250 Zeichen als kurze Zusammenfassung
    const shortSummary = cleanContent.length > 250 ? cleanContent.substring(0, 250) + "..." : cleanContent;

    return `- **Titel:** ${title} *(Kategorie: ${category})*
  **Zusammenfassung:** ${shortSummary}`;
  });

  cachedCompactKnowledge = knowledgeChunks.join("\n\n");
  return cachedCompactKnowledge;
}

// Empathischer Fallback-Generator, falls beide API-Provider (Groq & OpenRouter) nicht erreichbar sind oder Schlüssel fehlen
function generateFallbackResponse(userMessage: string, knowledge: string): string {
  const query = userMessage.toLowerCase();
  
  const contentDir = path.join(process.cwd(), "content/blog");
  let bestMatchTitle = "";
  let bestMatchExcerpt = "";
  let bestMatchCategory = "";

  if (fs.existsSync(contentDir)) {
    const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));
    for (const file of files) {
      const raw = fs.readFileSync(path.join(contentDir, file), "utf8");
      const { data, content } = matter(raw);
      const fullText = `${data.title} ${data.category} ${data.excerpt} ${content}`.toLowerCase();
      
      const keywords = query.split(" ").filter((w) => w.length > 3);
      const matchCount = keywords.filter((k) => fullText.includes(k)).length;

      if (matchCount > 0 || fullText.includes(query)) {
        bestMatchTitle = data.title;
        bestMatchExcerpt = data.excerpt;
        bestMatchCategory = data.category;
        break;
      }
    }
  }

  if (bestMatchTitle) {
    return `Hallo du, schön, dass du in Koulners Bubble verweilst. 🌿

Zu deiner Frage fällt mir sofort unser Beitrag **"${bestMatchTitle}"** aus der Kategorie *${bestMatchCategory}* ein.

${bestMatchExcerpt}

Wenn du möchtest, kannst du dir diesen Beitrag direkt in unserer Ruhe-Oase durchlesen. Ich bin hier, um dich sanft auf deiner Reise durch unsere 14 Artikel zu begleiten. Was möchtest du noch erfahren?

*(Hinweis: Um freie LLM-Antworten zu erhalten, hinterlege einfach deinen \`GROQ_API_KEY\` oder \`OPENROUTER_API_KEY\` in der \`.env.local\` Datei deines Projekts.)*`;
  }

  return `Herzlich willkommen in Koulners Bubble! ✨ Ich bin dein sanfter Bubble Guide. 

Ich kenne all unsere 14 Artikel in den 7 Kategorien (Natur, Philosophie, Ganzheitliche Gesundheit, DIY Kosmetik, Ernährung, Frequenzen und Funktionelles Training). Frag mich gerne nach Tipps für dein Nervensystem, nach einem ayurvedischen Frühstücksrezept oder nach Übungen für innere Ruhe!

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
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Keine Nachrichten erhalten" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1].content;
    const compactKnowledge = getCompactBlogKnowledge();

    // Kompakter System-Prompt für den "Bubble Guide"
    const systemPrompt = `Du bist der empathische 'Bubble Guide' von Koulners Bubble. Deine Aufgabe ist es, Besuchern sanft und lehrreich Fragen zu den Themen Natur, Philosophie, Gesundheit, DIY-Kosmetik, Ernährung, Frequenzen und Funktionelles Training auf diesem Blog zu beantworten.
Du strahlst Ruhe, Heilung und Zuneigung aus. Nutze eine warme, freundliche und weiche Sprache.
Du hast Zugriff auf die folgende kompakte Übersicht unserer Blog-Artikel (RAG-Wissensbasis). Beantworte Fragen bevorzugt mit diesem Wissen und verweise gerne auf die passenden Artikel-Titel:

--- KOMPAKTE WISSENS-DATENBANK ---
${compactKnowledge}
----------------------------------

Antworte prägnant, liebevoll und im Markdown-Format.`;

    // 2. Fallback-Logik: Primary Provider (Groq -> OpenRouter -> Lokaler Fallback)
    try {
      if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY nicht in .env.local gefunden");
      }

      console.log("Starte Chat-Aufruf über Primary Provider (Groq)...");
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

        console.log("Starte Fallback-Aufruf über OpenRouter (openai/gpt-oss-20b:free)...");
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
        const fallbackReply = generateFallbackResponse(lastMessage, compactKnowledge);
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
