'use client';

import { useBubbleStore } from '@/store/useBubbleStore';
import { Sparkles, CircleDashed } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface BubbleModeToggleProps {
  requiredPops: number;
}

export function BubbleModeToggle({ requiredPops }: BubbleModeToggleProps) {
  const { isBubbleModeActive, toggleBubbleMode, poppedCount } = useBubbleStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Render toggle only if user popped enough bubbles
  if (poppedCount < requiredPops) return null;

  return (
    <button
      onClick={toggleBubbleMode}
      className="fixed bottom-6 left-6 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/80 hover:text-white hover:bg-white/20 transition-all focus:outline-none focus:ring-2 focus:ring-white/50"
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
          {isBubbleModeActive ? <Sparkles size={24} /> : <CircleDashed size={24} />}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
