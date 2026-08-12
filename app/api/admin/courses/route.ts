import { NextRequest, NextResponse } from 'next/server';
import { getCourses, saveCourse } from '@/lib/storage/repository';
import { CourseSchema } from '@/lib/validation/schemas';

export async function GET() {
  const list = getCourses(false);
  return NextResponse.json(list);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = CourseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const created = await saveCourse(parsed.data);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error saving course' }, { status: 500 });
  }
}
