'use client';

import { useState, useEffect } from 'react';
import DemoMusicCard from '@/components/public/DemoMusicCard';
import Reveal from '@/components/public/Reveal';
import { DemoMusic, MusicTag } from '@/types';
import { ShoppingCart, Filter, Loader2 } from 'lucide-react';

export default function DemosPage() {
  const [demos, setDemos] = useState<DemoMusic[]>([]);
  const [tags, setTags] = useState<MusicTag[]>([]);
  const [zaloUrl, setZaloUrl] = useState<string | undefined>(undefined);
  const [telegramUrl, setTelegramUrl] = useState<string | undefined>(undefined);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [resDemos, resTags, resSettings] = await Promise.all([
          fetch('/api/public/demos'),
          fetch('/api/public/music-tags'),
          fetch('/api/public/settings'),
        ]);
        if (resDemos.ok) {
          const data = await resDemos.json();
          setDemos(data);
        }
        if (resTags.ok) {
          const tagData = await resTags.json();
          setTags(tagData);
        }
        if (resSettings.ok) {
          const settingsData = await resSettings.json();
          setZaloUrl(settingsData.zaloUrl);
          setTelegramUrl(settingsData.telegramUrl);
        }
      } catch (err) {
        console.error('Failed to load demo music data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredDemos = selectedTag
    ? demos.filter((m) => m.tags && m.tags.includes(selectedTag))
    : demos;

  return (
    <div className="section-page-demos relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16 space-y-14">
      {/* Header Banner */}
      <div className="space-y-4 max-w-2xl">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.32em] text-[#8a8a8a]">
          <ShoppingCart className="w-3 h-3 text-white/70" />
          <span>Demo Nhạc Bán</span>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-white leading-[1.05] tracking-tight">
          Demo Tracks
        </h1>
        <p className="text-sm sm:text-[15px] text-[#B0B0B0] leading-relaxed max-w-xl">
          Nghe thử các bản demo âm nhạc, beat, remix độc quyền từ BUOGS và liên hệ để mua file chất lượng cao.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:flex-wrap sm:gap-2.5 sm:overflow-visible sm:px-0">
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#5c5c5c] uppercase tracking-[0.15em] pr-1 flex-shrink-0">
          <Filter className="w-3 h-3" />
        </div>

        <button
          onClick={() => setSelectedTag(null)}
          className={`flex-shrink-0 text-[10.5px] px-3.5 py-[7px] rounded-full font-mono uppercase tracking-[0.06em] border transition-all duration-200 ${
            selectedTag === null
              ? 'bg-[#EDEAE2] border-[#EDEAE2] text-[#121212] font-semibold shadow-[0_4px_16px_rgba(0,0,0,0.3)]'
              : 'bg-white/[0.03] border-white/[0.08] text-[#8f8f8f] hover:text-[#dcdcdc] hover:border-white/20'
          }`}
        >
          Tất cả <span className="opacity-60">({demos.length})</span>
        </button>

        {tags.map((tag) => {
          const isSelected = selectedTag === tag.id;
          const count = demos.filter((m) => m.tags && m.tags.includes(tag.id)).length;
          return (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(isSelected ? null : tag.id)}
              className={`flex-shrink-0 text-[10.5px] px-3.5 py-[7px] rounded-full font-mono uppercase tracking-[0.06em] border transition-all duration-200 ${
                isSelected
                  ? 'bg-[#EDEAE2] border-[#EDEAE2] text-[#121212] font-semibold shadow-[0_4px_16px_rgba(0,0,0,0.3)]'
                  : 'bg-white/[0.03] border-white/[0.08] text-[#8f8f8f] hover:text-[#dcdcdc] hover:border-white/20'
              }`}
            >
              #{tag.name} <span className="opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Demo Track List Grid */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
          <span className="text-sm font-mono text-[#737373]">Đang tải danh sách demo...</span>
        </div>
      ) : filteredDemos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 pt-2">
          {filteredDemos.map((track, i) => (
            <Reveal key={track.id} delay={Math.min(i * 0.05, 0.3)} distance={16} className="h-full">
              <DemoMusicCard
                track={track}
                allTags={tags}
                zaloUrl={zaloUrl}
                telegramUrl={telegramUrl}
              />
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-[#0D0D0D] rounded-[20px] border border-white/[0.06] space-y-2">
          <p className="text-base font-semibold text-white">Chưa có bài demo nào</p>
          <p className="text-xs font-mono text-[#737373]">Vui lòng quay lại sau.</p>
        </div>
      )}
    </div>
  );
}
