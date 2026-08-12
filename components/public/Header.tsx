'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { SiteSettings } from '@/types';

interface HeaderProps {
  settings?: SiteSettings;
}

export default function Header({ settings }: HeaderProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 32);
    };
    handleScroll(); // Check scroll position immediately on mount
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: 'HOME' },
    { href: '/music', label: 'MUSIC' },
    { href: '/projects', label: 'FLP PROJECTS' },
    { href: '/courses', label: 'COURSES' },
    { href: '/equipment', label: 'EQUIPMENT' },
  ];

  const brand = settings?.brandName || 'BUOGS';
  const tagline = settings?.tagline || 'DJ / PRODUCER';
  const contactUrl = settings?.zaloUrl || '#contact';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full pointer-events-none flex justify-center">
      <div
        style={{
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
        }}
        className={`pointer-events-auto transition-[width,max-width,margin-top,padding,border-radius,background-color,border-color,box-shadow] duration-500 ease-out ${
          scrolled
            ? 'w-[92vw] max-w-5xl rounded-full bg-[#0a0a0a]/85 border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.9)] mt-4 py-2.5 px-4 sm:px-6'
            : 'w-full max-w-7xl rounded-none bg-gradient-to-b from-black/90 via-black/40 to-transparent border-b border-transparent mt-0 py-5 px-4 sm:px-6 lg:px-8'
        }`}
      >
        <div className="w-full flex items-center justify-between">
          
          {/* 1. Left (Brand / Logo) */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#101010] border border-white/15 overflow-hidden group-hover:border-white/40 transition-colors duration-200 flex-shrink-0">
              <Image
                src="/fav-logo.png"
                alt={brand}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div>
              <span className="font-heading text-xl sm:text-2xl font-bold tracking-widest text-white group-hover:text-white transition-colors">
                {brand}
              </span>
              <span
                className={`block text-[9px] tracking-widest text-[#737373] uppercase font-mono font-medium transition-all duration-300 overflow-hidden ${
                  scrolled ? 'max-h-0 opacity-0' : 'max-h-4 opacity-100'
                }`}
              >
                {tagline}
              </span>
            </div>
          </Link>

          {/* 2. Center (Navigation Links) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs font-mono tracking-widest uppercase transition-colors duration-200 relative py-1 ${
                    isActive ? 'text-white font-semibold' : 'text-[#8C8C8C] hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* 3. Right (CTA Button & Mobile Toggle) */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <a
              href={contactUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-white text-[#050505] font-bold text-xs tracking-wider uppercase transition-all duration-300 hover:scale-105 hover:bg-[#E6E6E6] shadow-lg shadow-black/40"
            >
              <span>CONTACT</span>
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </a>

            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* 4. Mobile Navigation Drawer (Smooth Max-Height & Opacity Transition) */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileOpen
              ? 'max-h-96 opacity-100 pointer-events-auto mt-3'
              : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          <div className="bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 space-y-3 shadow-2xl">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-xs font-mono tracking-wider uppercase transition-colors duration-200 ${
                    isActive
                      ? 'bg-white/10 text-white font-bold'
                      : 'text-[#8C8C8C] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <a
              href={contactUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 text-center w-full mt-3 py-3 rounded-full bg-white text-[#050505] font-bold text-xs tracking-wider uppercase shadow-lg"
            >
              <span>CONTACT BOOKING</span>
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}
