"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trees, BookOpen, HeartPulse, Sparkles, LayoutGrid, Utensils, Waves, Activity, Flame, Library } from "lucide-react";
import SearchOverlay from "./SearchOverlay";

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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 pb-4 border-b border-white/15">
        <div className="flex flex-col items-center sm:items-start">
          <span className="text-xs font-sans tracking-[0.25em] text-[#A3C9A8] uppercase mb-1">
            Sanft navigieren & filtern
          </span>
          <div className="w-12 h-[1px] bg-[#D9A05B]/60" />
        </div>
        <SearchOverlay />
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
                  ? "text-white font-medium shadow-lg shadow-[#2D5A3C]/30 border border-[#D9A05B]/40"
                  : "text-white/70 hover:text-white bg-white/5 hover:bg-white/15 border border-white/10 backdrop-blur-md"
              }`}
            >
              {/* Aktiver Hintergrund mit Framer Motion Layout Animation */}
              {isActive && (
                <motion.div
                  layoutId="activeBubbleNav"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-[#2D5A3C] to-[#1e3e29] -z-10"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              <span className={`transition-transform duration-300 ${isActive ? "scale-110 text-[#D9A05B]" : "group-hover:scale-110 text-[#A3C9A8]"}`}>
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
