import { NextResponse } from 'next/server';
import { getCommunity } from '@/lib/community';
export const dynamic = 'force-dynamic';
export function GET() { return NextResponse.json(getCommunity(), { headers: { 'Cache-Control': 'no-store' } }); }
