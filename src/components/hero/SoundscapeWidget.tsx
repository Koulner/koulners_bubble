"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Volume2, Music, X } from "lucide-react";

export interface SoundTrack {
  id: string;
  title: string;
  type: "frequency" | "melody" | "nature";
  url: string;
  moods: string[];
}

interface SoundscapeWidgetProps {
  sounds: SoundTrack[];
}

export default function SoundscapeWidget({ sounds }: SoundscapeWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const [activeTrack, setActiveTrack] = useState<SoundTrack>(sounds[0] || {} as SoundTrack);
  const [volume, setVolume] = useState(0.5);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Extract unique moods
  const allMoods = Array.from(new Set(sounds.flatMap((s) => s.moods)));

  const filteredTracks = activeMood 
    ? sounds.filter(t => t.moods.includes(activeMood))
    : sounds;

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio play failed:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, activeTrack]);

  const togglePlay = (track: SoundTrack) => {
    if (activeTrack.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveTrack(track);
      setIsPlaying(true);
    }
  };

  return (
    <div className="relative z-50">
      <audio ref={audioRef} src={activeTrack.url} loop />

      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-sm text-text-dark font-sans text-sm hover:bg-white/20 transition-colors"
      >
        {isPlaying ? (
          <div className="flex gap-0.5 items-end h-4">
            <motion.span animate={{ height: ["40%", "100%", "40%"] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-sage rounded-full" />
            <motion.span animate={{ height: ["80%", "40%", "80%"] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.1 }} className="w-1 bg-sage rounded-full" />
            <motion.span animate={{ height: ["50%", "90%", "50%"] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-1 bg-sage rounded-full" />
          </div>
        ) : (
          <Music className="w-4 h-4 text-text-muted" />
        )}
        <span className="font-medium tracking-wide">Vibe</span>
      </motion.button>

      {/* Expanded Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-12 right-0 w-80 p-5 rounded-2xl bg-white/20 dark:bg-black/20 backdrop-blur-xl border border-white/30 shadow-2xl overflow-hidden"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-serif text-lg text-text-dark">Soundscape</h3>
              <button onClick={() => setIsOpen(false)} className="text-text-muted hover:text-text-dark transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mood Filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setActiveMood(null)}
                className={`px-3 py-1 text-xs rounded-full border transition-colors ${!activeMood ? "bg-sage text-white border-sage" : "bg-white/10 border-white/20 text-text-dark hover:bg-white/20"}`}
              >
                All
              </button>
              {allMoods.map(mood => (
                <button
                  key={mood}
                  onClick={() => setActiveMood(mood)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${activeMood === mood ? "bg-sage text-white border-sage" : "bg-white/10 border-white/20 text-text-dark hover:bg-white/20"}`}
                >
                  {mood}
                </button>
              ))}
            </div>

            {/* Track List */}
            <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {filteredTracks.map(track => (
                <div key={track.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => togglePlay(track)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${activeTrack.id === track.id && isPlaying ? "bg-sage text-white" : "bg-white/30 text-text-dark hover:bg-white/50"}`}
                    >
                      {activeTrack.id === track.id && isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                    </button>
                    <div className="flex flex-col">
                      <span className={`text-sm font-medium ${activeTrack.id === track.id ? "text-sage" : "text-text-dark"}`}>{track.title}</span>
                      <span className="text-[10px] text-text-muted uppercase tracking-wider">{track.type}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Volume Control */}
            <div className="mt-6 flex items-center gap-3 pt-4 border-t border-white/20">
              <Volume2 className="w-4 h-4 text-text-muted" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-sage"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
