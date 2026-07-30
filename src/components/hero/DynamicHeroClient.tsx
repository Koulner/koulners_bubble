"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ChevronDown } from "lucide-react";
import dynamic from "next/dynamic";
export interface HeroEntry {
  id: string;
  imageSrc: string;
  quote: string;
  author: string;
  altText: string;
}

// Lazy Load des Soundscape Widgets für LCP-Optimierung
const SoundscapeWidget = dynamic(() => import("./SoundscapeWidget"), { ssr: false });
const SearchOverlay = dynamic(() => import("../SearchOverlay"), { ssr: false });

interface DynamicHeroClientProps {
  entries: HeroEntry[];
  sounds: any[];
}

export default function DynamicHeroClient({ entries, sounds }: DynamicHeroClientProps) {
  const [activeEntry, setActiveEntry] = useState<HeroEntry | null>(null);

  useEffect(() => {
    // Vermeidung von Hydration Mismatch: Wähle zufälligen Eintrag erst nach dem ersten Render
    if (entries.length > 0) {
      const randomIndex = Math.floor(Math.random() * entries.length);
      setActiveEntry(entries[randomIndex]);
    }
  }, [entries]);

  if (!activeEntry) {
    return (
      <div className="relative w-full h-screen bg-bg-cream flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.3, 0.7, 0.3], scale: [0.98, 1, 0.98] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-serif text-lg text-text-muted font-serif italic flex items-center gap-2"
        >
          <Sparkles className="w-5 h-5 text-sage animate-spin-slow" />
          Die schützende Bubble öffnet sich...
        </motion.div>
      </div>
    );
  }

  const handleScrollToBlog = () => {
    const section = document.getElementById("journal");
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="relative w-full h-screen min-h-[700px] overflow-hidden flex flex-col justify-between items-center text-center p-6 md:p-12 select-none">
      {/* 1. Hintergrund-Medium (Bild mit weichem Fade) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeEntry.id}
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.75 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, ease: "easeOut" }}
            src={activeEntry.imageSrc}
            alt={activeEntry.altText || "Ambient Background"}
            className="w-full h-full object-cover object-center transform-gpu"
          />
        </AnimatePresence>

        {/* Weiche, schützende Farb- und Lichtverläufe (Die "Bubble"-Atmosphäre) */}
        <div className="absolute inset-0 bg-gradient-to-b from-bg-cream/40 via-bg-cream/20 to-bg-cream/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-bg-cream/30 to-bg-cream/80" />
      </div>

      {/* 2. Sanft schwebende Licht-Bubbles im Hintergrund (Framer Motion) */}
      <div className="absolute inset-0 z-1 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`bubble-${i}`}
            className="absolute rounded-full blur-[80px] md:blur-[120px] mix-blend-multiply opacity-30"
            style={{
              background: i % 2 === 0 ? "#7A9A8B" : "#D9A05B",
              width: Math.random() * 300 + 200,
              height: Math.random() * 300 + 200,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 100 - 50, 0],
              scale: [1, Math.random() * 0.2 + 1.1, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 15,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Top Header */}
      <div className="relative z-50 w-full flex justify-between items-center max-w-7xl mx-auto py-4">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-sage shadow-[0_0_12px_rgba(122,154,139,0.8)] animate-pulse" />
          <span className="font-serif text-lg md:text-xl font-medium tracking-wider text-text-dark">
            Koulners <span className="font-light italic text-sage">Bubbles</span>
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <SearchOverlay />
          <SoundscapeWidget sounds={sounds} />
        </div>
      </div>

      {/* Hero Content (Quote & Search) */}
      <div className="z-10 flex flex-col items-center max-w-4xl mx-auto gap-8 mt-12 md:mt-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeEntry.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 1.5, delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-text-dark font-normal leading-[1.1] tracking-tight">
              {activeEntry.quote}
            </h1>
            <p className="mt-8 text-lg md:text-xl text-text-muted font-sans font-light tracking-wide italic">
              — {activeEntry.author}
            </p>
          </motion.div>
        </AnimatePresence>

      </div>

      {/* Scroll Indicator */}
      <motion.button
        onClick={handleScrollToBlog}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        whileHover={{ scale: 1.1, color: "#7A9A8B" }}
        className="z-10 mb-8 text-text-muted hover:text-sage transition-colors duration-300 flex flex-col items-center gap-3 group cursor-pointer"
        aria-label="Zum Journal scrollen"
      >
        <span className="text-xs uppercase tracking-[0.3em] font-sans">Journal entdecken</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5 opacity-70 group-hover:opacity-100" />
        </motion.div>
      </motion.button>
    </header>
  );
}
