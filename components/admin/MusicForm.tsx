'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Music, MusicTag } from '@/types';
import ImageCropperModal from './ImageCropperModal';
import { Upload, Music2, Image as ImageIcon, Loader2, Save, ArrowLeft, Crop } from 'lucide-react';

interface MusicFormProps {
  initialData?: Music;
  isEdit?: boolean;
}

export default function MusicForm({ initialData, isEdit = false }: MusicFormProps) {
  const router = useRouter();

  // Today's date default in Asia/Ho_Chi_Minh timezone
  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());

  const [title, setTitle] = useState(initialData?.title || '');
  const [artists, setArtists] = useState(initialData?.artists || 'BUOGS');
  const [audio, setAudio] = useState(initialData?.audio || '');
  const [cover, setCover] = useState(initialData?.cover || '');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [publishDate, setPublishDate] = useState(initialData?.publishDate || todayStr);
  const [featured, setFeatured] = useState(initialData?.featured ?? false);
  const [published, setPublished] = useState(initialData?.published ?? true);

  const [allTags, setAllTags] = useState<MusicTag[]>([]);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Image Cropper States
  const [rawCoverSrc, setRawCoverSrc] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [pendingFileName, setPendingFileName] = useState('cover.webp');

  useEffect(() => {
    fetch('/api/admin/music-tags')
      .then((res) => res.json())
      .then((data) => setAllTags(data))
      .catch(console.error);
  }, []);

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFileName(file.name);
    const objectUrl = URL.createObjectURL(file);
    setRawCoverSrc(objectUrl);
    setIsCropperOpen(true);
    e.target.value = ''; // reset input
  };

  const handleCroppedImageUpload = async (croppedFile: File) => {
    setIsCropperOpen(false);
    await handleFileUpload(croppedFile, 'covers', setCover, setUploadingCover);
  };

  const handleFileUpload = async (
    file: File,
    type: 'audio' | 'covers',
    setter: (url: string) => void,
    setLoadingState: (l: boolean) => void
  ) => {
    setError(null);
    setLoadingState(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('module', 'music');
      formData.append('type', type);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi upload file');

      setter(data.url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingState(false);
    }
  };

  const handleToggleTag = (tagId: string) => {
    if (tags.includes(tagId)) {
      setTags(tags.filter((t) => t !== tagId));
    } else {
      setTags([...tags, tagId]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!audio) {
      setError('Vui lòng tải lên file âm thanh MP3');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title,
        artists,
        audio,
        cover,
        tags,
        publishDate,
        featured,
        published,
      };

      const url = isEdit ? `/api/admin/music/${initialData?.id}` : '/api/admin/music';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi lưu thông tin bài nhạc');

      router.push('/admin/music');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-xs font-mono text-[#a3a3a3] hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </button>

        <h1 className="font-heading text-2xl font-bold text-white uppercase">
          {isEdit ? 'Chỉnh Sửa Bài Nhạc' : 'Thêm Bài Nhạc Mới'}
        </h1>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/30 text-red-400 text-sm font-mono">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Title */}
        <div className="space-y-2">
          <label className="block text-xs font-mono text-[#a3a3a3] uppercase">
            Tiêu đề bài nhạc *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Gió Lớn Đang Thổi Tuyết Đang Rơi"
            className="w-full bg-[#111111] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[#b6ff2e] focus:outline-none"
          />
        </div>

        {/* Artists */}
        <div className="space-y-2">
          <label className="block text-xs font-mono text-[#a3a3a3] uppercase">
            Nghệ sĩ thể hiện *
          </label>
          <input
            type="text"
            required
            value={artists}
            onChange={(e) => setArtists(e.target.value)}
            placeholder="Ví dụ: BUOGS x REVIX"
            className="w-full bg-[#111111] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[#b6ff2e] focus:outline-none"
          />
        </div>

        {/* Audio Upload */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-xs font-mono text-[#a3a3a3] uppercase">
            File Audio MP3 * (Tối đa 50MB)
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-[#111111] border border-white/10">
            <input
              type="file"
              accept="audio/mp3,audio/mpeg"
              id="audio-input"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file, 'audio', setAudio, setUploadingAudio);
              }}
            />
            <label
              htmlFor="audio-input"
              className="px-4 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-xs font-mono text-white hover:border-[#b6ff2e] hover:text-[#b6ff2e] cursor-pointer flex items-center gap-2"
            >
              {uploadingAudio ? <Loader2 className="w-4 h-4 animate-spin text-[#b6ff2e]" /> : <Music2 className="w-4 h-4 text-[#b6ff2e]" />}
              <span>Chọn File MP3</span>
            </label>

            {audio ? (
              <span className="text-xs font-mono text-[#b6ff2e] truncate max-w-md">
                ✓ {audio}
              </span>
            ) : (
              <span className="text-xs font-mono text-[#666]">Chưa chọn file audio</span>
            )}
          </div>
        </div>

        {/* Cover Image Upload with Crop Feature */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-xs font-mono text-[#a3a3a3] uppercase">
            Ảnh đại diện Track (Cover 1:1 - Hỗ trợ Crop vuông chuẩn)
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-[#111111] border border-white/10">
            {cover && (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#080808] border-2 border-[#b6ff2e] flex-shrink-0 shadow-lg shadow-[#b6ff2e]/10">
                <Image src={cover} alt="Cover preview" fill className="object-cover" unoptimized />
              </div>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              id="cover-input"
              className="hidden"
              onChange={handleCoverSelect}
            />
            <label
              htmlFor="cover-input"
              className="px-4 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-xs font-mono text-white hover:border-[#b6ff2e] hover:text-[#b6ff2e] cursor-pointer flex items-center gap-2"
            >
              {uploadingCover ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#b6ff2e]" />
              ) : (
                <Crop className="w-4 h-4 text-[#b6ff2e]" />
              )}
              <span>{cover ? 'Chọn & Crop Lại Ảnh Cover' : 'Chọn Ảnh & Crop Vuông 1:1'}</span>
            </label>

            {cover && (
              <span className="text-xs font-mono text-[#b6ff2e] truncate">
                ✓ Đã tải ảnh cover vuông
              </span>
            )}
          </div>
        </div>

        {/* Publish Date */}
        <div className="space-y-2">
          <label className="block text-xs font-mono text-[#a3a3a3] uppercase">
            Ngày đăng (publishDate YYYY-MM-DD)
          </label>
          <input
            type="date"
            required
            value={publishDate}
            onChange={(e) => setPublishDate(e.target.value)}
            className="w-full bg-[#111111] border border-white/10 rounded-xl p-3 text-white text-sm font-mono focus:border-[#b6ff2e] focus:outline-none"
          />
        </div>

        {/* Tags Selection */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-xs font-mono text-[#a3a3a3] uppercase">
            Gán Music Tags
          </label>
          <div className="flex flex-wrap gap-2 p-3 bg-[#111111] rounded-xl border border-white/10">
            {allTags.map((tag) => {
              const isSelected = tags.includes(tag.id);
              return (
                <button
                  type="button"
                  key={tag.id}
                  onClick={() => handleToggleTag(tag.id)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-mono transition-all ${
                    isSelected
                      ? 'bg-[#b6ff2e] text-black font-bold'
                      : 'bg-[#161616] text-[#a3a3a3] hover:text-white border border-white/10'
                  }`}
                >
                  #{tag.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Checkboxes: Featured & Published */}
        <div className="flex items-center gap-6 md:col-span-2 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-mono">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-4 h-4 accent-[#b6ff2e] rounded"
            />
            <span>Xuất hiện ở Featured Home</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-sm font-mono">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4 accent-[#b6ff2e] rounded"
            />
            <span>Xuất bản Public</span>
          </label>
        </div>

      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t border-white/10">
        <button
          type="submit"
          disabled={submitting}
          className="px-8 py-3.5 rounded-xl bg-[#b6ff2e] text-black font-bold text-sm uppercase tracking-wider hover:bg-[#9ee61a] transition-all flex items-center gap-2 shadow-lg shadow-[#b6ff2e]/20"
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          <span>{isEdit ? 'Cập Nhật Bài Nhạc' : 'Lưu Bài Nhạc'}</span>
        </button>
      </div>

      {/* Interactive Crop Image Modal */}
      <ImageCropperModal
        isOpen={isCropperOpen}
        imageSrc={rawCoverSrc}
        fileName={pendingFileName}
        aspectRatio={1}
        onCropComplete={handleCroppedImageUpload}
        onCancel={() => setIsCropperOpen(false)}
      />
    </form>
  );
}
