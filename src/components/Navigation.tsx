"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trees, BookOpen, HeartPulse, Sparkles, LayoutGrid, Utensils, Waves, Activity, Flame, Library, Menu, X } from "lucide-react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Verhindere Scrollen auf Mobile, wenn das Menü offen ist
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const handleCategorySelect = (cat: string) => {
    onSelectCategory(cat);
    setIsMobileMenuOpen(false);
  };

  // Passende Icons für die beruhigenden Themen
  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "Natur": return <Trees className="w-5 h-5 md:w-4 md:h-4" />;
      case "Philosophie": return <BookOpen className="w-5 h-5 md:w-4 md:h-4" />;
      case "Ganzheitliche Gesundheit": return <HeartPulse className="w-5 h-5 md:w-4 md:h-4" />;
      case "DIY Kosmetik": return <Sparkles className="w-5 h-5 md:w-4 md:h-4" />;
      case "Ernährung": return <Utensils className="w-5 h-5 md:w-4 md:h-4" />;
      case "Frequenzen": return <Waves className="w-5 h-5 md:w-4 md:h-4" />;
      case "Funktionelles Training": return <Activity className="w-5 h-5 md:w-4 md:h-4" />;
      case "Entfaltung": return <Flame className="w-5 h-5 md:w-4 md:h-4" />;
      case "Bücher": return <Library className="w-5 h-5 md:w-4 md:h-4" />;
      default: return <LayoutGrid className="w-5 h-5 md:w-4 md:h-4" />;
    }
  };

  return (
    <nav className="w-full max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10">
      <div className="flex flex-row items-center justify-between gap-2 mb-6 md:mb-8 pb-4 border-b border-white/15">
        <div className="flex flex-col items-start">
          <span className="text-[10px] md:text-xs font-sans tracking-[0.2em] md:tracking-[0.25em] text-[#A3C9A8] uppercase mb-1">
            Sanft navigieren
          </span>
          <div className="w-10 md:w-12 h-[1px] bg-[#D9A05B]/60" />
        </div>
        
        <div className="flex items-center gap-3">
          <SearchOverlay />
          
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden text-[#A3C9A8] hover:text-white bg-white/5 hover:bg-white/10 rounded-full min-touch flex items-center justify-center transition-colors border border-white/10"
            aria-label="Kategorien öffnen"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex flex-wrap items-center justify-center gap-4">
        {allCategories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`group relative flex items-center gap-2.5 px-6 py-3 rounded-full text-sm font-sans transition-all duration-500 cursor-pointer min-touch ${
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

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#050B08]/80 backdrop-blur-md md:hidden flex justify-end"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-4/5 max-w-sm h-full bg-[#0D1E14] border-l border-white/10 shadow-2xl flex flex-col pt-safe pb-safe"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 pb-4 border-b border-white/10">
                <span className="font-serif text-[#E8F0EB] text-xl">Kategorien</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-[#A3C9A8] hover:text-white bg-white/5 hover:bg-white/10 rounded-full min-touch flex items-center justify-center transition-colors border border-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5 pb-20">
                {allCategories.map((cat) => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => handleCategorySelect(cat)}
                      className={`flex items-center gap-3.5 px-5 py-4 rounded-xl text-[15px] font-sans transition-all w-full text-left min-touch shadow-sm ${
                        isActive
                          ? "bg-[#2D5A3C] text-white border border-[#D9A05B]/30"
                          : "text-white/80 hover:text-white bg-white/5 border border-white/5"
                      }`}
                    >
                      <span className={isActive ? "text-[#D9A05B]" : "text-[#A3C9A8]"}>
                        {getCategoryIcon(cat)}
                      </span>
                      <span>{cat}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
