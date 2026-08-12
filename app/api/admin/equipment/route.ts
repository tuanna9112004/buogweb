import { NextRequest, NextResponse } from 'next/server';
import { getEquipment, saveEquipment } from '@/lib/storage/repository';
import { EquipmentSchema } from '@/lib/validation/schemas';

export async function GET() {
  const list = getEquipment(false);
  return NextResponse.json(list);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = EquipmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const created = await saveEquipment(parsed.data);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error saving equipment' }, { status: 500 });
  }
}
