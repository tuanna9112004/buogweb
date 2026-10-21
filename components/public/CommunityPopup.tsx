'use client';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { trackEvent } from '@/lib/analytics/client';
import { ArrowUpRight, Check, Maximize2, Users, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { CommunitySettings } from '@/lib/community';
import { useAudio } from './AudioPlayerContext';

type MembershipGroup = {
  id: 'monthly' | 'lifetime';
  title: string;
  description: string;
  benefits: string[];
  priceText: string;
  membershipText: string;
  groupUrl: string;
  qrImage: string;
};
type GroupId = MembershipGroup['id'];

export default function CommunityPopup({ initial }: { initial: CommunitySettings }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);
  const aside = useRef<HTMLElement>(null);
  const impressions = useRef(new Set<string>());
  const [settings, setSettings] = useState(initial);
  const [open, setOpen] = useState<GroupId | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<GroupId>>(() => new Set());
  const dialog = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { activeTrack } = useAudio();
  const allowed = settings.displayPages.length === 0 || settings.displayPages.some(p => p === '/' ? pathname === '/' : pathname === p || pathname.startsWith(p + '/'));
  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), settings.delaySeconds * 1000);
    return () => clearTimeout(timer);
  }, [settings.delaySeconds]);
  useEffect(() => {
    if (!ready || !allowed || !settings.enabled || !settings.groupUrl || open || !aside.current || impressions.current.has(pathname)) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let sent = false;
    let visible = false;
    const schedule = () => {
      clearTimeout(timer);
      if (visible && !sent && document.visibilityState === 'visible') timer = setTimeout(() => { sent = true; impressions.current.add(pathname); trackEvent('popup_view'); }, 1000);
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); }, { threshold: 0.5 });
    observer.observe(aside.current);
    document.addEventListener('visibilitychange', schedule);
    return () => { observer.disconnect(); clearTimeout(timer); document.removeEventListener('visibilitychange', schedule); };
  }, [ready, allowed, settings.enabled, settings.groupUrl, open, pathname]);
  const expand = (group: GroupId) => { setOpen(group); trackEvent('popup_open', { placement: group }); };
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
      if (event.key === 'Escape') setOpen(null);
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

  const groups: MembershipGroup[] = [
    { id: 'monthly', ...settings.monthlyPlan },
    { id: 'lifetime', title: settings.title, description: settings.description, benefits: settings.benefits, priceText: settings.priceText, membershipText: settings.membershipText, groupUrl: settings.groupUrl, qrImage: settings.qrImage },
  ];
  const selectedGroup = open ? groups.find(group => group.id === open) : null;

  return <>
    <aside ref={aside} style={open ? { visibility: 'hidden' } : undefined} className={`community-floating community-member-popups ${activeTrack ? 'has-player' : ''}`} aria-label="Tham gia nhóm thành viên BUOGS">
      <motion.div className="community-invitation" initial={{ opacity: 0, y: reduceMotion ? 0 : 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : .22 }}>
        {groups.map(group => <motion.div key={group.id} className="community-teaser community-member-teaser" initial={{ opacity: 0, x: reduceMotion ? 0 : 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: reduceMotion ? 0 : .2, delay: reduceMotion ? 0 : group.id === 'monthly' ? .04 : .1 }}>
          {collapsedGroups.has(group.id) ? <button onClick={() => setCollapsedGroups(current => { const next = new Set(current); next.delete(group.id); return next; })} className="community-reopen" aria-label={`Mở lại thẻ ${group.title}`}>
            <span className="community-reopen-icon" aria-hidden="true"><Users size={16} /></span>
            <span className="community-reopen-copy"><strong>{group.title}</strong><span>{group.id === 'monthly' ? 'Nhóm Zalo riêng · 1 tháng' : 'Nhóm Zalo riêng · Trọn đời'}</span></span>
            <Maximize2 size={13} className="community-reopen-expand" aria-hidden="true" />
          </button> : <>
            <button className="community-close" aria-label={`Thu gọn thẻ ${group.title}`} onClick={() => setCollapsedGroups(current => new Set(current).add(group.id))}><X size={13} /></button>
            <p className="community-kicker">CỘNG ĐỒNG BUOGS · {group.id === 'monthly' ? '1 THÁNG' : 'TRỌN ĐỜI'}</p>
            <button onClick={() => expand(group.id)} className="community-preview" aria-label={`Xem quyền lợi ${group.title}`} aria-haspopup="dialog" aria-expanded={open === group.id}>
              <span className="community-preview-title">{group.title}</span>
              <span className="community-summary">{group.description}</span>
              <span className="community-price"><strong>{group.priceText || 'Liên hệ'}</strong><span>{group.membershipText}</span></span>
              <span className="community-expand-hint">Bấm xem quyền lợi nhóm <Maximize2 size={12} aria-hidden="true" /></span>
            </button>
            {group.groupUrl ? <a onClick={() => trackEvent('popup_join', { placement: group.id })} href={group.groupUrl} target="_blank" rel="noopener noreferrer" className="community-cta">Tham gia ngay <ArrowUpRight size={14} /></a> : <p className="community-missing-link">Link mời nhóm tháng chưa được cập nhật.</p>}
          </>}
        </motion.div>)}
      </motion.div>
    </aside>
    <AnimatePresence>
      {selectedGroup && <motion.div className="community-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : .2 }} onClick={e => { if (e.target === e.currentTarget) setOpen(null); }}>
        <motion.div ref={dialog} className="community-dialog" role="dialog" aria-modal="true" aria-labelledby="community-title"
          initial={{ opacity: 0, y: reduceMotion ? 0 : 18, scale: reduceMotion ? 1 : .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: reduceMotion ? 0 : 8, scale: reduceMotion ? 1 : .985 }} transition={{ duration: reduceMotion ? 0 : .24, ease: [.22, 1, .36, 1] }}>
          <button className="community-close" aria-label="Đóng thông tin nhóm thành viên" onClick={() => setOpen(null)}><X size={20} /></button>
          <p className="community-kicker">NHÓM ZALO RIÊNG · {selectedGroup.id === 'monthly' ? '1 THÁNG' : 'TRỌN ĐỜI'}</p>
          <h2 id="community-title">{selectedGroup.title}</h2>
          <p className="community-description">{selectedGroup.description}</p>
          <div className="community-detail-grid"><div><h3>Quyền lợi thành viên</h3><ul>{(selectedGroup.benefits.length ? selectedGroup.benefits : [selectedGroup.id === 'monthly' ? 'Tham gia cộng đồng thành viên theo tháng.' : 'Tham gia cộng đồng producer và nhận các tài nguyên FL Studio.']).map((benefit, index) => <li key={index}><Check size={17} /><span>{benefit}</span></li>)}</ul></div>
            <div className="community-join"><strong>{selectedGroup.priceText}</strong><p>{selectedGroup.membershipText}</p>
              {selectedGroup.qrImage && <div className="community-qr"><Image src={selectedGroup.qrImage} alt={`Mã QR tham gia nhóm ${selectedGroup.title}`} width={220} height={220} unoptimized className="object-contain" /><span>Quét QR để mở nhóm Zalo</span></div>}
              {selectedGroup.groupUrl ? <a onClick={() => trackEvent('popup_join', { placement: selectedGroup.id })} href={selectedGroup.groupUrl} target="_blank" rel="noopener noreferrer" className="community-cta">Tham gia nhóm Zalo <ArrowUpRight size={17} /></a> : <p className="community-missing-link">Link mời nhóm này chưa được cập nhật.</p>}
              <button className="community-later" onClick={() => setOpen(null)}>Để sau</button>
            </div>
          </div>
        </motion.div>
      </motion.div>}
    </AnimatePresence>
  </>;
}
