import { NextResponse } from 'next/server';
import { getRecentRoutes } from '@/app/(main)/routes/_actions/recent';

export async function GET() {
  try {
    const recent = await getRecentRoutes(1);
    return NextResponse.json({ route: recent[0] ?? null });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch recent route' }, { status: 500 });
  }
}


