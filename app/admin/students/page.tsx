'use client';

import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, Crop, X } from 'lucide-react';
import { Student } from '@/types';
import ImageCropperModal from '@/components/admin/ImageCropperModal';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { uploadFile } from '@/components/admin/uploadFile';

type Draft = { id?: string; name: string; photo: string; published: boolean; sortOrder: number };
const inputStyle = 'w-full rounded-xl border border-white/10 bg-[#161616] px-4 py-3 text-white';

export default function StudentsAdminPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [deleting, setDeleting] = useState<Student | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/students');
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Không thể tải học viên');
      setStudents(data);
    } catch (err) { setError(err instanceof Error ? err.message : 'Lỗi kết nối'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    // State changes in load happen only after the network request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const selectPhoto = (file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { setError('Chọn ảnh JPG, PNG hoặc WebP'); return; }
    if (file.size > 20 * 1024 * 1024) { setError('Ảnh gốc tối đa 20MB'); return; }
    const reader = new FileReader();
    reader.onload = () => { setError(''); setCropSource(reader.result as string); };
    reader.onerror = () => setError('Không đọc được ảnh');
    reader.readAsDataURL(file);
  };
  const uploadCropped = async (file: File) => {
    setCropSource(null); setUploading(true); setProgress(0); setError('');
    try {
      const result = await uploadFile(file, 'students', 'images', setProgress);
      setDraft(current => current ? { ...current, photo: result.url } : current);
    } catch (err) { setError(err instanceof Error ? err.message : 'Không tải được ảnh'); }
    finally { setUploading(false); }
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!draft || uploading) return;
    setSaving(true); setError('');
    try {
      const response = await fetch(draft.id ? `/api/admin/students/${draft.id}` : '/api/admin/students', {
        method: draft.id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Không thể lưu');
      setDraft(null); await load();
    } catch (err) { setError(err instanceof Error ? err.message : 'Không thể lưu'); }
    finally { setSaving(false); }
  };

  return <div className="max-w-6xl mx-auto space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><h1 className="text-3xl font-bold">Học viên</h1><p className="text-sm text-[#a3a3a3] mt-2">Ảnh và tên hiển thị sau khóa học trên trang chủ.</p></div>
      <button onClick={() => { setError(''); setDraft({ name: '', photo: '', published: true, sortOrder: students.reduce((max, s) => Math.max(max, s.sortOrder), 0) + 1 }); }} className="inline-flex items-center gap-2 bg-[#b6ff2e] text-black rounded-xl px-4 py-3 font-bold"><Plus size={18} />Thêm học viên</button>
    </div>
    {error && <p role="alert" className="text-red-400 bg-red-950/20 p-3 rounded-xl">{error}</p>}
    {loading ? <Loader2 className="animate-spin" /> : students.length === 0 ? <div className="p-10 rounded-2xl border border-white/10 text-center text-[#a3a3a3]">Chưa có học viên. Thêm ảnh và tên để hiển thị trên trang chủ.</div> :
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">{students.map(student => <article key={student.id} className="rounded-2xl border border-white/10 bg-[#111] overflow-hidden">
        <div className="relative aspect-[4/5]"><Image src={student.photo} alt={student.name} fill sizes="(max-width: 768px) 45vw, 250px" className="object-cover" /></div>
        <div className="p-4 space-y-3"><h2 className="font-bold break-words">{student.name}</h2><p className="text-xs text-[#a3a3a3]">Thứ tự {student.sortOrder} · {student.published ? 'Hiển thị' : 'Đang ẩn'}</p>
          <div className="flex gap-2"><button aria-label={`Sửa ${student.name}`} onClick={() => { setError(''); setDraft({ ...student }); }} className="p-3 rounded-lg bg-white/5"><Pencil size={16} /></button><button aria-label={`Xóa ${student.name}`} onClick={() => setDeleting(student)} className="p-3 rounded-lg bg-red-500/10 text-red-400"><Trash2 size={16} /></button></div>
        </div>
      </article>)}</div>}

    {draft && <div className="fixed inset-0 z-40 bg-black/80 flex items-center justify-center p-4">
      <form onSubmit={save} role="dialog" aria-modal="true" aria-labelledby="student-form-title" className="w-full max-w-lg max-h-[90dvh] overflow-y-auto rounded-2xl border border-white/10 bg-[#111] p-5 space-y-5">
        <div className="flex justify-between items-center"><h2 id="student-form-title" className="text-xl font-bold">{draft.id ? 'Sửa học viên' : 'Thêm học viên'}</h2><button type="button" aria-label="Đóng" disabled={saving || uploading} onClick={() => setDraft(null)} className="p-3"><X size={20} /></button></div>
        {error && <p role="alert" className="text-red-400 text-sm">{error}</p>}
        <label className="block space-y-2"><span>Tên học viên</span><input autoFocus required maxLength={100} value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} className={inputStyle} /></label>
        <div className="flex flex-wrap items-start gap-4">
          {draft.photo && <div className="relative w-32 aspect-[4/5] rounded-lg overflow-hidden"><Image src={draft.photo} alt="Ảnh học viên xem trước" fill sizes="128px" className="object-cover" /></div>}
          <div className="flex-1 min-w-40 space-y-3"><label className={`flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 cursor-pointer ${uploading ? 'opacity-50' : ''}`}><Crop size={18} /><span>{uploading ? `Đang tải ${progress}%` : 'Chọn ảnh và cắt'}</span><input className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading || saving} onChange={e => { selectPhoto(e.target.files?.[0]); e.target.value = ''; }} /></label>
          {draft.photo && <button type="button" disabled={uploading || saving} onClick={() => setCropSource(draft.photo)} className="text-sm text-[#b6ff2e] min-h-10">Cắt lại ảnh hiện tại</button>}
          <p className="text-xs leading-5 text-[#a3a3a3]">Khung dọc 4:5. Kéo, phóng to hoặc xoay để chọn vùng ảnh. Lưu WebP 800 × 1000 px.</p></div>
        </div>
        <label className="block space-y-2"><span>Thứ tự hiển thị</span><input required type="number" min={0} step={1} value={draft.sortOrder} onChange={e => setDraft({ ...draft, sortOrder: Number(e.target.value) })} className={inputStyle} /></label>
        <label className="flex gap-3 items-center"><input type="checkbox" checked={draft.published} onChange={e => setDraft({ ...draft, published: e.target.checked })} className="accent-[#b6ff2e]" />Hiển thị trên trang chủ</label>
        <button disabled={saving || uploading || !draft.photo} className="w-full py-3 rounded-xl bg-[#b6ff2e] text-black font-bold disabled:opacity-40">{saving ? 'Đang lưu...' : 'Lưu học viên'}</button>
      </form>
    </div>}
    <ImageCropperModal isOpen={!!cropSource} imageSrc={cropSource} aspectRatio={4 / 5} coverOnly fileName="student.webp" onCancel={() => setCropSource(null)} onCropComplete={file => { void uploadCropped(file); }} />
    <ConfirmModal isOpen={!!deleting} title="Xóa học viên" itemName={deleting?.name || ''} onCancel={() => setDeleting(null)} onConfirm={async () => {
      const response = await fetch(`/api/admin/students/${deleting?.id}`, { method: 'DELETE' });
      if (!response.ok) { const data = await response.json(); throw new Error(data.error || 'Không thể xóa'); }
      setDeleting(null); await load();
    }} />
  </div>;
}
