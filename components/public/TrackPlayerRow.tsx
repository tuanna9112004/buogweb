'use client';

import { useMemo, useRef, type MouseEvent } from 'react';
import { Play, Pause, Loader2, Clock } from 'lucide-react';
import { useAudio, useAudioTime } from './AudioPlayerContext';
import { Music } from '@/types';

interface TrackPlayerRowProps {
  track: Music;
  barCount?: number;
}

/** Deterministic, seed-based bar heights — looks like a real waveform without
 *  ever decoding audio just to draw one (nothing is fetched until Play). */
function seededBars(seed: string, count: number): number[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  let state = h || 1;
  const bars: number[] = [];
  for (let i = 0; i < count; i++) {
    state ^= state << 13; state >>>= 0;
    state ^= state >>> 17;
    state ^= state << 5; state >>>= 0;
    const rand = (state % 1000) / 1000;
    const envelope = 0.5 + 0.5 * Math.abs(Math.sin((i / count) * Math.PI * 5 + h));
    bars.push(Math.max(12, Math.min(100, Math.round(rand * envelope * 100))));
  }
  return bars;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export default function TrackPlayerRow({ track, barCount = 400 }: TrackPlayerRowProps) {
  const { currentTrackId, isPlaying, isBuffering, hasError, durations, toggleTrack, seek } = useAudio();
  const waveformRef = useRef<HTMLDivElement>(null);

  const isActive = currentTrackId === track.id;
  const currentTime = useAudioTime(); // only meaningful while this row is active
  const duration = durations[track.id] ?? 0;

  const bars = useMemo(() => seededBars(track.id, barCount), [track.id, barCount]);

  const progress = isActive && duration > 0 ? Math.min(currentTime / duration, 1) : 0;
  const playedBars = Math.round(progress * barCount);

  const showError = isActive && hasError;
  const showLoading = isActive && isBuffering && !hasError;

  const handlePlayToggle = () => {
    if (showError) return;
    toggleTrack(track);
  };

  const handleWaveformClick = (e: MouseEvent<HTMLDivElement>) => {
    if (showError) return;
    if (!isActive) {
      toggleTrack(track);
      return;
    }
    if (duration <= 0 || !waveformRef.current) return;
    const rect = waveformRef.current.getBoundingClientRect();
    const fraction = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    seek(fraction * duration);
  };

  return (
    <div className="flex items-center gap-3 w-full">
      <button
        onClick={handlePlayToggle}
        disabled={showError}
        aria-label={isActive && isPlaying ? 'Pause' : showError ? 'Audio chưa sẵn sàng' : 'Play'}
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
          showError
            ? 'bg-transparent text-[#5c5c5c] border border-white/10 cursor-not-allowed'
            : isActive && isPlaying
            ? 'bg-[#EDEAE2] text-[#121212]'
            : 'bg-white/[0.05] text-white/90 border border-white/[0.12] group-hover:border-white/30 hover:border-white/40'
        }`}
      >
        {showLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : showError ? (
          <Clock className="w-3.5 h-3.5" />
        ) : isActive && isPlaying ? (
          <Pause className="w-3 h-3 fill-current" />
        ) : (
          <Play className="w-3 h-3 fill-current ml-0.5" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        {showError ? (
          <div className="flex items-center gap-2 text-xs text-[#737373] font-mono py-2">
            <Clock className="w-3.5 h-3.5" />
            <span>Audio đang được cập nhật</span>
          </div>
        ) : (
          <div
            ref={waveformRef}
            onClick={handleWaveformClick}
            className="flex items-center gap-[0.5px] h-9 cursor-pointer"
          >
            {bars.map((barHeight, i) => (
              <span
                key={i}
                className={`flex-1 min-w-0 transition-colors duration-150 ${
                  i < playedBars ? 'bg-white' : 'bg-white/25'
                }`}
                style={{ height: `${barHeight}%` }}
              />
            ))}
          </div>
        )}
      </div>

      {!showError && (
        <span className="flex-shrink-0 text-[10px] font-mono text-[#5c5c5c] tabular-nums tracking-wide">
          {isActive ? formatTime(currentTime) : '0:00'} / {duration > 0 ? formatTime(duration) : '--:--'}
        </span>
      )}
    </div>
  );
}
