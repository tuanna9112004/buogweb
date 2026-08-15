'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { X, Phone } from 'lucide-react';
import { SiteSettings } from '@/types';

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
  settings?: SiteSettings;
}

// Official brand marks (path data from simple-icons), rendered white on a
// brand-color badge so they read correctly against both light and dark buttons.
function ZaloLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.49 10.2722v-.4496h1.3467v6.3218h-.7704a.576.576 0 01-.5763-.5729l-.0006.0005a3.273 3.273 0 01-1.9372.6321c-1.8138 0-3.2844-1.4697-3.2844-3.2823 0-1.8125 1.4706-3.2822 3.2844-3.2822a3.273 3.273 0 011.9372.6321l.0006.0005zM6.9188 7.7896v.205c0 .3823-.051.6944-.2995 1.0605l-.03.0343c-.0542.0615-.1815.206-.2421.2843L2.024 14.8h4.8948v.7682a.5764.5764 0 01-.5767.5761H0v-.3622c0-.4436.1102-.6414.2495-.8476L4.8582 9.23H.1922V7.7896h6.7266zm8.5513 8.3548a.4805.4805 0 01-.4803-.4798v-7.875h1.4416v8.3548H15.47zM20.6934 9.6C22.52 9.6 24 11.0807 24 12.9044c0 1.8252-1.4801 3.306-3.3066 3.306-1.8264 0-3.3066-1.4808-3.3066-3.306 0-1.8237 1.4802-3.3044 3.3066-3.3044zm-10.1412 5.253c1.0675 0 1.9324-.8645 1.9324-1.9312 0-1.065-.865-1.9295-1.9324-1.9295s-1.9324.8644-1.9324 1.9295c0 1.0667.865 1.9312 1.9324 1.9312zm10.1412-.0033c1.0737 0 1.945-.8707 1.945-1.9453 0-1.073-.8713-1.9436-1.945-1.9436-1.0753 0-1.945.8706-1.945 1.9436 0 1.0746.8697 1.9453 1.945 1.9453z" />
    </svg>
  );
}

function MessengerLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 0C5.24 0 0 4.952 0 11.64c0 3.499 1.434 6.521 3.769 8.61a.96.96 0 0 1 .323.683l.065 2.135a.96.96 0 0 0 1.347.85l2.381-1.053a.96.96 0 0 1 .641-.046A13 13 0 0 0 12 23.28c6.76 0 12-4.952 12-11.64S18.76 0 12 0m6.806 7.44c.522-.03.971.567.63 1.094l-4.178 6.457a.707.707 0 0 1-.977.208l-3.87-2.504a.44.44 0 0 0-.49.007l-4.363 3.01c-.637.438-1.415-.317-.995-.966l4.179-6.457a.706.706 0 0 1 .977-.21l3.87 2.505c.15.097.344.094.491-.007l4.362-3.008a.7.7 0 0 1 .364-.13" />
    </svg>
  );
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

        <div className="relative mb-6 flex justify-center">
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border border-white/15 bg-[#101010] shadow-lg">
            <Image
              src="/fav-logo.png"
              alt={settings?.brandName || 'BUOGS'}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        </div>

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
              className="group inline-flex items-center justify-center gap-3 rounded-full bg-white pl-3 pr-6 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-[#050505] shadow-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#E6E6E6] active:scale-[0.97]"
            >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#0068FF] text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                <ZaloLogo className="h-4 w-4" />
              </span>
              <span>Zalo Official</span>
            </a>
          )}

          {settings?.facebookUrl && (
            <a
              href={settings.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-3 rounded-full border border-white/18 bg-white/[0.04] pl-3 pr-6 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/10 active:scale-[0.97]"
            >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00B2FF] via-[#006AFF] to-[#2A2AFF] text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                <MessengerLogo className="h-4 w-4" />
              </span>
              <span>Facebook Messenger</span>
            </a>
          )}

          {settings?.phone && (
            <a
              href={`tel:${settings.phone}`}
              className="group inline-flex items-center justify-center gap-3 rounded-full border border-white/18 bg-white/[0.04] pl-3 pr-6 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wide text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white/35 hover:bg-white/10"
            >
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#22C55E] shadow-sm transition-transform duration-300 group-hover:rotate-12">
                <Phone className="h-4 w-4 fill-white text-white" />
              </span>
              <span>Hotline: {settings.phone}</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
