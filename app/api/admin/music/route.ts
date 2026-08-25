import { NextRequest, NextResponse } from 'next/server';
import { getMusicList, saveMusic } from '@/lib/storage/repository';
import { MusicSchema } from '@/lib/validation/schemas';
import { requireAdminAuth } from '@/lib/auth/session';

export async function GET() {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  const list = getMusicList(false); // Return all items (including unpublished) for Admin
  return NextResponse.json(list);
}

export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const parsed = MusicSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const created = await saveMusic(parsed.data);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error saving music';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
