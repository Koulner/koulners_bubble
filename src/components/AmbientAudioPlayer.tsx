"use client";

import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Sparkles, Wind } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AmbientAudioPlayerProps {
  audioUrl: string;
  audioLabel: string;
  onEnter?: () => void;
}

export default function AmbientAudioPlayer({
  audioUrl,
  audioLabel,
  onEnter,
}: AmbientAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEntered, setIsEntered] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const synthRef = useRef<{ ctx: AudioContext | null; osc1: OscillatorNode | null; osc2: OscillatorNode | null; gain: GainNode | null }>({
    ctx: null,
    osc1: null,
    osc2: null,
    gain: null,
  });

  useEffect(() => {
    // Initialisiere HTML Audio element
    const audio = new Audio(audioUrl);
    audio.loop = true;
    audio.volume = 0;
    audioRef.current = audio;

    return () => {
      audio.pause();
      if (synthRef.current.ctx) {
        synthRef.current.ctx.close().catch(() => {});
      }
    };
  }, [audioUrl]);

  // Sanftes Ein- und Ausblenden der Lautstärke
  const fadeVolume = (target: number, durationMs: number = 1500) => {
    const audio = audioRef.current;
    if (!audio) return;

    const startVol = audio.volume;
    const startTime = performance.now();

    const animateFade = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const currentVol = startVol + (target - startVol) * progress;
      
      if (audio) {
        audio.volume = Math.max(0, Math.min(1, currentVol));
      }

      if (progress < 1) {
        requestAnimationFrame(animateFade);
      }
    };

    requestAnimationFrame(animateFade);
  };

  // Synthetischer 432Hz Ambient Fallback/Enhancement via Web Audio API für unendliche Beruhigung
  const startSynthFallback = () => {
    try {
      if (!synthRef.current.ctx) {
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioContextClass();
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.01, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 3);

        // 432 Hz Grundton (Heilfrequenz / Beruhigung)
        const osc1 = ctx.createOscillator();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(216, ctx.currentTime); // Oktave tiefer für Wärme

        // 432 Hz + 3 Hz Binaural Schwebung (Theta/Alpha Wellen für Meditation)
        const osc2 = ctx.createOscillator();
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(219, ctx.currentTime);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start();
        osc2.start();

        synthRef.current = { ctx, osc1, osc2, gain };
      } else if (synthRef.current.gain && synthRef.current.ctx) {
        if (synthRef.current.ctx.state === "suspended") {
          synthRef.current.ctx.resume();
        }
        synthRef.current.gain.gain.exponentialRampToValueAtTime(0.08, synthRef.current.ctx.currentTime + 1.5);
      }
    } catch {
      // Ignore if Web Audio API not available
    }
  };

  const stopSynthFallback = () => {
    if (synthRef.current.gain && synthRef.current.ctx) {
      synthRef.current.gain.gain.exponentialRampToValueAtTime(0.0001, synthRef.current.ctx.currentTime + 1);
    }
  };

  const toggleAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!isPlaying) {
      setIsPlaying(true);
      if (!isEntered) {
        setIsEntered(true);
        if (onEnter) onEnter();
      }
      try {
        await audio.play();
        fadeVolume(volume, 2000);
      } catch {
        // Falls Audio-Link hakt oder CORS, starte beruhigenden 432 Hz Synth
        startSynthFallback();
      }
    } else {
      setIsPlaying(false);
      fadeVolume(0, 1000);
      stopSynthFallback();
      setTimeout(() => {
        if (audioRef.current && !isPlaying) {
          audioRef.current.pause();
        }
      }, 1000);
    }
  };

  return (
    <div className="z-30">
      <AnimatePresence>
        {!isEntered ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.8 }}
            className="flex flex-col items-center"
          >
            <motion.button
              onClick={toggleAudio}
              whileHover={{ scale: 1.04, boxShadow: "0 10px 30px -10px rgba(122, 154, 139, 0.4)" }}
              whileTap={{ scale: 0.98 }}
              className="group relative flex items-center gap-4 px-8 py-5 rounded-full bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/40 shadow-2xl transition-all duration-500 text-text-dark hover:bg-white"
            >
              {/* Pulsierender Hintergrundschein */}
              <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-sage/40 via-amber-warm/30 to-terracotta/40 opacity-75 blur-lg group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse" />

              <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-sage-light text-sage group-hover:bg-sage group-hover:text-white transition-colors duration-500">
                <Sparkles className="w-5 h-5 animate-spin-slow" />
              </div>

              <div className="relative flex flex-col text-left">
                <span className="text-base font-serif font-medium tracking-wide text-text-dark">
                  Eintreten & Durchatmen
                </span>
                <span className="text-xs font-sans text-text-muted flex items-center gap-1.5">
                  <Wind className="w-3 h-3 text-sage inline" />
                  Mit Ambient-Klang öffnen
                </span>
              </div>
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex items-center gap-3 px-5 py-3 rounded-full bg-white/70 backdrop-blur-md border border-white/50 shadow-lg"
          >
            <button
              onClick={toggleAudio}
              className={`p-2 rounded-full transition-colors ${
                isPlaying
                  ? "bg-sage text-white shadow-md"
                  : "bg-bg-sand text-text-muted hover:text-text-dark"
              }`}
              title={isPlaying ? "Klang pausieren" : "Klang abspielen"}
            >
              {isPlaying ? (
                <Volume2 className="w-4 h-4 animate-pulse" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </button>

            <div className="flex flex-col min-w-[140px]">
              <span className="text-xs font-serif font-medium text-text-dark truncate">
                {audioLabel}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  {isPlaying && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage opacity-75"></span>
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      isPlaying ? "bg-sage" : "bg-text-muted/40"
                    }`}
                  ></span>
                </span>
                <span className="text-[10px] text-text-muted tracking-wider uppercase font-sans">
                  {isPlaying ? "432 Hz Harmonie aktiv" : "Stummgeschaltet"}
                </span>
              </div>
            </div>

            {isPlaying && (
              <div className="flex items-end gap-0.5 h-4 px-2 border-l border-border-warm">
                <motion.span
                  animate={{ height: [4, 14, 6, 12, 4] }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                  className="w-0.5 bg-sage rounded-full"
                />
                <motion.span
                  animate={{ height: [8, 4, 16, 6, 8] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  className="w-0.5 bg-terracotta rounded-full"
                />
                <motion.span
                  animate={{ height: [12, 6, 10, 14, 12] }}
                  transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
                  className="w-0.5 bg-amber-warm rounded-full"
                />
                <motion.span
                  animate={{ height: [6, 12, 4, 10, 6] }}
                  transition={{ repeat: Infinity, duration: 1.4, ease: "easeInOut" }}
                  className="w-0.5 bg-sage rounded-full"
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
