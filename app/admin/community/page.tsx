'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Save, Loader2 } from 'lucide-react';
import type { CommunitySettings } from '@/lib/community';
import { uploadFile } from '@/components/admin/uploadFile';

const fieldClass = 'w-full rounded-xl border border-white/10 bg-[#161616] p-3 text-white';
export default function CommunityAdmin() {
  const [form, setForm] = useState<CommunitySettings | null>(null);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    fetch('/api/admin/community').then(async response => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Không thể tải cài đặt');
      setForm(data);
    }).catch(err => setError(err.message));
  }, []);
  const change = (key: keyof CommunitySettings, value: string | boolean | string[]) => { setForm(current => current ? { ...current, [key]: value } : current); setSaved(false); };
  const upload = async (file?: File) => {
    if (!file) return;
    if (!['image/png','image/jpeg','image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) { setError('Chọn ảnh JPG, PNG hoặc WebP tối đa 8MB'); return; }
    setUploading(true); setError(''); setProgress(0);
    try { const result = await uploadFile(file, 'community', 'images', setProgress); change('qrImage', result.url); }
    catch(err) { setError(err instanceof Error ? err.message : 'Không tải được QR'); }
    finally { setUploading(false); }
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError(''); setSaved(false);
    try {
      const response = await fetch('/api/admin/community',{ method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({ ...form, benefits: form?.benefits.map(item => item.trim()).filter(Boolean) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Không thể lưu');
      setForm(data); setSaved(true);
    } catch(err) { setError(err instanceof Error ? err.message : 'Không thể lưu'); }
    finally { setBusy(false); }
  };
  return <div className="max-w-3xl mx-auto space-y-6"><h1 className="text-3xl font-bold">Popup nhóm Zalo</h1><p className="text-sm text-[#a3a3a3]">Thẻ nhỏ ở góc trang. Người xem bấm để mở quyền lợi, QR và link tham gia.</p>
    {error && <p role="alert" className="p-3 bg-red-950/30 text-red-400 rounded-xl">{error}</p>}
    {saved && <p role="status" className="text-[#b6ff2e]">Đã lưu. Trang đang mở tự cập nhật trong tối đa 60 giây hoặc khi tải lại.</p>}
    {!form ? <Loader2 className="animate-spin" /> : <form onSubmit={save} className="rounded-2xl bg-[#111] border border-white/10 p-5 space-y-5">
      <label className="flex items-center gap-3"><input type="checkbox" checked={form.enabled} onChange={e=>change('enabled',e.target.checked)} />Bật popup trên website</label>
      <label className="block space-y-2"><span>Tên nhóm</span><input required maxLength={100} className={fieldClass} value={form.title} onChange={e=>change('title',e.target.value)} /></label>
      <label className="block space-y-2"><span>Mô tả ngắn trên thẻ</span><textarea maxLength={250} rows={2} className={fieldClass} value={form.summary} onChange={e=>change('summary',e.target.value)} /></label>
      <label className="block space-y-2"><span>Giới thiệu trong popup lớn</span><textarea maxLength={1000} rows={3} className={fieldClass} value={form.description} onChange={e=>change('description',e.target.value)} /></label>
      <label className="block space-y-2"><span>Quyền lợi thành viên — mỗi dòng một mục</span><textarea rows={6} className={fieldClass} value={form.benefits.join('\n')} onChange={e=>change('benefits',e.target.value.split('\n'))} /></label>
      <div className="grid sm:grid-cols-2 gap-4"><label className="block space-y-2"><span>Giá hiển thị</span><input maxLength={60} className={fieldClass} value={form.priceText} onChange={e=>change('priceText',e.target.value)} /></label><label className="block space-y-2"><span>Thời hạn thành viên</span><input maxLength={80} className={fieldClass} value={form.membershipText} onChange={e=>change('membershipText',e.target.value)} /></label></div>
      <label className="block space-y-2"><span>Link tham gia nhóm</span><input type="url" required={form.enabled} className={fieldClass} value={form.groupUrl} onChange={e=>change('groupUrl',e.target.value)} /></label>
      <div className="space-y-3"><label className="block space-y-2"><span>Ảnh QR Zalo</span><input type="file" accept="image/png,image/jpeg,image/webp" disabled={uploading || busy} className={fieldClass} onChange={e=>{void upload(e.target.files?.[0]);e.target.value='';}} /></label><p className="text-xs text-[#a3a3a3]">Giữ nguyên ảnh QR để quét chính xác, không cắt ảnh.</p>
        {uploading && <p>Đang tải {progress}%</p>}
        {form.qrImage && <><Image src={form.qrImage} alt="QR nhóm xem trước" width={180} height={180} unoptimized className="max-h-60 object-contain bg-white rounded-xl" /><button type="button" onClick={()=>change('qrImage','')} className="text-sm text-red-400">Bỏ ảnh QR</button></>}
      </div>
      <button disabled={busy || uploading} className="flex gap-2 items-center px-5 py-3 bg-[#b6ff2e] text-black rounded-xl font-bold disabled:opacity-50"><Save size={18}/>{busy ? 'Đang lưu...' : 'Lưu cài đặt'}</button>
    </form>}
  </div>;
}
