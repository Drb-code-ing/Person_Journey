import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const origin = request.nextUrl.searchParams.get('origin');
    const destinationId = request.nextUrl.searchParams.get('destinationId');

    if (!origin) {
      return NextResponse.json({ error: '请提供出发城市' }, { status: 400 });
    }

    const where: Record<string, unknown> = { origin, isActive: true };
    if (destinationId) where.destinationId = destinationId;

    const routes = await prisma.route.findMany({
      where,
      include: {
        destination: { select: { id: true, slug: true, country: true, city: true, images: true } },
        transit: { select: { id: true, slug: true, country: true, city: true } },
      },
      orderBy: { price: 'asc' },
    });

    return NextResponse.json(routes);
  } catch {
    return NextResponse.json({ error: '数据库查询失败' }, { status: 500 });
  }
}
