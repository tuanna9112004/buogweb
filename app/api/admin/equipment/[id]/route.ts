import { NextRequest, NextResponse } from 'next/server';
import { getEquipmentById, saveEquipment, deleteEquipment } from '@/lib/storage/repository';
import { EquipmentSchema } from '@/lib/validation/schemas';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = getEquipmentById(id);
  if (!item) {
    return NextResponse.json({ error: 'Thiết bị không tồn tại' }, { status: 404 });
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
    const parsed = EquipmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const updated = await saveEquipment({ ...parsed.data, id });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating equipment' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteEquipment(id);
    if (!success) {
      return NextResponse.json({ error: 'Thiết bị không tồn tại' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting equipment' }, { status: 500 });
  }
}
