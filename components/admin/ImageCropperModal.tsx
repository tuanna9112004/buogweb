'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Crop, ZoomIn, ZoomOut, Check, X, RotateCw } from 'lucide-react';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string | null;
  fileName?: string;
  onCropComplete: (croppedFile: File) => void;
  onCancel: () => void;
  aspectRatio?: number; // Default 1 for 1:1 square
  shape?: 'square' | 'circle'; // Default 'square'; 'circle' clips output to a disc (requires aspectRatio 1)
}

export default function ImageCropperModal({
  isOpen,
  imageSrc,
  fileName = 'cropped-cover.webp',
  onCropComplete,
  onCancel,
  aspectRatio = 1,
  shape = 'square',
}: ImageCropperModalProps) {
  const isCircle = shape === 'circle';
  const isRect = !isCircle && aspectRatio !== 1;
  const ratioLabel = (() => {
    for (let denom = 1; denom <= 20; denom++) {
      const num = Math.round(aspectRatio * denom);
      if (Math.abs(num / denom - aspectRatio) < 0.001) return `${num}:${denom}`;
    }
    return aspectRatio.toFixed(2);
  })();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // At zoom=1 the image always "covers" the frame (crops the shorter side).
  // When the source's own aspect ratio is far from the target frame's, that
  // can leave no way to see the full photo. minZoom lets the slider go below
  // 1 down to the "contain" scale — the frame then shows the whole image
  // with transparent padding on the long axis instead of forcing a crop.
  const minZoom = useMemo(() => {
    if (!imageObj) return 1;
    const rotated = rotation % 180 !== 0;
    const imgAspect = rotated ? imageObj.height / imageObj.width : imageObj.width / imageObj.height;
    const ratio = aspectRatio / imgAspect;
    return Math.min(ratio, 1 / ratio);
  }, [imageObj, aspectRatio, rotation]);

  // Keep the current zoom valid whenever the floor moves (new image, rotate)
  useEffect(() => {
    setZoom((z) => Math.min(Math.max(z, minZoom), 3));
  }, [minZoom]);

  // Load Image Object when imageSrc changes
  useEffect(() => {
    if (!imageSrc) return;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setImageObj(img);
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Draw crop preview on canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageObj) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 400; // Preview size in pixels
    canvas.width = size;
    canvas.height = size / aspectRatio;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    // Clip to a disc before drawing so everything outside it stays transparent
    if (isCircle) {
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2, 0, Math.PI * 2);
      ctx.clip();
    }

    // Center origin for rotation and translation
    ctx.translate(canvas.width / 2 + offset.x, canvas.height / 2 + offset.y);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Calculate base draw size fitting container
    const scale = Math.max(canvas.width / imageObj.width, canvas.height / imageObj.height);
    const drawWidth = imageObj.width * scale;
    const drawHeight = imageObj.height * scale;

    ctx.drawImage(imageObj, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();
  }, [imageObj, zoom, rotation, offset, aspectRatio, isCircle]);

  useEffect(() => {
    if (isOpen && imageObj) {
      drawCanvas();
    }
  }, [isOpen, imageObj, drawCanvas]);

  // Drag pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Generate cropped output file (800x800 WebP/PNG)
  const handleConfirmCrop = () => {
    if (!imageObj) return;

    const exportCanvas = document.createElement('canvas');
    const exportSize = 800; // High resolution square 800x800
    exportCanvas.width = exportSize;
    exportCanvas.height = exportSize / aspectRatio;

    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    const scaleFactor = exportSize / 400; // ratio vs preview canvas

    ctx.save();

    if (isCircle) {
      ctx.beginPath();
      ctx.arc(exportCanvas.width / 2, exportCanvas.height / 2, Math.min(exportCanvas.width, exportCanvas.height) / 2, 0, Math.PI * 2);
      ctx.clip();
    }

    ctx.translate(
      exportCanvas.width / 2 + offset.x * scaleFactor,
      exportCanvas.height / 2 + offset.y * scaleFactor
    );
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    const baseScale = Math.max(
      exportCanvas.width / imageObj.width,
      exportCanvas.height / imageObj.height
    );
    const drawWidth = imageObj.width * baseScale;
    const drawHeight = imageObj.height * baseScale;

    ctx.drawImage(imageObj, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();

    exportCanvas.toBlob(
      (blob) => {
        if (!blob) return;
        const croppedFile = new File([blob], fileName.replace(/\.[^/.]+$/, '') + '.webp', {
          type: 'image/webp',
        });
        onCropComplete(croppedFile);
      },
      'image/webp',
      0.9
    );
  };

  return (
    <AnimatePresence>
      {isOpen && imageSrc && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.div
            className="bg-[#111111] border border-white/10 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >

        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-[#b6ff2e]">
            <Crop className="w-5 h-5" />
            <h3 className="font-heading text-xl font-bold uppercase text-white">
              {isCircle ? 'Cắt Ảnh Tròn (Đĩa)' : isRect ? `Cắt Ảnh Chữ Nhật (${ratioLabel})` : 'Cắt Ảnh Vuông (1:1 Crop)'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="text-[#a3a3a3] hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Crop Viewport Box */}
        <div className="relative flex justify-center items-center bg-[#080808] p-4 rounded-2xl border border-white/10 overflow-hidden select-none">
          <div
            className={`relative cursor-move overflow-hidden border-2 border-[#b6ff2e] shadow-2xl shadow-[#b6ff2e]/20 ${
              isCircle ? 'rounded-full' : 'rounded-xl'
            }`}
            style={{ width: '320px', height: `${320 / aspectRatio}px` }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <canvas ref={canvasRef} className="w-full h-full pointer-events-none" />

            {/* Grid Overlay lines — rule-of-thirds guide, square crop only */}
            {!isCircle && (
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-30">
              <div className="border-r border-b border-white/40" />
              <div className="border-r border-b border-white/40" />
              <div className="border-b border-white/40" />
              <div className="border-r border-b border-white/40" />
              <div className="border-r border-b border-white/40" />
              <div className="border-b border-white/40" />
              <div className="border-r border-white/40" />
              <div className="border-r border-white/40" />
              <div />
            </div>
            )}
          </div>
        </div>

        <p className="text-center text-xs font-mono text-[#a3a3a3]">
          {isCircle
            ? '💡 Kéo ảnh để di chuyển khung hình tròn theo ý muốn'
            : isRect
            ? '💡 Kéo ảnh để di chuyển khung hình chữ nhật theo ý muốn'
            : '💡 Kéo ảnh để di chuyển khung hình vuông theo ý muốn'}
        </p>

        {/* Controls: Zoom Slider & Rotate */}
        <div className="space-y-4 bg-[#161616] p-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3">
            <ZoomOut className="w-4 h-4 text-[#a3a3a3]" />
            <input
              type="range"
              min={minZoom}
              max="3"
              step="0.01"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="w-full accent-[#b6ff2e] cursor-pointer"
            />
            <ZoomIn className="w-4 h-4 text-[#a3a3a3]" />
            <span className="text-xs font-mono text-[#b6ff2e] w-12 text-right">
              {Math.round(zoom * 100)}%
            </span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setRotation((prev) => (prev + 90) % 360)}
              className="inline-flex items-center gap-1.5 text-xs font-mono text-[#a3a3a3] hover:text-[#b6ff2e] transition-colors"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Xoay 90°</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setZoom(1);
                setRotation(0);
                setOffset({ x: 0, y: 0 });
              }}
              className="text-xs font-mono text-[#a3a3a3] hover:text-white transition-colors"
            >
              Đặt lại (Reset)
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl bg-[#161616] text-white text-xs font-semibold uppercase hover:bg-white/10 active:scale-[0.96] transition-all duration-150"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={handleConfirmCrop}
            className="px-6 py-2.5 rounded-xl bg-[#b6ff2e] text-black font-bold text-xs uppercase hover:bg-[#9ee61a] active:scale-[0.96] transition-all duration-150 flex items-center gap-2 shadow-lg shadow-[#b6ff2e]/20"
          >
            <Check className="w-4 h-4" />
            <span>{isCircle ? 'Xác Nhận Crop Ảnh Tròn' : isRect ? 'Xác Nhận Crop Ảnh Chữ Nhật' : 'Xác Nhận Crop Ảnh Vuông'}</span>
          </button>
        </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
