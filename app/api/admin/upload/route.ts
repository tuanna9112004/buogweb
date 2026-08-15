import { NextRequest, NextResponse } from 'next/server';
import { promises as fsp } from 'fs';
import path from 'path';
import crypto from 'crypto';

const MAX_IMAGE_SIZE = 8 * 1024 * 1024; // 8MB
const MAX_AUDIO_SIZE = 50 * 1024 * 1024; // 50MB

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/mp3'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const moduleType = (formData.get('module') as string) || 'music'; // music | projects | courses | equipment
    const fileType = (formData.get('type') as string) || 'images'; // images | audio | covers

    if (!file) {
      return NextResponse.json({ error: 'Không tìm thấy file tải lên' }, { status: 400 });
    }

    const mimeType = file.type;
    const size = file.size;

    let targetSubdir = 'images';
    let isImage = ALLOWED_IMAGE_TYPES.includes(mimeType);
    let isAudio = ALLOWED_AUDIO_TYPES.includes(mimeType) || file.name.endsWith('.mp3');

    if (isImage) {
      if (size > MAX_IMAGE_SIZE) {
        return NextResponse.json({ error: 'Kích thước file ảnh vượt quá giới hạn 8MB' }, { status: 400 });
      }
      targetSubdir = fileType === 'covers' ? 'covers' : 'images';
    } else if (isAudio) {
      if (size > MAX_AUDIO_SIZE) {
        return NextResponse.json({ error: 'Kích thước file audio vượt quá giới hạn 50MB' }, { status: 400 });
      }
      targetSubdir = 'audio';
    } else {
      return NextResponse.json({ error: 'Định dạng file không được hỗ trợ (Chỉ chấp nhận JPG, PNG, WEBP, MP3)' }, { status: 400 });
    }

    // Determine target physical directory: storage/media/[module]/[targetSubdir]
    const destDir = path.join(process.cwd(), 'storage', 'media', moduleType, targetSubdir);
    await fsp.mkdir(destDir, { recursive: true });

    // Generate random UUID file name with original extension
    const ext = path.extname(file.name).toLowerCase() || (isAudio ? '.mp3' : '.webp');
    const randomName = `${crypto.randomUUID()}${ext}`;
    const physicalPath = path.join(destDir, randomName);

    // Save buffer to physical path — async so a large audio upload never
    // blocks the Node event loop (and every other request on the server)
    // for the duration of the disk write.
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fsp.writeFile(physicalPath, buffer);

    // Public accessible URL: /media/[module]/[targetSubdir]/[randomName]
    const publicUrl = `/media/${moduleType}/${targetSubdir}/${randomName}`;

    return NextResponse.json({
      url: publicUrl,
      filename: randomName,
      size,
      mimeType,
    });
  } catch (error: any) {
    console.error('Upload handler error:', error);
    return NextResponse.json({ error: error.message || 'Lỗi xử lý file upload' }, { status: 500 });
  }
}
