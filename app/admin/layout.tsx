'use client';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Activity, Music2, Tag, Headphones, GraduationCap, Users, Sliders, Settings, LogOut, Menu, X, ArrowUpRight, MessageSquare } from 'lucide-react';
import './admin.css';
const groups = [
  { label: 'Theo dõi', links: [{ href: '/admin', label: 'Tổng quan & hiệu suất', icon: Activity }] },
  { label: 'Nội dung', links: [
    { href: '/admin/music', label: 'Bài nhạc', icon: Music2 }, { href: '/admin/demos', label: 'Demo âm nhạc', icon: Headphones },
    { href: '/admin/projects', label: 'FLP Projects', icon: Headphones }, { href: '/admin/courses', label: 'Khóa học', icon: GraduationCap },
    { href: '/admin/students', label: 'Học viên', icon: Users }, { href: '/admin/equipment', label: 'Thiết bị', icon: Sliders },
  ] },
  { label: 'Website', links: [{ href: '/admin/community', label: 'Popup cộng đồng', icon: MessageSquare }, { href: '/admin/settings', label: 'Thông tin website', icon: Settings }] },
  { label: 'Phân loại', links: [{ href: '/admin/music-tags', label: 'Thể loại nhạc', icon: Tag }, { href: '/admin/project-tags', label: 'Thể loại project', icon: Tag }, { href: '/admin/equipment-categories', label: 'Danh mục thiết bị', icon: Tag }] },
];
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(), router = useRouter();
  const [drawer, setDrawer] = useState(false);
  const sidebar = useRef<HTMLElement>(null), menu = useRef<HTMLButtonElement>(null);
  const active = (href: string) => href === '/admin' ? pathname === href || pathname === '/admin/analytics' : pathname === href || pathname.startsWith(href + '/');
  const current = groups.flatMap(g => g.links).find(l => active(l.href));
  useEffect(() => {
    if (!drawer) return;
    const old = document.body.style.overflow;
    const menuButton = menu.current;
    document.body.style.overflow = 'hidden';
    sidebar.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setDrawer(false);
      if (event.key !== 'Tab') return;
      const list = sidebar.current?.querySelectorAll<HTMLElement>('a, button');
      if (!list?.length) return;
      const first = list[0], last = list[list.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    const resize = () => { if (window.innerWidth >= 1024) setDrawer(false); };
    document.addEventListener('keydown', key); window.addEventListener('resize', resize);
    return () => { document.body.style.overflow = old; document.removeEventListener('keydown', key); window.removeEventListener('resize', resize); menuButton?.focus(); };
  }, [drawer]);
  if (pathname === '/admin/login') return <>{children}</>;
  const logout = async () => { const response = await fetch('/api/auth/logout', { method: 'POST' }); if (response.ok) { router.push('/admin/login'); router.refresh(); } };
  return <div className="admin-shell min-h-screen bg-[#0b0e0c] flex text-white font-sans">
    {drawer && <div className="admin-drawer-backdrop" onClick={() => setDrawer(false)} />}
    <aside ref={sidebar} className={`admin-sidebar ${drawer ? 'is-open' : ''}`} role={drawer ? 'dialog' : undefined} aria-modal={drawer || undefined} aria-label="Menu quản trị">
      <button className="admin-drawer-close" aria-label="Đóng menu" onClick={() => setDrawer(false)}><X size={20} /></button>
      <div className="admin-brand"><Image src="/fav-logo.png" width={38} height={38} alt="" /><div><strong>BUOGS</strong><small>STUDIO MANAGEMENT</small></div></div>
      <nav className="admin-nav">{groups.map(group => <div key={group.label}><p className="admin-nav-group">{group.label}</p>{group.links.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={active(href) ? 'page' : undefined} onClick={() => setDrawer(false)}><Icon size={17} /><span>{label}</span></Link>)}</div>)}</nav>
      <div className="admin-sidebar-footer"><button onClick={logout}><LogOut size={16} /> Đăng xuất</button></div>
    </aside>
    <div className="admin-main"><header className="admin-topbar"><div><button ref={menu} className="admin-mobile-menu" aria-label="Mở menu quản trị" aria-expanded={drawer} onClick={() => setDrawer(true)}><Menu size={21} /></button><span>{current?.label || 'Quản trị website'}</span></div><Link href="/" target="_blank" rel="noopener noreferrer">Xem website <ArrowUpRight size={15} /></Link></header><main className="admin-content">{children}</main></div>
  </div>;
}
