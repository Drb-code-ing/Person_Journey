/**
 * GET /api/travel-orders/has-active
 * 判断用户是否有有效订单（个人中心"我的行程"路由判断）
 */

import { NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/utils/auth';
import { withErrorHandling } from '../../../lib/utils/error-handler';
import { successResponse } from '../../../lib/utils/response';

export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(async (request: Request) => {
  const auth = requireAuth(request);

  const count = await prisma.travelOrder.count({
    where: {
      userId: auth.userId,
      status: { in: ['submitted', 'confirmed', 'paid', 'in_progress'] },
      deletedTime: null,
    },
  });

  return successResponse({
    hasOrders: count > 0,
    count,
  });
});
