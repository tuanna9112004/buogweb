'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { DemoMusic, MusicTag, SiteSettings } from '@/types';
import ImageCropperModal from './ImageCropperModal';
import FeaturedSwapModal from './FeaturedSwapModal';
import ConfirmModal from './ConfirmModal';
import { uploadFile } from './uploadFile';
import { Headphones, Loader2, Save, ArrowLeft, Crop } from 'lucide-react';

interface DemoMusicFormProps {
  initialData?: DemoMusic;
  isEdit?: boolean;
}

export default function DemoMusicForm({ initialData, isEdit = false }: DemoMusicFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || '');
  const [artists, setArtists] = useState(initialData?.artists || 'BUOGS');
  const [cover, setCover] = useState(initialData?.cover || '');
  const [demoAudio, setDemoAudio] = useState(initialData?.demoAudio || '');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [price, setPrice] = useState<number | ''>(initialData?.price ?? '');
  const [priceText, setPriceText] = useState(initialData?.priceText || 'Liên hệ');
  const publishDate =
    initialData?.publishDate || new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
  const [featured, setFeatured] = useState(initialData?.featured ?? false);
  const [published, setPublished] = useState(initialData?.published ?? true);
  const sortOrder = initialData?.sortOrder ?? 1;

  const [allTags, setAllTags] = useState<MusicTag[]>([]);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [thumbProgress, setThumbProgress] = useState(0);
  const [audioProgress, setAudioProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [featuredLimit, setFeaturedLimit] = useState(3);
  const [otherFeatured, setOtherFeatured] = useState<DemoMusic[]>([]);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapping, setSwapping] = useState(false);

  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [pendingFileName, setPendingFileName] = useState('cover.webp');

  useEffect(() => {
    fetch('/api/admin/music-tags')
      .then((res) => res.json())
      .then((data) => setAllTags(data))
      .catch(console.error);

    Promise.all([
      fetch('/api/admin/settings').then((res) => res.json()),
      fetch('/api/admin/demos').then((res) => res.json()),
    ])
      .then(([settings, list]: [SiteSettings, DemoMusic[]]) => {
        setFeaturedLimit(settings.featuredMusicCount ?? 3);
        setOtherFeatured(list.filter((p) => p.featured && p.id !== initialData?.id));
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
    const target = otherFeatured.find((p) => p.id === idToReplace);
    if (!target) return;
    setSwapping(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/demos/${idToReplace}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...target, featured: false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Không thể bỏ nổi bật mục đã chọn');

      setOtherFeatured((prev) => prev.filter((p) => p.id !== idToReplace));
      setFeatured(true);
      setShowSwapModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể bỏ nổi bật mục đã chọn');
    } finally {
      setSwapping(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFileName(file.name);
    const objectUrl = URL.createObjectURL(file);
    setRawImageSrc(objectUrl);
    setIsCropperOpen(true);
    e.target.value = '';
  };

  const handleCroppedImageUpload = async (croppedFile: File) => {
    setIsCropperOpen(false);
    await handleFileUpload(croppedFile, 'covers', setCover, setUploadingThumb, setThumbProgress);
  };

  const handleFileUpload = async (
    file: File,
    type: 'images' | 'audio' | 'covers',
    onSuccess: (url: string) => void,
    setLoadingState: (l: boolean) => void,
    setProgress: (p: number) => void
  ) => {
    setError(null);
    setLoadingState(true);
    setProgress(0);

    try {
      const data = await uploadFile(file, 'music', type, setProgress);
      onSuccess(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi khi tải file lên');
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

    if (!title || !artists || !demoAudio) {
      setError('Tiêu đề, Nghệ sĩ và File Audio không được để trống');
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
        cover,
        demoAudio,
        tags,
        price: price === '' ? null : Number(price),
        priceText,
        publishDate,
        featured,
        published,
        sortOrder: Number(sortOrder),
      };

      const url = isEdit ? `/api/admin/demos/${initialData?.id}` : '/api/admin/demos';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi lưu thông tin demo music');

      router.push('/admin/demos');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi lưu thông tin demo music');
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
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
          {isEdit ? 'Chỉnh Sửa Demo Nhạc Bán' : 'Thêm Demo Nhạc Bán Mới'}
        </h1>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/30 text-red-400 text-sm font-mono">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="space-y-2">
          <label className="block text-xs font-mono text-[#a3a3a3] uppercase">Tiêu đề bài hát *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: RHYTHM OF THE NIGHT"
            className="w-full bg-[#111111] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[#b6ff2e] focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-mono text-[#a3a3a3] uppercase">Nghệ sĩ *</label>
          <input
            type="text"
            required
            value={artists}
            onChange={(e) => setArtists(e.target.value)}
            placeholder="BUOGS x ZENO"
            className="w-full bg-[#111111] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[#b6ff2e] focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-mono text-[#a3a3a3] uppercase">Giá (Price) VNĐ</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Ví dụ: 200000"
            className="w-full bg-[#111111] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[#b6ff2e] focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-mono text-[#a3a3a3] uppercase">Chữ hiển thị (PriceText) *</label>
          <input
            type="text"
            required
            value={priceText}
            onChange={(e) => setPriceText(e.target.value)}
            placeholder="Ví dụ: 200.000đ"
            className="w-full bg-[#111111] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[#b6ff2e] focus:outline-none font-bold text-[#b6ff2e]"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="block text-xs font-mono text-[#a3a3a3] uppercase">Ảnh Bìa Cover (Crop 1:1)</label>
          <div className="space-y-3 p-4 rounded-xl bg-[#111111] border border-white/10">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {cover && (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#080808] border-2 border-[#b6ff2e] flex-shrink-0">
                  <Image src={cover} alt="Cover preview" fill className="object-cover" unoptimized />
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                id="demo-cover-input"
                className="hidden"
                onChange={handleImageSelect}
              />
              <label
                htmlFor="demo-cover-input"
                className="px-4 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-xs font-mono text-white hover:border-[#b6ff2e] hover:text-[#b6ff2e] cursor-pointer flex items-center gap-2 flex-shrink-0"
              >
                {uploadingThumb ? <Loader2 className="w-4 h-4 animate-spin text-[#b6ff2e]" /> : <Crop className="w-4 h-4 text-[#b6ff2e]" />}
                <span>{uploadingThumb ? `Đang tải lên... ${thumbProgress}%` : 'Tải & Crop Cover'}</span>
              </label>
            </div>
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="block text-xs font-mono text-[#a3a3a3] uppercase">Demo Audio MP3 *</label>
          <div className="space-y-3 p-4 rounded-xl bg-[#111111] border border-white/10">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <input
                type="file"
                accept="audio/mp3,audio/mpeg"
                id="demo-audio-input"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'audio', setDemoAudio, setUploadingAudio, setAudioProgress);
                }}
              />
              <label
                htmlFor="demo-audio-input"
                className="px-4 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-xs font-mono text-white hover:border-[#b6ff2e] hover:text-[#b6ff2e] cursor-pointer flex items-center gap-2 flex-shrink-0"
              >
                {uploadingAudio ? <Loader2 className="w-4 h-4 animate-spin text-[#b6ff2e]" /> : <Headphones className="w-4 h-4 text-[#b6ff2e]" />}
                <span>{uploadingAudio ? `Đang tải lên... ${audioProgress}%` : 'Chọn File Demo MP3'}</span>
              </label>

              {!uploadingAudio && (
                demoAudio ? (
                  <span className="text-xs font-mono text-[#b6ff2e] truncate max-w-md">✓ {demoAudio}</span>
                ) : (
                  <span className="text-xs font-mono text-[#666]">Chưa chọn file audio demo</span>
                )
              )}
            </div>

            {!uploadingAudio && demoAudio && (
              <audio controls src={demoAudio} className="w-full h-10 mt-2" preload="metadata">
                Trình duyệt không hỗ trợ phát audio.
              </audio>
            )}
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <label className="block text-xs font-mono text-[#a3a3a3] uppercase">Tags</label>
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

        <div className="flex items-center gap-6 md:col-span-2 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-mono">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => handleFeaturedChange(e.target.checked)}
              className="w-4 h-4 accent-[#b6ff2e] rounded"
            />
            <span>Featured Home</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-sm font-mono">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="w-4 h-4 accent-[#b6ff2e] rounded"
            />
            <span>Xuất bản</span>
          </label>
        </div>

      </div>

      <div className="pt-4 border-t border-white/10">
        <button
          type="submit"
          disabled={submitting}
          className="px-8 py-3.5 rounded-xl bg-[#b6ff2e] text-black font-bold text-sm uppercase tracking-wider hover:bg-[#9ee61a] transition-all flex items-center gap-2 shadow-lg shadow-[#b6ff2e]/20"
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          <span>{isEdit ? 'Cập Nhật' : 'Lưu'}</span>
        </button>
      </div>

      <ImageCropperModal
        isOpen={isCropperOpen}
        imageSrc={rawImageSrc}
        fileName={pendingFileName}
        aspectRatio={1}
        onCropComplete={handleCroppedImageUpload}
        onCancel={() => setIsCropperOpen(false)}
      />

      <FeaturedSwapModal
        isOpen={showSwapModal}
        typeLabel="demo music"
        limit={featuredLimit}
        items={otherFeatured.map((p) => ({ id: p.id, title: p.title }))}
        loading={swapping}
        onConfirm={handleSwapConfirm}
        onCancel={() => setShowSwapModal(false)}
      />

      <ConfirmModal
        isOpen={showSaveConfirm}
        title={isEdit ? 'Xác Nhận Cập Nhật' : 'Xác Nhận Lưu'}
        itemName={title}
        variant="default"
        confirmLabel={isEdit ? 'Xác Nhận Cập Nhật' : 'Xác Nhận Lưu'}
        message={
          isEdit
            ? `Lưu thay đổi cho "${title}"?`
            : `Thêm "${title}" vào hệ thống?`
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
