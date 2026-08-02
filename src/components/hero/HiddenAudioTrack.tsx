"use client";

import React, { useEffect, useRef } from "react";

interface HiddenAudioTrackProps {
  id: string;
  url: string;
  volume: number;
  isPlaying: boolean;
}

export const HiddenAudioTrack: React.FC<HiddenAudioTrackProps> = ({ id, url, volume, isPlaying }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync volume strictly without triggering a React re-render of the tag
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Sync playback state
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        console.log(`Attempting to play track ${id} with URL:`, url);
        audioRef.current.play().catch(e => console.error(`Audio play failed for track ${id}:`, e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, id, url]);

  if (!url) {
    console.warn(`HiddenAudioTrack mounted without URL for track ${id}!`);
    return null;
  }

  return (
    <audio 
      ref={audioRef} 
      src={url} 
      loop 
      className="hidden" 
      // Initial volume setup so it doesn't blast at 1.0 before useEffect runs
      onCanPlay={(e) => {
        (e.currentTarget as HTMLAudioElement).volume = volume;
      }}
    />
  );
};
