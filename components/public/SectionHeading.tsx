import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface SectionHeadingProps {
  number: string;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export default function SectionHeading({
  number,
  icon: Icon,
  eyebrow,
  title,
  ctaLabel,
  ctaHref,
}: SectionHeadingProps) {
  return (
    <div className="section-heading flex flex-row items-end justify-between gap-3 sm:gap-4 border-b border-white/[0.06] pb-6 sm:pb-8">
      <div className="min-w-0 flex-1 flex items-start gap-4 sm:gap-6">
        <span className="index-numeral hidden sm:block text-6xl sm:text-7xl select-none">
          {number}
        </span>
        <div className="min-w-0">
          <div className="kicker mb-2 flex items-center gap-2 text-[#A8A8A8]">
            <Icon className="w-3.5 h-3.5 text-white" />
            <span>{eyebrow}</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-white leading-[1.05]">
            {title}
          </h2>
        </div>
      </div>

      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          aria-label={ctaLabel}
          className="section-heading-link group shrink-0 inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-white/15 px-3 text-[10px] sm:text-xs font-mono font-semibold uppercase tracking-wide text-white transition-colors duration-200 hover:bg-white/10 hover:border-white/30"
        >
          <span className="hidden lg:inline">{ctaLabel}</span>
          <span className="lg:hidden">Xem tất cả</span>
          <ArrowRight className="w-3.5 h-3.5 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
