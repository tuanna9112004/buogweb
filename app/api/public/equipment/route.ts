import { NextResponse } from 'next/server';
import { getEquipment } from '@/lib/storage/repository';

export async function GET() {
  const list = getEquipment(true);
  return NextResponse.json(list);
}
