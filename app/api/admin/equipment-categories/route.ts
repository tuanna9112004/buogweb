import { NextRequest, NextResponse } from 'next/server';
import { getEquipmentCategories, saveEquipmentCategory } from '@/lib/storage/repository';
import { EquipmentCategorySchema } from '@/lib/validation/schemas';

export async function GET() {
  const cats = getEquipmentCategories(false);
  return NextResponse.json(cats);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = EquipmentCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const created = await saveEquipmentCategory(parsed.data);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error saving category' }, { status: 500 });
  }
}
