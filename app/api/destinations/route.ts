import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const destinations = await prisma.destination.findMany({
      orderBy: { country: 'asc' },
      select: { id: true, slug: true, country: true, city: true, bestTime: true },
    });
    return NextResponse.json(destinations);
  } catch {
    return NextResponse.json({ error: '数据库查询失败' }, { status: 500 });
  }
}
