import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Geschützte Route: /studio (außer der Login-Seite selbst)
  if (pathname.startsWith("/studio") && !pathname.startsWith("/studio/login")) {
    if (!req.auth) {
      const loginUrl = new URL("/studio/login", req.nextUrl.origin);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Geschützte API-Routen: /api/copilot, /api/save-content, /api/studio
  if (
    pathname.startsWith("/api/copilot") ||
    pathname.startsWith("/api/save-content") ||
    pathname.startsWith("/api/studio")
  ) {
    if (!req.auth) {
      return NextResponse.json(
        { error: "Unauthorized: Enterprise-grade session required." },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/studio/:path*",
    "/api/copilot/:path*",
    "/api/save-content/:path*",
    "/api/studio/:path*",
  ],
};
