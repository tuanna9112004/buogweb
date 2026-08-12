'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageGalleryProps {
  thumbnail: string;
  images?: string[];
  altTitle: string;
}

export default function ImageGallery({ thumbnail, images = [], altTitle }: ImageGalleryProps) {
  // Combine thumbnail and extra images into one unique array
  const allImages = Array.from(new Set([thumbnail, ...images])).filter(Boolean);
  const [selectedImage, setSelectedImage] = useState<string>(allImages[0] || thumbnail);

  if (allImages.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#080808] border border-white/10 shadow-2xl">
        <Image
          src={selectedImage}
          alt={altTitle}
          fill
          className="object-cover transition-all duration-300"
          sizes="(max-width: 1200px) 100vw, 800px"
          priority
          unoptimized
        />
      </div>

      {/* Thumbnail Bar */}
      {allImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {allImages.map((imgUrl, idx) => {
            const isSelected = selectedImage === imgUrl;
            return (
              <button
                key={idx}
                onClick={() => setSelectedImage(imgUrl)}
                className={`relative w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-[#080808] border-2 transition-all ${
                  isSelected
                    ? 'border-[#b6ff2e] scale-105 shadow-md shadow-[#b6ff2e]/20'
                    : 'border-white/10 opacity-60 hover:opacity-100 hover:border-white/30'
                }`}
              >
                <Image
                  src={imgUrl}
                  alt={`${altTitle} ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                  unoptimized
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
