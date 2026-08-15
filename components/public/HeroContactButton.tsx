'use client';

import { Send } from 'lucide-react';
import { useContactModal } from './ContactModalContext';

export default function HeroContactButton() {
  const { openContact } = useContactModal();

  return (
    <button
      type="button"
      onClick={openContact}
      className="inline-flex h-12 items-center gap-2 px-[21px] rounded-full border border-white/[0.22] bg-white/[0.015] text-white/80 font-semibold text-xs tracking-wide uppercase transition-all duration-200 hover:border-white/35 hover:text-white hover:-translate-y-0.5 active:scale-[0.97]"
    >
      <Send className="w-3.5 h-3.5" />
      <span>Booking</span>
    </button>
  );
}
