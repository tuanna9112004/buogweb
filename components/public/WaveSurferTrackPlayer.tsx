'use client';

import { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause, AlertCircle, Loader2 } from 'lucide-react';
import { useAudio } from './AudioPlayerContext';
import { Music } from '@/types';

interface WaveSurferTrackPlayerProps {
  track: Music;
  height?: number;
}

export default function WaveSurferTrackPlayer({ track, height = 48 }: WaveSurferTrackPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);

  const { currentTrackId, isPlaying, toggleTrack, pauseTrack } = useAudio();
  const isCurrentTrack = currentTrackId === track.id;
  const isThisPlaying = isCurrentTrack && isPlaying;

  const [isReady, setIsReady] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    // Destroy existing instance if any
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
    }

    setIsReady(false);
    setHasError(false);

    try {
      const ws = WaveSurfer.create({
        container: containerRef.current,
        waveColor: '#333333',
        progressColor: '#ffffff',
        cursorColor: '#ffffff',
        cursorWidth: 2,
        height: height,
        barWidth: 2,
        barGap: 2,
        barRadius: 2,
        url: track.audio,
      });

      ws.on('ready', (d) => {
        setIsReady(true);
        setDuration(d);
      });

      ws.on('audioprocess', (time) => {
        setCurrentTime(time);
      });

      ws.on('seeking', (time) => {
        setCurrentTime(time);
      });

      ws.on('finish', () => {
        pauseTrack();
        ws.seekTo(0);
      });

      ws.on('error', (err) => {
        console.error(`WaveSurfer error on track ${track.id}:`, err);
        setHasError(true);
        setIsReady(false);
      });

      wavesurferRef.current = ws;
    } catch (err) {
      console.error(`WaveSurfer creation error:`, err);
      setHasError(true);
    }

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
    };
  }, [track.audio, track.id, height, pauseTrack]);

  // Sync play/pause state from global AudioContext
  useEffect(() => {
    const ws = wavesurferRef.current;
    if (!ws || !isReady) return;

    if (isThisPlaying) {
      ws.play().catch((err) => {
        console.error('Play error:', err);
        setHasError(true);
      });
    } else {
      ws.pause();
    }
  }, [isThisPlaying, isReady]);

  const handlePlayToggle = () => {
    if (hasError) return;
    toggleTrack(track);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex items-center gap-4 w-full bg-[#0a0a0a] p-3 sm:p-4 rounded-xl border border-white/10 hover:border-white/20 transition-all">
      {/* Play/Pause Button */}
      <button
        onClick={handlePlayToggle}
        disabled={hasError}
        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all transform hover:scale-105 active:scale-95 focus:outline-none ${
          hasError
            ? 'bg-red-900/30 text-red-400 cursor-not-allowed'
            : isThisPlaying
            ? 'bg-white text-black shadow-lg shadow-white/10'
            : 'bg-[#101010] text-white border border-white/15 hover:border-white hover:text-white'
        }`}
        aria-label={isThisPlaying ? 'Pause' : 'Play'}
      >
        {!isReady && !hasError ? (
          <Loader2 className="w-5 h-5 animate-spin text-white" />
        ) : hasError ? (
          <AlertCircle className="w-5 h-5 text-red-400" />
        ) : isThisPlaying ? (
          <Pause className="w-5 h-5 fill-current" />
        ) : (
          <Play className="w-5 h-5 fill-current ml-0.5" />
        )}
      </button>

      {/* Waveform & Status */}
      <div className="flex-1 min-w-0">
        {hasError ? (
          <div className="flex items-center gap-2 text-sm text-red-400 font-mono py-2">
            <AlertCircle className="w-4 h-4" />
            <span>Không thể phát file audio</span>
          </div>
        ) : (
          <div className="relative w-full">
            <div ref={containerRef} className="w-full cursor-pointer" />
            {!isReady && (
              <div className="absolute inset-0 bg-[#0a0a0a]/80 flex items-center justify-center text-xs text-[#737373] font-mono">
                Loading waveform...
              </div>
            )}
          </div>
        )}

        {/* Time display */}
        <div className="flex justify-between items-center text-[11px] font-mono text-[#737373] mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{duration > 0 ? formatTime(duration) : '--:--'}</span>
        </div>
      </div>
    </div>
  );
}
