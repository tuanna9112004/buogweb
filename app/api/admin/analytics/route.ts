import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/session';
import { report } from '@/lib/analytics/store';
import { dayStart, validDay, vietnamDay } from '@/lib/analytics/core';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: NextRequest) {
  const auth = await requireAdminAuth(); if (auth) return auth;
  const end = request.nextUrl.searchParams.get('end') || vietnamDay();
  const start = request.nextUrl.searchParams.get('start') || vietnamDay(Date.now() - 6 * 86400000);
  if (!validDay(start) || !validDay(end) || start > end || end > vietnamDay() || dayStart(end) - dayStart(start) > 89 * 86400000) return NextResponse.json({ error: 'Chọn khoảng ngày hợp lệ, tối đa 90 ngày và không ở tương lai.' }, { status: 400 });
  try {
    const data = await report(start, end);
    if (request.nextUrl.searchParams.get('format') === 'csv') {
      const cell = (v: string | number) => `"${String(v).replace(/^[=+@-]/, "'$&").replaceAll('"', '""')}"`;
      const rows: (string | number)[][] = [['Báo cáo BUOGS', start, end], ['Chỉ số', 'Giá trị'], ...Object.entries(data.totals), [], ['Ngày', 'Lượt xem', 'Lượt nghe', 'Lượt tải'], ...data.daily.map(d => [d.date, d.pageview, d.listen, d.download]), [], ['Bài nhạc / demo', 'Lượt nghe', 'Lượt tải'], ...data.tracks.map(t => [t.title, t.listen, t.download]), [], ['Trang', 'Lượt xem'], ...data.pages.map(p => [p.name, p.count])];
      return new NextResponse('\uFEFF' + rows.map(row => row.map(cell).join(',')).join('\r\n'), { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="buogs-${start}-${end}.csv"`, 'Cache-Control': 'no-store' } });
    }
    return NextResponse.json(data, { headers: { 'Cache-Control': 'no-store' } });
  } catch { return NextResponse.json({ error: 'Không đọc được thống kê. Kiểm tra quyền truy cập thư mục analytics trên VPS.' }, { status: 500 }); }
}
