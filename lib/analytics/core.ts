export type EventKind = 'pageview' | 'listen' | 'download' | 'popup_view' | 'popup_open' | 'popup_join';
export interface AnalyticsEvent {
  id: string; at: number; visitor: string; session: string; kind: EventKind;
  path: string; source: string; device: string; item?: string; title?: string; placement?: string;
}
export function vietnamDay(at = Date.now()) { return new Date(at + 7 * 3600000).toISOString().slice(0, 10); }
export function dayStart(day: string) { return Date.parse(`${day}T00:00:00+07:00`); }
export function validDay(day: string) { return /^\d{4}-\d{2}-\d{2}$/.test(day) && Number.isFinite(dayStart(day)) && vietnamDay(dayStart(day)) === day; }
export function dedupeKey(event: AnalyticsEvent) {
  // Downloads/listens count once per item per session. Pausing or seeking never adds a play.
  return ['listen', 'download'].includes(event.kind) ? `${event.session}:${event.kind}:${event.item}` : event.id;
}
export function summarize(events: AnalyticsEvent[], start: string, end: string) {
  const from = dayStart(start), until = dayStart(end) + 86400000;
  const visitors = new Set<string>(), sessions = new Set<string>();
  const totals = { visitors: 0, sessions: 0, pageview: 0, listen: 0, download: 0, popup_view: 0, popup_open: 0, popup_join: 0 };
  const daily: Record<string, { date: string; pageview: number; listen: number; download: number }> = {};
  const tracks: Record<string, { id: string; title: string; listen: number; download: number }> = {};
  const pages: Record<string, number> = {}, sources: Record<string, number> = {}, devices: Record<string, number> = {};
  const placements: Record<string, number> = {};
  for (let at = from; at < until; at += 86400000) { const date = vietnamDay(at); daily[date] = { date, pageview: 0, listen: 0, download: 0 }; }
  for (const e of events) {
    if (e.at < from || e.at >= until) continue;
    visitors.add(e.visitor);
    if (!sessions.has(e.session)) { sources[e.source] = (sources[e.source] || 0) + 1; devices[e.device] = (devices[e.device] || 0) + 1; }
    sessions.add(e.session); totals[e.kind]++;
    if (e.kind === 'pageview') pages[e.path] = (pages[e.path] || 0) + 1;
    if (e.kind === 'popup_join') placements[e.placement || 'teaser'] = (placements[e.placement || 'teaser'] || 0) + 1;
    if (e.kind === 'pageview' || e.kind === 'listen' || e.kind === 'download') daily[vietnamDay(e.at)][e.kind]++;
    if (e.item && (e.kind === 'listen' || e.kind === 'download')) {
      tracks[e.item] ||= { id: e.item, title: e.title || e.item, listen: 0, download: 0 };
      tracks[e.item][e.kind]++;
    }
  }
  totals.visitors = visitors.size; totals.sessions = sessions.size;
  const ranked = (map: Record<string, number>) => Object.entries(map).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  return { totals, daily: Object.values(daily), tracks: Object.values(tracks).sort((a, b) => b.listen + b.download - a.listen - a.download), pages: ranked(pages), sources: ranked(sources), devices: ranked(devices), placements: ranked(placements) };
}
