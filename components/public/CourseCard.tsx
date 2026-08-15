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
    <div className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-white/[0.07] bg-[#101010] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-white/20 hover:bg-[#131313]">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#050505]">
        <Image
          src={thumbnail}
          alt={course.title}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wide text-white backdrop-blur-md">
          <GraduationCap className="h-3.5 w-3.5 text-white/70" />
          <span>Khóa Học</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        <h3 className="font-heading text-lg sm:text-xl font-semibold text-white leading-snug line-clamp-2">
          {course.title}
        </h3>
        <p className="text-sm text-[#8A8A8A] leading-relaxed line-clamp-2">
          {course.shortDescription}
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-white/[0.07] pt-4">
          <div>
            <span className="block font-mono text-[10px] uppercase tracking-wide text-[#6B6B6B]">
              Học Phí
            </span>
            <span className="font-mono text-base font-bold text-white">
              {course.priceText || 'Liên hệ'}
            </span>
          </div>

          <Link
            href={`/courses/${course.slug}`}
            className="group/cta inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-white transition-colors duration-200 hover:text-[#B8B8B8]"
          >
            <span>Xem chi tiết</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/cta:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
}
