import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Dynamic params with elegant defaults
    const title = searchParams.get("title") || "Gedanken aus der Bubble";
    const category = searchParams.get("category") || "Der geschützte Leseraum";
    const author = searchParams.get("author") || "Koulner";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "70px 80px",
            background: "linear-gradient(135deg, #050B08 0%, #0D1E14 50%, #050B08 100%)",
            color: "#E8F0EB",
            fontFamily: "sans-serif",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Ambient Glowing Orbs in Background */}
          <div
            style={{
              position: "absolute",
              top: "-150px",
              right: "-100px",
              width: "600px",
              height: "600px",
              background: "radial-gradient(circle, rgba(45, 90, 60, 0.35) 0%, rgba(0,0,0,0) 70%)",
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-200px",
              left: "-100px",
              width: "700px",
              height: "700px",
              background: "radial-gradient(circle, rgba(217, 160, 91, 0.2) 0%, rgba(0,0,0,0) 70%)",
              borderRadius: "50%",
            }}
          />

          {/* Glassmorphism Inner Frame */}
          <div
            style={{
              position: "absolute",
              inset: "30px",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "36px",
              background: "rgba(255, 255, 255, 0.02)",
              display: "flex",
            }}
          />

          {/* Top Bar: Brand & Category Badge */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              zIndex: 10,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  background: "#D9A05B",
                  boxShadow: "0 0 15px rgba(217, 160, 91, 0.8)",
                }}
              />
              <span
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: "#FFFFFF",
                  letterSpacing: "1px",
                }}
              >
                Koulners <span style={{ color: "#D9A05B", fontStyle: "italic", fontWeight: 400 }}>Bubble</span>
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 24px",
                borderRadius: "999px",
                background: "rgba(45, 90, 60, 0.5)",
                border: "1px solid rgba(217, 160, 91, 0.4)",
                color: "#D9A05B",
                fontSize: 20,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}
            >
              {category}
            </div>
          </div>

          {/* Main Title Area */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flex: 1,
              paddingTop: "30px",
              paddingBottom: "30px",
              zIndex: 10,
            }}
          >
            <h1
              style={{
                fontSize: title.length > 55 ? 48 : title.length > 35 ? 58 : 68,
                fontWeight: 700,
                color: "#FFFFFF",
                lineHeight: 1.15,
                margin: 0,
                textShadow: "0 4px 20px rgba(0,0,0,0.5)",
                display: "-webkit-box",
                overflow: "hidden",
              }}
            >
              {title}
            </h1>
          </div>

          {/* Bottom Bar: Author & Tagline */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              zIndex: 10,
              borderTop: "1px solid rgba(255, 255, 255, 0.15)",
              paddingTop: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: 22, color: "#A3C9A8" }}>Von</span>
              <span style={{ fontSize: 22, color: "#FFFFFF", fontWeight: 600, fontStyle: "italic" }}>
                {author}
              </span>
            </div>

            <div
              style={{
                fontSize: 20,
                color: "#A3C9A8",
                letterSpacing: "3px",
                textTransform: "uppercase",
              }}
            >
              Heilung • Ruhe • Zuneigung
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    console.error("OG Image generation error:", e);
    return new Response("Failed to generate OG Image", { status: 500 });
  }
}
