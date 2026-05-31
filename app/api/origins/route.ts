import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const routes = await prisma.route.findMany({
      where: { isActive: true },
      select: { origin: true },
      distinct: ['origin'],
      orderBy: { origin: 'asc' },
    });
    return NextResponse.json(routes.map((r) => r.origin));
  } catch {
    return NextResponse.json({ error: '数据库查询失败' }, { status: 500 });
  }
}
