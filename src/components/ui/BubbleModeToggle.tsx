'use client';

import { useBubbleStore } from '@/store/useBubbleStore';
import { Sparkles, CircleDashed, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface BubbleModeToggleProps {
  requiredPops: number;
}

export function BubbleModeToggle({ requiredPops }: BubbleModeToggleProps) {
  const { isBubbleModeActive, toggleBubbleMode, poppedCount, isVisitorEnabled, toggleVisitorEnabled } = useBubbleStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 left-6 z-50 flex gap-3">
      {/* Visibility Toggle - Always accessible so users can turn it off/on anytime */}
      <button
        onClick={toggleVisitorEnabled}
        className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/80 hover:text-white hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-white/50 shadow-sm"
        aria-label={isVisitorEnabled ? "Hide Bubbles" : "Show Bubbles"}
        title={isVisitorEnabled ? "Hide Bubbles" : "Show Bubbles"}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isVisitorEnabled ? 'visible' : 'hidden'}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.15 }}
            className="absolute"
          >
            {isVisitorEnabled ? <Eye size={20} /> : <EyeOff size={20} />}
          </motion.div>
        </AnimatePresence>
      </button>

      {/* Party Mode Toggle - Only shown if popped enough bubbles AND visitor didn't completely disable bubbles */}
      <AnimatePresence>
        {poppedCount >= requiredPops && isVisitorEnabled && (
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={toggleBubbleMode}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/80 hover:text-white hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-white/50 shadow-sm"
            aria-label="Toggle Bubble Mode"
            title="Toggle Bubble Mode"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isBubbleModeActive ? 'active' : 'inactive'}
                initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                transition={{ duration: 0.2 }}
                className="absolute"
              >
                {isBubbleModeActive ? <Sparkles size={22} /> : <CircleDashed size={22} />}
              </motion.div>
            </AnimatePresence>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
