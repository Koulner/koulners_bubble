"use client";

import React, { useState, useRef } from "react";
import HeroSection from "./HeroSection";
import Navigation from "./Navigation";
import BlogGrid from "./BlogGrid";
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
    <main className="min-h-screen flex flex-col bg-bg-cream selection:bg-sage-light">
      {/* 1. Das dynamische 100vh Erlebnis */}
      <HeroSection onScrollToBlog={scrollToBlog} />

      {/* 2. Der Journal- & Artikel-Bereich */}
      <div ref={exploreRef} className="relative z-10 bg-bg-cream pt-16">
        {/* Softes Übergangslicht */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-[1px] bg-gradient-to-r from-transparent via-border-warm to-transparent" />

        <div className="text-center max-w-3xl mx-auto px-6 pt-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sage-light/60 text-sage-dark text-xs uppercase tracking-widest font-sans mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Der geschützte Leseraum</span>
          </div>
          <h2 className="font-serif text-3xl md:text-5xl text-text-dark font-normal tracking-tight mb-4">
            Gedanken aus der Bubble
          </h2>
          <p className="font-sans text-text-muted text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Nimm dir Zeit. Jeder Artikel hier wurde entworfen, um deinem Geist Ruhe zu schenken und deine Seele zu nähren.
          </p>
        </div>

        {/* 3. Minimalistische Kategorie-Navigation */}
        <Navigation
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
        />

        {/* 4. Das Blog-Grid */}
        <BlogGrid posts={initialPosts} activeCategory={activeCategory} />
      </div>

      {/* 5. Softer Footer & Hinweis für Hermes KI-Agenten */}
      <footer className="mt-auto bg-bg-sand/70 border-t border-border-warm/80 py-16 px-6 text-center relative overflow-hidden">
        {/* Sanfte Hintergrund-Glows im Footer */}
        <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-96 h-96 bg-sage/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center gap-8">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-terracotta" />
            <span className="font-serif text-xl font-medium text-text-dark">
              Koulners <span className="font-light italic text-sage-dark">Bubble</span>
            </span>
          </div>

          <p className="font-serif italic text-base md:text-lg text-text-muted max-w-xl">
            &ldquo;Mögest du in dieser Bubble stets den Frieden finden, den die äußere Welt manchmal verbirgt.&rdquo;
          </p>

          <div className="w-24 h-[1px] bg-border-warm" />

          {/* Hermes Agent Status-Box */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 p-5 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 max-w-xl text-left shadow-sm">
            <div className="p-3 rounded-xl bg-sage-light text-sage-dark flex-shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div className="text-xs font-sans">
              <div className="flex items-center gap-1.5 font-medium text-text-dark mb-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-sage" />
                <span>Hermes AI Agent Ready</span>
              </div>
              <p className="text-text-muted leading-relaxed">
                Dieses Content-System überwacht <code className="bg-bg-sand px-1.5 py-0.5 rounded text-[11px]">/content/blog/</code>. Neuer Markdown-Content wird autonom eingelesen und sanft animiert gerendert.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-6 text-xs font-sans text-text-muted/80 pt-4">
            <span>© {new Date().getFullYear()} Koulners Bubble</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              Mit <Heart className="w-3 h-3 text-terracotta inline fill-terracotta/20" /> und Ruhe gestaltet
            </span>
            <span>•</span>
            <a href="/studio" className="hover:text-terracotta transition-colors flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-sage inline" /> Bubble Studio
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
