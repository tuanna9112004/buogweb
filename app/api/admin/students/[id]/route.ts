import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/session';
import { saveStudent, deleteStudent } from '@/lib/storage/students';
import { StudentSchema } from '@/lib/validation/schemas';

type Context = { params: Promise<{ id: string }> };
export async function PUT(request: NextRequest, { params }: Context) {
  const authError = await requireAdminAuth();
  if (authError) return authError;
  try {
    const { id } = await params;
    const parsed = StudentSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    const student = await saveStudent(parsed.data, id);
    return student ? NextResponse.json(student) : NextResponse.json({ error: 'Không tìm thấy học viên' }, { status: 404 });
  } catch {
    return NextResponse.json({ error: 'Không thể sửa học viên' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  const authError = await requireAdminAuth();
  if (authError) return authError;
  try {
    const { id } = await params;
    return await deleteStudent(id) ? NextResponse.json({ success: true }) : NextResponse.json({ error: 'Không tìm thấy học viên' }, { status: 404 });
  } catch {
    return NextResponse.json({ error: 'Không thể xóa học viên' }, { status: 500 });
  }
}
