"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HERO_EXPERIENCES, HeroExperience } from "@/data/heroExperiences";
import AmbientAudioPlayer from "./AmbientAudioPlayer";
import SearchOverlay from "./SearchOverlay";
import { ChevronDown, Sparkles, Feather } from "lucide-react";

interface HeroSectionProps {
  onScrollToBlog?: () => void;
}

export default function HeroSection({ onScrollToBlog }: HeroSectionProps) {
  const [experience, setExperience] = useState<HeroExperience | null>(null);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    // Wähle beim Laden zufällig ein Erlebnis aus
    const randomIndex = Math.floor(Math.random() * HERO_EXPERIENCES.length);
    setExperience(HERO_EXPERIENCES[randomIndex]);
  }, []);

  if (!experience) {
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

  return (
    <header className="relative w-full h-screen min-h-[700px] overflow-hidden flex flex-col justify-between items-center text-center p-6 md:p-12 select-none">
      {/* 1. Hintergrund-Medium (Bild/Video mit sanftem Zoom/Ken-Burns-Effekt) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.img
          initial={{ scale: 1.15, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.75 }}
          transition={{ duration: 3, ease: "easeOut" }}
          src={experience.mediaUrl}
          alt="Ambient Background"
          className="w-full h-full object-cover object-center transform-gpu"
        />

        {/* Weiche, schützende Farb- und Lichtverläufe (Die "Bubble"-Atmosphäre) */}
        <div className="absolute inset-0 bg-gradient-to-b from-bg-cream/40 via-bg-cream/20 to-bg-cream/95" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-bg-cream/30 to-bg-cream/80" />
      </div>

      {/* 2. Sanft schwebende Licht-Bubbles im Hintergrund (Framer Motion) */}
      <div className="absolute inset-0 z-1 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: `${15 + (i * 15)}vw`,
              y: "110vh",
              scale: 0.6 + (i * 0.15),
              opacity: 0,
            }}
            animate={{
              y: "-20vh",
              x: `${10 + (i * 15) + (i % 2 === 0 ? 5 : -5)}vw`,
              opacity: [0, 0.45, 0.45, 0],
            }}
            transition={{
              duration: 18 + (i * 4),
              repeat: Infinity,
              delay: i * 2.5,
              ease: "linear",
            }}
            className="absolute w-24 h-24 md:w-40 md:h-40 rounded-full border border-white/40 bg-gradient-to-tr from-white/20 via-white/5 to-transparent backdrop-blur-[2px] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)]"
          />
        ))}
      </div>

      {/* 3. Top-Bar / Marken-Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.3 }}
        className="relative z-10 w-full max-w-6xl flex justify-between items-center py-4"
      >
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-sage shadow-[0_0_12px_rgba(122,154,139,0.8)] animate-pulse" />
          <span className="font-serif text-lg md:text-xl font-medium tracking-wider text-text-dark">
            Koulners <span className="font-light italic text-sage">Bubble</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/50 backdrop-blur-sm border border-white/40 text-xs font-sans text-text-muted">
            <Feather className="w-3.5 h-3.5 text-terracotta" />
            <span>Heilung • Ruhe • Zuneigung</span>
          </div>
          <SearchOverlay />
        </div>
      </motion.div>

      {/* 4. Das Zitat mit weichem Blur-In-Effekt */}
      <div className="relative z-10 max-w-4xl mx-auto my-auto px-4 flex flex-col items-center justify-center">
        <motion.div
          initial={{ opacity: 0, filter: "blur(20px)", scale: 0.95 }}
          animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
          transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
          className="flex flex-col items-center"
        >
          {/* Kategorie-Tag */}
          <span className="inline-block px-4 py-1.5 mb-6 rounded-full bg-sage-light/80 text-sage-dark font-sans text-xs tracking-widest uppercase font-medium border border-sage/20 shadow-sm">
            {experience.category}
          </span>

          {/* Hauptzitat */}
          <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-text-dark font-normal leading-relaxed md:leading-tight tracking-tight max-w-3xl mb-8">
            &ldquo;{experience.quote}&rdquo;
          </h1>

          {/* Autor / Quelle */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 1.5 }}
            className="flex items-center gap-3 text-text-muted font-serif text-base md:text-lg italic"
          >
            <span className="w-8 h-[1px] bg-border-warm" />
            <span>— {experience.author}</span>
            <span className="w-8 h-[1px] bg-border-warm" />
          </motion.div>
        </motion.div>
      </div>

      {/* 5. Audio-Player & "Eintreten"-Interaktion */}
      <div className="relative z-10 w-full flex flex-col items-center pb-6 gap-8">
        <AmbientAudioPlayer
          audioUrl={experience.audioUrl}
          audioLabel={experience.audioLabel}
          onEnter={() => setHasEntered(true)}
        />

        {/* Sanfter Scroll-Hinweis */}
        <motion.button
          onClick={onScrollToBlog}
          initial={{ opacity: 0 }}
          animate={{ opacity: hasEntered ? 1 : 0.7 }}
          whileHover={{ y: 3 }}
          transition={{ duration: 1, delay: 2 }}
          className="flex flex-col items-center gap-2 text-text-muted hover:text-text-dark transition-colors font-sans text-xs tracking-widest uppercase cursor-pointer py-2"
        >
          <span>Den Raum erkunden</span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-4 h-4 text-sage" />
          </motion.div>
        </motion.button>
      </div>
    </header>
  );
}
