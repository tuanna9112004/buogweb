import { NextRequest, NextResponse } from 'next/server';
import { saveMusicTag, deleteMusicTag } from '@/lib/storage/repository';
import { MusicTagSchema } from '@/lib/validation/schemas';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = MusicTagSchema.safeParse({ ...body, id });

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const updated = await saveMusicTag(parsed.data);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating tag' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await deleteMusicTag(id);
    if (!result.success) {
      return NextResponse.json({ error: result.message || 'Không thể xóa tag' }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting tag' }, { status: 500 });
  }
}
