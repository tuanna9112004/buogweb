'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { trackEvent } from '@/lib/analytics/client';
import { ArrowUpRight, Check, Maximize2, Users, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { CommunitySettings } from '@/lib/community';
import { useAudio } from './AudioPlayerContext';

export default function CommunityPopup({ initial }: { initial: CommunitySettings }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const aside = useRef<HTMLElement>(null);
  const impressions = useRef(new Set<string>());
  const [settings, setSettings] = useState(initial);
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const { activeTrack } = useAudio();
  const reduceMotion = useReducedMotion();
  const allowed = settings.displayPages.length === 0 || settings.displayPages.some(p => p === '/' ? pathname === '/' : pathname === p || pathname.startsWith(p + '/'));
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try { setCollapsed(Number(localStorage.getItem('buogs-popup-dismissed')) > Date.now()); } catch {}
      setReady(true);
    }, settings.delaySeconds * 1000);
    return () => clearTimeout(timer);
  }, [settings.delaySeconds]);
  useEffect(() => {
    if (!ready || !allowed || !settings.enabled || !settings.groupUrl || collapsed || open || !aside.current || impressions.current.has(pathname)) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let sent = false;
    let visible = false;
    const schedule = () => {
      clearTimeout(timer);
      if (visible && !sent && document.visibilityState === 'visible') timer = setTimeout(() => { sent = true; impressions.current.add(pathname); trackEvent('popup_view'); }, 1000);
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting; schedule();
    }, { threshold: 0.5 });
    observer.observe(aside.current);
    document.addEventListener('visibilitychange', schedule);
    return () => { observer.disconnect(); clearTimeout(timer); document.removeEventListener('visibilitychange', schedule); };
  }, [ready, allowed, settings.enabled, settings.groupUrl, collapsed, pathname, open]);
  const expand = (placement: 'teaser' | 'badge') => { setOpen(true); trackEvent('popup_open', { placement }); };
  const collapse = () => {
    setCollapsed(true);
    try { localStorage.setItem('buogs-popup-dismissed', String(Date.now() + settings.rememberHours * 3600000)); } catch {}
  };
  useEffect(() => {
    const update = () => { if (document.visibilityState === 'visible') fetch('/api/public/community').then(r => r.ok ? r.json() : null).then(data => { if (data) setSettings(data); }).catch(() => {}); };
    const timer = window.setInterval(update, 60000);
    document.addEventListener('visibilitychange', update);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', update); };
  }, []);
  useEffect(() => {
    if (!open || !settings.enabled || !allowed) return;
    const previous = document.activeElement as HTMLElement;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.querySelector<HTMLButtonElement>('button')?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
      if (event.key !== 'Tab') return;
      const elements = dialog.current?.querySelectorAll<HTMLElement>('button, a[href]');
      if (!elements?.length) return;
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', handleKey);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener('keydown', handleKey); previous?.focus(); };
  }, [open, settings.enabled, allowed]);
  if (!ready || !allowed || !settings.enabled || !settings.groupUrl) return null;
  return <>
    <aside ref={aside} style={open ? { visibility: 'hidden' } : undefined} className={`community-floating ${activeTrack ? 'has-player' : ''}`} aria-label="Cộng đồng BUOGS">
      {collapsed ? <div className="community-invitation">
        <button className="community-notice" onClick={() => expand('badge')} aria-haspopup="dialog" aria-expanded={open}>
          <span className="community-notice-dot" aria-hidden="true" />
          <span>Bấm để xem quyền lợi{settings.qrImage ? ' & mã QR' : ' tham gia'}</span>
        </button>
        <motion.button ref={trigger} onClick={() => expand('badge')} className="community-reopen"
        aria-label={`Bấm xem quyền lợi ${settings.title}`} aria-haspopup="dialog" aria-expanded={open}
        initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : .22 }}>
        <span className="community-reopen-icon" aria-hidden="true"><Users size={20} /></span>
        <span className="community-reopen-copy"><strong>{settings.title}</strong><span>Mở thông tin nhóm <ArrowUpRight size={12} aria-hidden="true" /></span></span>
        <Maximize2 size={16} className="community-reopen-expand" aria-hidden="true" />
      </motion.button></div> : <motion.div className="community-teaser" initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25 }}>
        <button className="community-close" aria-label="Thu gọn giới thiệu nhóm" onClick={collapse}><X size={16} /></button>
        <button ref={trigger} onClick={() => expand('teaser')} className="community-preview" aria-label={`Mở thông tin ${settings.title}`} aria-haspopup="dialog" aria-expanded={open}>
          <span className="community-kicker">CỘNG ĐỒNG BUOGS</span><span className="community-preview-title">{settings.title}</span><span className="community-summary">{settings.summary}</span>
          <span className="community-price"><strong>{settings.priceText}</strong><span>{settings.membershipText}</span></span>
          <span className="community-expand-hint">Bấm xem quyền lợi nhóm <Maximize2 size={13} /></span>
        </button>
        <a onClick={() => trackEvent('popup_join', { placement: 'teaser' })} href={settings.groupUrl} target="_blank" rel="noopener noreferrer" className="community-cta">Tham gia ngay <ArrowUpRight size={16} /></a>
      </motion.div>}
    </aside>
    <AnimatePresence>
    {open && <motion.div className="community-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : .2 }} onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}>
      <motion.div ref={dialog} className="community-dialog" role="dialog" aria-modal="true" aria-labelledby="community-title"
        initial={{ opacity: 0, y: reduceMotion ? 0 : 18, scale: reduceMotion ? 1 : .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: reduceMotion ? 0 : 8, scale: reduceMotion ? 1 : .985 }} transition={{ duration: reduceMotion ? 0 : .24, ease: [.22, 1, .36, 1] }}>
        <button className="community-close" aria-label="Đóng thông tin nhóm" onClick={() => setOpen(false)}><X size={20} /></button>
        <p className="community-kicker">CỘNG ĐỒNG PRODUCER · BUOGS</p><h2 id="community-title">{settings.title}</h2><p className="community-description">{settings.description}</p>
        <div className="community-detail-grid"><div><h3>Quyền lợi thành viên</h3><ul>{settings.benefits.map((benefit,i) => <li key={i}><Check size={17} /><span>{benefit}</span></li>)}</ul></div>
          <div className="community-join"><strong>{settings.priceText}</strong><p>{settings.membershipText}</p>
            {settings.qrImage && <div className="community-qr"><Image src={settings.qrImage} alt="Mã QR tham gia nhóm Zalo" width={220} height={220} unoptimized className="object-contain" /><span>Quét QR để mở nhóm Zalo</span></div>}
            <a onClick={() => trackEvent('popup_join', { placement: 'dialog' })} href={settings.groupUrl} target="_blank" rel="noopener noreferrer" className="community-cta">Tham gia ngay <ArrowUpRight size={17} /></a>
            <button className="community-later" onClick={() => setOpen(false)}>Để sau</button>
          </div>
        </div>
      </motion.div>
    </motion.div>}
    </AnimatePresence>
  </>;
}
