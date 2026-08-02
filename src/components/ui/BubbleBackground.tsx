'use client';

import { useEffect, useState, useCallback } from 'react';
import { Bubble } from './Bubble';
import { useBubbleStore } from '@/store/useBubbleStore';

interface BubbleData {
  id: string;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export function BubbleBackground() {
  const { isBubbleModeActive, incrementPoppedCount } = useBubbleStore();
  const [bubbles, setBubbles] = useState<BubbleData[]>([]);
  const [mounted, setMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const generateBubble = useCallback((): BubbleData => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    return {
      id: Math.random().toString(36).substring(2, 9),
      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
      y: (typeof window !== 'undefined' ? window.innerHeight : 1000) + Math.random() * 200,
      size: Math.random() * (isMobile ? 40 : 80) + 20,
      duration: Math.random() * 10 + 15,
      delay: Math.random() * 5,
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const baseCount = prefersReducedMotion ? 5 : 15;
    const targetCount = isBubbleModeActive ? Math.floor(baseCount * 2.5) : baseCount;

    setBubbles((current) => {
      if (current.length > targetCount) {
        return current.slice(0, targetCount);
      }
      if (current.length < targetCount) {
        const newBubbles = Array.from({ length: targetCount - current.length }).map(() => generateBubble());
        return [...current, ...newBubbles];
      }
      return current;
    });
  }, [isBubbleModeActive, mounted, prefersReducedMotion, bubbles.length, generateBubble]);

  const handlePop = useCallback((id: string) => {
    incrementPoppedCount();
    setBubbles((current) => {
      return current.map(b => {
        if (b.id === id) {
          // Replace with a new bubble at the bottom so the density stays constant
          return generateBubble();
        }
        return b;
      });
    });
  }, [incrementPoppedCount, generateBubble]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-40 overflow-hidden pointer-events-none">
      {bubbles.map((bubble) => (
        <Bubble
          key={bubble.id}
          id={bubble.id}
          initialX={bubble.x}
          initialY={prefersReducedMotion ? (bubble.y % window.innerHeight) : bubble.y}
          size={bubble.size}
          duration={prefersReducedMotion ? 0 : bubble.duration}
          delay={prefersReducedMotion ? 0 : bubble.delay}
          onPop={handlePop}
        />
      ))}
    </div>
  );
}
