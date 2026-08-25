'use client';

import { useState } from 'react';
import { Link2, Check } from 'lucide-react';

interface CopyLinkButtonProps {
  label?: string;
  className?: string;
}

/** Copies the current page URL so a track/demo can be shared as a direct link. */
export default function CopyLinkButton({
  label = 'Share Link',
  className = '',
}: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = window.location.href;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for http/older browsers where the async Clipboard API is unavailable
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy link failed:', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-xs font-bold uppercase tracking-wider font-mono transition-all duration-200 ${
        copied
          ? 'border-[#b6ff2e]/50 bg-[#b6ff2e]/10 text-[#b6ff2e]'
          : 'border-white/15 bg-[#101010] text-white hover:border-white/30 hover:bg-white/[0.06]'
      } ${className}`}
    >
      <span className="relative w-4 h-4 flex-shrink-0">
        <Link2
          className={`absolute inset-0 w-4 h-4 transition-all duration-200 ${
            copied ? 'opacity-0 scale-50 rotate-45' : 'opacity-100 scale-100 rotate-0'
          }`}
        />
        <Check
          className={`absolute inset-0 w-4 h-4 transition-all duration-200 ${
            copied ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-45'
          }`}
        />
      </span>
      <span>{copied ? 'Copied!' : label}</span>
    </button>
  );
}
