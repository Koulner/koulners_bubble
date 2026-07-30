"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Tag, BookOpen, Sparkles, ArrowRight, Clock, CheckCircle2, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { Turnstile } from "@marsidev/react-turnstile";

interface SearchResultItem {
  slug: string;
  title: string;
  category: string[];
  level?: string;
  date?: string;
  description?: string;
  excerpt?: string;
  image?: string;
  readTime?: string;
  author?: string;
  snippet?: string;
  matchReason?: string;
}

export default function SearchOverlay() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Alle");
  const [categories, setCategories] = useState<string[]>(["Alle"]);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lade verfügbare Kategorien dynamisch
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/studio/categories");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.categories)) {
            setCategories(["Alle", ...data.categories]);
          }
        }
      } catch (err) {
        console.error("Fehler beim Laden der Kategorien für Suche:", err);
      }
    };
    fetchCategories();
  }, []);

  // Keyboard Shortcut Cmd+K / Ctrl+K / Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Focus Input nach Öffnen
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Live-Suche über API
  const performSearch = useCallback(async (q: string, cat: string, token: string) => {
    setLoading(true);
    try {
      const url = `/api/search?q=${encodeURIComponent(q)}&category=${encodeURIComponent(cat === "Alle" ? "" : cat)}`;
      const res = await fetch(url, {
        headers: {
          "x-turnstile-token": token || "",
        }
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch (err) {
      console.error("Fehler bei der Volltextsuche:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        performSearch(query, categoryFilter, turnstileToken);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [query, categoryFilter, isOpen, turnstileToken, performSearch]);

  return (
    <>
      {/* Trigger Button auf der Startseite / Navigation */}
      <button
        onClick={() => setIsOpen(true)}
        className="group flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-white/80 hover:bg-white border border-border-warm shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer text-sm text-text-dark font-sans"
        title="Volltextsuche öffnen (Cmd+K)"
      >
        <Search className="w-4 h-4 text-sage group-hover:scale-110 transition-transform" />
        <span className="font-medium text-text-muted group-hover:text-text-dark transition-colors">Suchen...</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md bg-bg-sand text-[10px] font-mono font-semibold text-text-muted border border-border-warm/60">
          ⌘K
        </kbd>
      </button>

      {/* Das Modal Overlay - via createPortal direkt in document.body platziert, um alle Stacking-Kontexte zu umgehen */}
      {mounted
        ? createPortal(
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[99999] flex items-start justify-center p-4 sm:p-6 md:p-14 bg-text-dark/40 backdrop-blur-md overflow-y-auto"
                  onClick={(e) => {
                    if (e.target === e.currentTarget) setIsOpen(false);
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -20 }}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    className="w-full max-w-3xl bg-bg-cream/95 backdrop-blur-2xl border border-border-warm/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
                  >
                    {/* Header / Suchleiste */}
                    <div className="p-4 sm:p-6 border-b border-border-warm bg-white/60 flex items-center gap-3">
                      <Search className="w-6 h-6 text-sage shrink-0" />
                      <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="In Titeln, Beschreibungen & im Text suchen..."
                        className="flex-1 bg-transparent text-text-dark placeholder-text-muted/60 text-lg sm:text-xl font-serif focus:outline-none"
                      />
                      {query && (
                        <button
                          onClick={() => setQuery("")}
                          className="p-1.5 rounded-full hover:bg-bg-sand text-text-muted hover:text-text-dark transition-colors cursor-pointer"
                          title="Suche löschen"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 rounded-2xl bg-bg-sand hover:bg-border-warm text-text-dark font-sans text-xs font-semibold px-3 transition-colors cursor-pointer shrink-0"
                      >
                        Schließen
                      </button>
                    </div>

                    {/* Kategorie Filter Bar */}
                    <div className="px-6 py-3 bg-bg-sand/40 border-b border-border-warm/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
                      <div className="flex items-center gap-1.5 text-xs font-sans uppercase tracking-wider text-text-muted shrink-0 mr-1">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-sage" />
                        <span>Filter:</span>
                      </div>
                      {categories.map((cat) => {
                        const isSelected = categoryFilter === cat;
                        return (
                          <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-sans font-medium transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-sage text-white shadow-sm shadow-sage/30"
                                : "bg-white/80 text-text-muted hover:text-text-dark hover:bg-white border border-border-warm/50"
                            }`}
                          >
                            {cat !== "Alle" && <Tag className="w-3 h-3" />}
                            {cat}
                          </button>
                        );
                      })}
                    </div>

                    {/* Ergebnisliste */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                      {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 text-text-muted">
                          <div className="w-8 h-8 rounded-full border-2 border-sage border-t-transparent animate-spin mb-3" />
                          <span className="text-sm font-sans">Durchsuche Koulners Bubble...</span>
                        </div>
                      ) : results.length === 0 ? (
                        <div className="text-center py-16 px-4">
                          <Sparkles className="w-10 h-10 text-sage/40 mx-auto mb-3" />
                          <h4 className="font-serif text-xl text-text-dark mb-1">Keine Beiträge gefunden</h4>
                          <p className="text-sm text-text-muted max-w-sm mx-auto">
                            Versuche es mit einem anderen Suchbegriff oder wechsle den Kategorie-Filter.
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between text-xs font-sans text-text-muted px-1">
                            <span>{results.length} Beitrag{results.length === 1 ? "" : "e"} gefunden</span>
                            {query && <span>Sortiert nach Relevanz (Fuse.js)</span>}
                          </div>

                          <div className="grid grid-cols-1 gap-3.5">
                            {results.map((res) => (
                              <Link
                                key={res.slug}
                                href={`/blog/${res.slug}`}
                                onClick={() => setIsOpen(false)}
                                className="group p-5 rounded-2xl bg-white/70 hover:bg-white border border-border-warm/80 hover:border-sage shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-2.5"
                              >
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-0.5 rounded-full bg-sage-light text-sage-dark text-[11px] font-semibold tracking-wide uppercase">
                                      {Array.isArray(res.category) ? res.category.join(", ") : res.category}
                                    </span>
                                    {res.matchReason && (
                                      <span className="px-2 py-0.5 rounded-md bg-bg-sand text-text-muted text-[11px] font-mono flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3 text-sage" />
                                        Treffer: {res.matchReason}
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-xs text-text-muted font-sans flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {res.readTime || "5 Min. Lesezeit"}
                                  </span>
                                </div>

                                <h3 className="font-serif text-lg sm:text-xl font-medium text-text-dark group-hover:text-sage-dark transition-colors">
                                  {res.title}
                                </h3>

                                {res.snippet && (
                                  <p className="font-sans text-xs sm:text-sm text-text-muted leading-relaxed line-clamp-2">
                                    {res.snippet}
                                  </p>
                                )}

                                <div className="flex items-center gap-1 text-xs font-semibold text-sage group-hover:text-sage-dark transition-colors pt-1">
                                  <span>Beitrag lesen</span>
                                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                </div>
                              </Link>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Footer Hinweis */}
                    <div className="px-6 py-3 bg-bg-sand/60 border-t border-border-warm/60 flex items-center justify-between text-[11px] text-text-muted font-sans">
                      <span>Enterprise Search • Powered by Fuse.js</span>
                      <span>ESC zum Schließen</span>
                    </div>

                    {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
                      <div className="hidden">
                        <Turnstile
                          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                          onSuccess={(token) => setTurnstileToken(token)}
                        />
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>,
            document.body
          )
        : null}
    </>
  );
}
