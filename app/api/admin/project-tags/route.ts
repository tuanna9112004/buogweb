import { NextRequest, NextResponse } from 'next/server';
import { getProjectTags, saveProjectTag } from '@/lib/storage/repository';
import { ProjectTagSchema } from '@/lib/validation/schemas';

export async function GET() {
  const tags = getProjectTags(false);
  return NextResponse.json(tags);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ProjectTagSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const created = await saveProjectTag(parsed.data);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error saving project tag' }, { status: 500 });
  }
}
