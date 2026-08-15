import Link from 'next/link';
import Image from 'next/image';
import {
  getMusicList,
  getMusicTags,
  getProjects,
  getProjectTags,
  getCourses,
  getEquipment,
  getEquipmentCategories,
  getSettings,
} from '@/lib/storage/repository';
import MusicShowcaseCard from '@/components/public/MusicShowcaseCard';
import FLPProjectCard from '@/components/public/FLPProjectCard';
import CourseCard from '@/components/public/CourseCard';
import EquipmentCard from '@/components/public/EquipmentCard';
import Reveal from '@/components/public/Reveal';
import SectionHeading from '@/components/public/SectionHeading';
import HeroContactButton from '@/components/public/HeroContactButton';
import { ArrowRight, Sliders, Music, Headphones, Award, Play, Sparkles } from 'lucide-react';

export const revalidate = 0; // Dynamic server rendering for live JSON edits

export default function HomePage() {
  const settings = getSettings();
  
  // Data lists
  const allMusic = getMusicList(true);
  const musicTags = getMusicTags(true);
  const featuredMusic = allMusic.filter((m) => m.featured).slice(0, settings.featuredMusicCount);

  const allProjects = getProjects(true);
  const projectTags = getProjectTags(true);
  const featuredProjects = allProjects.filter((p) => p.featured).slice(0, settings.featuredProjectsCount);

  const allCourses = getCourses(true);
  const featuredCourses = allCourses.filter((c) => c.featured).slice(0, settings.featuredCoursesCount);

  const allEquipment = getEquipment(true);
  const equipmentCategories = getEquipmentCategories(true);
  const featuredEquipment = allEquipment.filter((e) => e.featured).slice(0, settings.featuredEquipmentCount);

  return (
    <div className="space-y-20 sm:space-y-28 lg:space-y-36 pb-24">

      {/* HERO SECTION — dark premium editorial hero: css-composed depth layers + a fluid 40/12/48 content grid so text and portrait never collide */}
      <section className="relative w-full overflow-hidden min-h-screen bg-[#080808]">
        {/* Layer 1 — base + portrait photo (subject nudged left/up via object-position since it's a flat photo, not an isolated cutout) */}
        <Image
          src="/anh2-169.png"
          alt="BUOGS hero background"
          fill
          className="object-cover object-[68%_30%] lg:object-[70%_22%]"
          priority
          unoptimized
        />

        {/* Layer 2 — soft radial light behind head/shoulders */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at 72% 44%, rgba(160,160,160,0.32) 0%, rgba(90,90,90,0.18) 28%, rgba(20,20,20,0.05) 60%, transparent 74%)',
          }}
        />

        {/* Layer 3 — left dark gradient so text stays legible */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.78) 28%, rgba(0,0,0,0.30) 53%, transparent 75%)',
          }}
        />

        {/* Layer 4 — vignette */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.42) 100%)',
          }}
        />

        {/* Layer 5 — cinematic grain */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-soft-light"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />

        {/* Bottom fade into the next section */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 lg:h-32 bg-gradient-to-b from-transparent to-[#080808]" />

        <div className="relative z-10 min-h-screen w-[calc(100%-40px)] sm:w-[calc(100%-64px)] max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-[40%_12%_48%] items-center pt-28 lg:pt-0">
          <div className="max-w-[520px] text-center lg:text-left mx-auto lg:mx-0">

            {/* Eyebrow */}
            <Reveal delay={0} duration={0.42} distance={14}>
              <div className="inline-flex h-[26px] items-center gap-1.5 px-[14px] rounded-full bg-white/[0.02] border border-white/[0.14] backdrop-blur-md text-[9px] font-mono font-medium tracking-[2.1px] text-white/65 uppercase">
                <Sparkles className="w-3 h-3 text-white/50" />
                <span>OFFICIAL DJ / PRODUCER PORTFOLIO</span>
              </div>
            </Reveal>

            {/* Title */}
            <Reveal delay={0.08} duration={0.42} distance={14} className="mt-[32px]">
              <h1 className="font-heading text-5xl sm:text-6xl lg:text-[76px] font-medium tracking-[-2.5px] text-[#F4F2EE] uppercase leading-[0.95] lg:max-w-[360px]">
                {settings.brandName || 'BUOGS'}
              </h1>
            </Reveal>

            {/* Subtitle & genre line */}
            <Reveal delay={0.14} duration={0.42} distance={14} className="mt-3">
              <p className="font-heading italic font-normal text-xl lg:text-2xl text-white/92 tracking-normal">
                {settings.tagline || 'DJ / Producer'}
              </p>
              <p className="mt-[14px] text-[10px] font-mono font-medium text-white/55 uppercase tracking-[3.2px]">
                {settings.genresText || 'VINAHOUSE · HOUSE LAK · VINATRANCE'}
              </p>
            </Reveal>

            {/* Description */}
            <Reveal delay={0.22} duration={0.42} distance={14} className="hidden sm:block mt-[32px]">
              <p className="text-[15px] text-white/72 max-w-[500px] mx-auto lg:mx-0 leading-[1.65]">
                {settings.about || 'BUOGS là DJ / Producer chuyên nghiệp trong lĩnh vực âm nhạc điện tử, cung cấp các sản phẩm FL Studio chất lượng cao, đào tạo DJ/Producer chuyên sâu và tư vấn thiết bị DJ cao cấp.'}
              </p>
            </Reveal>

            {/* CTAs */}
            <Reveal delay={0.28} duration={0.42} distance={14} className="mt-7">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <Link
                  href="/music"
                  className="inline-flex h-12 items-center gap-2.5 pl-2 pr-5 rounded-full bg-[#F1EFEA] text-[#111111] text-xs font-bold uppercase tracking-[0.2px] transition-all duration-200 hover:bg-white hover:-translate-y-0.5 active:scale-[0.97]"
                >
                  <span className="flex items-center justify-center w-[30px] h-[30px] rounded-full bg-[#111111] text-[#F1EFEA]">
                    <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                  </span>
                  <span>Nghe Nhạc</span>
                </Link>

                <HeroContactButton />
              </div>
            </Reveal>
          </div>

          {/* Empty breathing-space column — keeps text clear of the portrait */}
          <div />
          <div />
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="divider-fade" />
      </div>

      {/* FEATURED MUSIC SECTION */}
      <section className="section-music max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        <Reveal className="flex flex-col items-center text-center gap-3">
          <div className="kicker flex items-center justify-center gap-2 text-[#A8A8A8]">
            <Music className="w-3.5 h-3.5 text-white" />
            <span>Music Showcase</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
            BÀI NHẠC NỔI BẬT
          </h2>

          <Link
            href="/music"
            className="group mt-1 inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-white hover:text-[#A8A8A8] transition-colors duration-300"
          >
            <span>Xem Tất Cả Bài Nhạc</span>
            <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </Reveal>

        {featuredMusic.length > 0 ? (
          <Reveal delay={0.1} className="grid grid-cols-3 gap-5 sm:gap-10 items-center py-6 sm:py-10">
            {featuredMusic.map((track, i) => (
              <MusicShowcaseCard
                key={track.id}
                track={track}
                allTags={musicTags}
                highlight={i === 1}
              />
            ))}
          </Reveal>
        ) : (
          <p className="text-sm font-mono text-[#737373] py-8 text-center bg-[#0A0A0A] rounded-2xl border border-white/10">
            Chưa có bài nhạc nổi bật.
          </p>
        )}
      </section>

      {/* FEATURED FLP PROJECTS SECTION */}
      <section className="section-projects max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        <Reveal>
          <SectionHeading
            number="02"
            icon={Headphones}
            eyebrow="FL Studio Projects"
            title="PROJECT NỔI BẬT"
            ctaLabel="Xem Tất Cả Project"
            ctaHref="/projects"
          />
        </Reveal>

        {featuredProjects.length > 0 ? (
          <Reveal delay={0.1} className="grid grid-cols-3 gap-3 sm:grid-cols-1 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project) => (
              <FLPProjectCard key={project.id} project={project} allTags={projectTags} compact />
            ))}
          </Reveal>
        ) : (
          <p className="text-sm font-mono text-[#737373] py-8 text-center bg-[#0A0A0A] rounded-2xl border border-white/10">
            Chưa có project nổi bật.
          </p>
        )}
      </section>

      {/* COURSES SECTION */}
      <section className="section-courses max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        <Reveal>
          <SectionHeading
            number="03"
            icon={Award}
            eyebrow="Academy & Training"
            title="DẠY DJ / PRODUCER"
            ctaLabel="Xem Tất Cả Khóa Học"
            ctaHref="/courses"
          />
        </Reveal>

        {featuredCourses.length > 0 ? (
          <Reveal delay={0.1} className="grid grid-cols-3 gap-3 sm:grid-cols-1 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} compact />
            ))}
          </Reveal>
        ) : (
          <p className="text-sm font-mono text-[#737373] py-8 text-center bg-[#0A0A0A] rounded-2xl border border-white/10">
            Chưa có khóa học nổi bật.
          </p>
        )}
      </section>

      {/* EQUIPMENT SECTION */}
      <section className="section-equipment max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        <Reveal>
          <SectionHeading
            number="04"
            icon={Sliders}
            eyebrow="Equipment Catalog"
            title="THIẾT BỊ DJ / PRODUCER"
            ctaLabel="Xem Tất Cả Thiết Bị"
            ctaHref="/equipment"
          />
        </Reveal>

        {featuredEquipment.length > 0 ? (
          <Reveal delay={0.1} className="grid grid-cols-4 gap-2.5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {featuredEquipment.map((eq) => (
              <EquipmentCard key={eq.id} equipment={eq} categories={equipmentCategories} compact />
            ))}
          </Reveal>
        ) : (
          <p className="text-sm font-mono text-[#737373] py-8 text-center bg-[#0A0A0A] rounded-2xl border border-white/10">
            Chưa có thiết bị nổi bật.
          </p>
        )}
      </section>

      {/* ABOUT BUOGS SECTION — Brand statement: left manifesto, right capability list */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0A0A0A] p-8 sm:p-14 lg:p-16">
          <div className="pointer-events-none absolute -top-1/3 -right-1/4 h-[560px] w-[560px] rounded-full bg-white/[0.04] blur-[120px]" />

          <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div className="space-y-6">
              <div className="kicker text-[#A8A8A8]">About {settings.brandName || 'BUOGS'}</div>
              <h2 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.05] max-w-xl">
                Giới Thiệu
                <br />
                Thương Hiệu
              </h2>
              <p className="max-w-xl text-base leading-relaxed text-[#A8A8A8] sm:text-lg">
                {settings.about}
              </p>
            </div>

            <div className="space-y-5 lg:pt-2">
              {[
                { title: '100% DJ / PRODUCER', desc: 'Đặc tả chuẩn phong cách Club' },
                { title: 'FL STUDIO PROJECTS', desc: 'Preset, Sample Pack & Mixing' },
                { title: '1-ON-1 TRAINING', desc: 'Thực hành thiết bị Pioneer DJ' },
              ].map((item, i) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 border-t border-white/[0.08] pt-5 first:border-t-0 first:pt-0"
                >
                  <span className="index-numeral flex-shrink-0 select-none text-3xl sm:text-4xl">
                    0{i + 1}
                  </span>
                  <div>
                    <span className="block font-heading text-lg sm:text-xl font-bold text-white">
                      {item.title}
                    </span>
                    <span className="mt-1 block font-mono text-[11px] uppercase tracking-wide text-[#737373]">
                      {item.desc}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

    </div>
  );
}
