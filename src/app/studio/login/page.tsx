"use client";

import React, { Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ShieldAlert, Lock, Sparkles, ArrowRight } from "lucide-react";

function LoginContent() {
  const searchParams = useSearchParams();
  const error = searchParams?.get("error");

  return (
    <div className="min-h-screen bg-[#050B08] text-[#E8F0EB] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Hintergrund Leuchteffekte */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#2D5A3C]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#D9A05B]/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-[#0F1B15]/80 backdrop-blur-xl border border-[#2D5A3C]/40 rounded-3xl p-8 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2D5A3C] to-[#1A3825] flex items-center justify-center border border-[#4E8752]/50 shadow-lg mb-4">
            <Lock className="w-8 h-8 text-[#D9A05B]" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2D5A3C]/30 border border-[#4E8752]/40 text-[#A3C9A8] text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#D9A05B]" /> Enterprise-Grade Security
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Bubble Studio</h1>
          <p className="text-sm text-[#A3C9A8] mt-2">
            Geschütztes Headless-CMS & GitOps-Steuerzentrale für Koulners Bubbles.
          </p>
        </div>

        {error === "AccessDenied" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-2xl bg-red-950/60 border border-red-500/40 flex items-start gap-3 text-red-200 text-sm"
          >
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-300">Zugriff verweigert (Enterprise Whitelist)</p>
              <p className="text-xs mt-1 text-red-200/80">
                Dein GitHub-Konto stimmt nicht mit den autorisierten Autoren-Credentials in den Systemeinstellungen überein.
              </p>
            </div>
          </motion.div>
        )}

        <div className="space-y-4">
          <button
            onClick={() => signIn("github", { callbackUrl: "/studio" })}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#2D5A3C] to-[#1e3e29] hover:from-[#3a724d] hover:to-[#2D5A3C] text-white font-medium flex items-center justify-center gap-3 transition-all duration-300 shadow-lg hover:shadow-[#2D5A3C]/30 border border-[#4E8752]/50 group cursor-pointer"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>Mit GitHub anmelden (OAuth)</span>
            <ArrowRight className="w-4 h-4 ml-auto opacity-70 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-[#2D5A3C]/20 text-center">
          <p className="text-xs text-[#A3C9A8]/60">
            Geschützt durch Auth.js OAuth 2.0 & exklusive Whitelist-Verifizierung.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050B08]" />}>
      <LoginContent />
    </Suspense>
  );
}
