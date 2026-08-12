import { NextRequest, NextResponse } from 'next/server';
import { getProjects, saveProject } from '@/lib/storage/repository';
import { ProjectSchema } from '@/lib/validation/schemas';

export async function GET() {
  const list = getProjects(false);
  return NextResponse.json(list);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = ProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const created = await saveProject(parsed.data);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error saving project' }, { status: 500 });
  }
}
