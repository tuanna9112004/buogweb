'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  itemName: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  /** Overrides the default delete-framed sentence. Use for save/create confirmations. */
  message?: string;
  /** Label on the confirm button. Defaults to "Xác Nhận Xóa". */
  confirmLabel?: string;
  /** 'danger' (default) = red, for destructive actions. 'default' = brand lime, for save/create. */
  variant?: 'danger' | 'default';
}

export default function ConfirmModal({
  isOpen,
  title,
  itemName,
  onConfirm,
  onCancel,
  message,
  confirmLabel = 'Xác Nhận Xóa',
  variant = 'danger',
}: ConfirmModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDanger = variant === 'danger';

  const handleConfirm = async () => {
    setError(null);
    setLoading(true);
    try {
      await onConfirm();
    } catch (err: any) {
      setError(err.message || (isDanger ? 'Lỗi khi xóa mục này' : 'Lỗi khi lưu mục này'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.target === e.currentTarget && onCancel()}
        >
          <motion.div
            className="bg-[#111111] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl"
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 4 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={`flex items-center gap-3 ${isDanger ? 'text-red-400' : 'text-[#b6ff2e]'}`}>
              <div className={`p-2 rounded-xl border ${isDanger ? 'bg-red-950/50 border-red-500/30' : 'bg-[#b6ff2e]/10 border-[#b6ff2e]/30'}`}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-xl font-bold uppercase">{title}</h3>
            </div>

            <p className="text-sm text-[#a3a3a3] leading-relaxed">
              {message ?? (
                <>
                  Bạn có chắc chắn muốn xóa <strong className="text-white">"{itemName}"</strong>? Hành động này sẽ xóa vĩnh viễn dữ liệu và không thể hoàn tác.
                </>
              )}
            </p>

            {error && (
              <div className="p-3 rounded-lg bg-red-950/50 text-red-400 text-xs font-mono">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                disabled={loading}
                onClick={onCancel}
                className="px-4 py-2.5 rounded-xl bg-[#161616] text-white text-xs font-semibold uppercase hover:bg-white/10 active:scale-[0.96] transition-all duration-150"
              >
                Hủy Bỏ
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleConfirm}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase transition-all duration-150 active:scale-[0.96] flex items-center gap-2 ${
                  isDanger
                    ? 'bg-red-600 text-white hover:bg-red-500'
                    : 'bg-[#b6ff2e] text-black hover:bg-[#9ee61a]'
                }`}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>{confirmLabel}</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
