import Link from 'next/link';
import {
  getMusicList,
  getProjects,
  getCourses,
  getEquipment,
} from '@/lib/storage/repository';
import { Music2, Headphones, GraduationCap, Sliders, Plus, ExternalLink } from 'lucide-react';

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
      icon: Music2,
      href: '/admin/music',
      addHref: '/admin/music/new',
    },
    {
      title: 'FLP Projects',
      count: projects.length,
      published: projects.filter((p) => p.published).length,
      icon: Headphones,
      href: '/admin/projects',
      addHref: '/admin/projects/new',
    },
    {
      title: 'Courses',
      count: courses.length,
      published: courses.filter((c) => c.published).length,
      icon: GraduationCap,
      href: '/admin/courses',
      addHref: '/admin/courses/new',
    },
    {
      title: 'Equipment',
      count: equipment.length,
      published: equipment.filter((e) => e.published).length,
      icon: Sliders,
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl hover:border-[#b6ff2e]/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-[#161616] border border-white/10 flex items-center justify-center text-[#b6ff2e]">
                  <Icon className="w-6 h-6" />
                </div>
                <Link
                  href={stat.addHref}
                  className="p-2 rounded-lg bg-[#b6ff2e]/10 text-[#b6ff2e] hover:bg-[#b6ff2e] hover:text-black transition-colors"
                  title="Thêm mới"
                >
                  <Plus className="w-4 h-4" />
                </Link>
              </div>

              <div>
                <span className="text-xs font-mono text-[#a3a3a3] uppercase block">
                  {stat.title}
                </span>
                <span className="font-heading text-4xl font-extrabold text-white">
                  {stat.count}
                </span>
                <span className="block text-xs text-[#a3a3a3] font-mono mt-1">
                  Đã xuất bản: <strong className="text-[#b6ff2e]">{stat.published}</strong>
                </span>
              </div>

              <div className="pt-2 border-t border-white/5">
                <Link
                  href={stat.href}
                  className="text-xs font-mono text-[#b6ff2e] hover:underline inline-flex items-center gap-1"
                >
                  <span>Quản lý danh sách</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions Shortcuts */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4">
        <h2 className="font-heading text-xl font-bold text-white uppercase">
          Lối Tắt Thao Tác Nhanh
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/admin/music/new"
            className="p-4 rounded-xl bg-[#161616] border border-white/5 hover:border-[#b6ff2e] text-left transition-all group"
          >
            <span className="font-bold text-white group-hover:text-[#b6ff2e] block text-sm">
              + Đăng Bài Nhạc Mới
            </span>
            <span className="text-xs text-[#a3a3a3] font-mono">Tải MP3, ảnh cover & chọn tag</span>
          </Link>

          <Link
            href="/admin/projects/new"
            className="p-4 rounded-xl bg-[#161616] border border-white/5 hover:border-[#b6ff2e] text-left transition-all group"
          >
            <span className="font-bold text-white group-hover:text-[#b6ff2e] block text-sm">
              + Thêm FL Studio Project
            </span>
            <span className="text-xs text-[#a3a3a3] font-mono">Tải demo MP3, BPM & Markdown</span>
          </Link>

          <Link
            href="/admin/settings"
            className="p-4 rounded-xl bg-[#161616] border border-white/5 hover:border-[#b6ff2e] text-left transition-all group"
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
