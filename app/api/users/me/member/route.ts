/**
 * GET /api/users/me/member
 * 获取用户会员信息（等级、消费、升级进度）
 */

import { prisma } from '../../../../lib/prisma';
import { requireAuth } from '../../../../lib/utils/auth';
import { withErrorHandling } from '../../../../lib/utils/error-handler';
import { successResponse } from '../../../../lib/utils/response';

export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(async (request: Request) => {
  const auth = requireAuth(request);

  const member = await prisma.userMember.findUnique({
    where: { userId: auth.userId },
    select: {
      totalSpend: true,
      orderCount: true,
      levelUpTime: true,
      expireTime: true,
      level: {
        select: {
          levelCode: true,
          levelName: true,
          icon: true,
          benefits: true,
          discountRate: true,
          minSpend: true,
          sortOrder: true,
        },
      },
    },
  });

  // 获取所有等级配置（用于计算进度）
  const allLevels = await prisma.memberLevel.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: {
      levelCode: true,
      levelName: true,
      minSpend: true,
      sortOrder: true,
    },
  });

  const totalSpend = member ? Number(member.totalSpend) : 0;
  const currentLevel = member?.level;

  // 找到当前等级和下一个等级
  const currentSortOrder = currentLevel?.sortOrder || 0;
  const nextLevel = allLevels.find((l) => l.sortOrder > currentSortOrder);

  // 计算进度
  let progress = 100;
  let amountToNextTier = 0;

  if (nextLevel) {
    const nextMinSpend = Number(nextLevel.minSpend);
    const currentMinSpend = currentLevel ? Number(currentLevel.minSpend) : 0;
    const range = nextMinSpend - currentMinSpend;
    progress = range > 0 ? Math.max(0, Math.min(100, ((totalSpend - currentMinSpend) / range) * 100)) : 100;
    amountToNextTier = Math.max(0, nextMinSpend - totalSpend);
  }

  return successResponse({
    tier: currentLevel
      ? {
          code: currentLevel.levelCode,
          name: currentLevel.levelName,
          icon: currentLevel.icon,
          benefits: currentLevel.benefits,
          discountRate: Number(currentLevel.discountRate),
          levelUpTime: member?.levelUpTime?.toISOString() || null,
        }
      : {
          code: 'silver',
          name: '银卡会员',
          icon: '🥈',
          benefits: '专属客服 · 优先预订',
          discountRate: 1,
          levelUpTime: null,
        },
    totalSpend,
    orderCount: member?.orderCount || 0,
    nextTier: nextLevel
      ? { code: nextLevel.levelCode, name: nextLevel.levelName, minSpend: Number(nextLevel.minSpend) }
      : null,
    progress: Math.round(progress * 10) / 10,
    amountToNextTier,
  });
});
