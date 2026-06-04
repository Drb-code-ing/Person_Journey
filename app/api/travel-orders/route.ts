/**
 * GET /api/travel-orders
 * 查询用户行程订单列表
 *
 * POST /api/travel-orders
 * 创建新行程订单（替代 /api/booking/submit）
 */

import { prisma } from '../../lib/prisma';
import { requireAuth } from '../../lib/utils/auth';
import { withErrorHandling } from '../../lib/utils/error-handler';
import { paginatedResponse, buildPagination, parsePagination } from '../../lib/utils/response';

const VALID_STATUSES = ['draft', 'submitted', 'confirmed', 'paid', 'in_progress', 'completed', 'cancelled', 'refunded'];

export const dynamic = 'force-dynamic';

// ─── GET: 查询订单列表 ───
export const GET = withErrorHandling(async (request: Request) => {
  const auth = requireAuth(request);
  const url = new URL(request.url);
  const { page, pageSize } = parsePagination(url.searchParams);
  const rawStatus = url.searchParams.get('status');
  const status = rawStatus && VALID_STATUSES.includes(rawStatus) ? rawStatus : undefined;

  const where = {
    userId: auth.userId,
    deletedTime: null as null,
    ...(status ? { status } : {}),
  };

  const [total, orders] = await Promise.all([
    prisma.travelOrder.count({ where }),
    prisma.travelOrder.findMany({
      where,
      orderBy: { createdTime: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        orderNo: true,
        scope: true,
        status: true,
        destinationName: true,
        transportType: true,
        travelDate: true,
        endDate: true,
        days: true,
        adults: true,
        children: true,
        totalPrice: true,
        createdTime: true,
      },
    }),
  ]);

  const pagination = buildPagination(page, pageSize, total);

  return paginatedResponse(
    orders.map((o) => ({
      id: o.id,
      orderNo: o.orderNo,
      scope: o.scope,
      status: o.status,
      destination: o.destinationName || '未知目的地',
      transportType: o.transportType,
      travelDate: o.travelDate?.toISOString().split('T')[0] || null,
      endDate: o.endDate?.toISOString().split('T')[0] || null,
      days: o.days,
      adults: o.adults,
      children: o.children,
      totalPrice: Number(o.totalPrice),
      createdAt: o.createdTime.toISOString(),
    })),
    pagination
  );
});
