import { NextRequest, NextResponse } from 'next/server';
import { getMusicById, saveMusic, deleteMusic } from '@/lib/storage/repository';
import { MusicSchema } from '@/lib/validation/schemas';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = getMusicById(id);
  if (!item) {
    return NextResponse.json({ error: 'Track music không tồn tại' }, { status: 404 });
  }
  return NextResponse.json(item);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = MusicSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const updated = await saveMusic({ ...parsed.data, id });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating music' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteMusic(id);
    if (!success) {
      return NextResponse.json({ error: 'Track music không tồn tại' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting music' }, { status: 500 });
  }
}
