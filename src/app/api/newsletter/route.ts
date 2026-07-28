import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, categories, frequency } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Bitte gib eine gültige E-Mail-Adresse an." }, { status: 400 });
    }

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
