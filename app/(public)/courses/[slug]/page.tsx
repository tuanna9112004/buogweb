import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCourseBySlug, getCourses, getSettings } from '@/lib/storage/repository';
import ImageGallery from '@/components/public/ImageGallery';
import MarkdownRenderer from '@/components/public/MarkdownRenderer';
import CourseCard from '@/components/public/CourseCard';
import { Send, ArrowLeft, GraduationCap, CheckCircle2 } from 'lucide-react';

export const revalidate = 0;

interface CourseDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { slug } = await params;
  const course = getCourseBySlug(slug, true);

  if (!course) {
    notFound();
  }

  const settings = getSettings();
  const allCourses = getCourses(true);
  const relatedCourses = allCourses.filter((c) => c.id !== course.id).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 space-y-12">
      {/* Back link */}
      <Link
        href="/courses"
        className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#A8A8A8] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại danh sách Khóa học</span>
      </Link>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-6">
          <ImageGallery
            thumbnail={course.thumbnail}
            images={course.images}
            altTitle={course.title}
          />
        </div>

        {/* Right Column: Course Info & Consultation CTAs */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-mono text-white bg-[#0A0A0A] px-3 py-1 rounded-full border border-white/10">
              <GraduationCap className="w-4 h-4 text-white/70" />
              <span>ĐÀO TẠO THỰC CHUYÊN</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
              {course.title}
            </h1>
          </div>

          <p className="text-sm text-[#A8A8A8] leading-relaxed">
            {course.shortDescription}
          </p>

          {/* Price Box & CTA */}
          <div className="bg-[#0A0A0A] border border-white/15 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div>
              <span className="text-xs font-mono text-[#737373] uppercase block">Học phí trọn gói</span>
              <span className="font-mono text-3xl font-extrabold text-white">
                {course.priceText || 'Liên hệ tư vấn'}
              </span>
            </div>

            <div className="space-y-2 text-xs text-[#A8A8A8] font-mono border-t border-white/10 pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Học 1-on-1 trực tiếp với BUOGS</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Thực hành 100% trên bàn Pioneer DJ</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Hỗ trợ tư vấn thiết bị & hướng đi lâu dài</span>
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
                  <span>Liên Hệ Zalo Đăng Ký Tư Vấn</span>
                </a>
              )}

              {settings.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[#101010] border border-white/15 text-white font-bold text-sm uppercase tracking-wider hover:border-white/30 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Facebook Messenger</span>
                </a>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Full Content Syllabus & Outline (Markdown) */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 sm:p-10 space-y-6">
        <h2 className="font-heading text-2xl font-bold text-white border-b border-white/10 pb-4 uppercase">
          Chi Tiết Chương Trình Đào Tạo
        </h2>
        <MarkdownRenderer content={course.content} />
      </div>

      {/* Related Courses */}
      {relatedCourses.length > 0 && (
        <div className="space-y-6 pt-6">
          <h2 className="font-heading text-2xl font-bold text-white uppercase border-b border-white/10 pb-4">
            Các Khóa Học Khác
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedCourses.map((rel) => (
              <CourseCard key={rel.id} course={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
