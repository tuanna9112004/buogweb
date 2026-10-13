'use client';

import Image from 'next/image';
import Link from 'next/link';
import { DemoMusic, MusicTag, Music } from '@/types';
import TrackPlayerRow from './TrackPlayerRow';
import { useAudio } from './AudioPlayerContext';
import { ShoppingCart, Send } from 'lucide-react';

interface DemoMusicCardProps {
  track: DemoMusic;
  allTags?: MusicTag[];
  zaloUrl?: string;
  telegramUrl?: string;
}

export default function DemoMusicCard({
  track,
  allTags = [],
  zaloUrl,
  telegramUrl,
}: DemoMusicCardProps) {
  const { currentTrackId } = useAudio();
  const isActive = currentTrackId === track.id;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
  };

  const hasCover = Boolean(track.cover);

  // Map DemoMusic to Music type for TrackPlayerRow compatibility
  const playableTrack: Music = {
    ...track,
    audio: track.demoAudio,
    isDownloadable: false,
    publishDate: track.publishDate || '',
  } as Music;

  return (
    <div
      className={`artist-track-card studio-card rounded-[20px] border bg-[#0D0D0D] p-4 sm:p-5 transition-all duration-300 ease-out group flex flex-col h-full ${
        isActive
          ? 'border-white/[0.18] bg-[#111111]'
          : 'border-white/[0.06] hover:border-white/[0.12] hover:bg-[#101010]'
      }`}
    >
      <div className="flex items-center gap-3 sm:gap-4 mb-2">
        {/* Cover */}
        <Link
          href={`/demos/${track.id}`}
          className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden flex-shrink-0 bg-[#0A0A0A] border border-white/[0.08] transition-colors duration-300 group-hover:border-white/20"
        >
          {hasCover ? (
            <>
              <Image
                src={track.cover}
                alt={track.title}
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                sizes="64px"
                unoptimized={!track.cover?.startsWith('/')}
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
                unoptimized={!track.cover?.startsWith('/')}
              />
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <Link href={`/demos/${track.id}`} className="min-w-0 group/title">
              <h3 className="font-heading text-base sm:text-[19px] font-semibold text-white leading-snug line-clamp-2 group-hover/title:text-[#EDEAE2] transition-colors duration-200">
                {track.title}
              </h3>
            </Link>
            <span className="flex-shrink-0 hidden sm:block text-[10px] font-mono text-[#969590] mt-1.5 whitespace-nowrap tracking-wide">
              {formatDate(track.publishDate)}
            </span>
          </div>

          <div className="artist-track-meta flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-xs text-[#9a9a9a] truncate max-w-full">{track.artists}</span>
            {track.tags && track.tags.length > 0 && (
              <>
                <span className="text-[#3a3a3a]">·</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {track.tags.map((tagId) => {
                    const tagObj = allTags.find((t) => t.id === tagId);
                    const tagName = tagObj ? tagObj.name : tagId.toUpperCase();
                    return (
                      <span
                        key={tagId}
                        className="text-[9.5px] px-2 py-0.5 rounded-md font-mono uppercase tracking-wide transition-colors duration-200 bg-white/[0.03] text-[#aaa9a5] border border-white/[0.08]"
                      >
                        #{tagName}
                      </span>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="pt-1 mb-3">
        <TrackPlayerRow track={playableTrack} />
      </div>

      <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-3 border-t border-white/[0.07] pt-4">
        <div className="min-w-0 flex-1">
          <span className="block font-mono text-[10px] uppercase tracking-wide text-[#969590]">
            Giá Mua File
          </span>
          <span className="block font-mono text-base font-bold text-white">
            {track.priceText || 'Liên hệ'}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {telegramUrl && (
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Liên hệ qua Telegram"
              className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.05] text-white transition-all duration-200 hover:border-[#b6ff2e] hover:bg-[#b6ff2e]/10 hover:text-[#b6ff2e]"
            >
              <Send className="h-3.5 w-3.5" />
            </a>
          )}
          <a
            href={zaloUrl || 'https://zalo.me'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-all duration-200 group-hover:border-[#b6ff2e] group-hover:bg-[#b6ff2e]/10 group-hover:text-[#b6ff2e]"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            <span>Liên Hệ Mua</span>
          </a>
        </div>
      </div>
    </div>
  );
}
