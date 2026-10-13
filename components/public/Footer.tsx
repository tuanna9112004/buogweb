import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Phone } from 'lucide-react';
import { SiteSettings } from '@/types';
import HeroContactButton from './HeroContactButton';

export default function Footer({ settings }: { settings?: SiteSettings }) {
  const brand = settings?.brandName || 'BUOGS';
  const socials = [
    { name: 'Zalo', href: settings?.zaloUrl },
    { name: 'Facebook', href: settings?.facebookUrl },
    { name: 'TikTok', href: settings?.tiktokUrl },
    { name: 'WeChat', href: settings?.wechatUrl },
  ].filter((item) => item.href);
  const phones = settings?.phone?.split(/\s*[-–,;/]\s*/).filter(Boolean) || [];
  const navigation = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Music', href: '/music' },
    { name: 'Demo Music', href: '/demos' },
    { name: 'FLP Projects', href: '/projects' },
    { name: 'Khóa học', href: '/courses' },
  ];

  return (
    <footer className="artist-footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="footer-brand-row">
          <Link href="/" aria-label={`${brand} — Trang chủ`} className="footer-brand">
            <Image src="/fav-logo.png" alt="" width={44} height={44} className="rounded-full border border-white/15" />
            <div><Image src="/buogs-logo-mark-v2.png" alt={brand} width={744} height={130} sizes="140px" className="h-6 w-auto invert" /><span>{settings?.tagline || 'DJ / PRODUCER'}</span></div>
          </Link>
          <div className="footer-booking"><HeroContactButton /></div>
        </div>
        <div className="footer-main-grid">
          <div className="footer-about"><p className="footer-genres">{settings?.genresText || 'VINAHOUSE · HOUSE LAK · VINATRANCE'}</p><p>Âm nhạc, FL Studio projects và đào tạo DJ / Producer. Kết nối cùng {brand} cho những dự án tiếp theo.</p></div>
          <nav aria-label="Điều hướng cuối trang" className="footer-link-panel"><h2>Khám phá</h2><ul>{navigation.map(item => <li key={item.href}><Link href={item.href}>{item.name}<ArrowUpRight size={12} /></Link></li>)}</ul></nav>
          <div className="footer-link-panel"><h2>Kết nối</h2><ul>{socials.map(item => <li key={item.name}><a href={item.href} target="_blank" rel="noopener noreferrer">{item.name}<ArrowUpRight size={12} /></a></li>)}</ul></div>
        </div>
        <div className="footer-bottom"><p>© {new Date().getFullYear()} {brand}. All rights reserved.</p>{phones.length > 0 && <div className="footer-phones"><Phone size={12} aria-hidden="true" />{phones.map(phone => <a key={phone} href={`tel:${phone.replace(/[^+\d]/g, '')}`}>{phone}</a>)}</div>}</div>
      </div>
    </footer>
  );
}
