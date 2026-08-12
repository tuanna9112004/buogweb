import { NextResponse } from 'next/server';
import { getMusicTags } from '@/lib/storage/repository';

export async function GET() {
  const tags = getMusicTags(true);
  return NextResponse.json(tags);
}
