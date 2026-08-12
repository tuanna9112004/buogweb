import { NextResponse } from 'next/server';
import { getMusicList } from '@/lib/storage/repository';

export async function GET() {
  const list = getMusicList(true); // published items only
  return NextResponse.json(list);
}
