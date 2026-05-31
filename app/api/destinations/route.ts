import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const scope = request.nextUrl.searchParams.get('scope') || undefined;
    const where = scope ? { scope } : {};
    const destinations = await prisma.destination.findMany({
      where,
      orderBy: { country: 'asc' },
      select: { id: true, slug: true, scope: true, country: true, city: true, bestTime: true },
    });
    return NextResponse.json(destinations);
  } catch {
    return NextResponse.json({ error: '数据库查询失败' }, { status: 500 });
  }
}
