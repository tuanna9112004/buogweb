import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/storage/repository';

export async function GET() {
  const settings = getSettings();
  return NextResponse.json(settings);
}
