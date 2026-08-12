import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const MEDIA_ROOT = path.join(process.cwd(), 'storage', 'media');

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const pathSegments = resolvedParams.path || [];
  const relativePath = pathSegments.join('/');

  // Security check: prevent path traversal
  const safePath = path.normalize(relativePath).replace(/^(\.\.[\/\\])+/, '');
  const filePath = path.join(MEDIA_ROOT, safePath);

  if (!filePath.startsWith(MEDIA_ROOT) || !fs.existsSync(filePath)) {
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
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (isNaN(start) || isNaN(end) || start >= fileSize || end >= fileSize) {
      return new NextResponse('Requested range not satisfiable', {
        status: 416,
        headers: { 'Content-Range': `bytes */${fileSize}` },
      });
    }

    const chunksize = end - start + 1;
    const fileStream = fs.createReadStream(filePath, { start, end });

    // Convert Node readable stream to Web ReadableStream
    const readableStream = new ReadableStream({
      start(controller) {
        fileStream.on('data', (chunk) => controller.enqueue(chunk));
        fileStream.on('end', () => controller.close());
        fileStream.on('error', (err) => controller.error(err));
      },
    });

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
  const readableStream = new ReadableStream({
    start(controller) {
      fileStream.on('data', (chunk) => controller.enqueue(chunk));
      fileStream.on('end', () => controller.close());
      fileStream.on('error', (err) => controller.error(err));
    },
  });

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
