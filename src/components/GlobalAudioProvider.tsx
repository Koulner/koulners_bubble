"use client";

import React from "react";
import { useAudioStore } from "@/store/useAudioStore";
import { HiddenAudioTrack } from "@/components/hero/HiddenAudioTrack";

export default function GlobalAudioProvider() {
  const activeTracks = useAudioStore((state) => state.activeTracks);

  return (
    <>
      {Object.entries(activeTracks).map(([soundId, trackState]) => (
        <HiddenAudioTrack
          key={soundId}
          id={soundId}
          url={trackState.url}
          volume={trackState.volume}
          isPlaying={trackState.isPlaying}
        />
      ))}
    </>
  );
}
