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
    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-white/[0.06] pb-6 sm:pb-8">
      <div className="flex items-start gap-4 sm:gap-6">
        <span className="index-numeral hidden sm:block text-6xl sm:text-7xl select-none">
          {number}
        </span>
        <div>
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
          className="group inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-white transition-colors duration-200 hover:text-[#A8A8A8]"
        >
          <span>{ctaLabel}</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </Link>
      )}
    </div>
  );
}
