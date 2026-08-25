import { NextRequest, NextResponse } from 'next/server';
import { getCourses, saveCourse } from '@/lib/storage/repository';
import { CourseSchema } from '@/lib/validation/schemas';
import { requireAdminAuth } from '@/lib/auth/session';

export async function GET() {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  const list = getCourses(false);
  return NextResponse.json(list);
}

export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const parsed = CourseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const created = await saveCourse(parsed.data);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error saving course';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
