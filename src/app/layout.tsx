import type { Metadata } from "next";
import { Playfair_Display, Outfit } from "next/font/google";
import "./globals.css";
import BubbleMentor from "@/components/BubbleMentor";
import { JsonLd } from "@/components/seo/JsonLd";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://koulnersbubble.de";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Koulners Bubble | Dein Raum für Ruhe, Heilung & Zuneigung",
  description: "Tritt in eine schützende digitale Bubble ein. Inspirierende Gedanken über Natur, Philosophie, ganzheitliche Gesundheit und DIY Kosmetik.",
  keywords: ["Heilung", "Ruhe", "Achtsamkeit", "Philosophie", "Ganzheitliche Gesundheit", "DIY Kosmetik", "Natur", "Koulners Bubble"],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    siteName: "Koulners Bubble",
    title: "Koulners Bubble | Dein Raum für Ruhe, Heilung & Zuneigung",
    description: "Tritt in eine schützende digitale Bubble ein. Inspirierende Gedanken über Natur, Philosophie, ganzheitliche Gesundheit und DIY Kosmetik.",
    url: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="de"
      className={`${outfit.variable} ${playfair.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-bg-cream text-text-dark font-sans selection:bg-sage-light selection:text-text-dark">
        <JsonLd siteUrl={siteUrl} />
        {children}
        <BubbleMentor />
      </body>
    </html>
  );
}
