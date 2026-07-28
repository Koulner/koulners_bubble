"use client";

import React, { useState, useEffect } from "react";
import { Send, CheckCircle2, AlertCircle, Settings2, Tag, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NewsletterBox() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const [showPreferences, setShowPreferences] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [frequency, setFrequency] = useState<string>("always");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/studio/categories");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.categories)) {
            setAvailableCategories(data.categories);
            setSelectedCategories(data.categories); // Standardmäßig alle
          }
        }
      } catch (err) {
        console.error("Fehler beim Laden der Kategorien für Newsletter:", err);
      }
    };
    fetchCategories();
  }, []);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus("loading");
    try {
      const payload = {
        email,
        categories: selectedCategories,
        frequency
      };

      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (res.ok) {
        setStatus("success");
        setMessage("Willkommen in der Bubble! Deine Präferenzen wurden gespeichert.");
        setEmail("");
      } else {
        const data = await res.json();
        setStatus("error");
        setMessage(data.error || "Es gab ein Problem. Bitte versuche es später noch einmal.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Netzwerkfehler. Bitte überprüfe deine Verbindung.");
    }
  };

  return (
    <div className="my-16 relative overflow-hidden rounded-3xl bg-gradient-to-br from-sage-light/40 to-bg-cream border border-border-warm/60 p-8 md:p-12 text-center max-w-2xl mx-auto shadow-sm">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-sage/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-terracotta/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10">
        <h3 className="font-serif text-2xl md:text-3xl text-text-dark font-medium mb-3">
          Post aus der Bubble
        </h3>
        <p className="font-sans text-text-muted mb-8 max-w-md mx-auto leading-relaxed">
          Sanfte Erinnerungen, neue Gedankenräume und exklusive Einblicke direkt in dein Postfach. Kein Spam, nur Ruhe.
        </p>

        {status === "success" ? (
          <div className="flex flex-col items-center justify-center gap-3 text-sage-dark animate-in fade-in zoom-in duration-500">
            <CheckCircle2 className="w-10 h-10" />
            <p className="font-medium">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-lg mx-auto text-left">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deine.email@ruhe.de"
                disabled={status === "loading"}
                className="flex-1 px-5 py-3 rounded-xl bg-white/80 border border-border-warm/80 focus:border-sage focus:ring-2 focus:ring-sage/20 outline-none transition-all placeholder:text-text-muted/60 text-text-dark font-sans disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-sage hover:bg-sage-dark text-white font-medium transition-colors shadow-md disabled:opacity-50 min-w-[140px]"
              >
                {status === "loading" ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Abonnieren</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            <div className="flex justify-center mt-2">
              <button
                type="button"
                onClick={() => setShowPreferences(!showPreferences)}
                className="flex items-center gap-2 text-sm font-sans text-text-muted hover:text-sage-dark transition-colors"
              >
                <Settings2 className="w-4 h-4" />
                <span>{showPreferences ? "Einstellungen schließen" : "Empfang anpassen (optional)"}</span>
              </button>
            </div>

            <AnimatePresence>
              {showPreferences && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 pb-2 border-t border-border-warm/60 space-y-6">
                    {/* Häufigkeit */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-text-dark">
                        <Clock className="w-4 h-4 text-sage" />
                        <h4>Häufigkeit</h4>
                      </div>
                      <div className="flex flex-col gap-2">
                        {[
                          { id: "always", label: "Jedes Mal, wenn etwas Neues erscheint" },
                          { id: "weekly", label: "Einmal wöchentlich (Zusammenfassung)" },
                          { id: "monthly", label: "Einmal im Monat (Highlights)" }
                        ].map((opt) => (
                          <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${frequency === opt.id ? "border-sage bg-sage" : "border-border-warm bg-white group-hover:border-sage/50"}`}>
                              {frequency === opt.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                            </div>
                            <input
                              type="radio"
                              name="frequency"
                              value={opt.id}
                              checked={frequency === opt.id}
                              onChange={() => setFrequency(opt.id)}
                              className="hidden"
                            />
                            <span className="text-sm font-sans text-text-dark/80 group-hover:text-text-dark transition-colors">{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Kategorien */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-text-dark">
                        <Tag className="w-4 h-4 text-terracotta" />
                        <h4>Interessen</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {availableCategories.map((cat) => {
                          const isSelected = selectedCategories.includes(cat);
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => toggleCategory(cat)}
                              className={`px-3 py-1.5 rounded-full text-xs font-sans tracking-wide transition-all border ${
                                isSelected 
                                  ? "bg-sage/10 text-sage-dark border-sage/30 hover:bg-sage/20" 
                                  : "bg-white/50 text-text-muted border-border-warm hover:bg-white"
                              }`}
                            >
                              {cat}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </form>
        )}
        
        {status === "error" && (
          <div className="mt-4 flex items-center justify-center gap-2 text-terracotta text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
