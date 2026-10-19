'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, ArrowDownToLine, ArrowUpRight, Eye, Headphones, RefreshCw, Users, Radio, MousePointer2 } from 'lucide-react';
import { vietnamDay, dayStart } from '@/lib/analytics/core';
import type { report } from '@/lib/analytics/store';
type Report = Awaited<ReturnType<typeof report>>;
const number = (n: number) => n.toLocaleString('vi-VN');
const cards = [
  ['visitors', 'Khách truy cập', Users], ['sessions', 'Phiên truy cập', Activity], ['pageview', 'Lượt xem trang', Eye], ['listen', 'Lượt nghe', Headphones], ['download', 'Lượt tải', ArrowDownToLine], ['popup_join', 'Bấm tham gia', MousePointer2],
] as const;
export default function AnalyticsDashboard() {
  const [today] = useState(() => vietnamDay());
  const [range, setRange] = useState(() => ({ start: vietnamDay(dayStart(today) - 6 * 86400000), end: today }));
  const [draft, setDraft] = useState(range);
  const [data, setData] = useState<Report | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(0);
  const [metric, setMetric] = useState<'pageview' | 'listen' | 'download'>('pageview');
  const [sort, setSort] = useState<'listen' | 'download'>('listen');
  const [table, setTable] = useState(false);
  const query = `start=${range.start}&end=${range.end}`;
  const update = useCallback(() => setRefresh(n => n + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/admin/analytics?${query}`, { signal: controller.signal }).then(async response => {
      const value = await response.json();
      if (!response.ok) throw new Error(value.error || 'Không tải được báo cáo');
      setData(value); setError('');
    }).catch(err => { if (err.name !== 'AbortError') setError(err.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [query, refresh]);
  useEffect(() => { const timer = setInterval(() => { if (document.visibilityState === 'visible') update(); }, 60000); return () => clearInterval(timer); }, [update]);
  const preset = (days: number) => { const next = { start: vietnamDay(dayStart(today) - (days - 1) * 86400000), end: today }; setDraft(next); setRange(next); setLoading(true); update(); };
  const max = Math.max(1, ...data?.daily.map(d => d[metric]) || []);
  const sorted = [...data?.tracks || []].sort((a, b) => b[sort] - a[sort]);
  return <div className="analytics-dashboard">
    <div className="analytics-heading"><div><span className="admin-eyebrow">BUOGS · TỔNG QUAN</span><h1>Hiệu suất website</h1><p>Hiểu người nghe. Theo dõi nội dung mang lại tương tác.</p></div>
      <div className="analytics-live"><Radio size={16} /><span><strong>{number(data?.online || 0)}</strong> đang online<small>Hoạt động trong 5 phút gần nhất</small></span></div>
    </div>
    <div className="analytics-toolbar">
      <div className="analytics-presets">{[[1, 'Hôm nay'], [7, '7 ngày'], [30, '30 ngày']].map(([days, label]) => <button key={days} type="button" onClick={() => preset(Number(days))} aria-pressed={range.start === vietnamDay(dayStart(today) - (Number(days) - 1) * 86400000) && range.end === today}>{label}</button>)}</div>
      <form onSubmit={e => { e.preventDefault(); setRange(draft); setLoading(true); update(); }} className="analytics-dates"><label><span>Từ ngày</span><input aria-label="Từ ngày" type="date" required value={draft.start} max={draft.end} onChange={e => setDraft({ ...draft, start: e.target.value })} /></label><label><span>Đến ngày</span><input aria-label="Đến ngày" type="date" required value={draft.end} min={draft.start} max={today} onChange={e => setDraft({ ...draft, end: e.target.value })} /></label><button type="submit">Áp dụng</button></form>
      <button aria-label="Làm mới báo cáo" title="Làm mới" onClick={() => { setLoading(true); update(); }}><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></button>
      <a className="analytics-export" href={`/api/admin/analytics?${query}&format=csv`}><ArrowDownToLine size={16} /> Xuất CSV</a>
    </div>
    {error && <p role="alert" className="analytics-error">{error} <button onClick={update}>Thử lại</button></p>}
    <p className="analytics-caption" role="status">{loading ? 'Đang cập nhật báo cáo…' : `Dữ liệu ${data?.start || range.start} → ${data?.end || range.end} · Giờ Việt Nam · Cập nhật ${data ? new Date(data.updatedAt).toLocaleTimeString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }) : ''}`}</p>
    <div className="analytics-kpis">{cards.map(([key, title, Icon]) => {
      const value = data?.totals[key] || 0, previous = data?.previous[key] || 0;
      const change = previous ? (value - previous) / previous * 100 : null;
      return <section key={key} className="analytics-kpi"><div><span>{title}</span><Icon size={18} /></div><strong>{loading && !data ? '—' : number(value)}</strong><small className={change !== null && change > 0 ? 'positive' : ''}>{change === null ? (value ? 'Chưa có số liệu kỳ trước' : 'Chưa có hoạt động') : `${change > 0 ? '+' : ''}${change.toFixed(1)}% so với kỳ trước`}</small></section>;
    })}</div>
    {!loading && !data?.since && <div className="analytics-empty">Sẵn sàng ghi nhận dữ liệu. Thống kê bắt đầu khi khách truy cập bản production trên VPS. Phiên admin và localhost được bỏ qua.</div>}
    <section className="analytics-panel"><div className="analytics-panel-heading"><div><h2>Xu hướng hoạt động</h2><p>So sánh số lượt theo từng ngày</p></div><div className="analytics-presets">{(['pageview','listen','download'] as const).map((key, i) => <button key={key} aria-pressed={metric === key} onClick={() => setMetric(key)}>{['Xem trang','Nghe','Tải'][i]}</button>)}<button aria-pressed={table} onClick={() => setTable(!table)}>Bảng số liệu</button></div></div>
      {table ? <div className="analytics-table-wrap"><table><thead><tr><th>Ngày</th><th>Xem trang</th><th>Nghe</th><th>Tải</th></tr></thead><tbody>{data?.daily.map(d => <tr key={d.date}><td>{d.date}</td><td>{number(d.pageview)}</td><td>{number(d.listen)}</td><td>{number(d.download)}</td></tr>)}</tbody></table></div> : <><div className="analytics-chart" role="img" aria-label={`Biểu đồ theo ngày. Giá trị cao nhất ${max}. Chọn Bảng số liệu để xem chi tiết.`}><span className="analytics-chart-max">{number(max)}</span>{data?.daily.map(d => <div key={d.date} className="analytics-bar-column"><div className="analytics-bar" title={`${d.date}: ${number(d[metric])}`} style={{ height: `${Math.max(d[metric] ? 1 : 0, d[metric] / max * 100)}%` }} /></div>)}</div><div className="analytics-chart-axis"><span>{range.start}</span><span>{range.end}</span></div></>}
    </section>
    <div className="analytics-two-col"><section className="analytics-panel"><div className="analytics-panel-heading"><div><h2>Nội dung được quan tâm</h2><p>Nhạc, demo và bản nghe thử FLP</p></div><select aria-label="Sắp xếp nội dung" value={sort} onChange={e => setSort(e.target.value as typeof sort)}><option value="listen">Lượt nghe</option><option value="download">Lượt tải</option></select></div><div className="analytics-table-wrap"><table><thead><tr><th>Bài nhạc</th><th>Nghe</th><th>Tải</th></tr></thead><tbody>{sorted.slice(0, 20).map(t => <tr key={t.id}><td>{t.title}</td><td>{number(t.listen)}</td><td>{number(t.download)}</td></tr>)}</tbody></table>{!sorted.length && <p className="analytics-no-data">Chưa có lượt nghe hoặc tải trong khoảng này.</p>}</div></section>
      <section className="analytics-panel"><div className="analytics-panel-heading"><div><h2>Hiệu quả popup</h2><p>Từ nhìn thấy đến bấm tham gia</p></div><Link href="/admin/community" aria-label="Chỉnh sửa popup"><ArrowUpRight size={20} /></Link></div><div className="analytics-funnel">{[['popup_view', 'Nhìn thấy thẻ'], ['popup_open', 'Mở thông tin'], ['popup_join', 'Bấm sang Zalo']].map(([key, label], i) => <div key={key}><span><em>0{i + 1}</em>{label}</span><strong>{number(data?.totals[key as keyof Report['totals']] || 0)}</strong></div>)}</div><p className="analytics-conversion">{data?.totals.popup_view ? `${(data.totals.popup_join / data.totals.popup_view * 100).toFixed(1)}%` : '—'} <span>Lượt bấm / lượt hiển thị</span></p><p className="analytics-caption">Có thể bấm trực tiếp từ thẻ hoặc nút thu gọn. Đây không phải số thành viên đã vào nhóm; tỷ lệ có thể vượt 100% khi bấm nhiều lần.</p><div className="analytics-placement">{data?.placements.map(p => <span key={p.name}>{p.name === 'dialog' ? 'Popup lớn' : 'Thẻ nhỏ'}: {p.count}</span>)}</div></section></div>
    <div className="analytics-three-col">{[['Trang được xem', data?.pages], ['Nguồn truy cập · phiên', data?.sources], ['Thiết bị · phiên', data?.devices]].map(([label, items]) => <section className="analytics-panel" key={String(label)}><h2>{String(label)}</h2><div className="analytics-ranking">{(items as Report['pages'] | undefined)?.slice(0, 8).map(item => <div key={item.name}><span title={item.name}>{item.name}</span><strong>{number(item.count)}</strong></div>)}{!(items as Report['pages'] | undefined)?.length && <p className="analytics-no-data">Chưa có dữ liệu.</p>}</div></section>)}</div>
    <details className="analytics-notes"><summary>Cách tính số liệu & thời điểm bắt đầu</summary><p>Khách truy cập được ước tính theo trình duyệt ẩn danh, không nhận diện một người trên nhiều thiết bị. Phiên mới sau 30 phút không hoạt động. Nghe đủ 10 giây thực tế mới được tính; mỗi bài tối đa một lượt nghe và tải trong một phiên. Lượt tải là yêu cầu tải file được chấp nhận, không xác nhận tải hoàn tất.</p><p>Nguồn và thiết bị dựa trên hoạt động đầu tiên của phiên trong khoảng báo cáo. Đang online dựa vào hoạt động gần đây và được làm mới mỗi phút; về 0 khi máy chủ khởi động lại. Bộ lọc bot cơ bản không loại bỏ được mọi truy cập giả.</p><p>Bắt đầu lưu: {data?.since || 'Chưa phát sinh dữ liệu'}. Không có dữ liệu lịch sử trước thời điểm triển khai. Giữ nhật ký riêng trên VPS, sao lưu cùng dữ liệu website.</p></details>
  </div>;
}
