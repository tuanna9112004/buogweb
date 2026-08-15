import { getCourses } from '@/lib/storage/repository';
import CourseCard from '@/components/public/CourseCard';
import Reveal from '@/components/public/Reveal';
import { GraduationCap } from 'lucide-react';

export const revalidate = 0;

export default function CoursesPage() {
  const courses = getCourses(true);

  return (
    <div className="section-page-courses max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 space-y-8">
      {/* Header Banner */}
      <Reveal className="space-y-3 border-b border-white/10 pb-6">
        <div className="text-xs font-mono text-[#A8A8A8] uppercase tracking-widest flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-white" />
          <span>ACADEMY & TRAINING CATALOG</span>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-white">
          DẠY DJ / PRODUCER
        </h1>
        <p className="text-sm text-[#A8A8A8] max-w-2xl">
          Đào tạo DJ và sản xuất nhạc chuyên nghiệp 1-on-1 trực tiếp tại Studio. Thực hành 100% trên thiết bị Pioneer DJ chuẩn Club.
        </p>
      </Reveal>

      {/* Grid Layout (Desktop 3, Tablet 2, Mobile 3-compact) */}
      {courses.length > 0 ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-1 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, i) => (
            <Reveal key={course.id} delay={Math.min(i * 0.05, 0.3)} distance={16}>
              <CourseCard course={course} compact />
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-[#0A0A0A] rounded-2xl border border-white/10 space-y-2">
          <p className="text-base font-semibold text-white">Chưa có khóa học nào được xuất bản</p>
          <p className="text-xs font-mono text-[#737373]">Vui lòng quay lại sau.</p>
        </div>
      )}
    </div>
  );
}
