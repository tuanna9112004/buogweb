import { NextRequest, NextResponse } from 'next/server';
import { getMusicTags, saveMusicTag } from '@/lib/storage/repository';
import { MusicTagSchema } from '@/lib/validation/schemas';

export async function GET() {
  const tags = getMusicTags(false);
  return NextResponse.json(tags);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = MusicTagSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const created = await saveMusicTag(parsed.data);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error saving music tag' }, { status: 500 });
  }
}
