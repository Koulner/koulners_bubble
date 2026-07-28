"use client";

import React from "react";
import Image from "next/image";

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

// 2. YouTube Komponente (Responsiver 16:9 Container)
export function YouTube({ id }: { id?: string }) {
  if (!id) return null;
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
      ["img", "figure", "div", "customimage", "youtube", "grid", "iframe"].includes(
        typeName.toLowerCase()
      ) ||
      ["CustomImage", "YouTube", "Grid"].includes(typeName)
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
      if (["img", "figure", "div", "customimage", "youtube", "grid", "iframe"].includes(tag)) {
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
  // Fallback-Wrapper für Standard <img /> in Markdown/MDX
  img: ({ src, alt }: { src?: string; alt?: string }) => (
    <CustomImage src={src} alt={alt} />
  ),
};
