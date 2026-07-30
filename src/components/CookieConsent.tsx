"use client";

import React from "react";
import { useCookieConsent } from "@/hooks/useCookieConsent";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie } from "lucide-react";

export default function CookieConsent() {
  const { consent, acceptAll, acceptEssential, isMounted } = useCookieConsent();

  if (!isMounted || consent !== "pending") return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-8 md:bottom-8 z-50 md:max-w-sm"
      >
        <div className="bg-[#050B08]/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-2xl p-5 md:p-6 text-[#E8F0EB] font-sans">
          <div className="flex items-center gap-3 mb-3">
            <Cookie className="w-5 h-5 text-[#D9A05B]" />
            <h3 className="font-serif text-lg text-white">Privatsphäre & Medien</h3>
          </div>
          <p className="text-sm text-[#A3C9A8]/90 leading-relaxed mb-5 font-light">
            Diese Bubble nutzt lokale Speicher (Cookies), um dir externe Medien (wie YouTube-Videos) direkt hier anzeigen zu können.
          </p>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={acceptAll}
              className="w-full py-2.5 rounded-lg bg-[#2D5A3C] hover:bg-[#2D5A3C]/80 text-[#D9A05B] border border-[#D9A05B]/30 font-medium transition-colors text-sm shadow-md"
            >
              Externe Medien akzeptieren
            </button>
            <button
              onClick={acceptEssential}
              className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 font-medium transition-colors text-sm"
            >
              Nur essenzielle Cookies (Medien blockieren)
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
