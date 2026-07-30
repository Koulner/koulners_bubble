import { NextResponse } from "next/server";

import { z } from "zod";
import rateLimit from "@/lib/rate-limit";

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokenPerInterval: 500,
});

const newsletterSchema = z.object({
  email: z.string().email("Bitte gib eine gültige E-Mail-Adresse an.").max(100),
  categories: z.array(z.string().max(50)).optional().default([]),
  frequency: z.enum(["always", "weekly", "monthly"]).optional().default("always"),
});

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown-ip";
    try {
      await limiter.check(5, ip); // max 5 requests per IP per min
    } catch {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = newsletterSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Ungültige Eingabe." },
        { status: 400 }
      );
    }

    const { email, categories, frequency } = result.data;

    // TODO: Hier später Mailchimp / Brevo / ConvertKit API-Aufruf einbauen
    console.log("Mock: Neue Newsletter-Anmeldung ->", {
      email,
      tags: categories,
      frequency_workflow: frequency
    });

    // Simuliere kurze Ladezeit
    await new Promise((resolve) => setTimeout(resolve, 800));

    return NextResponse.json({ success: true, message: "Abonniert" }, { status: 200 });
  } catch (error) {
    console.error("Newsletter API Error:", error);
    return NextResponse.json({ error: "Interner Server Fehler" }, { status: 500 });
  }
}
