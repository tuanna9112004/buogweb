'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedMarqueeHeroProps {
  tagline: string;
  brandTitle: string;
  roleText: string;
  description: string;
  ctaText: string;
  ctaHref?: string;
  images: string[];
  className?: string;
}

const FADE_IN_ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 100, damping: 20 },
  },
};

function ActionButton({
  children,
  href,
}: {
  children: React.ReactNode;
  href?: string;
}) {
  return (
    <motion.a
      href={href || '#'}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="mt-7 inline-flex items-center gap-2 px-7 py-3 rounded-full bg-white text-[#050505] font-semibold text-[11px] sm:text-xs tracking-[0.15em] uppercase shadow-[0_10px_40px_rgba(0,0,0,0.30)] transition-colors hover:bg-[#E6E6E6] focus:outline-none focus:ring-2 focus:ring-white/40"
    >
      {children}
    </motion.a>
  );
}

export function AnimatedMarqueeHero({
  tagline,
  brandTitle,
  roleText,
  description,
  ctaText,
  ctaHref,
  images,
  className,
}: AnimatedMarqueeHeroProps) {
  const duplicatedImages = [...images, ...images];

  return (
    <section
      className={cn(
        'relative w-full min-h-[760px] sm:h-screen sm:max-h-[940px] overflow-hidden bg-[#050505] flex flex-col items-center justify-start text-center px-4',
        className
      )}
    >
      <div className="z-10 flex flex-col items-center pt-24 sm:pt-28 lg:pt-32">
        <motion.div
          initial="hidden"
          animate="show"
          variants={FADE_IN_ANIMATION_VARIANTS}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/[0.10] bg-white/[0.03] px-3.5 py-1 text-[10px] font-mono uppercase tracking-[0.28em] text-[#8A8A8A] backdrop-blur-md"
        >
          {tagline}
        </motion.div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={FADE_IN_ANIMATION_VARIANTS}
          className="flex flex-col items-center"
        >
          <span
            className="font-marker text-white leading-none text-5xl sm:text-7xl lg:text-8xl"
            style={{ transform: 'skewX(-6deg)', display: 'inline-block' }}
          >
            {brandTitle}
          </span>
          <span className="font-heading italic mt-2 text-lg sm:text-2xl lg:text-3xl font-normal tracking-[0.04em] text-[#C9C9C9]">
            {roleText}
          </span>
        </motion.div>

        <motion.p
          initial="hidden"
          animate="show"
          variants={FADE_IN_ANIMATION_VARIANTS}
          transition={{ delay: 0.5 }}
          className="mt-5 max-w-lg text-[13px] sm:text-sm font-light text-[#9A9A9A] leading-relaxed"
        >
          {description}
        </motion.p>

        <motion.div
          initial="hidden"
          animate="show"
          variants={FADE_IN_ANIMATION_VARIANTS}
          transition={{ delay: 0.6 }}
        >
          <ActionButton href={ctaHref}>{ctaText}</ActionButton>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 w-full h-[48%] sm:h-1/2 md:h-[58%] [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]">
        <motion.div
          className="flex h-full items-end gap-4 sm:gap-5"
          animate={{
            x: ['-100%', '0%'],
            transition: { ease: 'linear' as const, duration: 40, repeat: Infinity },
          }}
        >
          {duplicatedImages.map((src, index) => (
            <div
              key={index}
              className="relative aspect-[3/4] h-64 sm:h-80 md:h-[26rem] flex-shrink-0"
              style={{ rotate: `${index % 2 === 0 ? -2 : 5}deg` }}
            >
              <img
                src={src}
                alt={`BUOGS showcase ${(index % images.length) + 1}`}
                className="h-full w-full rounded-2xl object-cover shadow-lg grayscale-[0.1] contrast-[1.05]"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
