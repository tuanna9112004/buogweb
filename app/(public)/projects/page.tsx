import { getProjects, getProjectTags } from '@/lib/storage/repository';
import FLPProjectCard from '@/components/public/FLPProjectCard';
import Reveal from '@/components/public/Reveal';
import { Headphones } from 'lucide-react';

export const revalidate = 0;

export default function ProjectsPage() {
  const projects = getProjects(true);
  const tags = getProjectTags(true);

  return (
    <div className="section-page-projects max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 space-y-8">
      {/* Header Banner */}
      <Reveal className="space-y-3 border-b border-white/10 pb-6">
        <div className="text-xs font-mono text-[#A8A8A8] uppercase tracking-widest flex items-center gap-2">
          <Headphones className="w-4 h-4 text-white" />
          <span>FL STUDIO PROJECTS CATALOG</span>
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-white">
          FLP PROJECTS SHOWCASE
        </h1>
        <p className="text-sm text-[#A8A8A8] max-w-2xl">
          Bộ sưu tập FL Studio Project độc quyền chuẩn Club dành cho các Producer. Đầy đủ mixing, mastering, sample packs và VST presets.
        </p>
      </Reveal>

      {/* Grid Layout (Desktop 3, Tablet 2, Mobile 1) */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <Reveal key={project.id} delay={Math.min(i * 0.05, 0.3)} distance={16}>
              <FLPProjectCard project={project} allTags={tags} />
            </Reveal>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-[#0A0A0A] rounded-2xl border border-white/10 space-y-2">
          <p className="text-base font-semibold text-white">Chưa có project nào được xuất bản</p>
          <p className="text-xs font-mono text-[#737373]">Vui lòng quay lại sau.</p>
        </div>
      )}
    </div>
  );
}
