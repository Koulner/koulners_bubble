export async function verifyTurnstileToken(token: string | null | undefined): Promise<boolean> {
  if (!token) {
    return false;
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    // Wenn kein Secret Key gesetzt ist (z.B. in lokaler Entwicklung ohne Keys),
    // erlauben wir den Fallback, warnen aber.
    console.warn("TURNSTILE_SECRET_KEY is not defined in environment variables. Bypassing Turnstile validation.");
    return true;
  }

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("Error validating Turnstile token:", error);
    return false;
  }
}
