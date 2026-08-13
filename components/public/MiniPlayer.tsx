'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Pause, Play, X } from 'lucide-react';
import { useAudio } from './AudioPlayerContext';

/**
 * Global floating "now playing" pill. Lives once in the public layout so it
 * survives route changes. The pill itself is a passive display — only the
 * small close button dismisses/stops playback, so it can't be triggered by
 * an accidental tap on the cover or text.
 */
export default function MiniPlayer() {
  const { activeTrack, isPlaying, isBuffering, toggleTrack, closePlayer, getAnalyser } = useAudio();
  const pulseRef = useRef<HTMLDivElement>(null); // scale "boom" driven by audio energy
  const rafRef = useRef<number | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!activeTrack || !isPlaying || reduceMotion) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (pulseRef.current) pulseRef.current.style.transform = 'scale(1)';
      return;
    }

    const analyser = getAnalyser();
    if (!analyser) return; // falls back to the CSS breathing animation below

    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(data);
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += data[i];
      const level = sum / data.length / 255; // 0..1
      const scale = 1 + Math.min(level, 1) * 0.06; // 1.00 -> 1.06 "boom" pulse
      if (pulseRef.current) {
        pulseRef.current.style.transform = `scale(${scale.toFixed(3)})`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [activeTrack, isPlaying, reduceMotion, getAnalyser]);

  const useFallbackBreathing = isPlaying && !reduceMotion && !getAnalyser();
  const isSpinning = isPlaying && !reduceMotion;

  return (
    <AnimatePresence>
      {activeTrack && (
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 14 }}
          transition={{ duration: reduceMotion ? 0.01 : 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[60] flex items-center gap-3 pl-2.5 pr-4 py-2.5 rounded-full bg-[#0c0c0c]/95 border border-white/15 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.55)] max-w-[calc(100vw-2rem)]"
        >
          {/* Outer node: audio-reactive "boom" scale (JS/rAF, transform only) */}
          <div
            ref={pulseRef}
            className="relative w-11 h-11 flex-shrink-0 will-change-transform"
            style={{ transition: reduceMotion ? undefined : 'transform 90ms linear' }}
          >
            {/* Inner node: continuous vinyl-style spin (CSS animation) — kept on a
                separate element so it doesn't fight the JS-driven scale above */}
            <div
              className={`absolute inset-0 rounded-full overflow-hidden border border-white/15 ${
                isSpinning ? 'animate-[mini-spin_5s_linear_infinite]' : ''
              } ${useFallbackBreathing ? 'mini-cover-breathe' : ''}`}
            >
              <Image
                src={activeTrack.cover || '/media/music/covers/gio-lon.webp'}
                alt={activeTrack.title}
                fill
                className="object-cover"
                unoptimized
              />
              {/* Vinyl center hole for the disc read */}
              <span className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0c0c0c] border border-white/40" />
            </div>
          </div>

          <div className="min-w-0 text-left">
            <p className="text-sm font-semibold text-white truncate max-w-[9rem] sm:max-w-[12rem] leading-snug">
              {activeTrack.title}
            </p>
            <p className="text-[11px] font-mono text-[#8A8A8A] truncate max-w-[9rem] sm:max-w-[12rem]">
              {activeTrack.artists}
            </p>
          </div>

          <button
            type="button"
            onClick={() => toggleTrack(activeTrack)}
            disabled={isBuffering}
            aria-label={isPlaying ? 'Tạm dừng' : 'Phát tiếp'}
            title={isPlaying ? 'Tạm dừng' : 'Phát tiếp'}
            className="flex-shrink-0 w-7 h-7 rounded-full bg-white/[0.06] border border-white/15 flex items-center justify-center hover:bg-white/15 hover:border-white/30 transition-colors duration-200 active:scale-90 disabled:cursor-not-allowed"
          >
            {isBuffering ? (
              <span className="w-2.5 h-2.5 rounded-full border-[1.5px] border-white/30 border-t-white animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-3.5 h-3.5 text-white fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 text-white fill-current ml-0.5" />
            )}
          </button>

          {/* Tiny dedicated close/stop control — the only way to dismiss the pill */}
          <button
            type="button"
            onClick={closePlayer}
            aria-label="Đóng và dừng phát nhạc"
            title="Dừng phát nhạc"
            className="flex-shrink-0 w-5 h-5 rounded-full bg-white/[0.06] border border-white/15 flex items-center justify-center text-[#8A8A8A] hover:bg-white hover:text-black hover:border-white transition-colors duration-200 active:scale-90"
          >
            <X className="w-3 h-3" strokeWidth={2.5} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
