'use client';

import Image from 'next/image';
import { Play, Pause } from 'lucide-react';
import { Music, MusicTag } from '@/types';
import { useAudio } from './AudioPlayerContext';

interface MusicShowcaseCardProps {
  track: Music;
  allTags?: MusicTag[];
  highlight?: boolean;
}

export default function MusicShowcaseCard({ track, allTags = [], highlight = false }: MusicShowcaseCardProps) {
  const { currentTrackId, isPlaying, toggleTrack } = useAudio();
  const isActive = currentTrackId === track.id;
  const isActivePlaying = isActive && isPlaying;

  const coverUrl = track.cover || '/media/music/covers/gio-lon.webp';
  const primaryTagId = track.tags?.[0];
  const primaryTag = primaryTagId
    ? allTags.find((t) => t.id === primaryTagId)?.name || primaryTagId.toUpperCase()
    : null;

  return (
    <button
      type="button"
      onClick={() => toggleTrack(track)}
      aria-pressed={isActivePlaying}
      className={`group relative flex w-full flex-col overflow-hidden rounded-[22px] border bg-[#131118] text-left shadow-[0_20px_45px_rgba(0,0,0,0.5)] transition-all duration-300 ${
        highlight ? 'z-10 sm:scale-[1.1]' : ''
      } ${isActive ? 'border-white/30' : 'border-white/10 hover:border-white/20'}`}
    >
      {/* Cover — inset within the card, not stretched to the card's full width */}
      <div className="p-3 sm:p-3.5 pb-0">
        <div className="relative w-full aspect-[3/4] overflow-hidden rounded-xl">
          <Image
            src={coverUrl}
            alt={track.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            sizes="(max-width: 640px) 33vw, 280px"
            unoptimized
          />

          <span
            className={`absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 backdrop-blur-sm transition-all duration-300 ${
              isActive
                ? 'border-white bg-white/95'
                : 'border-white/70 bg-white/10 group-hover:bg-white/20'
            }`}
          >
            {isActivePlaying ? (
              <Pause className="h-4 w-4 fill-current text-black" />
            ) : (
              <Play className={`h-4 w-4 ml-0.5 fill-current ${isActive ? 'text-black' : 'text-white'}`} />
            )}
          </span>
        </div>
      </div>

      {/* Text panel — separate flat surface below the cover, not overlaid on it */}
      <div className="flex items-start justify-between gap-2 px-4 py-3.5">
        <div className="min-w-0">
          <h3 className="font-heading text-sm sm:text-base font-semibold text-white leading-snug truncate">
            {track.title}
          </h3>
          <p className="mt-0.5 truncate text-xs text-[#8A8A8A]">{track.artists}</p>
        </div>
        {primaryTag && (
          <span className="mt-0.5 flex-shrink-0 whitespace-nowrap font-mono text-[10px] text-[#6B6B6B]">
            #{primaryTag}
          </span>
        )}
      </div>
    </button>
  );
}
