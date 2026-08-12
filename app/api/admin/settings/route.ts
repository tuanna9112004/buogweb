import { NextRequest, NextResponse } from 'next/server';
import { getSettings, updateSettings } from '@/lib/storage/repository';
import { SiteSettingsSchema } from '@/lib/validation/schemas';

export async function GET() {
  const settings = getSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = SiteSettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.format() }, { status: 400 });
    }

    const updated = await updateSettings(parsed.data);
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error updating settings' }, { status: 500 });
  }
}
