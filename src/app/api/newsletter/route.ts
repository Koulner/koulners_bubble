import { NextResponse } from "next/server";
import { z } from "zod";
import rateLimit from "@/lib/rate-limit";
import { verifyTurnstileToken } from "@/lib/turnstile";

// Rate Limiter: max 5 requests per minute per IP
const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

// Zod Schema for input validation
const newsletterSchema = z.object({
  email: z.string().email("Bitte gib eine gültige E-Mail-Adresse an.").max(100),
  categories: z.array(z.string().max(50)).optional().default([]),
  frequency: z.enum(["always", "weekly", "monthly"]).optional().default("always"),
  turnstileToken: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting
    const ip = req.headers.get("x-forwarded-for") || "unknown-ip";
    try {
      await limiter.check(5, ip); // 5 requests per IP
    } catch {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // 2. Input Validation (Zod)
    const body = await req.json();
    const result = newsletterSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Ungültige Eingabe." },
        { status: 400 }
      );
    }

    const { email, categories, frequency, turnstileToken } = result.data;

    // 3. Turnstile Validation
    const isHuman = await verifyTurnstileToken(turnstileToken);
    if (!isHuman) {
      return NextResponse.json(
        { error: "Security check failed (Turnstile). Please try again." },
        { status: 400 }
      );
    }

    // TODO: Hier später Mailchimp / Brevo / ConvertKit API-Aufruf einbauen
    console.log("Mock: Neue Newsletter-Anmeldung ->", {
      email,
      tags: categories,
      frequency_workflow: frequency,
    });

    // Simuliere kurze Ladezeit
    await new Promise((resolve) => setTimeout(resolve, 800));

    return NextResponse.json({ success: true, message: "Abonniert" }, { status: 200 });
  } catch (error) {
    console.error("Newsletter API Error:", error);
    return NextResponse.json({ error: "Interner Server Fehler" }, { status: 500 });
  }
}
