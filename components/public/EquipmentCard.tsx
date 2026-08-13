import Link from 'next/link';
import Image from 'next/image';
import { Equipment, EquipmentCategory } from '@/types';
import { ArrowRight, Sliders } from 'lucide-react';

interface EquipmentCardProps {
  equipment: Equipment;
  categories?: EquipmentCategory[];
}

export default function EquipmentCard({ equipment, categories = [] }: EquipmentCardProps) {
  const thumbnail = equipment.thumbnail || '/media/equipment/images/rx3-cover.webp';
  const categoryObj = categories.find((c) => c.id === equipment.category);
  const categoryName = categoryObj ? categoryObj.name : equipment.category.toUpperCase();

  return (
    <div className="h-full bg-[#0c0c0c] border border-white/10 rounded-2xl overflow-hidden flex flex-col transition-colors duration-300 hover:border-white/30 group">
      {/* Cover Thumbnail — tighter 4:3 crop to minimize dead space around product shots */}
      <div className="relative aspect-[4/3] w-full bg-[#050505] overflow-hidden border-b border-white/10">
        <Image
          src={thumbnail}
          alt={equipment.title}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          unoptimized
        />
        <div className="absolute top-3 left-3 bg-[#050505]/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 text-[10px] font-mono uppercase tracking-wide text-white flex items-center gap-1.5">
          <Sliders className="w-3 h-3 text-white/70" />
          <span>{categoryName}</span>
        </div>
      </div>

      {/* Info Content */}
      <div className="flex-1 flex flex-col p-5 space-y-2">
        <h3 className="font-heading text-lg font-semibold leading-snug text-white line-clamp-2 min-h-[2.75rem] transition-colors">
          {equipment.title}
        </h3>
        <p className="text-sm text-[#A8A8A8] leading-relaxed line-clamp-2 min-h-[2.6rem]">
          {equipment.shortDescription}
        </p>
      </div>

      {/* Footer: price left — CTA right, always one line */}
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/10 px-5 py-4">
        <div className="min-w-0">
          <span className="text-[10px] text-[#737373] block font-mono uppercase tracking-wide">Giá thiết bị</span>
          <span className="text-[15px] font-bold text-white font-mono block leading-snug whitespace-nowrap">
            {equipment.priceText || 'Liên hệ'}
          </span>
        </div>

        <Link
          href={`/equipment/${equipment.slug}`}
          className="shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white text-[#050505] text-[11px] font-bold uppercase tracking-wide hover:bg-[#E6E6E6] transition-colors duration-300 active:scale-[0.97]"
        >
          <span>Xem chi tiết</span>
          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
        </Link>
      </div>
    </div>
  );
}
