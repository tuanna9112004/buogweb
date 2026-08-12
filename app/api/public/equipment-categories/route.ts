import { NextResponse } from 'next/server';
import { getEquipmentCategories } from '@/lib/storage/repository';

export async function GET() {
  const cats = getEquipmentCategories(true);
  return NextResponse.json(cats);
}
