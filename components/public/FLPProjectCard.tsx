import Link from 'next/link';
import Image from 'next/image';
import { Project, ProjectTag } from '@/types';
import { ArrowRight, Gauge } from 'lucide-react';

interface FLPProjectCardProps {
  project: Project;
  allTags?: ProjectTag[];
}

export default function FLPProjectCard({ project, allTags = [] }: FLPProjectCardProps) {
  const thumbnail = project.thumbnail || '/media/projects/images/sexy-my-mind-cover.webp';

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-white/[0.07] bg-[#101010] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-white/20 hover:bg-[#131313]">
      {/* Preview — dominant portion of the card */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#050505]">
        <Image
          src={thumbnail}
          alt={project.title}
          fill
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {project.bpm && (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full border border-white/15 bg-black/60 px-2.5 py-1 font-mono text-[11px] text-white backdrop-blur-md">
            <Gauge className="h-3.5 w-3.5 text-white/70" />
            <span>{project.bpm} BPM</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
        {project.tags && project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.tags.map((tagId) => {
              const tagObj = allTags.find((t) => t.id === tagId);
              const tagName = tagObj ? tagObj.name : tagId.toUpperCase();
              return (
                <span
                  key={tagId}
                  className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-[#8A8A8A]"
                >
                  #{tagName}
                </span>
              );
            })}
          </div>
        )}

        <h3 className="font-heading text-lg sm:text-xl font-semibold text-white leading-snug line-clamp-1">
          {project.title}
        </h3>

        <p className="text-sm text-[#8A8A8A] leading-relaxed line-clamp-2">
          {project.shortDescription}
        </p>

        <div className="mt-auto flex items-center justify-between border-t border-white/[0.07] pt-4">
          <div>
            <span className="block font-mono text-[10px] uppercase tracking-wide text-[#6B6B6B]">
              Giá Project
            </span>
            <span className="font-mono text-base font-bold text-white">
              {project.priceText || 'Liên hệ'}
            </span>
          </div>

          <Link
            href={`/projects/${project.slug}`}
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
