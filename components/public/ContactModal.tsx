'use client';

import { useEffect } from 'react';
import { X, Send, Phone } from 'lucide-react';
import { SiteSettings } from '@/types';

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  settings?: SiteSettings;
}

export default function ContactModal({ open, onClose, settings }: ContactModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Contact BUOGS"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm animate-[fadeIn_200ms_ease-out]"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/[0.1] bg-[#0A0A0A] p-8 sm:p-12 text-center shadow-2xl animate-[modalIn_250ms_cubic-bezier(0.16,1,0.3,1)]">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[320px] w-[560px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-white/[0.06] blur-[120px]" />

        <button
          type="button"
          onClick={onClose}
          aria-label="Đóng"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/70 transition-colors duration-200 hover:border-white/30 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative space-y-3">
          <h2 className="font-heading text-2xl sm:text-3xl font-bold uppercase leading-[1.1] tracking-tight text-white">
            {settings?.contactHeading || 'BOOKING / MUSIC / PROJECT / COURSE / EQUIPMENT'}
          </h2>
          <p className="mx-auto max-w-sm text-sm font-mono text-[#A8A8A8]">
            Liên hệ trực tiếp qua Zalo, Facebook Messenger hoặc Hotline để được tư vấn chi tiết và giải đáp nhanh chóng.
          </p>
        </div>

        <div className="relative mt-8 flex flex-col items-stretch gap-3">
          {settings?.zaloUrl && (
            <a
              href={settings.zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-[#050505] shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#E6E6E6] active:scale-[0.97]"
            >
              <Send className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              <span>Zalo Official</span>
            </a>
          )}

          {settings?.facebookUrl && (
            <a
              href={settings.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/18 bg-white/[0.04] px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/10 active:scale-[0.97]"
            >
              <Send className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              <span>Facebook Messenger</span>
            </a>
          )}

          {settings?.phone && (
            <a
              href={`tel:${settings.phone}`}
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/18 bg-white/[0.04] px-6 py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/10"
            >
              <Phone className="h-4 w-4 text-white transition-transform duration-300 group-hover:rotate-12" />
              <span>Hotline: {settings.phone}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
