'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Star, RefreshCw, Loader2 } from 'lucide-react';

interface FeaturedSwapItem {
  id: string;
  title: string;
}

interface FeaturedSwapModalProps {
  isOpen: boolean;
  typeLabel: string; // e.g. "bài nhạc", "project", "khóa học", "thiết bị"
  limit: number;
  items: FeaturedSwapItem[]; // currently-featured items, excluding the one being edited
  loading?: boolean;
  onConfirm: (idToReplace: string) => void;
  onCancel: () => void;
}

/**
 * Shown when an admin tries to feature an item but the homepage section is
 * already at its configured cap (Settings → Số Lượng Hiển Thị Trên Trang Chủ).
 * Forces an explicit swap instead of silently truncating on the homepage.
 */
export default function FeaturedSwapModal({
  isOpen,
  typeLabel,
  limit,
  items,
  loading = false,
  onConfirm,
  onCancel,
}: FeaturedSwapModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) setSelectedId(null);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.target === e.currentTarget && !loading && onCancel()}
        >
          <motion.div
            className="bg-[#111111] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl"
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 4 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-[#b6ff2e]/10 flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 text-[#b6ff2e]" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-white">
                  Đã đủ {limit} {typeLabel} nổi bật
                </h3>
                <p className="text-xs font-mono text-[#a3a3a3] mt-1 leading-relaxed">
                  Trang chủ chỉ hiển thị tối đa {limit} {typeLabel}. Chọn 1 mục bên dưới để bỏ nổi bật,
                  thay bằng mục bạn vừa chọn.
                </p>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {items.map((item, i) => (
                <motion.label
                  key={item.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18, delay: Math.min(i * 0.03, 0.2) }}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150 ${
                    selectedId === item.id
                      ? 'border-[#b6ff2e] bg-[#b6ff2e]/5'
                      : 'border-white/10 bg-[#161616] hover:border-white/25'
                  }`}
                >
                  <input
                    type="radio"
                    name="featured-swap"
                    checked={selectedId === item.id}
                    onChange={() => setSelectedId(item.id)}
                    className="accent-[#b6ff2e] flex-shrink-0"
                  />
                  <span className="text-sm text-white truncate">{item.title}</span>
                </motion.label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-[#161616] text-white text-xs font-semibold uppercase hover:bg-white/10 active:scale-[0.96] transition-all duration-150 disabled:opacity-40"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={!selectedId || loading}
                onClick={() => selectedId && onConfirm(selectedId)}
                className="px-6 py-2.5 rounded-xl bg-[#b6ff2e] text-black font-bold text-xs uppercase hover:bg-[#9ee61a] active:scale-[0.96] transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-[#b6ff2e]/20"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span>Thay Thế & Đặt Nổi Bật</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
