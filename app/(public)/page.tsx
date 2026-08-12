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
import MusicItemCard from '@/components/public/MusicItemCard';
import FLPProjectCard from '@/components/public/FLPProjectCard';
import CourseCard from '@/components/public/CourseCard';
import EquipmentCard from '@/components/public/EquipmentCard';
import { Play, ArrowRight, Phone, Send, Sparkles, Sliders, Music, Headphones, Award } from 'lucide-react';

export const revalidate = 0; // Dynamic server rendering for live JSON edits

export default function HomePage() {
  const settings = getSettings();
  
  // Data lists
  const allMusic = getMusicList(true);
  const musicTags = getMusicTags(true);
  const featuredMusic = allMusic.filter((m) => m.featured).slice(0, 4);

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
      
      {/* HERO SECTION - Form-fitted to 16:9 aspect ratio of backGR-hero.png so 100% of photo is visible */}
      <section className="relative w-full aspect-[16/9] min-h-[500px] flex items-center overflow-hidden border-b border-white/10 bg-[#050505]">
        
        {/* Background Hero Studio Photo (Full 100% Uncropped 16:9 Image) */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <Image
            src="/backGR-hero.png"
            alt="BUOGS DJ Studio Background"
            fill
            className="object-cover object-center filter brightness-[0.95] contrast-[1.05]"
            priority
            unoptimized
          />
          {/* Gentle Overlay Gradient for Typography Legibility on Left */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, #050505 0%, rgba(5,5,5,0.92) 28%, rgba(5,5,5,0.60) 50%, rgba(5,5,5,0.10) 75%, transparent 100%)',
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(0deg, #050505 0%, rgba(5,5,5,0.30) 25%, transparent 100%)',
            }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-28 sm:pt-32 lg:pt-36 relative z-10">
          <div className="max-w-xl space-y-4 sm:space-y-6 text-center lg:text-left">
            
            {/* Monochrome Luxury Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/15 backdrop-blur-md text-xs font-mono tracking-widest text-[#CCCCCC] uppercase">
              <Sparkles className="w-3.5 h-3.5 text-white/60" />
              <span>OFFICIAL DJ / PRODUCER PORTFOLIO</span>
            </div>

            {/* Title & Subtitle */}
            <div className="space-y-3">
              <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight text-white uppercase leading-none">
                {settings.brandName || 'BUOGS'}
              </h1>
              <p className="font-heading text-xl sm:text-2xl lg:text-3xl text-[#E5E5E5] tracking-widest uppercase">
                {settings.tagline || 'DJ / PRODUCER'}
              </p>
              <p className="text-xs font-mono text-[#8A8A8A] uppercase tracking-widest">
                {settings.genresText || 'VINAHOUSE · HOUSE LAK · VINATRANCE'}
              </p>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base text-[#A8A8A8] max-w-lg leading-relaxed mx-auto lg:mx-0">
              {settings.about || 'Chuyên nghiệp trong âm nhạc điện tử, cung cấp các FL Studio Project chất lượng cao, đào tạo DJ/Producer thực chiến và cung cấp thiết bị DJ cao cấp.'}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/music"
                className="inline-flex items-center gap-2 px-7 py-3.5 sm:px-8 sm:py-4 rounded-full bg-white text-[#050505] font-bold text-xs sm:text-sm tracking-wider uppercase hover:bg-[#E6E6E6] transition-all transform hover:-translate-y-0.5 shadow-[0_10px_40px_rgba(0,0,0,0.30)]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Nghe Nhạc Trực Tiếp</span>
              </Link>

              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-7 py-3.5 sm:px-8 sm:py-4 rounded-full bg-white/[0.04] border border-white/[0.18] text-white font-semibold text-xs sm:text-sm tracking-wider uppercase hover:bg-white/10 hover:border-white/35 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Liên Hệ Booking</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED MUSIC SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="text-xs font-mono text-[#A8A8A8] uppercase tracking-widest mb-1 flex items-center gap-2">
              <Music className="w-4 h-4 text-white" />
              <span>MUSIC SHOWCASE</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
              BÀI NHẠC NỔI BẬT
            </h2>
          </div>

          <Link
            href="/music"
            className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-white hover:text-[#A8A8A8] transition-colors"
          >
            <span>Xem Tất Cả Bài Nhạc</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredMusic.length > 0 ? (
          <div className="space-y-4">
            {featuredMusic.map((track) => (
              <MusicItemCard key={track.id} track={track} allTags={musicTags} />
            ))}
          </div>
        ) : (
          <p className="text-sm font-mono text-[#737373] py-8 text-center bg-[#0A0A0A] rounded-2xl border border-white/10">
            Chưa có bài nhạc nổi bật.
          </p>
        )}
      </section>

      {/* FEATURED FLP PROJECTS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="text-xs font-mono text-[#A8A8A8] uppercase tracking-widest mb-1 flex items-center gap-2">
              <Headphones className="w-4 h-4 text-white" />
              <span>FL STUDIO PROJECTS</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
              PROJECT NỔI BẬT
            </h2>
          </div>

          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-white hover:text-[#A8A8A8] transition-colors"
          >
            <span>Xem Tất Cả Project</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <FLPProjectCard key={project.id} project={project} allTags={projectTags} />
            ))}
          </div>
        ) : (
          <p className="text-sm font-mono text-[#737373] py-8 text-center bg-[#0A0A0A] rounded-2xl border border-white/10">
            Chưa có project nổi bật.
          </p>
        )}
      </section>

      {/* COURSES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="text-xs font-mono text-[#A8A8A8] uppercase tracking-widest mb-1 flex items-center gap-2">
              <Award className="w-4 h-4 text-white" />
              <span>ACADEMY & TRAINING</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
              KHÓA HỌC DJ / PRODUCER
            </h2>
          </div>

          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-white hover:text-[#A8A8A8] transition-colors"
          >
            <span>Xem Tất Cả Khóa Học</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <p className="text-sm font-mono text-[#737373] py-8 text-center bg-[#0A0A0A] rounded-2xl border border-white/10">
            Chưa có khóa học nổi bật.
          </p>
        )}
      </section>

      {/* EQUIPMENT SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="text-xs font-mono text-[#A8A8A8] uppercase tracking-widest mb-1 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-white" />
              <span>EQUIPMENT CATALOG</span>
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
              THIẾT BỊ DJ / PRODUCER
            </h2>
          </div>

          <Link
            href="/equipment"
            className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase tracking-wider text-white hover:text-[#A8A8A8] transition-colors"
          >
            <span>Xem Tất Cả Thiết Bị</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {featuredEquipment.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredEquipment.map((eq) => (
              <EquipmentCard key={eq.id} equipment={eq} categories={equipmentCategories} />
            ))}
          </div>
        ) : (
          <p className="text-sm font-mono text-[#737373] py-8 text-center bg-[#0A0A0A] rounded-2xl border border-white/10">
            Chưa có thiết bị nổi bật.
          </p>
        )}
      </section>

      {/* ABOUT BUOGS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 sm:p-12 space-y-6 relative overflow-hidden">
          <div className="text-xs font-mono text-[#A8A8A8] uppercase tracking-widest">
            ABOUT {settings.brandName || 'BUOGS'}
          </div>
          
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white">
            GIỚI THIỆU THƯƠNG HIỆU
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
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0A0A0A] border border-white/15 rounded-3xl p-8 sm:p-12 text-center space-y-8 shadow-2xl relative overflow-hidden">
          <div className="space-y-3">
            <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-white tracking-wider uppercase">
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
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white text-[#050505] font-bold text-xs sm:text-sm tracking-wide uppercase hover:bg-[#E6E6E6] transition-all transform hover:-translate-y-0.5 shadow-xl"
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
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-white/[0.04] border border-white/18 text-white font-bold text-xs sm:text-sm tracking-wide uppercase hover:bg-white/10 hover:border-white/35 transition-all"
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
        </div>
      </section>

    </div>
  );
}
