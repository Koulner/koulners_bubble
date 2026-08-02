"use client";

import React, { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, X, SlidersHorizontal, PauseCircle } from "lucide-react";
import { useAudioStore } from "@/store/useAudioStore";

export type SoundCategory = 'frequency' | 'binaural' | 'percussion' | 'flute' | 'voice' | 'nature' | 'ambient';

const CATEGORY_LABELS: Record<SoundCategory, string> = {
  frequency: "Frequenzen",
  binaural: "Binaurale Beats",
  percussion: "Trommeln & Klangschalen",
  flute: "Flöten",
  voice: "Stimmen & Mantren",
  nature: "Naturgeräusche",
  ambient: "Atmosphäre & Rauschen"
};
export interface AmbientSound {
  id: string;
  title: string;
  category: SoundCategory;
  url: string;
  enabled?: boolean;
}

interface SoundscapeMixerProps {
  sounds?: AmbientSound[];
}

export default function SoundscapeMixer({ sounds: initialSounds }: SoundscapeMixerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sounds, setSounds] = useState<AmbientSound[]>(initialSounds || []);
  
  const { activeTracks, toggleTrack, setTrackVolume, stopAll } = useAudioStore();

  useEffect(() => {
    if (!initialSounds) {
      fetch("/api/studio/sounds")
        .then(res => res.json())
        .then(data => {
          if (data.sounds) setSounds(data.sounds);
        })
        .catch(console.error);
    }
  }, [initialSounds]);

  // Public frontend filter
  const activeSounds = useMemo(() => sounds.filter(s => s.enabled !== false), [sounds]);

  const isAnyPlaying = Object.values(activeTracks).some((track) => track.isPlaying);

  // Group sounds by category
  const groupedSounds = useMemo(() => {
    return activeSounds.reduce((acc, sound) => {
      if (!acc[sound.category]) acc[sound.category] = [];
      acc[sound.category].push(sound);
      return acc;
    }, {} as Record<string, AmbientSound[]>);
  }, [activeSounds]);

  return (
    <div className="relative z-50">
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-sm text-text-dark font-sans text-sm hover:bg-white/20 transition-colors"
      >
        {isAnyPlaying ? (
          <div className="flex gap-0.5 items-end h-4">
            <motion.span animate={{ height: ["40%", "100%", "40%"] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-sage rounded-full" />
            <motion.span animate={{ height: ["80%", "40%", "80%"] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.1 }} className="w-1 bg-sage rounded-full" />
            <motion.span animate={{ height: ["50%", "90%", "50%"] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-1 bg-sage rounded-full" />
          </div>
        ) : (
          <SlidersHorizontal className="w-4 h-4 text-text-muted" />
        )}
        <span className="font-medium tracking-wide">Mixer</span>
      </motion.button>

      {/* Expanded Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-12 right-0 w-[340px] p-5 rounded-2xl bg-white/40 dark:bg-black/40 backdrop-blur-2xl border border-white/30 shadow-2xl overflow-hidden"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-serif text-lg text-text-dark flex items-center gap-2">
                <Music className="w-4 h-4" /> Ambient Mixer
              </h3>
              <div className="flex gap-2">
                {isAnyPlaying && (
                  <button
                    onClick={stopAll}
                    title="Stop All"
                    className="p-1.5 text-red-400 hover:text-red-500 hover:bg-white/20 rounded-md transition"
                  >
                    <PauseCircle className="w-5 h-5" />
                  </button>
                )}
                <button onClick={() => setIsOpen(false)} className="p-1.5 text-text-muted hover:text-text-dark transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-2 flex flex-col gap-6 custom-scrollbar">
              {Object.entries(groupedSounds).map(([category, catSounds]) => (
                <div key={category} className="flex flex-col gap-2">
                  <h4 className="text-xs font-bold text-sage uppercase tracking-widest">{CATEGORY_LABELS[category as SoundCategory] || category}</h4>
                  <div className="flex flex-col gap-2">
                    {catSounds.map((sound) => {
                      const isActive = !!activeTracks[sound.id];
                      const volume = activeTracks[sound.id]?.volume ?? 0.5;

                      return (
                        <div key={sound.id} className={`flex flex-col p-2.5 rounded-xl border transition-all ${isActive ? 'bg-white/40 border-sage/30' : 'bg-white/10 border-white/10 hover:bg-white/20'}`}>
                          <div 
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => toggleTrack(sound.id, sound.url)}
                          >
                            <span className={`text-sm font-medium ${isActive ? 'text-sage-dark' : 'text-text-dark'}`}>
                              {sound.title}
                            </span>
                            <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-sage shadow-[0_0_8px_rgba(122,154,139,0.8)]' : 'bg-gray-300'}`} />
                          </div>
                          
                          <AnimatePresence>
                            {isActive && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mt-3 flex items-center gap-3 overflow-hidden"
                              >
                                <span className="text-[10px] text-text-muted font-mono w-6">{(volume * 100).toFixed(0)}</span>
                                <input
                                  type="range"
                                  min="0"
                                  max="1"
                                  step="0.01"
                                  value={volume}
                                  onChange={(e) => setTrackVolume(sound.id, parseFloat(e.target.value))}
                                  className="w-full accent-sage h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
