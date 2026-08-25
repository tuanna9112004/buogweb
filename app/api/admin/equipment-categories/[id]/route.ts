import { NextRequest, NextResponse } from 'next/server';
import { saveEquipmentCategory, deleteEquipmentCategory } from '@/lib/storage/repository';
import { EquipmentCategorySchema } from '@/lib/validation/schemas';
import { requireAdminAuth } from '@/lib/auth/session';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = EquipmentCategorySchema.safeParse({ ...body, id });

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const updated = await saveEquipmentCategory(parsed.data);
    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error updating category';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const { id } = await params;
    const result = await deleteEquipmentCategory(id);
    if (!result.success) {
      return NextResponse.json({ error: result.message || 'Không thể xóa danh mục' }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error deleting category';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
