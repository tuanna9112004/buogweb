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
    <footer className="pt-20 pb-12 text-[#a8a8a8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-16 border-b border-white/10">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
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
                  src="/buogs-logo-mark.png"
                  alt=""
                  width={463}
                  height={74}
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
              Official portfolio website of {brandName} DJ/Producer. Providing high-quality FL Studio Projects, DJ Training Courses and Premier Equipment.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="kicker text-white/80">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs font-mono">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/music" className="hover:text-white transition-colors">
                  Music
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-white transition-colors">
                  FLP Projects
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-white transition-colors">
                  Courses
                </Link>
              </li>
              <li>
                <Link href="/equipment" className="hover:text-white transition-colors">
                  Equipment
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect & Contact */}
          <div className="space-y-4">
            <h4 className="kicker text-white/80">
              Connect
            </h4>
            <ul className="space-y-2.5 text-xs font-mono">
              {zaloUrl && (
                <li>
                  <a
                    href={zaloUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Zalo Official</span>
                    <ExternalLink className="w-3 h-3 text-[#737373]" />
                  </a>
                </li>
              )}
              {facebookUrl && (
                <li>
                  <a
                    href={facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>Facebook Page</span>
                    <ExternalLink className="w-3 h-3 text-[#737373]" />
                  </a>
                </li>
              )}
              {tiktokUrl && (
                <li>
                  <a
                    href={tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>TikTok Channel</span>
                    <ExternalLink className="w-3 h-3 text-[#737373]" />
                  </a>
                </li>
              )}
              {phone && (
                <li>
                  <a
                    href={`tel:${phone}`}
                    className="hover:text-white transition-colors inline-flex items-center gap-1.5"
                  >
                    <Phone className="w-3 h-3 text-[#737373]" />
                    <span>Hotline: {phone}</span>
                  </a>
                </li>
              )}
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#737373] gap-4">
          <p>© {new Date().getFullYear()} {brandName}. All rights reserved.</p>
          <p>Built with Next.js • Portfolio V1</p>
        </div>
      </div>
    </footer>
  );
}
