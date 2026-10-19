import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getMusicById, getMusicList, getMusicTags } from '@/lib/storage/repository';
import TrackPlayerRow from '@/components/public/TrackPlayerRow';
import MusicItemCard from '@/components/public/MusicItemCard';
import CopyLinkButton from '@/components/public/CopyLinkButton';
import Reveal from '@/components/public/Reveal';
import { ArrowLeft, Music2, Calendar, Download } from 'lucide-react';

export const revalidate = 0;

interface MusicDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: MusicDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const track = getMusicById(id);
  if (!track || !track.published) return { title: 'Track không tồn tại | BUOGS' };

  return {
    title: `${track.title} — ${track.artists} | BUOGS`,
    description: `Nghe "${track.title}" bởi ${track.artists} trên BUOGS — DJ / Producer.`,
  };
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
}

export default async function MusicDetailPage({ params }: MusicDetailPageProps) {
  const { id } = await params;
  const track = getMusicById(id);

  if (!track || !track.published) {
    notFound();
  }

  const allTags = getMusicTags(true);
  const allTracks = getMusicList(true);

  const trackTagSet = new Set(track.tags || []);
  const related = allTracks
    .filter((t) => t.id !== track.id)
    .sort((a, b) => {
      const aShared = (a.tags || []).some((tId) => trackTagSet.has(tId)) ? 1 : 0;
      const bShared = (b.tags || []).some((tId) => trackTagSet.has(tId)) ? 1 : 0;
      return bShared - aShared;
    })
    .slice(0, 3);

  return (
    <div className="section-detail relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 space-y-10">
      {/* Back link */}
      <Link
        href="/music"
        className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#A8A8A8] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại danh sách Music</span>
      </Link>

      {/* Hero */}
      <div className="rounded-[28px] border border-white/[0.08] bg-[#0A0A0A] p-6 sm:p-10 flex flex-col sm:flex-row items-center sm:items-start gap-8">
        {/* Disc artwork */}
        <div className="relative w-40 h-40 sm:w-52 sm:h-52 rounded-full overflow-hidden flex-shrink-0 bg-[#0A0A0A] border border-white/[0.1] shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
          {track.cover ? (
            <>
              <Image
                src={track.cover}
                alt={track.title}
                fill
                className="object-cover"
                sizes="208px"
                priority
                unoptimized
              />
              <span className="absolute top-1/2 left-1/2 w-3.5 h-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#050505] border border-white/40" />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#161616] to-[#0A0A0A]">
              <Image src="/fav-logo.png" alt="" width={80} height={80} className="w-14 h-14 opacity-75" unoptimized />
            </div>
          )}
        </div>

        {/* Meta */}
        <div className="flex-1 min-w-0 space-y-4 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.28em] text-[#8a8a8a]">
            <Music2 className="w-3 h-3 text-white/70" />
            <span>Music Track</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white leading-[1.1]">
            {track.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-2 text-sm text-[#B0B0B0]">
            <span>{track.artists}</span>
            {track.publishDate && (
              <>
                <span className="text-[#3a3a3a]">·</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[#737373]">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(track.publishDate)}
                </span>
              </>
            )}
          </div>

          {track.tags && track.tags.length > 0 && (
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
              {track.tags.map((tagId) => {
                const tagObj = allTags.find((t) => t.id === tagId);
                return (
                  <span
                    key={tagId}
                    className="text-[10px] font-mono px-3 py-1 rounded-md bg-white/[0.03] text-[#a8a8a8] border border-white/[0.08] uppercase tracking-wide"
                  >
                    #{tagObj ? tagObj.name : tagId.toUpperCase()}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Player + Actions */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0A0A0A] p-6 sm:p-7 space-y-6">
        <TrackPlayerRow track={track} />

        <div className="flex flex-wrap items-center gap-3 border-t border-white/[0.07] pt-5">
          <CopyLinkButton />
          {track.isDownloadable && (
            <a
              href={track.audio.startsWith('/media/') ? `/api/download/${track.id}` : track.audio}
              download={`${track.title.replace(/[\\/:*?"<>|]/g, '').trim()} - buogsdj.mp3`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-[#101010] px-5 py-3 text-xs font-bold uppercase tracking-wider font-mono text-white hover:border-[#b6ff2e]/50 hover:text-[#b6ff2e] transition-all duration-200"
            >
              <Download className="w-4 h-4" />
              <span>Tải Về File Audio</span>
            </a>
          )}
        </div>
      </div>

      {/* Related tracks */}
      {related.length > 0 && (
        <div className="space-y-6 pt-4">
          <h2 className="font-heading text-2xl font-bold text-white uppercase border-b border-white/10 pb-4">
            Nghe Thêm Track Khác
          </h2>
          <div className="space-y-4">
            {related.map((rel, i) => (
              <Reveal key={rel.id} delay={Math.min(i * 0.05, 0.3)} distance={16}>
                <MusicItemCard track={rel} allTags={allTags} />
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
