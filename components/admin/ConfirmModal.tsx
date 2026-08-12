'use client';

import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  itemName: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  itemName,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const [confirmInput, setConfirmInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setError(null);
    setLoading(true);
    try {
      await onConfirm();
    } catch (err: any) {
      setError(err.message || 'Lỗi khi xóa mục này');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111111] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl">
        <div className="flex items-center gap-3 text-red-400">
          <div className="p-2 rounded-xl bg-red-950/50 border border-red-500/30">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="font-heading text-xl font-bold uppercase">{title}</h3>
        </div>

        <p className="text-sm text-[#a3a3a3] leading-relaxed">
          Bạn có chắc chắn muốn xóa <strong className="text-white">"{itemName}"</strong>? Hành động này sẽ xóa vĩnh viễn dữ liệu và không thể hoàn tác.
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
            className="px-4 py-2.5 rounded-xl bg-[#161616] text-white text-xs font-semibold uppercase hover:bg-white/10 transition-colors"
          >
            Hủy Bỏ
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-bold text-xs uppercase hover:bg-red-500 transition-colors flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>Xác Nhận Xóa</span>
          </button>
        </div>
      </div>
    </div>
  );
}
