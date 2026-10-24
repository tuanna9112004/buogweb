import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Play } from 'lucide-react';
import type { SiteSettings } from '@/types';
import HeroContactButton from './HeroContactButton';
import DepthSurface from './DepthSurface';

export default function StudioHero({ settings }: { settings: SiteSettings }) {
  return (
    <section className="studio-hero">
      <div className="hero-background" aria-hidden="true">
        <Image src="/bgr.jpg" alt="" fill sizes="(max-width: 767px) 100vw, 65vw" preload className="hero-background-photo" />
      </div>
      <div className="studio-hero-grid studio-container">
        <div className="hero-copy">
          <p className="studio-eyebrow"><span className="studio-status" /> Independent artist · Official portfolio</p>
          <h1 className="hero-wordmark">
            <Image src="/buogs-logo-mark-v2.png" alt={settings.brandName || 'BUOGS'} width={744} height={130} sizes="(max-width: 767px) 78vw, 440px" loading="eager" className="w-full h-auto invert" />
          </h1>
          <p className="hero-role">{settings.tagline || 'DJ / Producer'}<span>Âm thanh mang dấu ấn riêng.</span></p>
          <p className="hero-description">{settings.about || 'Khám phá âm nhạc, FL Studio projects và các khóa học DJ / Producer cùng BUOGS.'}</p>
          <div className="hero-actions">
            <Link href="/music" className="studio-primary"><Play size={16} fill="currentColor" /> Nghe nhạc <ArrowUpRight size={17} /></Link>
            <HeroContactButton />
          </div>
          <div className="hero-genres"><span>THE SOUND</span><p>{settings.genresText || 'VINAHOUSE · HOUSE LAK · VINATRANCE'}</p></div>
        </div>
        <DepthSurface className="hero-art" strength={3}>
          <div className="hero-art-label" aria-hidden="true"><span>BUOGS / STUDIO</span><span>01 — SOUND & VISION</span></div>
          <div className="hero-art-caption"><span className="hero-caption-line" /> Music. Made personal.</div>
        </DepthSurface>
      </div>
    </section>
  );
}
