'use client';

import { useState, useEffect } from 'react';
import EquipmentCard from '@/components/public/EquipmentCard';
import { Equipment, EquipmentCategory } from '@/types';
import { Sliders, Filter, Loader2 } from 'lucide-react';

export default function EquipmentPage() {
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [resEq, resCat] = await Promise.all([
          fetch('/api/public/equipment'),
          fetch('/api/public/equipment-categories'),
        ]);
        if (resEq.ok) {
          const eqData = await resEq.json();
          setEquipmentList(eqData);
        }
        if (resCat.ok) {
          const catData = await resCat.json();
          setCategories(catData);
        }
      } catch (err) {
        console.error('Failed to load equipment:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredList = selectedCat
    ? equipmentList.filter((e) => e.category === selectedCat)
    : equipmentList;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 space-y-8">
      {/* Header Banner */}
      <div className="space-y-3 border-b border-white/10 pb-6">
        <div className="text-xs font-mono text-[#A8A8A8] uppercase tracking-widest flex items-center gap-2">
          <Sliders className="w-4 h-4 text-white" />
          <span>EQUIPMENT SHOWROOM & CATALOG</span>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-white">
          THIẾT BỊ DJ / PRODUCER
        </h1>
        <p className="text-sm text-[#A8A8A8] max-w-2xl">
          Catalog các dòng máy Pioneer DJ, All-In-One Player, Controller và Loa kiểm âm chuyên nghiệp do BUOGS tư vấn & cung cấp.
        </p>
      </div>

      {/* Category Filter Bar */}
      <div className="flex flex-wrap items-center gap-2 bg-[#0A0A0A] p-3 rounded-2xl border border-white/10">
        <div className="flex items-center gap-2 text-xs font-mono text-[#737373] px-3 py-1">
          <Filter className="w-3.5 h-3.5 text-white/70" />
          <span>DANH MỤC:</span>
        </div>

        <button
          onClick={() => setSelectedCat(null)}
          className={`text-xs px-4 py-2 rounded-xl font-mono uppercase tracking-wider transition-all ${
            selectedCat === null
              ? 'bg-white text-black font-bold shadow-md'
              : 'bg-[#101010] text-[#737373] hover:text-white border border-white/10 hover:border-white/30'
          }`}
        >
          TẤT CẢ ({equipmentList.length})
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCat === cat.id;
          const count = equipmentList.filter((e) => e.category === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(isSelected ? null : cat.id)}
              className={`text-xs px-4 py-2 rounded-xl font-mono uppercase tracking-wider transition-all ${
                isSelected
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'bg-[#101010] text-[#737373] hover:text-white border border-white/10 hover:border-white/30'
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Grid Layout (Desktop 3-4, Tablet 2, Mobile 1) */}
      {loading ? (
        <div className="py-20 text-center flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
          <span className="text-sm font-mono text-[#737373]">Đang tải catalog thiết bị...</span>
        </div>
      ) : filteredList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredList.map((eq) => (
            <EquipmentCard key={eq.id} equipment={eq} categories={categories} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-[#0A0A0A] rounded-2xl border border-white/10 space-y-2">
          <p className="text-base font-semibold text-white">Chưa có thiết bị nào trong danh mục này</p>
          <p className="text-xs font-mono text-[#737373]">Vui lòng thử chọn danh mục khác.</p>
        </div>
      )}
    </div>
  );
}
