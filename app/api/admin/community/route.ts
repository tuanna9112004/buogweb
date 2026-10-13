import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/session';
import { CommunitySchema, getCommunity, saveCommunity } from '@/lib/community';

export async function GET() {
  const auth = await requireAdminAuth();
  if (auth) return auth;
  return NextResponse.json(getCommunity());
}
export async function PUT(request: NextRequest) {
  const auth = await requireAdminAuth();
  if (auth) return auth;
  try {
    const parsed = CommunitySchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    return NextResponse.json(await saveCommunity(parsed.data));
  } catch { return NextResponse.json({ error: 'Không thể lưu cài đặt nhóm' }, { status: 500 }); }
}
