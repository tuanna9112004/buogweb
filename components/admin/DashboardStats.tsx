'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, ExternalLink, Music2, Headphones, GraduationCap, Sliders } from 'lucide-react';

const ICONS = {
  music: Music2,
  projects: Headphones,
  courses: GraduationCap,
  equipment: Sliders,
};

interface Stat {
  title: string;
  count: number;
  published: number;
  icon: keyof typeof ICONS;
  href: string;
  addHref: string;
}

export default function DashboardStats({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, idx) => {
        const Icon = ICONS[stat.icon];
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: idx * 0.06, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ y: -3 }}
            className="bg-[#111111] border border-white/10 rounded-2xl p-6 space-y-4 shadow-xl hover:border-[#b6ff2e]/40 transition-colors duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-[#161616] border border-white/10 flex items-center justify-center text-[#b6ff2e]">
                <Icon className="w-6 h-6" />
              </div>
              <Link
                href={stat.addHref}
                className="p-2 rounded-lg bg-[#b6ff2e]/10 text-[#b6ff2e] hover:bg-[#b6ff2e] hover:text-black active:scale-90 transition-all duration-150"
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
                className="text-xs font-mono text-[#b6ff2e] hover:underline inline-flex items-center gap-1 group"
              >
                <span>Quản lý danh sách</span>
                <ExternalLink className="w-3 h-3 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
