'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { ArrowUpRight, Check, Users, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { CommunitySettings } from '@/lib/community';
import { useAudio } from './AudioPlayerContext';

export default function CommunityPopup({ initial }: { initial: CommunitySettings }) {
  const [settings, setSettings] = useState(initial);
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const { activeTrack } = useAudio();
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    const update = () => { if (document.visibilityState === 'visible') fetch('/api/public/community').then(r => r.ok ? r.json() : null).then(data => { if (data) setSettings(data); }).catch(() => {}); };
    const timer = window.setInterval(update, 60000);
    document.addEventListener('visibilitychange', update);
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', update); };
  }, []);
  useEffect(() => {
    if (!open || !settings.enabled) return;
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
  }, [open, settings.enabled]);
  if (!settings.enabled || !settings.groupUrl) return null;
  return <>
    <aside className={`community-floating ${activeTrack ? 'has-player' : ''}`} aria-label="Cộng đồng BUOGS">
      {collapsed ? <button ref={trigger} onClick={() => { setCollapsed(false); setOpen(true); }} className="community-reopen"><Users size={18} /><span>Nhóm FLP – Sample</span></button> : <motion.div className="community-teaser" initial={{ opacity: 0, y: reduceMotion ? 0 : 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25 }}>
        <button className="community-close" aria-label="Thu gọn giới thiệu nhóm" onClick={() => setCollapsed(true)}><X size={16} /></button>
        <button ref={trigger} onClick={() => setOpen(true)} className="community-preview" aria-label={`Mở thông tin ${settings.title}`} aria-haspopup="dialog" aria-expanded={open}>
          <span className="community-kicker">CỘNG ĐỒNG BUOGS</span><span className="community-preview-title">{settings.title}</span><span className="community-summary">{settings.summary}</span>
          <span className="community-price"><strong>{settings.priceText}</strong><span>{settings.membershipText}</span></span>
          <span className="community-expand-hint">Xem quyền lợi <ArrowUpRight size={13} /></span>
        </button>
        <a href={settings.groupUrl} target="_blank" rel="noopener noreferrer" className="community-cta">Tham gia ngay <ArrowUpRight size={16} /></a>
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
            <a href={settings.groupUrl} target="_blank" rel="noopener noreferrer" className="community-cta">Tham gia ngay <ArrowUpRight size={17} /></a>
            <button className="community-later" onClick={() => setOpen(false)}>Để sau</button>
          </div>
        </div>
      </motion.div>
    </motion.div>}
    </AnimatePresence>
  </>;
}
