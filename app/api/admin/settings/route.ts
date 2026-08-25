import { NextRequest, NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/lib/storage/repository';
import { SiteSettingsSchema } from '@/lib/validation/schemas';
import { requireAdminAuth } from '@/lib/auth/session';

export async function GET() {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  const settings = getSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  const authError = await requireAdminAuth();
  if (authError) return authError;

  try {
    const body = await request.json();
    const parsed = SiteSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const updated = await updateSettings(parsed.data);
    return NextResponse.json(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error updating settings';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
