"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { BlogPostMeta } from "@/lib/content";
import { normalizeCategories } from "@/lib/categories";
import BlogCard from "./BlogCard";
import { Sparkles, Compass } from "lucide-react";

interface BlogSectionProps {
  posts: BlogPostMeta[];
  activeCategory: string;
}

// Bento Grid Logik: Bestimmt die Abmessungen der Karten für ein fesselndes Magazin-Layout
const getBentoSpan = (index: number) => {
  if (index === 0) {
    // 1. Der Featured Post: Auf Desktop doppelte Breite und doppelte Höhe (md:col-span-2 md:row-span-2)
    return "col-span-1 md:col-span-2 lg:col-span-2 row-span-2 min-h-[520px] md:min-h-[640px]";
  }

  // Wiederkehrendes, abwechslungsreiches Bento-Muster für ein 3-Spalten CSS Grid
  const pos = (index - 1) % 6;
  switch (pos) {
    case 0: // Spalte 3, Zeile 1
      return "col-span-1 md:col-span-1 lg:col-span-1 row-span-1 min-h-[340px]";
    case 1: // Spalte 3, Zeile 2
      return "col-span-1 md:col-span-1 lg:col-span-1 row-span-1 min-h-[340px]";
    case 2: // Spalten 1 & 2, Zeile 3 (Querformat-Feature)
      return "col-span-1 md:col-span-2 lg:col-span-2 row-span-1 min-h-[340px]";
    case 3: // Spalte 3, Zeile 3
      return "col-span-1 md:col-span-1 lg:col-span-1 row-span-1 min-h-[340px]";
    case 4: // Spalte 1, Zeile 4
      return "col-span-1 md:col-span-1 lg:col-span-1 row-span-1 min-h-[340px]";
    case 5: // Spalten 2 & 3, Zeile 4 (Querformat-Feature rechts)
      return "col-span-1 md:col-span-2 lg:col-span-2 row-span-1 min-h-[340px]";
    default:
      return "col-span-1 md:col-span-1 lg:col-span-1 row-span-1 min-h-[340px]";
  }
};

export default function BlogSection({ posts, activeCategory }: BlogSectionProps) {
  const filteredPosts =
    activeCategory === "Alle"
      ? posts
      : posts.filter((post) => {
          const cats = normalizeCategories(post.category);
          return cats.includes(activeCategory);
        });

  return (
    <section className="relative w-full max-w-7xl mx-auto px-6 pb-32">
      {/* Atmosphärische, schwebende Hintergrund-Glows im Glassmorphism Nebel */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-[#2D5A3C]/15 rounded-full blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 right-10 w-[30rem] h-[30rem] bg-[#D9A05B]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header für die gefilterte Ansicht */}
      <div className="flex items-center justify-between mb-10 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5 text-xs font-mono text-[#A3C9A8] uppercase tracking-widest">
          <Compass className="w-4 h-4 text-[#D9A05B]" />
          <span>Kuration: {activeCategory}</span>
        </div>
        <span className="text-xs font-mono text-white/50">
          {filteredPosts.length} {filteredPosts.length === 1 ? "Gedankenraum" : "Gedankenräume"}
        </span>
      </div>

      <AnimatePresence mode="popLayout">
        {filteredPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-28 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-8 max-w-xl mx-auto shadow-2xl"
          >
            <Sparkles className="w-10 h-10 text-[#D9A05B] mx-auto mb-4 animate-spin-slow" />
            <h3 className="font-serif text-2xl text-white mb-2 font-normal">
              Keine Artikel in dieser Kategorie gefunden
            </h3>
            <p className="text-sm text-[#A3C9A8]/80 leading-relaxed font-sans">
              Der Agent Hermes wird in Kürze neue inspirierende Gedanken und tiefgründige Recherchen für diesen Raum generieren.
            </p>
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 auto-rows-[minmax(340px,_auto)]"
          >
            {filteredPosts.map((post, index) => {
              const spanClass = getBentoSpan(index);
              const isFeatured = index === 0;

              return (
                <BlogCard
                  key={post.slug}
                  post={post}
                  index={index}
                  isFeatured={isFeatured}
                  spanClass={spanClass}
                />
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
