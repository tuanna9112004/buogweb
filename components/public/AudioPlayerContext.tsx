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
  prepareTrack: (track: Music) => void;
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
  const preparedAudioRef = useRef<string | null>(null);
  const playRequestRef = useRef(0);
  // useState (not useRef) so the stable instance can be read during render
  // (as TimeStoreContext's value) without tripping the no-refs-in-render rule.
  const [timeStore] = useState(() => new TimeStore());

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

  const prepareTrack = useCallback((track: Music) => {
    const audio = audioRef.current;
    // Never replace a track the listener has already opened. Warm only the
    // intended track, using the same element so play() reuses its buffer.
    if (!audio || activeTrackRef.current || preparedAudioRef.current === track.audio) return;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
    if (connection?.saveData || connection?.effectiveType?.includes('2g')) return;
    preparedAudioRef.current = track.audio;
    audio.preload = 'metadata';
    audio.src = track.audio;
    audio.load();
  }, []);

  const playTrack = useCallback((track: Music) => {
    const audio = audioRef.current;
    if (!audio) return;
    const requestId = ++playRequestRef.current;
    setHasError(false);

    ensureAudioGraph();
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {});
    }

    // Side effects live outside the setState updater — updater functions can
    // be invoked more than once (e.g. React Strict Mode), which would fire
    // a second `audio.src` assignment and abort the first play() request.
    if (activeTrackRef.current?.id !== track.id) {
      setIsBuffering(true);
      timeStore.set(0);
      if (preparedAudioRef.current !== track.audio) {
        audio.src = track.audio;
        preparedAudioRef.current = track.audio;
      }
    }
    activeTrackRef.current = track;
    setIsBuffering(audio.readyState < HTMLMediaElement.HAVE_FUTURE_DATA);
    audio.preload = 'auto';
    if (audio.error) audio.load();
    if (Number.isFinite(audio.duration)) setDurations(prev => ({ ...prev, [track.id]: audio.duration }));
    setActiveTrack(track);

    audio.play().catch((err) => {
      if (requestId !== playRequestRef.current || err.name === 'AbortError') return;
      setIsBuffering(false);
      setIsPlaying(false);
      setHasError(true);
      console.warn('Playback failed:', err);
    });
  }, [ensureAudioGraph, timeStore]);

  const pauseTrack = useCallback(() => {
    ++playRequestRef.current;
    audioRef.current?.pause();
    setIsBuffering(false);
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
    ++playRequestRef.current;
    activeTrackRef.current = null;
    preparedAudioRef.current = null;
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }
    setActiveTrack(null);
    setIsBuffering(false);
    setHasError(false);
    timeStore.set(0);
  }, [timeStore]);

  const seek = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(time)) return;
    audio.currentTime = time;
    timeStore.set(time);
  }, [timeStore]);

  // Native <audio> events are the single source of truth for play state —
  // covers OS media-key pauses, tab audio focus loss, etc., not just our own calls.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => timeStore.set(audio.currentTime);
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
      timeStore.set(0);
    };
    const onError = () => {
      if (!activeTrackRef.current) return;
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
  }, [timeStore]);

  const value = useMemo<AudioContextType>(() => ({
    currentTrackId: activeTrack?.id ?? null,
    activeTrack,
    isPlaying,
    isBuffering,
    hasError,
    durations,
    playTrack,
    prepareTrack,
    pauseTrack,
    toggleTrack,
    closePlayer,
    seek,
    getAnalyser,
  }), [activeTrack, isPlaying, isBuffering, hasError, durations, playTrack, prepareTrack, pauseTrack, toggleTrack, closePlayer, seek, getAnalyser]);

  return (
    <AudioPlayerContext.Provider value={value}>
      <TimeStoreContext.Provider value={timeStore}>
        {children}
        {/* Single global audio element — persists across route changes within
            this layout, so playback survives navigation. Nothing is fetched
            until interaction with a play control; prepareTrack then warms metadata. */}
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
