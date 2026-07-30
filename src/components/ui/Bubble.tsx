'use client';

import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState, memo } from 'react';

interface BubbleProps {
  id: string;
  initialX: number;
  initialY: number;
  size: number;
  duration: number;
  delay: number;
  onPop?: (id: string) => void;
}

const BubbleComponent = ({ id, initialX, initialY, size, duration, delay, onPop }: BubbleProps) => {
  const [popped, setPopped] = useState(false);
  const controls = useAnimation();

  useEffect(() => {
    if (!popped && duration > 0) {
      controls.start({
        y: [initialY, initialY - (typeof window !== 'undefined' ? window.innerHeight * 1.5 : 1000)],
        x: [initialX, initialX + (Math.random() * 200 - 100)],
        transition: {
          duration: duration,
          ease: 'linear',
          repeat: Infinity,
          delay: delay,
        },
      });
    } else if (duration === 0) {
      // Reduced motion: static position
      controls.set({ x: initialX, y: initialY });
    }
  }, [controls, duration, delay, initialX, initialY, popped]);

  const handlePop = () => {
    if (popped) return;
    setPopped(true);
    controls.stop();
    controls.start({
      scale: 1.5,
      opacity: 0,
      transition: { duration: 0.15, ease: 'easeOut' },
    }).then(() => {
      onPop?.(id);
    });
  };

  if (popped) return null;

  return (
    <motion.div
      className="absolute rounded-full border border-white/20 bg-white/5 backdrop-blur-[2px]"
      style={{
        width: size,
        height: size,
        left: 0,
        top: 0,
        x: initialX,
        y: initialY,
      }}
      animate={controls}
    >
      <div
        className="absolute inset-0 m-auto pointer-events-auto rounded-full cursor-crosshair"
        style={{ width: '40%', height: '40%' }}
        onMouseEnter={handlePop}
      />
    </motion.div>
  );
};

export const Bubble = memo(BubbleComponent);
