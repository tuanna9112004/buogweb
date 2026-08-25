import { NextRequest, NextResponse } from 'next/server';
import { getProjectTags, saveProjectTag } from '@/lib/storage/repository';
import { ProjectTagSchema } from '@/lib/validation/schemas';
import { requireAdminAuth } from '@/lib/auth/session';

export async function GET() {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  const tags = getProjectTags(false);
  return NextResponse.json(tags);
}

export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const parsed = ProjectTagSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const created = await saveProjectTag(parsed.data);
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error saving project tag';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
