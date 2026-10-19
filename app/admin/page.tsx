import Link from 'next/link';
import AnalyticsDashboard from '@/components/admin/AnalyticsDashboard';
import { getMusicList, getDemoMusicList, getProjects, getCourses } from '@/lib/storage/repository';
export const dynamic = 'force-dynamic';
export default function AdminDashboardPage() {
  const content = [['Bài nhạc', '/admin/music', getMusicList().length], ['Demo', '/admin/demos', getDemoMusicList().length], ['FLP Projects', '/admin/projects', getProjects().length], ['Khóa học', '/admin/courses', getCourses().length]];
  return <><AnalyticsDashboard /><section className="mt-8 pt-6 border-t border-white/10"><h2 className="text-sm font-semibold mb-4">Quản lý nội dung</h2><div className="grid grid-cols-2 xl:grid-cols-4 gap-3">{content.map(([title, href, count]) => <Link key={title} href={String(href)} className="rounded-xl p-4 border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] text-sm flex items-center justify-between"><span>{title}</span><strong className="text-[#c5f277]">{count} →</strong></Link>)}</div></section></>;
}
