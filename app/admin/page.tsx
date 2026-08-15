import Link from 'next/link';
import {
  getMusicList,
  getProjects,
  getCourses,
  getEquipment,
} from '@/lib/storage/repository';
import DashboardStats from '@/components/admin/DashboardStats';

export const revalidate = 0;

export default function AdminDashboardPage() {
  const musicList = getMusicList(false);
  const projects = getProjects(false);
  const courses = getCourses(false);
  const equipment = getEquipment(false);

  const stats = [
    {
      title: 'Music Tracks',
      count: musicList.length,
      published: musicList.filter((m) => m.published).length,
      icon: 'music' as const,
      href: '/admin/music',
      addHref: '/admin/music/new',
    },
    {
      title: 'FLP Projects',
      count: projects.length,
      published: projects.filter((p) => p.published).length,
      icon: 'projects' as const,
      href: '/admin/projects',
      addHref: '/admin/projects/new',
    },
    {
      title: 'Courses',
      count: courses.length,
      published: courses.filter((c) => c.published).length,
      icon: 'courses' as const,
      href: '/admin/courses',
      addHref: '/admin/courses/new',
    },
    {
      title: 'Equipment',
      count: equipment.length,
      published: equipment.filter((e) => e.published).length,
      icon: 'equipment' as const,
      href: '/admin/equipment',
      addHref: '/admin/equipment/new',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-white">
          DASHBOARD TỔNG QUAN
        </h1>
        <p className="text-sm font-mono text-[#a3a3a3] mt-1">
          Hệ thống quản trị nội dung BUOGS Portfolio CMS
        </p>
      </div>

      {/* Stats Counter Cards Grid */}
      <DashboardStats stats={stats} />

      {/* Quick Actions Shortcuts */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="font-heading text-xl font-bold text-white uppercase">
          Lối Tắt Thao Tác Nhanh
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/admin/music/new"
            className="p-4 rounded-xl bg-[#161616] border border-white/5 hover:border-[#b6ff2e] hover:-translate-y-0.5 active:scale-[0.98] text-left transition-all duration-200 group"
          >
            <span className="font-bold text-white group-hover:text-[#b6ff2e] block text-sm">
              + Đăng Bài Nhạc Mới
            </span>
            <span className="text-xs text-[#a3a3a3] font-mono">Tải MP3, ảnh cover & chọn tag</span>
          </Link>

          <Link
            href="/admin/projects/new"
            className="p-4 rounded-xl bg-[#161616] border border-white/5 hover:border-[#b6ff2e] hover:-translate-y-0.5 active:scale-[0.98] text-left transition-all duration-200 group"
          >
            <span className="font-bold text-white group-hover:text-[#b6ff2e] block text-sm">
              + Thêm FL Studio Project
            </span>
            <span className="text-xs text-[#a3a3a3] font-mono">Tải demo MP3, BPM & Markdown</span>
          </Link>

          <Link
            href="/admin/settings"
            className="p-4 rounded-xl bg-[#161616] border border-white/5 hover:border-[#b6ff2e] hover:-translate-y-0.5 active:scale-[0.98] text-left transition-all duration-200 group"
          >
            <span className="font-bold text-white group-hover:text-[#b6ff2e] block text-sm">
              ⚙ Chỉnh Sửa Thông Tin Liên Hệ
            </span>
            <span className="text-xs text-[#a3a3a3] font-mono">Cập nhật Zalo, Phone & Bio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
