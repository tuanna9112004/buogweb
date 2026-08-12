'use client';

import { useState, useEffect } from 'react';
import MusicItemCard from '@/components/public/MusicItemCard';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 space-y-8">
      {/* Header Banner */}
      <div className="space-y-3 border-b border-white/10 pb-6">
        <div className="text-xs font-mono text-[#A8A8A8] uppercase tracking-widest flex items-center gap-2">
          <Music2 className="w-4 h-4 text-white" />
          <span>PORTFOLIO MUSIC TRACKS</span>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-white">
          MUSIC & REMIX CATALOG
        </h1>
        <p className="text-sm text-[#A8A8A8] max-w-2xl">
          Nghe trực tiếp các sản phẩm âm nhạc, bản Remix, House Lak, Vinahouse độc bản của BUOGS với chất lượng cao bằng WaveSurfer Audio Player.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-[#0A0A0A] p-3 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2 text-xs font-mono text-[#737373] px-3 py-1">
          <Filter className="w-3.5 h-3.5 text-white/70" />
          <span>LỌC THEO TAG:</span>
        </div>

        <button
          onClick={() => setSelectedTag(null)}
          className={`text-xs px-4 py-2 rounded-xl font-mono uppercase tracking-wider transition-all ${
            selectedTag === null
              ? 'bg-white text-black font-bold shadow-md'
              : 'bg-[#101010] text-[#737373] hover:text-white border border-white/10 hover:border-white/30'
          }`}
        >
          TẤT CẢ ({musicList.length})
        </button>

        {tags.map((tag) => {
          const isSelected = selectedTag === tag.id;
          const count = musicList.filter((m) => m.tags && m.tags.includes(tag.id)).length;
          return (
            <button
              key={tag.id}
              onClick={() => setSelectedTag(isSelected ? null : tag.id)}
              className={`text-xs px-4 py-2 rounded-xl font-mono uppercase tracking-wider transition-all ${
                isSelected
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'bg-[#101010] text-[#737373] hover:text-white border border-white/10 hover:border-white/30'
              }`}
            >
              #{tag.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Music Track List (LIST Layout) */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
          <span className="text-sm font-mono text-[#737373]">Đang tải danh sách nhạc...</span>
        </div>
      ) : filteredMusic.length > 0 ? (
        <div className="space-y-4">
          {filteredMusic.map((track) => (
            <MusicItemCard
              key={track.id}
              track={track}
              allTags={tags}
              selectedTag={selectedTag}
              onSelectTag={(tId) => setSelectedTag(tId)}
            />
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
