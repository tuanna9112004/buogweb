'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Course } from '@/types';
import ImageCropperModal from './ImageCropperModal';
import { Image as ImageIcon, Loader2, Save, ArrowLeft, X, Plus, Crop } from 'lucide-react';

interface CourseFormProps {
  initialData?: Course;
  isEdit?: boolean;
}

export default function CourseForm({ initialData, isEdit = false }: CourseFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail || '');
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [price, setPrice] = useState<number | ''>(initialData?.price ?? '');
  const [priceText, setPriceText] = useState(initialData?.priceText || '20.000.000đ');
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [content, setContent] = useState(initialData?.content || '## Giới Thiệu Khóa Học\n\nNội dung khóa học...');
  const [featured, setFeatured] = useState(initialData?.featured ?? false);
  const [published, setPublished] = useState(initialData?.published ?? true);
  const [sortOrder, setSortOrder] = useState(initialData?.sortOrder ?? 1);

  const [uploadingThumb, setUploadingThumb] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Image Cropper States
  const [rawImageSrc, setRawImageSrc] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [cropTarget, setCropTarget] = useState<'thumbnail' | 'gallery'>('thumbnail');
  const [pendingFileName, setPendingFileName] = useState('course.webp');

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

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('module', 'courses');
      formData.append('type', 'images');

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi upload file');

      onSuccess(data.url);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingState(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title || !slug || !content) {
      setError('Tiêu đề, Slug và Nội dung khóa học không được để trống');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title,
        slug,
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

      const url = isEdit ? `/api/admin/courses/${initialData?.id}` : '/api/admin/courses';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi lưu khóa học');

      router.push('/admin/courses');
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
          {isEdit ? 'Chỉnh Sửa Khóa Học' : 'Thêm Khóa Học Mới'}
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
            Tên Khóa Học *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Ví dụ: Khóa Đào Tạo DJ Chuyên Nghiệp"
            className="w-full bg-[#111111] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[#b6ff2e] focus:outline-none"
          />
          {slug && (
            <p className="text-[11px] font-mono text-[#666]">
              URL: /courses/<span className="text-[#b6ff2e]">{slug}</span>
            </p>
          )}
        </div>

        {/* Price Text */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-xs font-mono text-[#a3a3a3] uppercase">
            Học phí hiển thị (priceText) *
          </label>
          <input
            type="text"
            required
            value={priceText}
            onChange={(e) => setPriceText(e.target.value)}
            placeholder="Ví dụ: 20.000.000đ hoặc Liên hệ tư vấn"
            className="w-full bg-[#111111] border border-white/10 rounded-xl p-3 text-white text-sm font-bold text-[#b6ff2e] focus:border-[#b6ff2e] focus:outline-none"
          />
        </div>

        {/* Thumbnail Upload */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-xs font-mono text-[#a3a3a3] uppercase">
            Ảnh Thumbnail Khóa Học (Hỗ trợ Crop vuông 1:1)
          </label>
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-[#111111] border border-white/10">
            {thumbnail && (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#080808] border-2 border-[#b6ff2e] flex-shrink-0">
                <Image src={thumbnail} alt="Thumbnail preview" fill className="object-cover" unoptimized />
              </div>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              id="course-thumb-input"
              className="hidden"
              onChange={(e) => handleImageSelect(e, 'thumbnail')}
            />
            <label
              htmlFor="course-thumb-input"
              className="px-4 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-xs font-mono text-white hover:border-[#b6ff2e] hover:text-[#b6ff2e] cursor-pointer flex items-center gap-2"
            >
              {uploadingThumb ? <Loader2 className="w-4 h-4 animate-spin text-[#b6ff2e]" /> : <Crop className="w-4 h-4 text-[#b6ff2e]" />}
              <span>Tải & Crop Ảnh Thumbnail</span>
            </label>
          </div>
        </div>

        {/* Gallery Images Upload */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-xs font-mono text-[#a3a3a3] uppercase">
            Bộ Ảnh Gallery Khóa Học (Crop vuông 1:1)
          </label>
          <div className="p-4 rounded-xl bg-[#111111] border border-white/10 space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                id="course-gallery-input"
                className="hidden"
                onChange={(e) => handleImageSelect(e, 'gallery')}
              />
              <label
                htmlFor="course-gallery-input"
                className="px-4 py-2.5 rounded-xl bg-[#161616] border border-white/10 text-xs font-mono text-white hover:border-[#b6ff2e] hover:text-[#b6ff2e] cursor-pointer flex items-center gap-2"
              >
                {uploadingGallery ? <Loader2 className="w-4 h-4 animate-spin text-[#b6ff2e]" /> : <Crop className="w-4 h-4 text-[#b6ff2e]" />}
                <span>Chọn & Crop Ảnh Gallery</span>
              </label>
            </div>

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
            placeholder="Tóm tắt ngắn về khóa học..."
            className="w-full bg-[#111111] border border-white/10 rounded-xl p-3 text-white text-sm focus:border-[#b6ff2e] focus:outline-none"
          />
        </div>

        {/* Content Markdown */}
        <div className="space-y-2 md:col-span-2">
          <label className="block text-xs font-mono text-[#a3a3a3] uppercase">
            Nội dung chi tiết chương trình đào tạo (Định dạng Markdown) *
          </label>
          <textarea
            rows={10}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="## Giới Thiệu\n\n## Nội Dung Đào Tạo\n- Lesson 1...\n- Lesson 2..."
            className="w-full bg-[#111111] border border-white/10 rounded-xl p-4 text-white font-mono text-sm focus:border-[#b6ff2e] focus:outline-none"
          />
        </div>

        {/* Featured & Published */}
        <div className="flex items-center gap-6 md:col-span-2 pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-sm font-mono">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
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
          <span>{isEdit ? 'Cập Nhật Khóa Học' : 'Lưu Khóa Học'}</span>
        </button>
      </div>

      {/* Image Cropper Modal */}
      <ImageCropperModal
        isOpen={isCropperOpen}
        imageSrc={rawImageSrc}
        fileName={pendingFileName}
        aspectRatio={1}
        onCropComplete={handleCroppedImageUpload}
        onCancel={() => setIsCropperOpen(false)}
      />
    </form>
  );
}
