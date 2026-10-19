import { promises as fs, createReadStream } from 'fs';
import path from 'path';
import { createInterface } from 'readline';
import { type AnalyticsEvent, dedupeKey, vietnamDay, dayStart, summarize } from './core';

// Append-only daily journals: no native dependencies, compatible with the existing Windows VPS.
// One writer process, as configured in deploy/ecosystem.config.js. Never put these files in Git.
const directory = process.env.ANALYTICS_DIR || path.join(process.cwd(), 'storage', 'analytics');
const state = globalThis as typeof globalThis & { buogsAnalytics?: { queue: Promise<void>; day: string; keys: Set<string>; online: Map<string, number> } };
const store = state.buogsAnalytics ||= { queue: Promise.resolve(), day: '', keys: new Set(), online: new Map() };
async function readDay(day: string) {
  const events: AnalyticsEvent[] = [];
  try {
    const stream = createReadStream(path.join(directory, `${day}.jsonl`), { encoding: 'utf8' });
    const lines = createInterface({ input: stream, crlfDelay: Infinity });
    for await (const line of lines) { try { events.push(JSON.parse(line)); } catch { /* A truncated final record must not break reports. */ } }
  } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  return events;
}
export function touchVisitor(visitor: string) {
  const now = Date.now(); store.online.set(visitor, now);
  for (const [key, at] of store.online) if (now - at > 300000) store.online.delete(key);
}
export async function recordEvent(event: AnalyticsEvent) {
  const job = store.queue.then(async () => {
    const day = vietnamDay(event.at);
    if (store.day !== day) {
      const yesterday = vietnamDay(dayStart(day) - 86400000);
      store.keys = new Set((await readDay(yesterday)).concat(await readDay(day)).map(dedupeKey));
      // A power loss can leave a partial last line. Separate it from the next valid record.
      try {
        const filename = path.join(directory, `${day}.jsonl`);
        const handle = await fs.open(filename, 'r');
        let needsNewline = false;
        try {
          const { size } = await handle.stat();
          if (size) { const byte = Buffer.alloc(1); await handle.read(byte, 0, 1, size - 1); needsNewline = byte[0] !== 10; }
        } finally { await handle.close(); }
        if (needsNewline) await fs.appendFile(filename, '\n');
      } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
      store.day = day;
    }
    const key = dedupeKey(event);
    if (store.keys.has(key)) return;
    await fs.mkdir(directory, { recursive: true });
    await fs.appendFile(path.join(directory, `${day}.jsonl`), JSON.stringify(event) + '\n', 'utf8');
    store.keys.add(key);
  });
  store.queue = job.catch(() => {});
  return job;
}
export async function report(start: string, end: string) {
  await store.queue;
  const count = Math.round((dayStart(end) - dayStart(start)) / 86400000) + 1;
  const previousStart = vietnamDay(dayStart(start) - count * 86400000);
  const previousEnd = vietnamDay(dayStart(start) - 86400000);
  const events: AnalyticsEvent[] = [];
  for (let at = dayStart(previousStart); at <= dayStart(end); at += 86400000) events.push(...await readDay(vietnamDay(at)));
  const now = Date.now();
  const online = [...store.online.values()].filter(at => now - at <= 300000).length;
  let since: string | null = null;
  try { since = (await fs.readdir(directory)).filter(n => /^\d{4}-\d{2}-\d{2}\.jsonl$/.test(n)).sort()[0]?.slice(0, 10) || null; } catch {}
  return { ...summarize(events, start, end), previous: summarize(events, previousStart, previousEnd).totals, start, end, online, since, updatedAt: now };
}
