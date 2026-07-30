"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { TableOfContents } from "@/components/mdx/TableOfContents";
import { ShieldAlert } from "lucide-react";

export { TableOfContents };

// 1. CustomImage Komponente (Weiche abgerundete Ecken & Schatten)
export function CustomImage({
  src,
  alt = "",
  caption,
}: {
  src?: string;
  alt?: string;
  caption?: string;
}) {
  if (!src) return null;
  return (
    <figure className="my-8 flex flex-col items-center">
      <div className="relative w-full overflow-hidden rounded-2xl shadow-xl border border-border-warm/60 bg-bg-sand/30">
        <img
          src={src}
          alt={alt}
          className="w-full h-auto object-cover max-h-[550px] transition-transform duration-700 hover:scale-[1.01]"
          loading="lazy"
        />
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-xs font-sans text-text-muted italic max-w-lg">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// 2. YouTube Komponente (DSGVO-konform mit Consent-Blocker)
export function YouTube({ id }: { id?: string }) {
  const [consent, setConsent] = useState<string>("pending");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const checkConsent = () => setConsent(localStorage.getItem("cookie_consent") || "pending");
    checkConsent();
    window.addEventListener("cookie_consent_changed", checkConsent);
    return () => window.removeEventListener("cookie_consent_changed", checkConsent);
  }, []);

  if (!id) return null;

  if (!isMounted) {
    return <div className="my-8 w-full aspect-video rounded-2xl bg-bg-sand/40 animate-pulse border border-border-warm/40" />;
  }

  if (consent !== "accepted_all") {
    return (
      <div className="my-8 w-full overflow-hidden rounded-2xl shadow-sm border border-border-warm/60 bg-white/40 backdrop-blur-md aspect-video relative flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-sage-light flex items-center justify-center mb-4 border border-sage/30">
          <ShieldAlert className="w-5 h-5 text-sage-dark" />
        </div>
        <p className="text-text-dark font-serif text-lg mb-2">Externe Medien blockiert</p>
        <p className="text-text-muted text-sm max-w-sm mb-5 font-sans leading-relaxed">
          Bitte akzeptiere alle Cookies im Banner unten, um dieses YouTube-Video abzuspielen. Ohne deine Erlaubnis bauen wir keine Verbindung zu externen Servern auf.
        </p>
        <button 
          onClick={() => {
            localStorage.setItem("cookie_consent", "accepted_all");
            window.dispatchEvent(new Event("cookie_consent_changed"));
          }}
          className="px-5 py-2.5 bg-sage hover:bg-sage-dark border border-sage/20 shadow-md rounded-lg text-xs font-sans tracking-wide uppercase text-white transition-all duration-300"
        >
          Externen Inhalt erlauben
        </button>
      </div>
    );
  }

  return (
    <div className="my-8 w-full overflow-hidden rounded-2xl shadow-xl border border-border-warm/60 bg-bg-sand/30 aspect-video relative">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title="YouTube video player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute top-0 left-0 w-full h-full border-0"
      />
    </div>
  );
}

// 3. Grid Komponente (Side-by-Side Content)
export function Grid({ children }: { children?: React.ReactNode }) {
  return (
    <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      {children}
    </div>
  );
}

// Hilfsfunktion zur Erkennung ob ein React-Kind ein Block-/Medien-Element ist
const hasBlockElement = (children: React.ReactNode): boolean => {
  let found = false;
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const type = child.type as any;
    const typeName = typeof type === "string" ? type : type?.name || type?.displayName || "";
    if (
      ["img", "figure", "div", "customimage", "youtube", "grid", "iframe", "tableofcontents", "toc", "nav"].includes(
        typeName.toLowerCase()
      ) ||
      ["CustomImage", "YouTube", "Grid", "TableOfContents"].includes(typeName)
    ) {
      found = true;
    }
    const props = (child as any).props;
    if (props && props.children && !found) {
      if (hasBlockElement(props.children)) {
        found = true;
      }
    }
  });
  return found;
};

// Hilfsfunktion zur Erkennung ob der AST-Node ein Block-/Medien-Element enthält
const hasAstBlockElement = (node: any): boolean => {
  if (!node || !Array.isArray(node.children)) return false;
  return node.children.some((child: any) => {
    if (child.type === "element") {
      const tag = (child.tagName || "").toLowerCase();
      if (["img", "figure", "div", "customimage", "youtube", "grid", "iframe", "tableofcontents", "toc", "nav"].includes(tag)) {
        return true;
      }
      if (hasAstBlockElement(child)) return true;
    }
    return false;
  });
};

// Das komplette MDX-Komponenten-Mapping für next-mdx-remote und den Editor
export const mdxComponents = {
  CustomImage,
  YouTube,
  Grid,
  TableOfContents,
  // Intelligenter Absatz-Renderer zur Vermeidung von HTML-Nesting-Fehlern (div/figure in p)
  p: ({ children, node, ...props }: any) => {
    const isBlock = hasAstBlockElement(node) || hasBlockElement(children);
    if (isBlock) {
      return (
        <div className="mb-6 leading-relaxed" {...props}>
          {children}
        </div>
      );
    }
    return (
      <p className="mb-6 leading-relaxed" {...props}>
        {children}
      </p>
    );
  },
  // Lowercase aliases für rehype-raw (Client-Editor-Preview)
  customimage: ({ src, alt, caption }: any) => <CustomImage src={src} alt={alt} caption={caption} />,
  youtube: ({ id }: any) => <YouTube id={id} />,
  grid: ({ children }: any) => <Grid>{children}</Grid>,
  tableofcontents: ({ markdown }: any) => <TableOfContents markdown={markdown} />,
  toc: ({ markdown }: any) => <TableOfContents markdown={markdown} />,
  // Fallback-Wrapper für Standard <img /> in Markdown/MDX
  img: ({ src, alt }: { src?: string; alt?: string }) => (
    <CustomImage src={src} alt={alt} />
  ),
  // Responsive Tabellen auf Mobile
  table: ({ children, ...props }: any) => (
    <div className="w-full overflow-x-auto block whitespace-nowrap pb-2 min-touch">
      <table {...props}>{children}</table>
    </div>
  ),
};
