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

  const hasCover = Boolean(track.cover);

  return (
    <div
      className={`rounded-[20px] border bg-[#0D0D0D] p-4 sm:p-5 transition-all duration-300 ease-out group ${
        isActive
          ? 'border-white/[0.18] bg-[#111111]'
          : 'border-white/[0.06] hover:border-white/[0.12] hover:bg-[#101010]'
      }`}
    >
      <div className="flex items-center gap-4 sm:gap-5">
        {/* Cover — brand-consistent disc treatment; falls back to the BUOGS mark, never a raw placeholder */}
        <div className="relative w-[68px] h-[68px] sm:w-20 sm:h-20 rounded-full overflow-hidden flex-shrink-0 bg-[#0A0A0A] border border-white/[0.08] transition-colors duration-300 group-hover:border-white/20">
          {hasCover ? (
            <>
              <Image
                src={track.cover}
                alt={track.title}
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                sizes="80px"
                unoptimized
              />
              <span className="absolute top-1/2 left-1/2 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#050505] border border-white/40" />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#161616] to-[#0A0A0A]">
              <Image
                src="/fav-logo.png"
                alt=""
                width={64}
                height={64}
                className="w-7 h-7 sm:w-8 sm:h-8 opacity-75"
                unoptimized
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-heading text-base sm:text-[19px] font-semibold text-white leading-snug line-clamp-2">
              {track.title}
            </h3>
            <span className="flex-shrink-0 hidden sm:block text-[10px] font-mono text-[#5c5c5c] mt-1.5 whitespace-nowrap tracking-wide">
              {formatDate(track.publishDate)}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-xs text-[#9a9a9a] truncate max-w-full">{track.artists}</span>
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
                        className={`text-[9.5px] px-2 py-0.5 rounded-md font-mono uppercase tracking-wide transition-colors duration-200 ${
                          isSelected
                            ? 'bg-[#EDEAE2] text-[#121212] font-semibold'
                            : 'bg-white/[0.03] text-[#737373] hover:text-[#dcdcdc] border border-white/[0.08] hover:border-white/20'
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
