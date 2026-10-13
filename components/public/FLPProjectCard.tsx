import Link from 'next/link';
import Image from 'next/image';
import DepthSurface from './DepthSurface';
import { Project, ProjectTag } from '@/types';
import { ArrowRight, Gauge } from 'lucide-react';

interface FLPProjectCardProps {
  project: Project;
  allTags?: ProjectTag[];
  /** Renders a condensed image+title+price card below the `sm` breakpoint (for tight mobile grids). Full card is unaffected at sm+. */
  compact?: boolean;
}

export default function FLPProjectCard({ project, allTags = [], compact = false }: FLPProjectCardProps) {
  const thumbnail = project.thumbnail || '/media/projects/images/sexy-my-mind-cover.webp';

  return (
    <DepthSurface className="h-full"><Link
      href={`/projects/${project.slug}`}
      className={
        compact
          ? 'studio-compact-card group flex h-full flex-col gap-2 overflow-hidden rounded-xl border border-white/[0.1] bg-[#101112] md:gap-0 md:rounded-[20px] md:transition-all md:duration-300 md:hover:-translate-y-1 md:hover:border-white/20'
          : 'studio-card group flex h-full flex-col overflow-hidden rounded-[20px] border border-white/[0.07] bg-[#101010] transition-all duration-300 ease-out hover:-translate-y-1 hover:border-white/20 hover:bg-[#131313]'
      }
    >
      {compact && (
        <div className="md:hidden">
          <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-white/[0.07] bg-[#050505]">
            <Image
              src={thumbnail}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
              sizes="33vw"
              unoptimized={!thumbnail.startsWith('/')}
            />
          </div>
          <div className="p-2">
            <h3 className="text-[11px] font-semibold leading-snug text-white line-clamp-2">
              {project.title}
            </h3>
            <span className="mt-0.5 block font-mono text-[10px] font-bold text-white/70">
              {project.priceText || 'Liên hệ'}
            </span>
          </div>
        </div>
      )}

      <div className={compact ? 'hidden md:contents' : 'contents'}>
        {/* Preview — dominant portion of the card */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#050505]">
          <Image
            src={thumbnail}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={!thumbnail.startsWith('/')}
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
                    className="rounded-full border border-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-[#aaa9a5]"
                  >
                    #{tagName}
                  </span>
                );
              })}
            </div>
          )}

          <h3 className="font-heading text-lg sm:text-xl font-semibold text-white leading-snug line-clamp-2">
            {project.title}
          </h3>

          <p className="text-sm text-[#aaa9a5] leading-relaxed line-clamp-2">
            {project.shortDescription}
          </p>

          <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-3 border-t border-white/[0.07] pt-4">
            <div className="min-w-0 flex-1">
              <span className="block font-mono text-[10px] uppercase tracking-wide text-[#969590]">
                Giá Project
              </span>
              <span className="block font-mono text-base font-bold text-white">
                {project.priceText || 'Liên hệ'}
              </span>
            </div>

            <span className="shrink-0 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-white/15 bg-white/[0.05] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white transition-all duration-200 group-hover:border-white group-hover:bg-white group-hover:text-[#111111]">
              <span>Xem chi tiết</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </div>
    </Link></DepthSurface>
  );
}
