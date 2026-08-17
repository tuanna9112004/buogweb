import Image from 'next/image';
import Link from 'next/link';
import { SiteSettings } from '@/types';
import { Phone, ExternalLink } from 'lucide-react';

interface FooterProps {
  settings?: SiteSettings;
}

export default function Footer({ settings }: FooterProps) {
  const brandName = settings?.brandName || 'BUOGS';
  const tagline = settings?.tagline || 'DJ / PRODUCER';
  const genres = settings?.genresText || 'VINAHOUSE · HOUSE LAK · VINATRANCE';
  const phone = settings?.phone || '0988888888';
  const zaloUrl = settings?.zaloUrl || '#';
  const facebookUrl = settings?.facebookUrl || '#';
  const tiktokUrl = settings?.tiktokUrl || '#';

  return (
    <footer className="relative overflow-hidden pt-24 pb-10 text-[#a8a8a8]">
      {/* Oversized brand watermark — barely-there texture in the background */}
      <span
        aria-hidden="true"
        className="font-heading pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 select-none whitespace-nowrap text-[22vw] sm:text-[16vw] font-black uppercase leading-none text-white/[0.012]"
      >
        {brandName}
      </span>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-10 pb-14 border-b border-white/[0.08]">

          {/* Brand Info */}
          <div className="md:col-span-2 space-y-5">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full bg-[#101010] border border-white/15 overflow-hidden flex-shrink-0">
                <Image
                  src="/fav-logo.png"
                  alt={brandName}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div>
                <span className="sr-only">{brandName}</span>
                <Image
                  src="/buogs-logo-mark-v2.png"
                  alt=""
                  width={744}
                  height={130}
                  className="h-5 w-auto invert block"
                  unoptimized
                />
                <span className="block text-[9px] tracking-widest text-[#737373] uppercase font-mono mt-1">
                  {tagline}
                </span>
              </div>
            </div>

            <p className="text-sm font-mono text-[#737373] tracking-widest uppercase">
              {genres}
            </p>

            <p className="text-sm text-[#a8a8a8] max-w-md leading-relaxed">
              Official portfolio website of {brandName} DJ/Producer. Providing high-quality FL Studio Projects and DJ Training Courses.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-5">
            <h4 className="kicker text-white/80">
              Navigation
            </h4>
            <ul className="flex flex-wrap gap-x-4 gap-y-2 md:block md:space-y-3 text-xs font-mono">
              <li>
                <Link href="/" className="text-[#8a8a8a] hover:text-white transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/music" className="text-[#8a8a8a] hover:text-white transition-colors duration-200">
                  Music
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-[#8a8a8a] hover:text-white transition-colors duration-200">
                  FLP Projects
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-[#8a8a8a] hover:text-white transition-colors duration-200">
                  Courses
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect & Contact */}
          <div className="space-y-5">
            <h4 className="kicker text-white/80">
              Connect
            </h4>
            <ul className="flex flex-wrap gap-x-4 gap-y-2 md:block md:space-y-3 text-xs font-mono">
              {zaloUrl && (
                <li>
                  <a
                    href={zaloUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-[#8a8a8a] hover:text-white transition-colors duration-200"
                  >
                    <span>Zalo Official</span>
                    <ExternalLink className="w-3 h-3 text-[#5c5c5c] transition-colors duration-200 group-hover:text-white/70" />
                  </a>
                </li>
              )}
              {facebookUrl && (
                <li>
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-[#8a8a8a] hover:text-white transition-colors duration-200"
                  >
                    <span>Facebook Page</span>
                    <ExternalLink className="w-3 h-3 text-[#5c5c5c] transition-colors duration-200 group-hover:text-white/70" />
                  </a>
                </li>
              )}
              {tiktokUrl && (
                <li>
                  <a
                    href={tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center gap-1.5 text-[#8a8a8a] hover:text-white transition-colors duration-200"
                  >
                    <span>TikTok Channel</span>
                    <ExternalLink className="w-3 h-3 text-[#5c5c5c] transition-colors duration-200 group-hover:text-white/70" />
                  </a>
                </li>
              )}
              {phone && (
                <li>
                  <a
                    href={`tel:${phone}`}
                    className="inline-flex items-center gap-1.5 text-[#8a8a8a] hover:text-white transition-colors duration-200"
                  >
                    <Phone className="w-3 h-3 text-[#5c5c5c]" />
                    <span>Hotline: {phone}</span>
                  </a>
                </li>
              )}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-7 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#6b6b6b] gap-3">
          <p>© {new Date().getFullYear()} {brandName}. All rights reserved.</p>
          <p>Built with Next.js • Portfolio V1</p>
        </div>
      </div>
    </footer>
  );
}
