'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import { SiteSettings } from '@/types';
import { useContactModal } from './ContactModalContext';

interface HeaderProps {
  settings?: SiteSettings;
}

export default function Header({ settings }: HeaderProps) {
  const pathname = usePathname();
  const { openContact } = useContactModal();
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

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full pointer-events-none flex justify-center">
      <div
        style={{
          backdropFilter: scrolled ? 'blur(20px)' : 'blur(16px)',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'blur(16px)',
        }}
        className={`pointer-events-auto transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          scrolled
            ? 'w-[90vw] sm:w-[88vw] max-w-5xl rounded-full bg-[#080808]/88 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.45)] mt-3 sm:mt-4 h-[60px] sm:h-[68px] px-5 sm:px-6'
            : 'w-[94vw] sm:w-[92vw] max-w-[1240px] rounded-[22px] bg-[#080808]/55 border border-white/[0.06] shadow-[0_12px_40px_rgba(0,0,0,0.22)] mt-4 sm:mt-6 h-[60px] sm:h-[68px] px-5 sm:px-6'
        }`}
      >
        <div className="w-full h-full flex items-center justify-between">
          
          {/* 1. Left (Brand / Logo) */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#101010] border border-white/15 overflow-hidden group-hover:border-white/40 transition-colors duration-200 flex-shrink-0">
              <Image
                src="/fav-logo.png"
                alt={brand}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div>
              <span className="sr-only">{brand}</span>
              <Image
                src="/buogs-logo-mark.png"
                alt=""
                width={463}
                height={74}
                className="h-4 sm:h-[18px] w-auto invert block"
                unoptimized
              />
              <span
                className={`block text-[8.5px] tracking-widest text-[#737373] uppercase font-mono font-medium transition-all duration-300 overflow-hidden ${
                  scrolled ? 'max-h-0 opacity-0' : 'max-h-3 opacity-100'
                }`}
              >
                {tagline}
              </span>
            </div>
          </Link>

          {/* 2. Center (Navigation Links with generous 28px-36px spacing) */}
          <nav className="hidden md:flex items-center gap-[38px]">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[12px] font-mono font-semibold tracking-[1.3px] uppercase transition-colors duration-200 relative py-1 ${
                    isActive
                      ? 'text-white'
                      : 'text-white/60 hover:text-white/85'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-[2px] bg-white rounded-full transition-all duration-200" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* 3. Right (Contact Pill Button & Mobile Toggle) */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={openContact}
              className="hidden sm:inline-flex items-center justify-center gap-1.5 w-[112px] h-[38px] rounded-full bg-[#EDEAE2] text-[#0d0d0d] font-mono font-semibold text-[11px] tracking-wider uppercase transition-all duration-200 hover:-translate-y-[1px] hover:bg-white shadow-sm"
            >
              <span>CONTACT</span>
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl text-white hover:bg-white/10 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* 4. Mobile Navigation Drawer (Floating Dark Glass Dropdown Card) */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileOpen
              ? 'max-h-96 opacity-100 pointer-events-auto mt-3'
              : 'max-h-0 opacity-0 pointer-events-none'
          }`}
        >
          <div className="bg-[#080808]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 space-y-2.5 shadow-2xl">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-2.5 rounded-xl text-[11px] font-mono tracking-wider uppercase transition-colors duration-200 ${
                    isActive
                      ? 'bg-white/10 text-white font-bold'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                openContact();
              }}
              className="inline-flex items-center justify-center gap-1.5 text-center w-full mt-3 h-[40px] rounded-full bg-[#EDEAE2] text-[#0d0d0d] font-mono font-semibold text-[11px] tracking-wider uppercase shadow-md"
            >
              <span>CONTACT BOOKING</span>
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
