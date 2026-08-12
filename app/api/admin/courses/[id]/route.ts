import { NextRequest, NextResponse } from 'next/server';
import { getCourseById, saveCourse, deleteCourse } from '@/lib/storage/repository';
import { CourseSchema } from '@/lib/validation/schemas';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = getCourseById(id);
  if (!item) {
    return NextResponse.json({ error: 'Khóa học không tồn tại' }, { status: 404 });
  }
  return NextResponse.json(item);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = CourseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const updated = await saveCourse({ ...parsed.data, id });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating course' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteCourse(id);
    if (!success) {
      return NextResponse.json({ error: 'Khóa học không tồn tại' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error deleting course' }, { status: 500 });
  }
}
