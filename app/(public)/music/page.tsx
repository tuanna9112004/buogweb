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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16 space-y-12">
      {/* Header Banner */}
      <div className="space-y-3">
        <div className="kicker flex items-center gap-2 text-[#A8A8A8]">
          <Music2 className="w-3.5 h-3.5 text-white" />
          <span>Portfolio Music Tracks</span>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white">
          Music &amp; Remix Catalog
        </h1>
        <p className="text-sm text-[#A8A8A8] max-w-2xl leading-relaxed">
          Nghe trực tiếp các sản phẩm âm nhạc, bản Remix, House Lak, Vinahouse độc bản của BUOGS.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#5c5c5c] uppercase tracking-wide pr-1">
          <Filter className="w-3.5 h-3.5" />
        </div>

        <button
          onClick={() => setSelectedTag(null)}
          className={`text-[11px] px-3.5 py-1.5 rounded-full font-mono uppercase tracking-wide transition-colors duration-200 ${selectedTag === null
              ? 'bg-white text-black font-bold'
              : 'bg-white/[0.04] text-[#8a8a8a] hover:text-white border border-white/10 hover:border-white/25'
            }`}
        >
          Tất cả ({musicList.length})
        </button>

        {tags.map((tag) => {
          const isSelected = selectedTag === tag.id;
          const count = musicList.filter((m) => m.tags && m.tags.includes(tag.id)).length;
          return (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(isSelected ? null : tag.id)}
              className={`text-[11px] px-3.5 py-1.5 rounded-full font-mono uppercase tracking-wide transition-colors duration-200 ${isSelected
                  ? 'bg-white text-black font-bold'
                  : 'bg-white/[0.04] text-[#8a8a8a] hover:text-white border border-white/10 hover:border-white/25'
                }`}
            >
              #{tag.name} ({count})
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
        <div className="space-y-3.5 pt-2">
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
        <div className="py-16 text-center bg-[#0A0A0A] rounded-2xl border border-white/10 space-y-2">
          <p className="text-base font-semibold text-white">Chưa có bài nhạc nào trong danh mục này</p>
          <p className="text-xs font-mono text-[#737373]">Vui lòng thử chọn tag khác hoặc quay lại sau.</p>
        </div>
      )}
    </div>
  );
}
