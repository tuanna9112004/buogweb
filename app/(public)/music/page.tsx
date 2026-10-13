'use client';

import { useState, useEffect } from 'react';
import MusicItemCard from '@/components/public/MusicItemCard';
import Reveal from '@/components/public/Reveal';
import { Music, MusicTag } from '@/types';
import { Filter, Loader2 } from 'lucide-react';

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
    <div className="artist-catalog section-page-music relative max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16 space-y-6">
      <h1 className="sr-only">Music</h1>

      {/* Filter Bar — luxury pill system; horizontal scroll strip on mobile, wraps from sm+ */}
      <div className="artist-filters catalog-filters flex flex-wrap items-center gap-2">
        <div className="hidden md:flex items-center gap-1.5 text-[10px] font-mono text-[#5c5c5c] uppercase tracking-[0.15em] pr-1 flex-shrink-0">
          <Filter className="w-3 h-3" />
        </div>

        <button
          aria-pressed={selectedTag === null}
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
          if (count === 0) return null;
          return (
            <button
              key={tag.id}
              aria-pressed={isSelected}
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
        <div className="music-list space-y-3">
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
