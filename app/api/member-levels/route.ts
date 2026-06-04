/**
 * GET /api/member-levels
 * 获取所有会员等级配置
 */

import { NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { withErrorHandling } from '../../lib/utils/error-handler';
import { successResponse } from '../../lib/utils/response';

export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(async () => {
  const levels = await prisma.memberLevel.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: {
      levelCode: true,
      levelName: true,
      icon: true,
      minSpend: true,
      benefits: true,
      discountRate: true,
      sortOrder: true,
    },
  });

  return successResponse(
    levels.map((l) => ({
      code: l.levelCode,
      name: l.levelName,
      icon: l.icon,
      minSpend: Number(l.minSpend),
      benefits: l.benefits,
      discountRate: Number(l.discountRate),
      sortOrder: l.sortOrder,
    }))
  );
});
