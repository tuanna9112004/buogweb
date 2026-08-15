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
    <div className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-white/[0.07] bg-[#101010] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-white/20 hover:bg-[#131313]">
      {/* Product shot — clean, focal point of the card */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#050505]">
        <Image
          src={thumbnail}
          alt={equipment.title}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          unoptimized
        />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-white backdrop-blur-md">
          <Sliders className="h-3 w-3 text-white/70" />
          <span>{categoryName}</span>
        </div>
      </div>

      {/* Info — kept minimal so the product image stays the focal point */}
      <div className="flex flex-1 flex-col gap-2 p-5">
        <h3 className="font-heading text-base sm:text-lg font-semibold leading-snug text-white line-clamp-2 min-h-[2.75rem]">
          {equipment.title}
        </h3>
        <p className="text-sm text-[#8A8A8A] leading-relaxed line-clamp-2 min-h-[2.6rem]">
          {equipment.shortDescription}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/[0.07] pt-4">
          <div className="min-w-0">
            <span className="block font-mono text-[10px] uppercase tracking-wide text-[#6B6B6B]">
              Giá Thiết Bị
            </span>
            <span className="block whitespace-nowrap font-mono text-[15px] font-bold leading-snug text-white">
              {equipment.priceText || 'Liên hệ'}
            </span>
          </div>

          <Link
            href={`/equipment/${equipment.slug}`}
            className="group/cta shrink-0 inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-bold uppercase tracking-wider text-white transition-colors duration-200 hover:text-[#B8B8B8]"
          >
            <span>Xem chi tiết</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-300 group-hover/cta:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
