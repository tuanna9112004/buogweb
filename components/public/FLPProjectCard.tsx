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
    <div className="bg-[#101010] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between transition-all duration-300 hover:border-white/25 hover:-translate-y-1 shadow-2xl group">
      <div>
        {/* Cover Thumbnail */}
        <div className="relative aspect-video w-full bg-[#050505] overflow-hidden border-b border-white/10">
          <Image
            src={thumbnail}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized
          />
          {project.bpm && (
            <div className="absolute top-3 right-3 bg-[#050505]/90 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 text-xs font-mono text-white flex items-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-white/70" />
              <span>{project.bpm} BPM</span>
            </div>
          )}
        </div>

        {/* Info Content */}
        <div className="p-6 space-y-3">
          
          {/* Tags */}
          {project.tags && project.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.tags.map((tagId) => {
                const tagObj = allTags.find((t) => t.id === tagId);
                const tagName = tagObj ? tagObj.name : tagId.toUpperCase();
                return (
                  <span
                    key={tagId}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0A0A0A] text-[#737373] border border-white/10"
                  >
                    #{tagName}
                  </span>
                );
              })}
            </div>
          )}

          {/* Title */}
          <h3 className="font-heading text-xl font-bold text-white transition-colors line-clamp-1">
            {project.title}
          </h3>

          {/* Short Description */}
          <p className="text-sm text-[#A8A8A8] line-clamp-2 leading-relaxed">
            {project.shortDescription}
          </p>

        </div>
      </div>

      {/* Footer Price & CTA */}
      <div className="p-6 pt-0 border-t border-white/10 mt-4 flex items-center justify-between">
        <div>
          <span className="text-[11px] text-[#737373] block font-mono uppercase">Giá Project</span>
          <span className="text-lg font-bold text-white font-mono">
            {project.priceText || 'Liên hệ'}
          </span>
        </div>

        <Link
          href={`/projects/${project.slug}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-[#050505] border border-white text-xs font-bold uppercase tracking-wider hover:bg-[#E6E6E6] transition-all"
        >
          <span>Xem chi tiết</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
