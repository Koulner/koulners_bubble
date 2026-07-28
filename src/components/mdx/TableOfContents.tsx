"use client";

import React, { useEffect, useState } from "react";
import { ListTree, ChevronRight } from "lucide-react";

interface TOCItem {
  id: string;
  text: string;
  level: number; // 2 for H2, 3 for H3
}

export function TableOfContents({ markdown }: { markdown?: string }) {
  const [headings, setHeadings] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // 1. Wenn ein Markdown-String direkt übergeben wurde, parsen wir H2 und H3 direkt per Regex
    if (markdown) {
      const regex = /^(#{2,3})\s+(.+)$/gm;
      const items: TOCItem[] = [];
      let match;
      while ((match = regex.exec(markdown)) !== null) {
        const level = match[1].length;
        const text = match[2].trim();
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-äöüß]/g, "")
          .trim()
          .replace(/\s+/g, "-");
        items.push({ id, text, level });
      }
      setHeadings(items);
      return;
    }

    // 2. Automatisches Scannen des gerenderten DOMs im Artikel/Vorschau-Bereich
    const findHeadings = () => {
      const containerEl =
        document.querySelector("article") ||
        document.querySelector(".prose") ||
        document.body;

      const elements = Array.from(containerEl.querySelectorAll("h2, h3"));
      
      const items: TOCItem[] = elements.map((el) => {
        // Falls kein id von rehype-slug vergeben wurde (oder bei dynamischer Vorschau), generieren wir eine ID
        if (!el.id) {
          el.id = (el.textContent || "")
            .toLowerCase()
            .replace(/[^a-z0-9\s-äöüß]/g, "")
            .trim()
            .replace(/\s+/g, "-");
        }
        return {
          id: el.id,
          text: el.textContent || "",
          level: el.tagName.toLowerCase() === "h2" ? 2 : 3,
        };
      });

      setHeadings(items);
    };

    findHeadings();
    // Kurzes Nachladen für dynamisches MDX/Client-Rendering
    const timer = setTimeout(findHeadings, 350);

    // Scroll-Spy zur farblichen Hervorhebung des aktiven Kapitels beim Scrollen
    const handleScroll = () => {
      const containerEl =
        document.querySelector("article") ||
        document.querySelector(".prose") ||
        document.body;

      const elements = Array.from(containerEl.querySelectorAll("h2, h3"));
      const scrollPosition = window.scrollY + 130; // Offset für Sticky Headers

      for (let i = elements.length - 1; i >= 0; i--) {
        const el = elements[i] as HTMLElement;
        if (el.offsetTop <= scrollPosition) {
          setActiveId(el.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [markdown]);

  if (headings.length === 0) return null;

  const scrollToHeading = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveId(id);
    }
  };

  return (
    <nav
      aria-label="Inhaltsverzeichnis"
      className="my-8 p-6 rounded-3xl bg-[#0F1B15]/90 border border-[#2D5A3C]/40 shadow-xl backdrop-blur-md not-prose"
    >
      <div className="flex items-center gap-2.5 pb-4 mb-4 border-b border-[#2D5A3C]/30 text-[#D9A05B]">
        <ListTree className="w-5 h-5" />
        <h4 className="text-base font-bold tracking-tight text-white m-0">Inhaltsverzeichnis</h4>
      </div>
      <ul className="space-y-2 m-0 p-0 list-none font-sans text-sm">
        {headings.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li
              key={item.id}
              className={`transition-all duration-200 ${item.level === 3 ? "pl-5" : "pl-1"}`}
            >
              <a
                href={`#${item.id}`}
                onClick={(e) => scrollToHeading(item.id, e)}
                className={`flex items-center gap-1.5 py-1 px-3 rounded-xl transition-colors no-underline block leading-snug ${
                  isActive
                    ? "bg-[#2D5A3C]/60 text-[#D9A05B] font-semibold border-l-2 border-[#D9A05B] shadow-sm"
                    : "text-[#E8F0EB]/80 hover:text-white hover:bg-[#2D5A3C]/25"
                }`}
              >
                {item.level === 3 && <ChevronRight className="w-3.5 h-3.5 opacity-70 shrink-0" />}
                <span className="truncate">{item.text}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
