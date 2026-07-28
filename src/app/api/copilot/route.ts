import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
});

export async function POST(req: Request) {
  // 1. Enterprise-Grade Security Check (Crucial Whitelist Session Verification)
  const session = await auth();
  if (!session?.user) {
    console.warn("[COPILOT BLOCKED] Unauthorized attempt without valid whitelist session.");
    return NextResponse.json(
      { error: "Unauthorized: Active whitelisted session required for AI Co-Pilot." },
      { status: 401 }
    );
  }

  try {
    const { rawContent, instruction = "Überarbeite diesen Artikel empathisch, verbessere die Lesbarkeit und stärke das wissenschaftliche E-E-A-T Fundament." } = await req.json();

    if (!rawContent) {
      return NextResponse.json({ error: "No rawContent provided" }, { status: 400 });
    }

    const systemPrompt = `Du bist der "Bubble Guide Co-Pilot", ein weiser, empathischer Editor für die Website "Koulners Bubble".
Deine Aufgabe ist es, den vom Nutzer bereitgestellten Markdown-Artikel zu überarbeiten, zu verbessern oder auf Anweisung zu erweitern.

STRIKTE REGELN:
1. Erhalte das YAML-Frontmatter (--- bis ---) zwingend intakt! Verändere keine bestehenden Bild-URLs oder IDs, es sei denn, der Nutzer bittet ausdrücklich darum.
2. Bewahre den ruhigen, erdenden, bildhaften und empathischen Schreibstil.
3. Wenn wissenschaftliche Aussagen enthalten sind, bewahre die Fußnoten [1], [2] und das IEEE-Quellenverzeichnis am Ende des Textes.
4. Gib AUSSCHLIESSLICH den vollständigen, überarbeiteten Markdown-Text inklusive YAML-Frontmatter zurück - keine Erklärungen oder Chat-Kommentare davor oder danach!`;

    if (process.env.OPENROUTER_API_KEY) {
      console.log(`[COPILOT] Generating revision for user ${session.user.name || session.user.email}...`);
      const result = await generateText({
        model: openrouter.chat("openai/gpt-oss-20b:free"), // Oder ein zuverlässiges Modell in OpenRouter
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: `Anweisung für die Überarbeitung: ${instruction}\n\nHier ist der aktuelle Markdown-Artikel:\n\n${rawContent}`,
          },
        ],
        temperature: 0.5,
        maxOutputTokens: 3000,
      });

      const revisedContent = result.text.trim();
      return NextResponse.json({ revisedContent, success: true });
    } else {
      // Fallback für Offline-/Dev-Modus ohne Key
      console.warn("[COPILOT] No OPENROUTER_API_KEY found, performing fallback formatting.");
      const fallbackRevised = rawContent
        .replace(/\n{3,}/g, "\n\n")
        .trim();
      return NextResponse.json({
        revisedContent: fallbackRevised,
        success: true,
        message: "Fallback revision (No API key present)",
      });
    }
  } catch (error: any) {
    console.error("[COPILOT ERROR]", error);
    return NextResponse.json({ error: error?.message || "Internal Co-Pilot Error" }, { status: 500 });
  }
}
