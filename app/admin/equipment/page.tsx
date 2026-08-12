'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Equipment, EquipmentCategory } from '@/types';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { Plus, Edit, Trash2, Sliders, Star, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function AdminEquipmentPage() {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Equipment | null>(null);

  const fetchEquipment = async () => {
    try {
      const [resE, resC] = await Promise.all([
        fetch('/api/admin/equipment'),
        fetch('/api/admin/equipment-categories'),
      ]);
      if (resE.ok) setEquipmentList(await resE.json());
      if (resC.ok) setCategories(await resC.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/admin/equipment/${deleteTarget.id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Lỗi khi xóa thiết bị');
    }
    setDeleteTarget(null);
    fetchEquipment();
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white uppercase">
            Quản Lý Thiết Bị (Equipment)
          </h1>
          <p className="text-xs font-mono text-[#a3a3a3] mt-1">
            Danh sách thiết bị DJ, All-In-One, Controller, danh mục và thông số kĩ thuật
          </p>
        </div>

        <Link
          href="/admin/equipment/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#b6ff2e] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#9ee61a] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Thiết Bị Mới</span>
        </Link>
      </div>

      {/* Data Table */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#b6ff2e]" />
          <span className="text-xs font-mono text-[#a3a3a3]">Đang tải dữ liệu...</span>
        </div>
      ) : equipmentList.length > 0 ? (
        <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#161616] border-b border-white/10 text-xs font-mono text-[#a3a3a3] uppercase">
                  <th className="p-4">Thumbnail</th>
                  <th className="p-4">Tên Thiết Bị / Slug</th>
                  <th className="p-4">Danh Mục</th>
                  <th className="p-4">Giá Hiển Thị</th>
                  <th className="p-4">Nổi Bật</th>
                  <th className="p-4">Trạng Thái</th>
                  <th className="p-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {equipmentList.map((item) => {
                  const catObj = categories.find((c) => c.id === item.category);
                  const catName = catObj ? catObj.name : item.category;

                  return (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <div className="relative w-16 h-10 rounded-lg overflow-hidden bg-[#080808] border border-white/10">
                          {item.thumbnail ? (
                            <Image src={item.thumbnail} alt={item.title} fill className="object-cover" unoptimized />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#a3a3a3]">
                              <Sliders className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="font-bold text-white line-clamp-1">{item.title}</div>
                        <div className="text-xs text-[#a3a3a3] font-mono">/{item.slug}</div>
                      </td>

                      <td className="p-4 font-mono text-xs text-[#b6ff2e]">
                        {catName}
                      </td>

                      <td className="p-4 font-mono text-xs font-bold text-[#b6ff2e]">
                        {item.priceText || 'Liên hệ'}
                      </td>

                      <td className="p-4">
                        {item.featured ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#b6ff2e] bg-[#b6ff2e]/10 px-2.5 py-1 rounded-full border border-[#b6ff2e]/30">
                            <Star className="w-3 h-3 fill-current" />
                            <span>Featured</span>
                          </span>
                        ) : (
                          <span className="text-[11px] font-mono text-[#666]">-</span>
                        )}
                      </td>

                      <td className="p-4">
                        {item.published ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-500/30">
                            <Eye className="w-3 h-3" />
                            <span>Public</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-gray-400 bg-gray-900/60 px-2.5 py-1 rounded-full border border-gray-700">
                            <EyeOff className="w-3 h-3" />
                            <span>Ẩn</span>
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/equipment/${item.id}/edit`}
                            className="p-2 rounded-lg bg-[#161616] text-white hover:text-[#b6ff2e] border border-white/10 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(item)}
                            className="p-2 rounded-lg bg-red-950/30 text-red-400 hover:bg-red-900/40 border border-red-500/20 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="py-16 text-center bg-[#111111] rounded-2xl border border-white/5 space-y-3">
          <p className="text-base text-white">Chưa có thiết bị nào</p>
          <Link
            href="/admin/equipment/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#b6ff2e] text-black font-bold text-xs uppercase"
          >
            + Thêm thiết bị đầu tiên
          </Link>
        </div>
      )}

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Xóa Thiết Bị"
        itemName={deleteTarget?.title || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
