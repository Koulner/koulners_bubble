"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trees, BookOpen, HeartPulse, Sparkles, LayoutGrid, Utensils, Waves, Activity, Flame, Library } from "lucide-react";

interface NavigationProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export default function Navigation({
  categories,
  activeCategory,
  onSelectCategory,
}: NavigationProps) {
  const allCategories = ["Alle", ...categories];

  // Passende Icons für die beruhigenden Themen
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Natur":
        return <Trees className="w-4 h-4" />;
      case "Philosophie":
        return <BookOpen className="w-4 h-4" />;
      case "Ganzheitliche Gesundheit":
        return <HeartPulse className="w-4 h-4" />;
      case "DIY Kosmetik":
        return <Sparkles className="w-4 h-4" />;
      case "Ernährung":
        return <Utensils className="w-4 h-4" />;
      case "Frequenzen":
        return <Waves className="w-4 h-4" />;
      case "Funktionelles Training":
        return <Activity className="w-4 h-4" />;
      case "Entfaltung":
        return <Flame className="w-4 h-4" />;
      case "Bücher":
        return <Library className="w-4 h-4" />;
      default:
        return <LayoutGrid className="w-4 h-4" />;
    }
  };

  return (
    <nav className="w-full max-w-5xl mx-auto px-6 py-10">
      <div className="flex flex-col items-center mb-6">
        <span className="text-xs font-sans tracking-[0.25em] text-text-muted uppercase mb-2">
          Sanft navigieren
        </span>
        <div className="w-12 h-[1px] bg-sage/40" />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2.5 md:gap-4">
        {allCategories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`group relative flex items-center gap-2.5 px-6 py-3 rounded-full text-sm font-sans transition-all duration-500 cursor-pointer ${
                isActive
                  ? "text-white font-medium shadow-md shadow-sage/20"
                  : "text-text-muted hover:text-text-dark bg-white/60 hover:bg-white border border-border-warm/60"
              }`}
            >
              {/* Aktiver Hintergrund mit Framer Motion Layout Animation */}
              {isActive && (
                <motion.div
                  layoutId="activeBubbleNav"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-sage to-sage-dark -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              <span className={`transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110 text-sage"}`}>
                {getCategoryIcon(cat)}
              </span>

              <span>{cat}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
