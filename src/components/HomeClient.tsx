"use client";

import React, { useState, useRef } from "react";
import HeroSection from "./HeroSection";
import Navigation from "./Navigation";
import BlogSection from "./BlogSection";
import { BlogPostMeta } from "@/lib/content";
import { Sparkles, Heart, Bot, ShieldCheck } from "lucide-react";

interface HomeClientProps {
  initialPosts: BlogPostMeta[];
  categories: string[];
}

export default function HomeClient({ initialPosts, categories }: HomeClientProps) {
  const [activeCategory, setActiveCategory] = useState<string>("Alle");
  const exploreRef = useRef<HTMLDivElement | null>(null);

  const scrollToBlog = () => {
    exploreRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen flex flex-col bg-[#050B08] selection:bg-[#2D5A3C] selection:text-white">
      {/* 1. Das dynamische 100vh Erlebnis */}
      <HeroSection onScrollToBlog={scrollToBlog} />

      {/* 2. Der Journal- & Artikel-Bereich (Magazin Glassmorphism Nebel) */}
      <div ref={exploreRef} className="relative z-10 bg-gradient-to-b from-[#050B08] via-[#0D1812] to-[#050B08] text-[#E8F0EB] pt-20 overflow-hidden">
        {/* Softes Übergangslicht vom Hero */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-[#D9A05B]/40 to-transparent shadow-[0_0_15px_rgba(217,160,91,0.5)]" />

        <div className="text-center max-w-3xl mx-auto px-6 pt-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2D5A3C]/30 text-[#D9A05B] text-xs uppercase tracking-widest font-sans mb-6 border border-[#D9A05B]/30 shadow-lg backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Der geschützte Leseraum</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-6xl text-white font-normal tracking-tight mb-5 drop-shadow-sm">
            Gedanken aus der Bubble
          </h2>
          <p className="font-sans text-[#A3C9A8]/90 text-base md:text-lg max-w-xl mx-auto leading-relaxed font-light">
            Nimm dir Zeit. Jeder Artikel hier wurde entworfen, um deinem Geist Ruhe zu schenken und deine Seele zu nähren.
          </p>
        </div>

        {/* 3. Minimalistische Kategorie-Navigation */}
        <Navigation
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />

        {/* 4. Das Bento Magazin Blog-Grid */}
        <BlogSection posts={initialPosts} activeCategory={activeCategory} />
      </div>

      {/* 5. Softer Footer im Dark Glassmorphism-Stil */}
      <footer className="mt-auto bg-[#030705] border-t border-white/10 py-16 px-6 text-center relative overflow-hidden text-[#E8F0EB]/80">
        {/* Sanfte Hintergrund-Glows im Footer */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#2D5A3C]/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D9A05B] shadow-[0_0_10px_rgba(217,160,91,0.8)]" />
            <span className="font-serif text-xl font-medium text-white tracking-wide">
              Koulners <span className="font-light italic text-[#D9A05B]">Bubble</span>
            </span>
          </div>

          <p className="font-serif italic text-base md:text-lg text-[#A3C9A8]/80 max-w-xl font-light">
            &ldquo;Mögest du in dieser Bubble stets den Frieden finden, den die äußere Welt manchmal verbirgt.&rdquo;
          </p>

          <div className="w-24 h-[1px] bg-white/15" />

          {/* Hermes Agent Status-Box in Glassmorphism */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 max-w-xl text-left shadow-xl hover:border-white/20 transition-all">
            <div className="p-3 rounded-xl bg-[#2D5A3C]/40 text-[#D9A05B] border border-[#D9A05B]/30 flex-shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div className="text-xs font-sans">
              <div className="flex items-center gap-1.5 font-medium text-white mb-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D9A05B]" />
                <span>Hermes AI Agent Ready</span>
              </div>
              <p className="text-[#A3C9A8]/80 leading-relaxed">
                Dieses Content-System überwacht <code className="bg-white/10 px-1.5 py-0.5 rounded text-[11px] text-[#D9A05B]">/content/blog/</code>. Neuer Markdown-Content wird autonom eingelesen und im Bento-Stil gerendert.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 text-xs font-sans text-white/50 pt-4">
            <span>© {new Date().getFullYear()} Koulners Bubbles</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              Mit <Heart className="w-3 h-3 text-[#D9A05B] inline fill-[#D9A05B]/20" /> und Ruhe gestaltet
            </span>
            <span>•</span>
            <a href="/studio" className="hover:text-[#D9A05B] transition-colors flex items-center gap-1 text-white/80">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D9A05B] inline" /> Bubble Studio
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
