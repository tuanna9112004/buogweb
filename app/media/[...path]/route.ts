import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { parseMediaRange } from '@/lib/media-range';

const MEDIA_ROOT = path.join(process.cwd(), 'storage', 'media');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const pathSegments = resolvedParams.path || [];
  const relativePath = pathSegments.join('/');

  // Security check: prevent path traversal
  const filePath = path.resolve(MEDIA_ROOT, relativePath);

  if (!filePath.startsWith(MEDIA_ROOT + path.sep) || !fs.existsSync(filePath)) {
    return new NextResponse('File not found', { status: 404 });
  }

  const stat = fs.statSync(filePath);
  if (stat.isDirectory()) {
    return new NextResponse('Invalid request', { status: 400 });
  }

  const fileSize = stat.size;
  const range = request.headers.get('range');

  // Determine MIME type
  const ext = path.extname(filePath).toLowerCase();
  let contentType = 'application/octet-stream';
  if (ext === '.mp3') contentType = 'audio/mpeg';
  else if (ext === '.webp') contentType = 'image/webp';
  else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
  else if (ext === '.png') contentType = 'image/png';

  // Handle HTTP Range Requests for MP3 seeking
  if (range) {
    const parsedRange = parseMediaRange(range, fileSize);
    if (!parsedRange) {
      return new NextResponse('Requested range not satisfiable', {
        status: 416,
        headers: { 'Content-Range': `bytes */${fileSize}` },
      });
    }
    const { start, end } = parsedRange;

    const chunksize = end - start + 1;
    const fileStream = fs.createReadStream(filePath, { start, end });

    // Convert Node readable stream to Web ReadableStream
    const readableStream = Readable.toWeb(fileStream) as ReadableStream<Uint8Array>;

    return new NextResponse(readableStream, {
      status: 206, // Partial Content
      headers: {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize.toString(),
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  }

  // Full content response
  const fileStream = fs.createReadStream(filePath);
  // Node's adapter applies backpressure and destroys the file stream when
  // the browser cancels a request (for example when changing tracks).
  const readableStream = Readable.toWeb(fileStream) as ReadableStream<Uint8Array>;

  return new NextResponse(readableStream, {
    status: 200,
    headers: {
      'Content-Length': fileSize.toString(),
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
