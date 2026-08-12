'use client';

import Image from 'next/image';
import { Music, MusicTag } from '@/types';
import WaveSurferTrackPlayer from './WaveSurferTrackPlayer';
import { Calendar, Tag } from 'lucide-react';

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
  // Format publishDate (dd/MM/yyyy)
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const coverUrl = track.cover || '/media/music/covers/gio-lon.webp';

  return (
    <div className="bg-[#101010] border border-white/10 rounded-2xl p-4 sm:p-6 transition-all hover:border-white/25 shadow-2xl group">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
        
        {/* Cover Thumbnail */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden flex-shrink-0 bg-[#050505] border border-white/15 group-hover:border-white/40 transition-colors">
          <Image
            src={coverUrl}
            alt={track.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 96px, 112px"
            unoptimized
          />
        </div>

        {/* Info & Player Wrapper */}
        <div className="flex-1 w-full space-y-3">
          
          {/* Header Info: Title, Artists, Date, Tags */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-wide line-clamp-2 transition-colors">
                {track.title}
              </h3>
              <p className="text-sm font-medium text-[#A8A8A8]">
                {track.artists}
              </p>
            </div>

            {/* Date Badge */}
            <div className="flex items-center gap-1.5 text-xs font-mono text-[#737373] bg-[#0A0A0A] px-3 py-1.5 rounded-full border border-white/10 w-fit">
              <Calendar className="w-3.5 h-3.5 text-white/60" />
              <span>{formatDate(track.publishDate)}</span>
            </div>
          </div>

          {/* Tags list */}
          {track.tags && track.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Tag className="w-3.5 h-3.5 text-[#737373]" />
              {track.tags.map((tagId) => {
                const tagObj = allTags.find((t) => t.id === tagId);
                const tagName = tagObj ? tagObj.name : tagId.toUpperCase();
                const isSelected = selectedTag === tagId;

                return (
                  <button
                    key={tagId}
                    onClick={() => onSelectTag && onSelectTag(isSelected ? null : tagId)}
                    className={`text-xs px-2.5 py-1 rounded-md font-mono transition-all ${
                      isSelected
                        ? 'bg-white text-black font-bold shadow-md'
                        : 'bg-[#0A0A0A] text-[#737373] hover:text-white border border-white/10 hover:border-white/30'
                    }`}
                  >
                    #{tagName}
                  </button>
                );
              })}
            </div>
          )}

          {/* WaveSurfer Player */}
          <div className="pt-2">
            <WaveSurferTrackPlayer track={track} />
          </div>

        </div>

      </div>
    </div>
  );
}
