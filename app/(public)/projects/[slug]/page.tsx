import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getProjectBySlug, getProjects, getProjectTags, getSettings } from '@/lib/storage/repository';
import TrackPlayerRow from '@/components/public/TrackPlayerRow';
import MarkdownRenderer from '@/components/public/MarkdownRenderer';
import FLPProjectCard from '@/components/public/FLPProjectCard';
import { Gauge, Send, ArrowLeft, Headphones, CheckCircle2 } from 'lucide-react';

export const revalidate = 0;

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug, true);

  if (!project) {
    notFound();
  }

  const settings = getSettings();
  const allTags = getProjectTags(true);
  const allProjects = getProjects(true);

  // Related projects (3 items, excluding current)
  const relatedProjects = allProjects.filter((p) => p.id !== project.id).slice(0, 3);

  // Adapt project.demoAudio to the shared Music shape for the demo player
  const demoTrack = project.demoAudio
    ? {
        id: `demo-${project.id}`,
        title: `Demo Audio - ${project.title}`,
        artists: 'BUOGS',
        audio: project.demoAudio,
        cover: project.thumbnail,
        tags: project.tags,
        publishDate: '',
        featured: false,
        published: true,
        sortOrder: 0,
        createdAt: '',
        updatedAt: '',
      }
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10 space-y-12">
      {/* Back link */}
      <Link
        href="/projects"
        className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#A8A8A8] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại danh sách Project</span>
      </Link>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Image Gallery & Demo Player */}
        <div className="lg:col-span-7 space-y-6">
          <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#080808] border border-white/10 shadow-2xl">
            <Image
              src={project.thumbnail}
              alt={project.title}
              fill
              className="object-cover"
              sizes="(max-width: 1200px) 100vw, 800px"
              priority
              unoptimized
            />
          </div>

          {/* Demo Audio Player */}
          {demoTrack && (
            <div className="space-y-3 bg-[#0A0A0A] p-5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2 text-xs font-mono text-white/80 uppercase">
                <Headphones className="w-4 h-4 text-white" />
                <span>Nghe thử Demo Audio Project</span>
              </div>
              <TrackPlayerRow track={demoTrack} />
            </div>
          )}
        </div>

        {/* Right Column: Project Meta & Contact CTAs */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Header & Tags */}
          <div className="space-y-3">
            {project.tags && project.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tagId) => {
                  const tagObj = allTags.find((t) => t.id === tagId);
                  return (
                    <span
                      key={tagId}
                      className="text-xs font-mono px-3 py-1 rounded-md bg-[#0A0A0A] text-white border border-white/10"
                    >
                      #{tagObj ? tagObj.name : tagId.toUpperCase()}
                    </span>
                  );
                })}
              </div>
            )}

            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
              {project.title}
            </h1>

            {project.bpm && (
              <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#737373] bg-[#0A0A0A] px-3 py-1.5 rounded-full border border-white/10">
                <Gauge className="w-3.5 h-3.5 text-white/70" />
                <span>BPM: {project.bpm}</span>
              </div>
            )}
          </div>

          {/* Short Description */}
          <p className="text-sm text-[#A8A8A8] leading-relaxed">
            {project.shortDescription}
          </p>

          {/* Price Box & CTA */}
          <div className="bg-[#0A0A0A] border border-white/15 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div>
              <span className="text-xs font-mono text-[#737373] uppercase block">Giá sở hữu</span>
              <span className="font-mono text-3xl font-extrabold text-white">
                {project.priceText || 'Liên hệ'}
              </span>
            </div>

            <div className="space-y-2 text-xs text-[#A8A8A8] font-mono border-t border-white/10 pt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Bao gồm đầy đủ FLP + Samples + Presets</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Gửi link tải Drive tốc độ cao ngay sau tư vấn</span>
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
                  <span>Liên Hệ Qua Zalo Mua Project</span>
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

      {/* Full Content Description (Markdown) */}
      <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-6 sm:p-10 space-y-6">
        <h2 className="font-heading text-2xl font-bold text-white border-b border-white/10 pb-4 uppercase">
          Chi Tiết Project & Hướng Dẫn Sử Dụng
        </h2>
        <MarkdownRenderer content={project.content} />
      </div>

      {/* Related Projects Section */}
      {relatedProjects.length > 0 && (
        <div className="space-y-6 pt-6">
          <h2 className="font-heading text-2xl font-bold text-white uppercase border-b border-white/10 pb-4">
            FL Studio Projects Liên Quan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProjects.map((rel) => (
              <FLPProjectCard key={rel.id} project={rel} allTags={allTags} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
