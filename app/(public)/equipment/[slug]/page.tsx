import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getEquipmentBySlug, getEquipment, getEquipmentCategories, getSettings } from '@/lib/storage/repository';
import ImageGallery from '@/components/public/ImageGallery';
import MarkdownRenderer from '@/components/public/MarkdownRenderer';
import EquipmentCard from '@/components/public/EquipmentCard';
import { Send, ArrowLeft, Sliders, CheckCircle2, Phone } from 'lucide-react';

export const revalidate = 0;

interface EquipmentDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EquipmentDetailPage({ params }: EquipmentDetailPageProps) {
  const { slug } = await params;
  const eq = getEquipmentBySlug(slug, true);

  if (!eq) {
    notFound();
  }

  const settings = getSettings();
  const categories = getEquipmentCategories(true);
  const allEquipment = getEquipment(true);
  const relatedEquipment = allEquipment.filter((e) => e.id !== eq.id).slice(0, 4);

  const categoryObj = categories.find((c) => c.id === eq.category);
  const categoryName = categoryObj ? categoryObj.name : eq.category.toUpperCase();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 space-y-12">
      {/* Back link */}
      <Link
        href="/equipment"
        className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#A8A8A8] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại catalog Thiết bị</span>
      </Link>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-6">
          <ImageGallery
            thumbnail={eq.thumbnail}
            images={eq.images}
            altTitle={eq.title}
          />
        </div>

        {/* Right Column: Info & Price */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-white bg-[#0A0A0A] px-3 py-1 rounded-full border border-white/10">
              <Sliders className="w-4 h-4 text-white/70" />
              <span>{categoryName}</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
              {eq.title}
            </h1>
          </div>

          <p className="text-sm text-[#A8A8A8] leading-relaxed">
            {eq.shortDescription}
          </p>

          {/* Price Box & CTA */}
          <div className="bg-[#0A0A0A] border border-white/15 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div>
              <span className="text-xs font-mono text-[#737373] uppercase block">Giá niêm yết</span>
              <span className="font-mono text-3xl font-extrabold text-white">
                {eq.priceText || 'Liên hệ'}
              </span>
            </div>

            <div className="space-y-2 text-xs text-[#A8A8A8] font-mono border-t border-white/10 pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Cam kết chính hãng / Kiểm tra trực tiếp</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Bảo hành uy tín tại studio BUOGS</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Giao hàng toàn quốc hoặc nhận tại studio</span>
              </div>
            </div>

            {/* Direct Contact CTAs */}
            <div className="flex flex-col gap-3 pt-2">
              {settings.zaloUrl && (
                <a
                  href={settings.zaloUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-white text-[#050505] font-bold text-sm uppercase tracking-wider hover:bg-[#E6E6E6] transition-all transform hover:scale-[1.01] shadow-lg"
                >
                  <Send className="w-4 h-4" />
                  <span>Liên Hệ Zalo Mua Thiết Bị</span>
                </a>
              )}

              {settings.phone && (
                <a
                  href={`tel:${settings.phone}`}
                  className="inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#101010] border border-white/15 text-white font-bold text-sm uppercase tracking-wider hover:border-white/30 transition-all"
                >
                  <Phone className="w-4 h-4 text-white" />
                  <span>Hotline: {settings.phone}</span>
                </a>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Full Content Description (Markdown) */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 sm:p-10 space-y-6">
        <h2 className="font-heading text-2xl font-bold text-white border-b border-white/10 pb-4 uppercase">
          Thông Số Kỹ Thuật & Tình Trạng Thiết Bị
        </h2>
        <MarkdownRenderer content={eq.content} />
      </div>

      {/* Related Equipment */}
      {relatedEquipment.length > 0 && (
        <div className="space-y-6 pt-6">
          <h2 className="font-heading text-2xl font-bold text-white uppercase border-b border-white/10 pb-4">
            Thiết Bị Khác
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedEquipment.map((rel) => (
              <EquipmentCard key={rel.id} equipment={rel} categories={categories} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
