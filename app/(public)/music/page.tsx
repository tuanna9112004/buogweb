'use client';

import { useState, useEffect } from 'react';
import MusicItemCard from '@/components/public/MusicItemCard';
import Reveal from '@/components/public/Reveal';
import { Music, MusicTag } from '@/types';
import { Music2, Filter, Loader2 } from 'lucide-react';

export default function MusicPage() {
  const [musicList, setMusicList] = useState<Music[]>([]);
  const [tags, setTags] = useState<MusicTag[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [resMusic, resTags] = await Promise.all([
          fetch('/api/public/music'),
          fetch('/api/public/music-tags'),
        ]);
        if (resMusic.ok) {
          const data = await resMusic.json();
          setMusicList(data);
        }
        if (resTags.ok) {
          const tagData = await resTags.json();
          setTags(tagData);
        }
      } catch (err) {
        console.error('Failed to load music data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredMusic = selectedTag
    ? musicList.filter((m) => m.tags && m.tags.includes(selectedTag))
    : musicList;

  return (
    <div className="section-page-music relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16 space-y-14">
      {/* Subtle radial depth behind the heading — barely-there, editorial not flashy */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[380px] w-[90vw] max-w-[720px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-white/[0.035] blur-[130px]" />

      {/* Header Banner */}
      <div className="space-y-4 max-w-2xl">
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.32em] text-[#8a8a8a]">
          <Music2 className="w-3 h-3 text-white/70" />
          <span>Portfolio Music Tracks</span>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-[3.25rem] font-bold text-white leading-[1.05] tracking-tight">
          Music &amp; Remix Catalog
        </h1>
        <p className="text-sm sm:text-[15px] text-[#B0B0B0] leading-relaxed max-w-xl">
          Nghe trực tiếp các sản phẩm âm nhạc, bản Remix, House Lak, Vinahouse độc bản của BUOGS.
        </p>
      </div>

      {/* Filter Bar — luxury pill system */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 overflow-x-auto pb-1 -mx-1 px-1 sm:mx-0 sm:px-0">
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
          Tất cả <span className="opacity-60">({musicList.length})</span>
        </button>

        {tags.map((tag) => {
          const isSelected = selectedTag === tag.id;
          const count = musicList.filter((m) => m.tags && m.tags.includes(tag.id)).length;
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

      {/* Music Track List */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
          <span className="text-sm font-mono text-[#737373]">Đang tải danh sách nhạc...</span>
        </div>
      ) : filteredMusic.length > 0 ? (
        <div className="music-list space-y-4 pt-2">
          {filteredMusic.map((track, i) => (
            <Reveal key={track.id} delay={Math.min(i * 0.05, 0.3)} distance={16}>
              <MusicItemCard
                track={track}
                allTags={tags}
                selectedTag={selectedTag}
                onSelectTag={(tId) => setSelectedTag(tId)}
              />
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-[#0D0D0D] rounded-[20px] border border-white/[0.06] space-y-2">
          <p className="text-base font-semibold text-white">Chưa có bài nhạc nào trong danh mục này</p>
          <p className="text-xs font-mono text-[#737373]">Vui lòng thử chọn tag khác hoặc quay lại sau.</p>
        </div>
      )}
    </div>
  );
}
