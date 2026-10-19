import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { excluded, identity, identifyResponse, limited, device, requestLimitKey, publicHost } from '@/lib/analytics/request';
import { recordEvent, touchVisitor } from '@/lib/analytics/store';
import { getMusicById, getDemoMusicById, getProjectById } from '@/lib/storage/repository';
export const runtime = 'nodejs';
const schema = z.object({ id: z.uuid(), kind: z.enum(['pageview', 'listen', 'heartbeat', 'popup_view', 'popup_open', 'popup_join']), path: z.string().max(250).regex(/^\/(?!admin|api)[^?#]*$/), item: z.string().max(100).optional(), referrer: z.string().max(2000).optional(), placement: z.enum(['teaser', 'dialog', 'badge']).optional() });
export async function POST(request: NextRequest) {
  // Next's internal URL may be localhost behind a reverse proxy; compare the browser's host.
  try { if (new URL(request.headers.get('origin') || '').host !== publicHost(request)) return new NextResponse(null, { status: 403 }); }
  catch { return new NextResponse(null, { status: 403 }); }
  if (excluded(request)) return new NextResponse(null, { status: 204 });
  const ipKey = requestLimitKey(request);
  if (ipKey && limited(ipKey)) return new NextResponse(null, { status: 429 });
  if (Number(request.headers.get('content-length') || 0) > 4096) return new NextResponse(null, { status: 413 });
  try {
    const raw = await request.text();
    if (raw.length > 4096) return new NextResponse(null, { status: 413 });
    const result = schema.safeParse(JSON.parse(raw));
    if (!result.success) return new NextResponse(null, { status: 400 });
    const data = result.data, ids = identity(request);
    if (limited(ids.visitor)) return new NextResponse(null, { status: 429 });
    let item: string | undefined, title: string | undefined;
    if (data.kind === 'listen') {
      const id = data.item || '';
      const found = getMusicById(id) || getDemoMusicById(id) || (id.startsWith('demo-') ? getProjectById(id.slice(5)) : getProjectById(id));
      if (!found?.published) return new NextResponse(null, { status: 404 });
      item = id; title = found.title;
    }
    let source = 'Trực tiếp';
    try { const ref = new URL(data.referrer || ''); if (ref.host !== publicHost(request)) source = ref.hostname; } catch {}
    touchVisitor(ids.visitor);
    if (data.kind !== 'heartbeat') await recordEvent({ id: data.id, at: Date.now(), ...ids, kind: data.kind, path: data.path, source, device: device(request), item, title, placement: data.placement });
    return identifyResponse(new NextResponse(null, { status: 204 }), ids, request);
  } catch (error) {
    if (error instanceof SyntaxError) return new NextResponse(null, { status: 400 });
    console.error('Analytics write failed', error); return new NextResponse(null, { status: 503 });
  }
}
