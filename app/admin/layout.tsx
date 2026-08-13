'use client';

import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Music2,
  Tag,
  Headphones,
  GraduationCap,
  Sliders,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Do not render admin sidebar/layout on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/music', label: 'Music Tracks', icon: Music2 },
    { href: '/admin/music-tags', label: 'Music Tags', icon: Tag },
    { href: '/admin/projects', label: 'FLP Projects', icon: Headphones },
    { href: '/admin/project-tags', label: 'Project Tags', icon: Tag },
    { href: '/admin/courses', label: 'Courses', icon: GraduationCap },
    { href: '/admin/equipment', label: 'Equipment', icon: Sliders },
    { href: '/admin/equipment-categories', label: 'Eq Categories', icon: Tag },
    { href: '/admin/settings', label: 'Site Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#080808] flex text-white font-sans">
      
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 bg-[#111111] border-r border-white/10 flex-col justify-between flex-shrink-0 fixed inset-y-0 left-0 z-40">
        <div>
          {/* Brand Logo Header */}
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full bg-[#161616] border border-[#b6ff2e]/40 overflow-hidden flex-shrink-0">
              <Image
                src="/fav-logo.png"
                alt="BUOGS Admin"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div>
              <span className="font-heading text-xl font-bold tracking-wider text-white">
                BUOGS
              </span>
              <span className="block text-[10px] font-mono text-[#a3a3a3]">
                ADMIN CMS V1
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[#b6ff2e] text-black font-bold shadow-md shadow-[#b6ff2e]/20'
                      : 'text-[#a3a3a3] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout Button Footer */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="block text-center text-xs font-mono text-[#a3a3a3] hover:text-[#b6ff2e] py-1 transition-colors"
          >
            ← Xem Public Website
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-950/30 border border-red-500/20 text-red-400 font-semibold text-xs uppercase tracking-wider hover:bg-red-900/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng Xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        
        {/* Top Header Mobile */}
        <header className="lg:hidden bg-[#111111] border-b border-white/10 p-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-full bg-[#161616] border border-[#b6ff2e]/40 overflow-hidden flex-shrink-0">
              <Image
                src="/fav-logo.png"
                alt="BUOGS Admin"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <span className="font-heading text-lg font-bold">BUOGS CMS</span>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-2 rounded-lg text-white hover:bg-white/10"
          >
            {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </header>

        {/* Mobile Drawer */}
        {mobileSidebarOpen && (
          <div className="lg:hidden bg-[#111111] border-b border-white/10 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/admin'
                  ? pathname === '/admin'
                  : pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                    isActive
                      ? 'bg-[#b6ff2e] text-black font-bold'
                      : 'text-[#a3a3a3] hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-red-950/30 text-red-400 font-semibold text-xs uppercase mt-4"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng Xuất</span>
            </button>
          </div>
        )}

        {/* Admin Content Container */}
        <main className="p-4 sm:p-8 flex-1">{children}</main>
      </div>

    </div>
  );
}
