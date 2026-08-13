'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { Music } from '@/types';

interface AudioContextType {
  currentTrackId: string | null;
  activeTrack: Music | null;
  isPlaying: boolean;
  isBuffering: boolean;
  hasError: boolean;
  durations: Record<string, number>;
  playTrack: (track: Music) => void;
  pauseTrack: () => void;
  toggleTrack: (track: Music) => void;
  closePlayer: () => void;
  seek: (time: number) => void;
  /** Returns the live Web Audio AnalyserNode once a track has started playing (null until then). */
  getAnalyser: () => AnalyserNode | null;
}

const AudioPlayerContext = createContext<AudioContextType | null>(null);

/**
 * High-frequency playback position lives outside React state entirely.
 * Only components that call useAudioTime() subscribe to it, so a
 * `timeupdate` tick (~4-60/sec) never re-renders the rest of the app.
 */
class TimeStore {
  private time = 0;
  private listeners = new Set<() => void>();

  set = (t: number) => {
    this.time = t;
    this.listeners.forEach((l) => l());
  };

  get = () => this.time;

  subscribe = (cb: () => void) => {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  };
}

const TimeStoreContext = createContext<TimeStore | null>(null);

/** Live playback position (seconds) of whatever track is currently active. */
export function useAudioTime() {
  const store = useContext(TimeStoreContext);
  return useSyncExternalStore(
    store?.subscribe ?? (() => () => {}),
    store?.get ?? (() => 0),
    () => 0
  );
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timeStoreRef = useRef(new TimeStore());

  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const graphInitializedRef = useRef(false);

  const [activeTrack, setActiveTrack] = useState<Music | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [durations, setDurations] = useState<Record<string, number>>({});

  // Mirrors `activeTrack` for read access inside callbacks/event handlers
  // without depending on (and re-creating) those callbacks every render.
  const activeTrackRef = useRef<Music | null>(null);
  useEffect(() => {
    activeTrackRef.current = activeTrack;
  }, [activeTrack]);

  // Web Audio graph is created lazily, inside a user-gesture call chain
  // (playTrack), since browsers block AudioContext creation otherwise.
  const ensureAudioGraph = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || graphInitializedRef.current) return;
    try {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof window.AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      const ctx = new Ctor();
      const source = ctx.createMediaElementSource(audio);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.75;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
      graphInitializedRef.current = true;
    } catch (err) {
      // Web Audio unavailable — playback still works, mini player falls
      // back to a static breathing animation instead of analyser-driven motion.
      console.warn('Web Audio graph unavailable:', err);
    }
  }, []);

  const getAnalyser = useCallback(() => analyserRef.current, []);

  const playTrack = useCallback((track: Music) => {
    const audio = audioRef.current;
    if (!audio) return;

    ensureAudioGraph();
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }

    // Side effects live outside the setState updater — updater functions can
    // be invoked more than once (e.g. React Strict Mode), which would fire
    // a second `audio.src` assignment and abort the first play() request.
    if (activeTrackRef.current?.id !== track.id) {
      setHasError(false);
      setIsBuffering(true);
      timeStoreRef.current.set(0);
      audio.src = track.audio;
      audio.currentTime = 0;
    }
    setActiveTrack(track);

    audio.play().catch((err) => {
      console.warn('Playback failed:', err);
    });
  }, [ensureAudioGraph]);

  const pauseTrack = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const toggleTrack = useCallback((track: Music) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (activeTrack?.id === track.id) {
      if (isPlaying) {
        pauseTrack();
      } else {
        playTrack(track);
      }
    } else {
      playTrack(track);
    }
  }, [activeTrack, isPlaying, pauseTrack, playTrack]);

  const closePlayer = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    setActiveTrack(null);
    setIsBuffering(false);
    setHasError(false);
    timeStoreRef.current.set(0);
  }, []);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(time)) return;
    audio.currentTime = time;
    timeStoreRef.current.set(time);
  }, []);

  // Native <audio> events are the single source of truth for play state —
  // covers OS media-key pauses, tab audio focus loss, etc., not just our own calls.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => timeStoreRef.current.set(audio.currentTime);
    const onLoadedMetadata = () => {
      const track = activeTrackRef.current;
      if (track && Number.isFinite(audio.duration)) {
        setDurations((prev) => ({ ...prev, [track.id]: audio.duration }));
      }
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onPlaying = () => setIsBuffering(false);
    const onWaiting = () => setIsBuffering(true);
    const onEnded = () => {
      setIsPlaying(false);
      audio.currentTime = 0;
      timeStoreRef.current.set(0);
    };
    const onError = () => {
      console.warn('Audio playback error for track:', activeTrackRef.current?.id);
      setHasError(true);
      setIsBuffering(false);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
    };
  }, []);

  const value = useMemo<AudioContextType>(() => ({
    currentTrackId: activeTrack?.id ?? null,
    activeTrack,
    isPlaying,
    isBuffering,
    hasError,
    durations,
    playTrack,
    pauseTrack,
    toggleTrack,
    closePlayer,
    seek,
    getAnalyser,
  }), [activeTrack, isPlaying, isBuffering, hasError, durations, playTrack, pauseTrack, toggleTrack, closePlayer, seek, getAnalyser]);

  return (
    <AudioPlayerContext.Provider value={value}>
      <TimeStoreContext.Provider value={timeStoreRef.current}>
        {children}
        {/* Single global audio element — persists across route changes within
            this layout, so playback survives navigation. preload="none" means
            nothing is fetched until the user actually presses play. */}
        <audio ref={audioRef} preload="none" className="hidden" />
      </TimeStoreContext.Provider>
    </AudioPlayerContext.Provider>
  );
}

export function useAudio() {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return ctx;
}
