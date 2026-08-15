'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Equipment, EquipmentCategory, SiteSettings } from '@/types';
import ImageCropperModal from './ImageCropperModal';
import { uploadFile } from './uploadFile';
import FeaturedSwapModal from './FeaturedSwapModal';
import ConfirmModal from './ConfirmModal';
import { Image as ImageIcon, Loader2, Save, ArrowLeft, X, Plus, Crop } from 'lucide-react';

interface EquipmentFormProps {
  initialData?: Equipment;
  isEdit?: boolean;
}

export default function EquipmentForm({ initialData, isEdit = false }: EquipmentFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [category, setCategory] = useState(initialData?.category || 'dj-player');
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail || '');
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [price, setPrice] = useState<number | ''>(initialData?.price ?? '');
  const [priceText, setPriceText] = useState(initialData?.priceText || 'Liên hệ');
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [content, setContent] = useState(initialData?.content || '## Thông Tin Sản Phẩm\n\nNội dung chi tiết...');
  const [featured, setFeatured] = useState(initialData?.featured ?? false);
  const [published, setPublished] = useState(initialData?.published ?? true);
  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder ?? 1);

  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Homepage featured-slot guard — see MusicForm for the same pattern.
  const [featuredLimit, setFeaturedLimit] = useState(4);
  const [otherFeatured, setOtherFeatured] = useState<Equipment[]>([]);
  const [showSwapModal, setShowSwapModal] = useState(false);
  const [swapping, setSwapping] = useState(false);

  // Image Cropper States
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [cropTarget, setCropTarget] = useState<'thumbnail' | 'gallery'>('thumbnail');
  const [pendingFileName, setPendingFileName] = useState('equipment.webp');

  useEffect(() => {
    fetch('/api/admin/equipment-categories')
      .then((res) => res.json())
      .then((data) => setCategories(data))
      .catch(console.error);

    Promise.all([
      fetch('/api/admin/settings').then((res) => res.json()),
      fetch('/api/admin/equipment').then((res) => res.json()),
    ])
      .then(([settings, list]: [SiteSettings, Equipment[]]) => {
        setFeaturedLimit(settings.featuredEquipmentCount ?? 4);
        setOtherFeatured(list.filter((eq) => eq.featured && eq.id !== initialData?.id));
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
    const target = otherFeatured.find((eq) => eq.id === idToReplace);
    if (!target) return;
    setSwapping(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/equipment/${idToReplace}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...target, featured: false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Không thể bỏ nổi bật mục đã chọn');

      setOtherFeatured((prev) => prev.filter((eq) => eq.id !== idToReplace));
      setFeatured(true);
      setShowSwapModal(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSwapping(false);
    }
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (!isEdit) {
      const generatedSlug = newTitle
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/[^a-z0-9 -]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      setSlug(generatedSlug);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, target: 'thumbnail' | 'gallery') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCropTarget(target);
    setPendingFileName(file.name);
    const objectUrl = URL.createObjectURL(file);
    setRawImageSrc(objectUrl);
    setIsCropperOpen(true);
    e.target.value = '';
  };

  const handleCroppedImageUpload = async (croppedFile: File) => {
    setIsCropperOpen(false);
    if (cropTarget === 'thumbnail') {
      await handleFileUpload(croppedFile, setThumbnail, setUploadingThumb);
    } else {
      await handleFileUpload(croppedFile, (url) => setImages([...images, url]), setUploadingGallery);
    }
  };

  const handleFileUpload = async (
    file: File,
    onSuccess: (url: string) => void,
    setLoadingState: (l: boolean) => void
  ) => {
    setError(null);
    setLoadingState(true);
    setUploadProgress(0);

    try {
      const data = await uploadFile(file, 'equipment', 'images', setUploadProgress);
      onSuccess(data.url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingState(false);
    }
  };

  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !slug || !category) {
      setError('Tiêu đề, Slug và Danh mục không được để trống');
      return;
    }

    setShowSaveConfirm(true);
  };

  const performSave = async () => {
    setSubmitting(true);

    try {
      const payload = {
        title,
        slug,
        category,
        thumbnail,
        images,
        price: price === '' ? null : Number(price),
        priceText,
        shortDescription,
        content,
        featured,
        published,
        sortOrder: Number(sortOrder),
      };

      const url = isEdit ? `/api/admin/equipment/${initialData?.id}` : '/api/admin/equipment';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi lưu thiết bị');

      router.push('/admin/equipment');
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
          {isEdit ? 'Chỉnh Sửa Thiết Bị' : 'Thêm Thiết Bị Mới'}
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
            Tên Thiết Bị *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Ví dụ: Pioneer XDJ-RX3"
            className="w-full bg-[#111111] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[#b6ff2e] focus:outline-none"
          />
          {slug && (
            <p className="text-[11px] font-mono text-[#666]">
              URL: /equipment/<span className="text-[#b6ff2e]">{slug}</span>
            </p>
          )}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <label className="block text-xs font-mono text-[#a3a3a3] uppercase">
            Danh Mục Thiết Bị *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-[#111111] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[#b6ff2e] focus:outline-none"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price Text */}
        <div className="space-y-2">
          <label className="block text-xs font-mono text-[#a3a3a3] uppercase">
            Giá hiển thị (priceText) *
          </label>
          <input
            type="text"
            required
            value={priceText}
            onChange={(e) => setPriceText(e.target.value)}
            placeholder="Ví dụ: Liên hệ, 25.000.000đ, Hết hàng tạm thời"
            className="w-full bg-[#111111] border border-white/10 rounded-xl p-3 text-white text-sm font-bold text-[#b6ff2e] focus:border-[#b6ff2e] focus:outline-none"
          />
        </div>

        {/* Thumbnail Upload */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-xs font-mono text-[#a3a3a3] uppercase">
            Ảnh Thumbnail Thiết Bị (Crop vuông 1:1)
          </label>
          <div className="space-y-3 p-4 rounded-xl bg-[#111111] border border-white/10">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {thumbnail && (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#080808] border-2 border-[#b6ff2e] flex-shrink-0">
                  <Image src={thumbnail} alt="Thumbnail preview" fill className="object-cover" unoptimized />
                </div>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                id="eq-thumb-input"
                className="hidden"
                onChange={(e) => handleImageSelect(e, 'thumbnail')}
              />
              <label
                htmlFor="eq-thumb-input"
                className="px-4 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-xs font-mono text-white hover:border-[#b6ff2e] hover:text-[#b6ff2e] cursor-pointer flex items-center gap-2 flex-shrink-0"
              >
                {uploadingThumb ? <Loader2 className="w-4 h-4 animate-spin text-[#b6ff2e]" /> : <Crop className="w-4 h-4 text-[#b6ff2e]" />}
                <span>{uploadingThumb ? `Đang tải lên... ${uploadProgress}%` : 'Tải & Crop Ảnh Thumbnail'}</span>
              </label>
            </div>
            {uploadingThumb && (
              <div className="h-1.5 w-full bg-[#161616] rounded-full overflow-hidden">
                <div className="h-full bg-[#b6ff2e] transition-all duration-150 ease-out" style={{ width: `${uploadProgress}%` }} />
              </div>
            )}
          </div>
        </div>

        {/* Gallery Images Upload */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-xs font-mono text-[#a3a3a3] uppercase">
            Bộ Ảnh Gallery (Crop vuông 1:1)
          </label>
          <div className="p-4 rounded-xl bg-[#111111] border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                id="eq-gallery-input"
                className="hidden"
                onChange={(e) => handleImageSelect(e, 'gallery')}
              />
              <label
                htmlFor="eq-gallery-input"
                className="px-4 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-xs font-mono text-white hover:border-[#b6ff2e] hover:text-[#b6ff2e] cursor-pointer flex items-center gap-2"
              >
                {uploadingGallery ? <Loader2 className="w-4 h-4 animate-spin text-[#b6ff2e]" /> : <Crop className="w-4 h-4 text-[#b6ff2e]" />}
                <span>{uploadingGallery ? `Đang tải lên... ${uploadProgress}%` : 'Chọn & Crop Ảnh Gallery'}</span>
              </label>
            </div>

            {uploadingGallery && (
              <div className="h-1.5 w-full bg-[#161616] rounded-full overflow-hidden">
                <div className="h-full bg-[#b6ff2e] transition-all duration-150 ease-out" style={{ width: `${uploadProgress}%` }} />
              </div>
            )}

            {images.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-2">
                {images.map((imgUrl, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#080808] border border-white/10 group">
                    <Image src={imgUrl} alt={`Gallery ${idx}`} fill className="object-cover" unoptimized />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((img) => img !== imgUrl))}
                      className="absolute top-1 right-1 bg-red-600/80 text-white p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Short Description */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-xs font-mono text-[#a3a3a3] uppercase">
            Mô tả ngắn (Hiển thị ở Card / List)
          </label>
          <textarea
            rows={2}
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="Mô tả ngắn gọn về thiết bị..."
            className="w-full bg-[#111111] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[#b6ff2e] focus:outline-none"
          />
        </div>

        {/* Content Markdown */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-xs font-mono text-[#a3a3a3] uppercase">
            Mô tả chi tiết (Thông số, phụ kiện, tình trạng, bảo hành - Markdown) *
          </label>
          <textarea
            rows={8}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="## Thông Tin Sản Phẩm\n\n- Tình trạng: Mới 99%\n- Phụ kiện: Cáp nguồn..."
            className="w-full bg-[#111111] border border-white/10 rounded-xl p-4 text-white font-mono text-sm focus:border-[#b6ff2e] focus:outline-none"
          />
        </div>

        {/* Featured & Published */}
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
          <span>{isEdit ? 'Cập Nhật Thiết Bị' : 'Lưu Thiết Bị'}</span>
        </button>
      </div>

      {/* Image Cropper Modal */}
      <ImageCropperModal
        isOpen={isCropperOpen}
        imageSrc={rawImageSrc}
        fileName={pendingFileName}
        aspectRatio={4 / 3}
        onCropComplete={handleCroppedImageUpload}
        onCancel={() => setIsCropperOpen(false)}
      />

      {/* Featured Home slot swap picker */}
      <FeaturedSwapModal
        isOpen={showSwapModal}
        typeLabel="thiết bị"
        limit={featuredLimit}
        items={otherFeatured.map((eq) => ({ id: eq.id, title: eq.title }))}
        loading={swapping}
        onConfirm={handleSwapConfirm}
        onCancel={() => setShowSwapModal(false)}
      />

      {/* Save/Update confirmation */}
      <ConfirmModal
        isOpen={showSaveConfirm}
        title={isEdit ? 'Xác Nhận Cập Nhật' : 'Xác Nhận Lưu Thiết Bị'}
        itemName={title}
        variant="default"
        confirmLabel={isEdit ? 'Xác Nhận Cập Nhật' : 'Xác Nhận Lưu'}
        message={
          isEdit
            ? `Lưu thay đổi cho thiết bị "${title}"?`
            : `Thêm thiết bị mới "${title}" vào hệ thống?`
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
