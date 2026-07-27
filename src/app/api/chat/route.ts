import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { GoogleGenAI } from "@google/genai";

// Cache für das Blog-Wissen im Arbeitsspeicher
let cachedKnowledge: string | null = null;

function getBlogKnowledge(): string {
  if (cachedKnowledge) return cachedKnowledge;

  const contentDir = path.join(process.cwd(), "content/blog");
  if (!fs.existsSync(contentDir)) return "Keine Artikel gefunden.";

  const files = fs.readdirSync(contentDir).filter((f) => f.endsWith(".md") || f.endsWith(".mdx"));
  
  const knowledgeChunks = files.map((file) => {
    const raw = fs.readFileSync(path.join(contentDir, file), "utf8");
    const { data, content } = matter(raw);
    return `### ARTIKEL: ${data.title || file} (Kategorie: ${data.category || "Allgemein"})
Datum: ${data.date || ""} | Lesezeit: ${data.readTime || ""}
Auszug: ${data.excerpt || ""}

Inhalt:
${content}
---`;
  });

  cachedKnowledge = knowledgeChunks.join("\n\n");
  return cachedKnowledge;
}

// Empathischer Fallback-Generator, falls noch kein API-Key hinterlegt wurde
function generateFallbackResponse(userMessage: string, knowledge: string): string {
  const query = userMessage.toLowerCase();
  
  // Suche nach passenden Artikeln basierend auf Schlüsselwörtern
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

*(Hinweis: Um mich mit freier, generativer KI-Intelligenz zu verbinden, hinterlege einfach deinen \`GEMINI_API_KEY\` in der \`.env.local\` Datei deines Projekts.)*`;
  }

  return `Herzlich willkommen in Koulners Bubble! ✨ Ich bin dein sanfter Bubble Guide. 

Ich kenne all unsere 14 Artikel in den 7 Kategorien (Natur, Philosophie, Ganzheitliche Gesundheit, DIY Kosmetik, Ernährung, Frequenzen und Funktionelles Training). Frag mich gerne nach Tipps für dein Nervensystem, nach einem ayurvedischen Frühstücksrezept oder nach Übungen für innere Ruhe!

*(Hinweis: Um mich mit freier, generativer KI-Intelligenz zu verbinden, hinterlege einfach deinen \`GEMINI_API_KEY\` in der \`.env.local\` Datei deines Projekts.)*`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Keine Nachrichten erhalten" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1].content;
    const blogKnowledge = getBlogKnowledge();

    const apiKey = process.env.GEMINI_API_KEY;

    // Falls ein gültiger API-Key existiert, nutze das echte Gemini LLM
    if (apiKey && apiKey !== "DEIN_API_KEY_HIER") {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const systemInstruction = `Du bist der empathische 'Bubble Guide' von Koulners Bubble. Deine Aufgabe ist es, Besuchern sanft und lehrreich Fragen zu den Themen Natur, Philosophie, Gesundheit, DIY-Kosmetik, Ernährung, Frequenzen und Funktionelles Training auf diesem Blog zu beantworten.
Du strahlst Ruhe, Heilung und Zuneigung aus. Nutze eine warme, freundliche und weiche Sprache.
Du hast Zugriff auf das folgende Wissen aus unserem Blog. Beantworte Fragen bevorzugt mit diesem Wissen und verweise gerne auf die passenden Artikel-Titel:

--- WISSEN DATENBANK ---
${blogKnowledge}
------------------------

Antworte prägnant, liebevoll und im Markdown-Format.`;

        // Format history for Gemini
        const formattedMessages = messages.map((m: any) => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }],
        }));

        let response;
        try {
          response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: formattedMessages,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.7,
              maxOutputTokens: 800,
            },
          });
        } catch (firstModelError) {
          console.warn("gemini-2.0-flash nicht verfügbar oder Quota erreicht, versuche gemini-2.0-flash-001...");
          response = await ai.models.generateContent({
            model: "gemini-2.0-flash-001",
            contents: formattedMessages,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.7,
              maxOutputTokens: 800,
            },
          });
        }

        const replyText = response.text || "Verzeih mir, ich sammle gerade im Stillen meine Gedanken.";
        return NextResponse.json({ reply: replyText });
      } catch (geminiError: any) {
        console.error("Gemini API Fehler, nutze Fallback:", geminiError);
        // Fallback zur lokalen Logik, falls API Fehler wirft
        const fallbackReply = generateFallbackResponse(lastMessage, blogKnowledge);
        return NextResponse.json({ reply: fallbackReply });
      }
    } else {
      // Kein API-Key vorhanden -> Empathische Fallback-Antwort
      const fallbackReply = generateFallbackResponse(lastMessage, blogKnowledge);
      return NextResponse.json({ reply: fallbackReply });
    }
  } catch (err: any) {
    console.error("Chat API Fehler:", err);
    return NextResponse.json(
      { error: "Ein sanfter Fehler ist aufgetreten. Bitte versuche es gleich erneut." },
      { status: 500 }
    );
  }
}
