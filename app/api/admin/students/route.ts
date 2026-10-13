import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/session';
import { getStudents, saveStudent } from '@/lib/storage/students';
import { StudentSchema } from '@/lib/validation/schemas';

export async function GET() {
  const authError = await requireAdminAuth();
  if (authError) return authError;
  return NextResponse.json(getStudents());
}

export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth();
  if (authError) return authError;
  try {
    const parsed = StudentSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    return NextResponse.json(await saveStudent(parsed.data), { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Không thể lưu học viên' }, { status: 500 });
  }
}
