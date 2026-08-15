'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MusicTag } from '@/types';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { Plus, Edit, Trash2, Tag, Loader2, Save, X } from 'lucide-react';

export default function AdminMusicTagsPage() {
  const [tags, setTags] = useState<MusicTag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal / Form state for Add or Edit
  const [editingTag, setEditingTag] = useState<MusicTag | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [tagId, setTagId] = useState('');
  const [tagName, setTagName] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [published, setPublished] = useState(true);

  const [deleteTarget, setDeleteTarget] = useState<MusicTag | null>(null);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/admin/music-tags');
      if (res.ok) setTags(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  const openCreateModal = () => {
    setEditingTag(null);
    setTagId('');
    setTagName('');
    setSortOrder(tags.length + 1);
    setPublished(true);
    setIsModalOpen(true);
  };

  const openEditModal = (tag: MusicTag) => {
    setEditingTag(tag);
    setTagId(tag.id);
    setTagName(tag.name);
    setSortOrder(tag.sortOrder);
    setPublished(tag.published);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const finalId = tagId.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
    if (!finalId || !tagName) {
      setError('ID và Tên tag không được để trống');
      return;
    }

    setShowSaveConfirm(true);
  };

  const handleSave = async () => {
    const finalId = tagId.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');

    try {
      const payload = {
        id: finalId,
        name: tagName.toUpperCase(),
        sortOrder: Number(sortOrder),
        published,
      };

      const url = editingTag ? `/api/admin/music-tags/${editingTag.id}` : '/api/admin/music-tags';
      const method = editingTag ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi lưu tag');

      setIsModalOpen(false);
      setShowSaveConfirm(false);
      fetchTags();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/admin/music-tags/${deleteTarget.id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Không thể xóa tag');
    }
    setDeleteTarget(null);
    fetchTags();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white uppercase">
            Quản Lý Music Tags
          </h1>
          <p className="text-xs font-mono text-[#a3a3a3] mt-1">
            Danh sách các tag thể loại bài nhạc (Vinahouse, House Lak, Vinatrance, Remix, EDM...)
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#b6ff2e] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#9ee61a] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Music Tag Mới</span>
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#b6ff2e]" />
          <span className="text-xs font-mono text-[#a3a3a3]">Đang tải dữ liệu...</span>
        </div>
      ) : tags.length > 0 ? (
        <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-xl max-w-4xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#161616] border-b border-white/10 text-xs font-mono text-[#a3a3a3] uppercase">
                <th className="p-4">ID Tag</th>
                <th className="p-4">Tên Tag (Display)</th>
                <th className="p-4">Thứ Tự</th>
                <th className="p-4">Trạng Thái</th>
                <th className="p-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {tags.map((tag) => (
                <tr key={tag.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-mono text-xs text-[#b6ff2e]">#{tag.id}</td>
                  <td className="p-4 font-bold text-white">{tag.name}</td>
                  <td className="p-4 font-mono text-xs text-[#a3a3a3]">{tag.sortOrder}</td>
                  <td className="p-4">
                    {tag.published ? (
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/30">
                        Hiển thị
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-gray-400 bg-gray-900/60 px-2.5 py-1 rounded-full border border-gray-700">
                        Ẩn
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(tag)}
                        className="p-2 rounded-lg bg-[#161616] text-white hover:text-[#b6ff2e] border border-white/10 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(tag)}
                        className="p-2 rounded-lg bg-red-950/30 text-red-400 border border-red-500/20 hover:bg-red-900/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="py-16 text-center bg-[#111111] rounded-2xl border border-white/5">
          <p className="text-sm text-white font-mono">Chưa có tag bài nhạc nào</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
        >
          <motion.div
            className="bg-[#111111] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl"
            initial={{ opacity: 0, scale: 0.94, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 4 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-heading text-xl font-bold uppercase text-white">
                {editingTag ? 'Chỉnh Sửa Tag' : 'Thêm Music Tag Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#a3a3a3] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-950/50 text-red-400 text-xs font-mono">
                {error}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-mono text-[#a3a3a3] uppercase">
                  ID Tag (Slug) *
                </label>
                <input
                  type="text"
                  disabled={!!editingTag}
                  required
                  value={tagId}
                  onChange={(e) => setTagId(e.target.value)}
                  placeholder="Ví dụ: vinahouse"
                  className="w-full bg-[#161616] border border-white/10 rounded-xl p-3 text-white text-sm font-mono focus:border-[#b6ff2e] focus:outline-none disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-mono text-[#a3a3a3] uppercase">
                  Tên Hiển Thị (Display Name) *
                </label>
                <input
                  type="text"
                  required
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  placeholder="Ví dụ: VINAHOUSE"
                  className="w-full bg-[#161616] border border-white/10 rounded-xl p-3 text-white text-sm font-bold uppercase focus:border-[#b6ff2e] focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-mono text-[#a3a3a3] uppercase">
                  Thứ Tự Sắp Xếp (Sort Order)
                </label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className="w-full bg-[#161616] border border-white/10 rounded-xl p-3 text-white text-sm font-mono focus:border-[#b6ff2e] focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer text-sm font-mono pt-2">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-4 h-4 accent-[#b6ff2e]"
                />
                <span>Xuất bản Public</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#161616] text-white text-xs uppercase hover:bg-white/10 active:scale-[0.96] transition-all duration-150"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#b6ff2e] text-black font-bold text-xs uppercase hover:bg-[#9ee61a] active:scale-[0.96] transition-all duration-150"
                >
                  Lưu Tag
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Xóa Music Tag"
        itemName={deleteTarget?.name || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Confirm Save Modal */}
      <ConfirmModal
        isOpen={showSaveConfirm}
        title={editingTag ? 'Xác Nhận Cập Nhật Tag' : 'Xác Nhận Thêm Tag'}
        itemName={tagName}
        variant="default"
        confirmLabel={editingTag ? 'Xác Nhận Cập Nhật' : 'Xác Nhận Thêm'}
        message={
          editingTag
            ? `Lưu thay đổi cho tag "${tagName}"?`
            : `Thêm music tag mới "${tagName}"?`
        }
        onConfirm={handleSave}
        onCancel={() => setShowSaveConfirm(false)}
      />
    </div>
  );
}
