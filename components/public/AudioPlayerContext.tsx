'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Music } from '@/types';

interface AudioContextType {
  currentTrackId: string | null;
  isPlaying: boolean;
  activeTrack: Music | null;
  playTrack: (track: Music) => void;
  pauseTrack: () => void;
  toggleTrack: (track: Music) => void;
}

const AudioContext = createContext<AudioContextType>({
  currentTrackId: null,
  isPlaying: false,
  activeTrack: null,
  playTrack: () => {},
  pauseTrack: () => {},
  toggleTrack: () => {},
});

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeTrack, setActiveTrack] = useState<Music | null>(null);

  const playTrack = useCallback((track: Music) => {
    setCurrentTrackId(track.id);
    setActiveTrack(track);
    setIsPlaying(true);
  }, []);

  const pauseTrack = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const toggleTrack = useCallback((track: Music) => {
    if (currentTrackId === track.id) {
      setIsPlaying((prev) => !prev);
    } else {
      setCurrentTrackId(track.id);
      setActiveTrack(track);
      setIsPlaying(true);
    }
  }, [currentTrackId]);

  return (
    <AudioContext.Provider
      value={{
        currentTrackId,
        isPlaying,
        activeTrack,
        playTrack,
        pauseTrack,
        toggleTrack,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  return useContext(AudioContext);
}
