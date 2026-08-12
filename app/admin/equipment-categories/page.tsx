'use client';

import { useState, useEffect } from 'react';
import { EquipmentCategory } from '@/types';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { Plus, Edit, Trash2, Loader2, X } from 'lucide-react';

export default function AdminEquipmentCategoriesPage() {
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [editingCat, setEditingCat] = useState<EquipmentCategory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [catId, setCatId] = useState('');
  const [catName, setCatName] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [published, setPublished] = useState(true);

  const [deleteTarget, setDeleteTarget] = useState<EquipmentCategory | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/equipment-categories');
      if (res.ok) setCategories(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCat(null);
    setCatId('');
    setCatName('');
    setSortOrder(categories.length + 1);
    setPublished(true);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: EquipmentCategory) => {
    setEditingCat(cat);
    setCatId(cat.id);
    setCatName(cat.name);
    setSortOrder(cat.sortOrder);
    setPublished(cat.published);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const finalId = catId.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-');
    if (!finalId || !catName) {
      setError('ID và Tên danh mục không được để trống');
      return;
    }

    try {
      const payload = {
        id: finalId,
        name: catName,
        sortOrder: Number(sortOrder),
        published,
      };

      const url = editingCat ? `/api/admin/equipment-categories/${editingCat.id}` : '/api/admin/equipment-categories';
      const method = editingCat ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Lỗi khi lưu danh mục');

      setIsModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/admin/equipment-categories/${deleteTarget.id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Không thể xóa danh mục');
    }
    setDeleteTarget(null);
    fetchCategories();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white uppercase">
            Quản Lý Danh Mục Thiết Bị
          </h1>
          <p className="text-xs font-mono text-[#a3a3a3] mt-1">
            Danh sách các category phân loại thiết bị DJ (Player, Controller, Monitor, Phụ kiện...)
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#b6ff2e] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#9ee61a] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Danh Mục Mới</span>
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#b6ff2e]" />
          <span className="text-xs font-mono text-[#a3a3a3]">Đang tải dữ liệu...</span>
        </div>
      ) : categories.length > 0 ? (
        <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-xl max-w-4xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#161616] border-b border-white/10 text-xs font-mono text-[#a3a3a3] uppercase">
                <th className="p-4">ID Category</th>
                <th className="p-4">Tên Danh Mục</th>
                <th className="p-4">Thứ Tự</th>
                <th className="p-4">Trạng Thái</th>
                <th className="p-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 font-mono text-xs text-[#b6ff2e]">#{cat.id}</td>
                  <td className="p-4 font-bold text-white">{cat.name}</td>
                  <td className="p-4 font-mono text-xs text-[#a3a3a3]">{cat.sortOrder}</td>
                  <td className="p-4">
                    {cat.published ? (
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
                        onClick={() => openEditModal(cat)}
                        className="p-2 rounded-lg bg-[#161616] text-white hover:text-[#b6ff2e] border border-white/10 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(cat)}
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
          <p className="text-sm text-white font-mono">Chưa có danh mục thiết bị nào</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111111] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-heading text-xl font-bold uppercase text-white">
                {editingCat ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Thiết Bị Mới'}
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

            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-xs font-mono text-[#a3a3a3] uppercase">
                  ID Danh Mục (Slug) *
                </label>
                <input
                  type="text"
                  disabled={!!editingCat}
                  required
                  value={catId}
                  onChange={(e) => setCatId(e.target.value)}
                  placeholder="dj-player"
                  className="w-full bg-[#161616] border border-white/10 rounded-xl p-3 text-white text-sm font-mono focus:border-[#b6ff2e] focus:outline-none disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-mono text-[#a3a3a3] uppercase">
                  Tên Hiển Thị *
                </label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  placeholder="DJ Player / All-In-One"
                  className="w-full bg-[#161616] border border-white/10 rounded-xl p-3 text-white text-sm font-bold focus:border-[#b6ff2e] focus:outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-mono text-[#a3a3a3] uppercase">
                  Thứ Tự Sắp Xếp
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
                  className="px-4 py-2.5 rounded-xl bg-[#161616] text-white text-xs uppercase"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#b6ff2e] text-black font-bold text-xs uppercase hover:bg-[#9ee61a]"
                >
                  Lưu Danh Mục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Xóa Danh Mục Thiết Bị"
        itemName={deleteTarget?.name || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
