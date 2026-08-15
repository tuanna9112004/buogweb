'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Music, MusicTag, SiteSettings } from '@/types';
import ImageCropperModal from './ImageCropperModal';
import FeaturedSwapModal from './FeaturedSwapModal';
import ConfirmModal from './ConfirmModal';
import { uploadFile } from './uploadFile';
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
  const [audioProgress, setAudioProgress] = useState(0);
  const [coverProgress, setCoverProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Homepage featured-slot guard: cap comes from Settings, current occupants
  // come from the full music list so we can offer a swap instead of letting
  // the admin silently exceed the homepage's slice(0, N).
  const [featuredLimit, setFeaturedLimit] = useState(3);
  const [otherFeatured, setOtherFeatured] = useState<Music[]>([]);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapping, setSwapping] = useState(false);

  // Image Cropper States
  const [rawCoverSrc, setRawCoverSrc] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [pendingFileName, setPendingFileName] = useState('cover.webp');

  useEffect(() => {
    fetch('/api/admin/music-tags')
      .then((res) => res.json())
      .then((data) => setAllTags(data))
      .catch(console.error);

    Promise.all([
      fetch('/api/admin/settings').then((res) => res.json()),
      fetch('/api/admin/music').then((res) => res.json()),
    ])
      .then(([settings, musicList]: [SiteSettings, Music[]]) => {
        setFeaturedLimit(settings.featuredMusicCount ?? 3);
        setOtherFeatured(musicList.filter((m) => m.featured && m.id !== initialData?.id));
      })
      .catch(console.error);
  }, [initialData?.id]);

  const handleFeaturedChange = (checked: boolean) => {
    if (!checked) {
      setFeatured(false);
      return;
    }
    if (otherFeatured.length < featuredLimit) {
      setFeatured(true);
      return;
    }
    setShowSwapModal(true);
  };

  const handleSwapConfirm = async (idToReplace: string) => {
    const target = otherFeatured.find((m) => m.id === idToReplace);
    if (!target) return;
    setSwapping(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/music/${idToReplace}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...target, featured: false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Không thể bỏ nổi bật mục đã chọn');

      setOtherFeatured((prev) => prev.filter((m) => m.id !== idToReplace));
      setFeatured(true);
      setShowSwapModal(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSwapping(false);
    }
  };

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
    await handleFileUpload(croppedFile, 'covers', setCover, setUploadingCover, setCoverProgress);
  };

  const handleFileUpload = async (
    file: File,
    type: 'audio' | 'covers',
    setter: (url: string) => void,
    setLoadingState: (l: boolean) => void,
    setProgress: (p: number) => void
  ) => {
    setError(null);
    setLoadingState(true);
    setProgress(0);

    try {
      const data = await uploadFile(file, 'music', type, setProgress);
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

  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!audio) {
      setError('Vui lòng tải lên file âm thanh MP3');
      return;
    }

    setShowSaveConfirm(true);
  };

  const performSave = async () => {
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
      throw err;
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
          <div className="space-y-3 p-4 rounded-xl bg-[#111111] border border-white/10">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <input
                type="file"
                accept="audio/mp3,audio/mpeg"
                id="audio-input"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'audio', setAudio, setUploadingAudio, setAudioProgress);
                }}
              />
              <label
                htmlFor="audio-input"
                className="px-4 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-xs font-mono text-white hover:border-[#b6ff2e] hover:text-[#b6ff2e] cursor-pointer flex items-center gap-2 flex-shrink-0"
              >
                {uploadingAudio ? <Loader2 className="w-4 h-4 animate-spin text-[#b6ff2e]" /> : <Music2 className="w-4 h-4 text-[#b6ff2e]" />}
                <span>{uploadingAudio ? `Đang tải lên... ${audioProgress}%` : 'Chọn File MP3'}</span>
              </label>

              {!uploadingAudio && (
                audio ? (
                  <span className="text-xs font-mono text-[#b6ff2e] truncate max-w-md">
                    ✓ {audio}
                  </span>
                ) : (
                  <span className="text-xs font-mono text-[#666]">Chưa chọn file audio</span>
                )
              )}
            </div>

            {uploadingAudio && (
              <div className="h-1.5 w-full bg-[#161616] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#b6ff2e] transition-all duration-150 ease-out"
                  style={{ width: `${audioProgress}%` }}
                />
              </div>
            )}

            {/* Nghe thử ngay khi đã có file audio */}
            {!uploadingAudio && audio && (
              <audio controls src={audio} className="w-full h-10" preload="metadata">
                Trình duyệt của bạn không hỗ trợ phát audio.
              </audio>
            )}
          </div>
        </div>

        {/* Cover Image Upload with Crop Feature */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-xs font-mono text-[#a3a3a3] uppercase">
            Ảnh đại diện Track (Cover dạng đĩa tròn - Hỗ trợ Crop tròn chuẩn)
          </label>
          <div className="space-y-3 p-4 rounded-xl bg-[#111111] border border-white/10">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {cover && (
                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-[#080808] border-2 border-[#b6ff2e] flex-shrink-0 shadow-lg shadow-[#b6ff2e]/10">
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
                className="px-4 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-xs font-mono text-white hover:border-[#b6ff2e] hover:text-[#b6ff2e] cursor-pointer flex items-center gap-2 flex-shrink-0"
              >
                {uploadingCover ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#b6ff2e]" />
                ) : (
                  <Crop className="w-4 h-4 text-[#b6ff2e]" />
                )}
                <span>{uploadingCover ? `Đang tải lên... ${coverProgress}%` : cover ? 'Chọn & Crop Lại Ảnh Cover' : 'Chọn Ảnh & Crop Vuông 1:1'}</span>
              </label>

              {!uploadingCover && cover && (
                <span className="text-xs font-mono text-[#b6ff2e] truncate">
                  ✓ Đã tải ảnh cover tròn
                </span>
              )}
            </div>

            {uploadingCover && (
              <div className="h-1.5 w-full bg-[#161616] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#b6ff2e] transition-all duration-150 ease-out"
                  style={{ width: `${coverProgress}%` }}
                />
              </div>
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
                  className={`text-xs px-3 py-1.5 rounded-lg font-mono transition-all ${isSelected
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
              onChange={(e) => handleFeaturedChange(e.target.checked)}
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
        shape="circle"
        onCropComplete={handleCroppedImageUpload}
        onCancel={() => setIsCropperOpen(false)}
      />

      {/* Featured Home slot swap picker */}
      <FeaturedSwapModal
        isOpen={showSwapModal}
        typeLabel="bài nhạc"
        limit={featuredLimit}
        items={otherFeatured.map((m) => ({ id: m.id, title: m.title }))}
        loading={swapping}
        onConfirm={handleSwapConfirm}
        onCancel={() => setShowSwapModal(false)}
      />

      {/* Save/Update confirmation */}
      <ConfirmModal
        isOpen={showSaveConfirm}
        title={isEdit ? 'Xác Nhận Cập Nhật' : 'Xác Nhận Lưu Bài Nhạc'}
        itemName={title}
        variant="default"
        confirmLabel={isEdit ? 'Xác Nhận Cập Nhật' : 'Xác Nhận Lưu'}
        message={
          isEdit
            ? `Lưu thay đổi cho bài nhạc "${title}"?`
            : `Thêm bài nhạc mới "${title}" vào hệ thống?`
        }
        onConfirm={async () => {
          await performSave();
          setShowSaveConfirm(false);
        }}
        onCancel={() => setShowSaveConfirm(false)}
      />
    </form>
  );
}
