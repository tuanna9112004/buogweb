import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { getDemoMusicById, getDemoMusicList, getMusicTags, getSettings } from '@/lib/storage/repository';
import { Music } from '@/types';
import TrackPlayerRow from '@/components/public/TrackPlayerRow';
import DemoMusicCard from '@/components/public/DemoMusicCard';
import CopyLinkButton from '@/components/public/CopyLinkButton';
import Reveal from '@/components/public/Reveal';
import { ArrowLeft, ShoppingCart, Calendar, Send, CheckCircle2 } from 'lucide-react';

export const revalidate = 0;

interface DemoDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: DemoDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const demo = getDemoMusicById(id);
  if (!demo || !demo.published) return { title: 'Demo không tồn tại | BUOGS' };

  return {
    title: `${demo.title} — ${demo.artists} | Demo Music BUOGS`,
    description: `Nghe thử demo "${demo.title}" bởi ${demo.artists} và liên hệ mua file chất lượng cao từ BUOGS.`,
  };
}

function formatDate(dateStr: string) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateStr;
}

export default async function DemoDetailPage({ params }: DemoDetailPageProps) {
  const { id } = await params;
  const demo = getDemoMusicById(id);

  if (!demo || !demo.published) {
    notFound();
  }

  const settings = getSettings();
  const allTags = getMusicTags(true);
  const allDemos = getDemoMusicList(true);

  const demoTagSet = new Set(demo.tags || []);
  const related = allDemos
    .filter((d) => d.id !== demo.id)
    .sort((a, b) => {
      const aShared = (a.tags || []).some((tId) => demoTagSet.has(tId)) ? 1 : 0;
      const bShared = (b.tags || []).some((tId) => demoTagSet.has(tId)) ? 1 : 0;
      return bShared - aShared;
    })
    .slice(0, 2);

  // Adapt DemoMusic to the shared Music shape for the waveform player
  const playableTrack: Music = {
    ...demo,
    audio: demo.demoAudio,
    isDownloadable: false,
    publishDate: demo.publishDate || '',
  } as Music;

  return (
    <div className="section-detail relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-16 space-y-10">
      {/* Back link */}
      <Link
        href="/demos"
        className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#A8A8A8] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại danh sách Demo Music</span>
      </Link>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: artwork + player */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-[28px] border border-white/[0.08] bg-[#0A0A0A] p-6 sm:p-8 flex items-center gap-6">
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden flex-shrink-0 bg-[#0A0A0A] border border-white/[0.1] shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
              {demo.cover ? (
                <>
                  <Image
                    src={demo.cover}
                    alt={demo.title}
                    fill
                    className="object-cover"
                    sizes="144px"
                    priority
                    unoptimized
                  />
                  <span className="absolute top-1/2 left-1/2 w-3 h-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#050505] border border-white/40" />
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#161616] to-[#0A0A0A]">
                  <Image src="/fav-logo.png" alt="" width={64} height={64} className="w-10 h-10 opacity-75" unoptimized />
                </div>
              )}
            </div>

            <div className="min-w-0 space-y-2">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.28em] text-[#8a8a8a]">
                <ShoppingCart className="w-3 h-3 text-white/70" />
                <span>Demo Nhạc Bán</span>
              </div>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white leading-[1.15]">
                {demo.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#B0B0B0]">
                <span className="truncate">{demo.artists}</span>
                {demo.publishDate && (
                  <>
                    <span className="text-[#3a3a3a]">·</span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[#737373]">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(demo.publishDate)}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Player */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0A0A0A] p-6 space-y-5">
            <div className="flex items-center gap-2 text-xs font-mono text-white/80 uppercase">
              <span>Nghe Thử Demo Audio</span>
            </div>
            <TrackPlayerRow track={playableTrack} />

            {demo.tags && demo.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 border-t border-white/[0.07] pt-4">
                {demo.tags.map((tagId) => {
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

        {/* Right: price box + CTAs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0A0A0A] border border-white/15 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div>
              <span className="text-xs font-mono text-[#737373] uppercase block">Giá Sở Hữu File Gốc</span>
              <span className="font-mono text-3xl font-extrabold text-white">
                {demo.priceText || 'Liên hệ'}
              </span>
            </div>

            <div className="space-y-2 text-xs text-[#A8A8A8] font-mono border-t border-white/10 pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>File chất lượng cao, sẵn sàng sử dụng</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Gửi link tải Drive tốc độ cao ngay sau tư vấn</span>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2">
              {settings.zaloUrl && (
                <a
                  href={settings.zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-white text-[#050505] font-bold text-sm uppercase tracking-wider hover:bg-[#E6E6E6] transition-all transform hover:scale-[1.01] shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  <span>Liên Hệ Zalo Mua Demo</span>
                </a>
              )}

              {settings.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#101010] border border-white/15 text-white font-bold text-sm uppercase tracking-wider hover:border-white/30 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Facebook Messenger</span>
                </a>
              )}

              {settings.telegramUrl && (
                <a
                  href={settings.telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#101010] border border-white/15 text-white font-bold text-sm uppercase tracking-wider hover:border-white/30 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Liên Hệ Qua Telegram</span>
                </a>
              )}

              <CopyLinkButton className="w-full py-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Related demos */}
      {related.length > 0 && (
        <div className="space-y-6 pt-6">
          <h2 className="font-heading text-2xl font-bold text-white uppercase border-b border-white/10 pb-4">
            Demo Khác Bạn Có Thể Thích
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {related.map((rel, i) => (
              <Reveal key={rel.id} delay={Math.min(i * 0.05, 0.3)} distance={16} className="h-full">
                <DemoMusicCard track={rel} allTags={allTags} zaloUrl={settings.zaloUrl} telegramUrl={settings.telegramUrl} />
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
