import { NextRequest, NextResponse } from 'next/server';
import { getEquipmentCategories, saveEquipmentCategory } from '@/lib/storage/repository';
import { EquipmentCategorySchema } from '@/lib/validation/schemas';
import { requireAdminAuth } from '@/lib/auth/session';

export async function GET() {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  const cats = getEquipmentCategories(false);
  return NextResponse.json(cats);
}

export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const parsed = EquipmentCategorySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const created = await saveEquipmentCategory(parsed.data);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error saving category';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
