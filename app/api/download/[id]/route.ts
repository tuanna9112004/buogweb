import { randomUUID } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { getMusicById } from '@/lib/storage/repository';
import { GET as media } from '@/app/media/[...path]/route';
import { excluded, identity, identifyResponse, device } from '@/lib/analytics/request';
import { recordEvent, touchVisitor } from '@/lib/analytics/store';
export const runtime = 'nodejs';
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const track = getMusicById(id);
  if (!track?.published || !track.isDownloadable || !track.audio.startsWith('/media/')) return new NextResponse('Không có file tải', { status: 404 });
  const response = await media(request, { params: Promise.resolve({ path: track.audio.slice('/media/'.length).split('/') }) });
  response.headers.set('Cache-Control', 'private, no-store');
  if (response.status !== 200 && response.status !== 206) return response;
  response.headers.set('Content-Disposition', `attachment; filename="buogsdj.mp3"; filename*=UTF-8''${encodeURIComponent(track.title + ' - buogsdj.mp3')}`);
  if (!excluded(request)) {
    const ids = identity(request);
    touchVisitor(ids.visitor);
    try { await recordEvent({ id: randomUUID(), at: Date.now(), ...ids, kind: 'download', item: id, title: track.title, path: `/music/${id}`, source: 'Trực tiếp', device: device(request) }); } catch (error) { console.error('Download analytics failed', error); }
    return identifyResponse(response, ids, request);
  }
  return response;
}
export async function HEAD() { return new NextResponse(null, { status: 405 }); }
