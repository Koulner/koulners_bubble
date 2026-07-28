import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Parameter auslesen mit sinnvollen Fallbacks
    const title = searchParams.get("title") || "Gedanken aus der Bubble";
    const category = searchParams.get("category") || "Natur & Ruhe";
    const author = searchParams.get("author") || "Koulner";
    const date = searchParams.get("date") || "";

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
            backgroundColor: "#050B08",
            backgroundImage: "radial-gradient(circle at 15% 25%, rgba(45, 90, 60, 0.45) 0%, transparent 60%), radial-gradient(circle at 85% 75%, rgba(217, 160, 91, 0.25) 0%, transparent 50%)",
            color: "#E8F0EB",
            fontFamily: "sans-serif",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtiler feiner Rahmen / Glassmorphism Border */}
          <div
            style={{
              position: "absolute",
              top: "24px",
              left: "24px",
              right: "24px",
              bottom: "24px",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: "28px",
              display: "flex",
              pointerEvents: "none",
            }}
          />

          {/* Top Header: Marken-Logo & Kategorie Badge */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              zIndex: 10,
            }}
          >
            {/* Logo */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  backgroundColor: "#D9A05B",
                  boxShadow: "0 0 16px rgba(217, 160, 91, 0.8)",
                }}
              />
              <span
                style={{
                  fontSize: "26px",
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  color: "#FFFFFF",
                }}
              >
                Koulners <span style={{ fontWeight: 300, fontStyle: "italic", color: "#D9A05B" }}>Bubble</span>
              </span>
            </div>

            {/* Kategorie Pill */}
            <div
              style={{
                display: "flex",
                padding: "10px 24px",
                borderRadius: "999px",
                backgroundColor: "rgba(45, 90, 60, 0.35)",
                border: "1px solid rgba(217, 160, 91, 0.4)",
                color: "#D9A05B",
                fontSize: "18px",
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              {category}
            </div>
          </div>

          {/* Center: Beitragstitel */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flexGrow: 1,
              paddingTop: "30px",
              paddingBottom: "30px",
              zIndex: 10,
            }}
          >
            <h1
              style={{
                fontSize: title.length > 50 ? "54px" : "64px",
                fontWeight: 400,
                lineHeight: 1.2,
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
                margin: 0,
                maxHeight: "310px",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {title}
            </h1>
          </div>

          {/* Bottom Footer: Autor, Datum & Leseanspruch */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              borderTop: "1px solid rgba(255, 255, 255, 0.15)",
              paddingTop: "24px",
              zIndex: 10,
              fontSize: "20px",
              color: "rgba(232, 240, 235, 0.8)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{ color: "#D9A05B", fontWeight: 600 }}>{author}</span>
              {date && (
                <>
                  <span style={{ opacity: 0.4 }}>•</span>
                  <span>{date}</span>
                </>
              )}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "18px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: "rgba(163, 201, 168, 0.9)",
                fontWeight: 600,
              }}
            >
              <span>Der geschützte Leseraum</span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error("OG Image generation failed:", e);
    return new Response("Failed to generate OG image", { status: 500 });
  }
}
