import Link from 'next/link';
import Image from 'next/image';
import { Course } from '@/types';
import { ArrowRight, GraduationCap } from 'lucide-react';

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const thumbnail = course.thumbnail || '/media/courses/images/dj-full-cover.webp';

  return (
    <div className="bg-[#101010] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 ease-out hover:border-white/25 hover:-translate-y-1.5 hover:shadow-[0_20px_60px_rgba(0,0,0,0.5)] shadow-2xl group">
      <div>
        {/* Cover Thumbnail */}
        <div className="relative aspect-video w-full bg-[#050505] overflow-hidden border-b border-white/10">
          <Image
            src={thumbnail}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />
          <div className="absolute top-3 left-3 bg-[#050505]/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 text-xs font-mono text-white flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-white/70" />
            <span>Khóa học</span>
          </div>
        </div>

        {/* Info Content */}
        <div className="p-6 space-y-3">
          <h3 className="font-heading text-xl font-semibold text-white transition-colors line-clamp-2">
            {course.title}
          </h3>
          <p className="text-sm text-[#A8A8A8] line-clamp-2 leading-relaxed">
            {course.shortDescription}
          </p>
        </div>
      </div>

      {/* Footer Price & CTA */}
      <div className="p-6 pt-0 border-t border-white/10 mt-4 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-[#737373] block font-mono uppercase">Học phí</span>
          <span className="text-lg font-bold text-white font-mono">
            {course.priceText || 'Liên hệ'}
          </span>
        </div>

        <Link
          href={`/courses/${course.slug}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-[#050505] border border-white text-xs font-bold uppercase tracking-wider hover:bg-[#E6E6E6] transition-all duration-300 active:scale-[0.97]"
        >
          <span>Xem chi tiết</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
