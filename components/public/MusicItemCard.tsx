'use client';

import Image from 'next/image';
import { Music, MusicTag } from '@/types';
import TrackPlayerRow from './TrackPlayerRow';
import { useAudio } from './AudioPlayerContext';

interface MusicItemCardProps {
  track: Music;
  allTags?: MusicTag[];
  selectedTag?: string | null;
  onSelectTag?: (tagId: string | null) => void;
}

export default function MusicItemCard({
  track,
  allTags = [],
  selectedTag,
  onSelectTag,
}: MusicItemCardProps) {
  const { currentTrackId } = useAudio();
  const isActive = currentTrackId === track.id;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
  };

  const coverUrl = track.cover || '/media/music/covers/gio-lon.webp';

  return (
    <div
      className={`bg-[#101010] border rounded-2xl p-3.5 sm:p-4 transition-colors duration-300 group ${
        isActive ? 'border-white/30' : 'border-white/[0.08] hover:border-white/20'
      }`}
    >
      <div className="flex items-center gap-4 sm:gap-5">
        {/* Cover — circular disc treatment to match the mini player */}
        <div className="relative w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] rounded-full overflow-hidden flex-shrink-0 bg-[#050505] border border-white/10 group-hover:border-white/25 transition-colors duration-300">
          <Image
            src={coverUrl}
            alt={track.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            sizes="(max-width: 640px) 100px, 120px"
            unoptimized
          />
          {/* Vinyl center hole */}
          <span className="absolute top-1/2 left-1/2 w-2.5 h-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#050505] border border-white/40" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-heading text-base sm:text-lg font-semibold text-white leading-snug line-clamp-2">
              {track.title}
            </h3>
            <span className="flex-shrink-0 text-[10px] font-mono text-[#5c5c5c] mt-1 whitespace-nowrap">
              {formatDate(track.publishDate)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-xs text-[#8a8a8a] truncate max-w-full">{track.artists}</span>
            {track.tags && track.tags.length > 0 && (
              <>
                <span className="text-[#3a3a3a]">·</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {track.tags.map((tagId) => {
                    const tagObj = allTags.find((t) => t.id === tagId);
                    const tagName = tagObj ? tagObj.name : tagId.toUpperCase();
                    const isSelected = selectedTag === tagId;
                    return (
                      <button
                        key={tagId}
                        onClick={() => onSelectTag && onSelectTag(isSelected ? null : tagId)}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-mono transition-colors duration-200 ${
                          isSelected
                            ? 'bg-white text-black font-bold'
                            : 'bg-white/[0.04] text-[#737373] hover:text-white border border-white/10 hover:border-white/25'
                        }`}
                      >
                        #{tagName}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <div className="pt-1">
            <TrackPlayerRow track={track} />
          </div>
        </div>
      </div>
    </div>
  );
}
