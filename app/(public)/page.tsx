import StudioHero from '@/components/public/StudioHero';
import StudentShowcase from '@/components/public/StudentShowcase';
import { getStudents } from '@/lib/storage/students';
import {
  getMusicList,
  getMusicTags,
  getProjects,
  getProjectTags,
  getCourses,
  getSettings,
} from '@/lib/storage/repository';
import MusicShowcaseCard from '@/components/public/MusicShowcaseCard';
import FLPProjectCard from '@/components/public/FLPProjectCard';
import CourseCard from '@/components/public/CourseCard';
import Reveal from '@/components/public/Reveal';
import SectionHeading from '@/components/public/SectionHeading';
import { Music, Headphones, Award } from 'lucide-react';

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

  return (
    <div className="home-studio space-y-20 sm:space-y-28 lg:space-y-32 pb-12 sm:pb-16">

      <StudioHero settings={settings} />

      {/* FEATURED MUSIC SECTION */}
      <section id="featured-music" className="section-music max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
        <Reveal><SectionHeading number="01" icon={Music} eyebrow="Selected sounds" title="Âm nhạc nổi bật" ctaLabel="Tất cả bài nhạc" ctaHref="/music" /></Reveal>

        {featuredMusic.length > 0 ? (
          <Reveal delay={0.1} className="music-showcase-grid">
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
            title="Projects dành cho bạn"
            ctaLabel="Xem Tất Cả Project"
            ctaHref="/projects"
          />
        </Reveal>

        {featuredProjects.length > 0 ? (
          <Reveal delay={0.1} className="grid grid-cols-3 gap-3 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
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
            title="Tạo nên âm thanh của bạn"
            ctaLabel="Xem Tất Cả Khóa Học"
            ctaHref="/courses"
          />
        </Reveal>

        {featuredCourses.length > 0 ? (
          <Reveal delay={0.1} className="grid grid-cols-3 gap-3 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
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
      <StudentShowcase students={getStudents(true)} />
    </div>
  );
}
