import { NextRequest, NextResponse } from 'next/server';
import { getProjects, saveProject } from '@/lib/storage/repository';
import { ProjectSchema } from '@/lib/validation/schemas';
import { requireAdminAuth } from '@/lib/auth/session';

export async function GET() {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  const list = getProjects(false);
  return NextResponse.json(list);
}

export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const parsed = ProjectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const created = await saveProject(parsed.data);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error saving project';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
