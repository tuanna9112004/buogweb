import Link from 'next/link';
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
import { AnimatedMarqueeHero } from '@/components/ui/animated-marquee-hero';
import { ArrowRight, Phone, Send, Sliders, Music, Headphones, Award } from 'lucide-react';

const HERO_MARQUEE_IMAGES = [
  '/hero-marquee/buogs-01.jpg',
  '/hero-marquee/buogs-02.jpg',
  '/hero-marquee/buogs-03.jpg',
  '/hero-marquee/buogs-04.jpg',
  '/hero-marquee/buogs-05.jpg',
  '/hero-marquee/buogs-06.jpg',
];

export const revalidate = 0; // Dynamic server rendering for live JSON edits

export default function HomePage() {
  const settings = getSettings();
  
  // Data lists
  const allMusic = getMusicList(true);
  const musicTags = getMusicTags(true);
  const featuredMusic = allMusic.filter((m) => m.featured).slice(0, 3);

  const allProjects = getProjects(true);
  const projectTags = getProjectTags(true);
  const featuredProjects = allProjects.filter((p) => p.featured).slice(0, 3);

  const allCourses = getCourses(true);
  const featuredCourses = allCourses.filter((c) => c.featured).slice(0, 3);

  const allEquipment = getEquipment(true);
  const equipmentCategories = getEquipmentCategories(true);
  const featuredEquipment = allEquipment.filter((e) => e.featured).slice(0, 4);

  return (
    <div className="space-y-24 pb-20">
      
      {/* HERO SECTION - Animated marquee of BUOGS photos beneath centered copy */}
      <AnimatedMarqueeHero
        tagline={settings.genresText || 'VINAHOUSE · HOUSE LAK · VINATRANCE'}
        brandTitle={settings.brandName || 'BUOGS'}
        roleText={settings.tagline || 'DJ / Producer'}
        description={
          settings.about ||
          'Chuyên nghiệp trong âm nhạc điện tử, cung cấp các FL Studio Project chất lượng cao, đào tạo DJ/Producer thực chiến và cung cấp thiết bị DJ cao cấp.'
        }
        ctaText="Nghe Nhạc Trực Tiếp"
        ctaHref="/music"
        images={HERO_MARQUEE_IMAGES}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="divider-fade" />
      </div>

      {/* FEATURED MUSIC SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
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
            className="mt-1 inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-white hover:text-[#A8A8A8] transition-colors duration-300"
          >
            <span>Xem Tất Cả Bài Nhạc</span>
            <ArrowRight className="w-4 h-4" />
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Reveal className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-start gap-4 sm:gap-6">
            <span className="index-numeral hidden sm:block text-6xl sm:text-7xl select-none">02</span>
            <div>
              <div className="kicker mb-1.5 flex items-center gap-2 text-[#A8A8A8]">
                <Headphones className="w-3.5 h-3.5 text-white" />
                <span>FL Studio Projects</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
                PROJECT NỔI BẬT
              </h2>
            </div>
          </div>

          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-white hover:text-[#A8A8A8] transition-colors duration-300"
          >
            <span>Xem Tất Cả Project</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>

        {featuredProjects.length > 0 ? (
          <Reveal delay={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <FLPProjectCard key={project.id} project={project} allTags={projectTags} />
            ))}
          </Reveal>
        ) : (
          <p className="text-sm font-mono text-[#737373] py-8 text-center bg-[#0A0A0A] rounded-2xl border border-white/10">
            Chưa có project nổi bật.
          </p>
        )}
      </section>

      {/* COURSES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Reveal className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-start gap-4 sm:gap-6">
            <span className="index-numeral hidden sm:block text-6xl sm:text-7xl select-none">03</span>
            <div>
              <div className="kicker mb-1.5 flex items-center gap-2 text-[#A8A8A8]">
                <Award className="w-3.5 h-3.5 text-white" />
                <span>Academy & Training</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
                DẠY DJ / PRODUCER
              </h2>
            </div>
          </div>

          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-white hover:text-[#A8A8A8] transition-colors duration-300"
          >
            <span>Xem Tất Cả Khóa Học</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>

        {featuredCourses.length > 0 ? (
          <Reveal delay={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </Reveal>
        ) : (
          <p className="text-sm font-mono text-[#737373] py-8 text-center bg-[#0A0A0A] rounded-2xl border border-white/10">
            Chưa có khóa học nổi bật.
          </p>
        )}
      </section>

      {/* EQUIPMENT SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <Reveal className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-start gap-4 sm:gap-6">
            <span className="index-numeral hidden sm:block text-6xl sm:text-7xl select-none">04</span>
            <div>
              <div className="kicker mb-1.5 flex items-center gap-2 text-[#A8A8A8]">
                <Sliders className="w-3.5 h-3.5 text-white" />
                <span>Equipment Catalog</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
                THIẾT BỊ DJ / PRODUCER
              </h2>
            </div>
          </div>

          <Link
            href="/equipment"
            className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-white hover:text-[#A8A8A8] transition-colors duration-300"
          >
            <span>Xem Tất Cả Thiết Bị</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </Reveal>

        {featuredEquipment.length > 0 ? (
          <Reveal delay={0.1} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredEquipment.map((eq) => (
              <EquipmentCard key={eq.id} equipment={eq} categories={equipmentCategories} />
            ))}
          </Reveal>
        ) : (
          <p className="text-sm font-mono text-[#737373] py-8 text-center bg-[#0A0A0A] rounded-2xl border border-white/10">
            Chưa có thiết bị nổi bật.
          </p>
        )}
      </section>

      {/* ABOUT BUOGS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Reveal className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 sm:p-12 space-y-6 relative overflow-hidden">
          <div className="kicker text-[#A8A8A8]">
            About {settings.brandName || 'BUOGS'}
          </div>

          <h2 className="font-heading text-3xl sm:text-5xl font-bold text-white max-w-2xl">
            Giới Thiệu Thương Hiệu
          </h2>

          <p className="text-[#A8A8A8] leading-relaxed text-base sm:text-lg max-w-4xl">
            {settings.about}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-white/10 font-mono text-xs">
            <div>
              <span className="text-white block text-lg font-bold">100% DJ/PRODUCER</span>
              <span className="text-[#737373]">Đặc tả chuẩn phong cách Club</span>
            </div>
            <div>
              <span className="text-white block text-lg font-bold">FL STUDIO PROJECTS</span>
              <span className="text-[#737373]">Preset, Sample Pack & Mixing</span>
            </div>
            <div>
              <span className="text-white block text-lg font-bold">1-ON-1 TRAINING</span>
              <span className="text-[#737373]">Thực hành thiết bị Pioneer DJ</span>
            </div>
          </div>
        </Reveal>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="bg-[#0A0A0A] border border-white/15 rounded-3xl p-8 sm:p-12 text-center space-y-8 shadow-2xl relative overflow-hidden">
          <div className="space-y-3">
            <h2 className="font-heading text-3xl sm:text-5xl font-bold text-white tracking-tight uppercase">
              {settings.contactHeading || 'BOOKING / MUSIC / PROJECT / COURSE / EQUIPMENT'}
            </h2>
            <p className="text-sm font-mono text-[#A8A8A8] max-w-xl mx-auto">
              Liên hệ trực tiếp qua Zalo, Facebook Messenger hoặc Hotline để được tư vấn chi tiết và giải đáp nhanh chóng.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {settings.zaloUrl && (
              <a
                href={settings.zaloUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-[#050505] font-bold text-xs sm:text-sm tracking-wide uppercase hover:bg-[#E6E6E6] transition-all duration-300 transform hover:-translate-y-0.5 active:scale-[0.97] shadow-xl"
              >
                <Send className="w-4 h-4" />
                <span>Zalo Official</span>
              </a>
            )}

            {settings.facebookUrl && (
              <a
                href={settings.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/[0.04] border border-white/18 text-white font-bold text-xs sm:text-sm tracking-wide uppercase hover:bg-white/10 hover:border-white/35 transition-all duration-300 active:scale-[0.97]"
              >
                <Send className="w-4 h-4" />
                <span>Facebook Messenger</span>
              </a>
            )}

            {settings.phone && (
              <a
                href={`tel:${settings.phone}`}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/[0.04] border border-white/18 text-white font-bold text-xs sm:text-sm tracking-wide uppercase hover:bg-white/10 hover:border-white/35 transition-all"
              >
                <Phone className="w-4 h-4 text-white" />
                <span>Hotline: {settings.phone}</span>
              </a>
            )}
          </div>
        </Reveal>
      </section>

    </div>
  );
}
