import { NextResponse } from 'next/server';
import { getDemoMusicList } from '@/lib/storage/repository';

export async function GET() {
  const publishedList = getDemoMusicList(true);
  return NextResponse.json(publishedList);
}
