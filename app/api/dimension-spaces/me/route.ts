/**
 * GET /api/dimension-spaces/me
 * 获取用户次元空间配置
 */

import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/utils/auth';
import { withErrorHandling } from '../../../lib/utils/error-handler';
import { successResponse } from '../../../lib/utils/response';

export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(async (request: Request) => {
  const auth = requireAuth(request);

  const space = await prisma.dimensionSpace.findUnique({
    where: { userId: auth.userId },
    select: {
      spaceName: true,
      theme: true,
      coverUrl: true,
      bio: true,
      visitCount: true,
      avatarFrame: true,
      bgMusicUrl: true,
      particleStyle: true,
      showcaseItems: true,
    },
  });

  // 如果没有空间记录，返回默认配置
  if (!space) {
    return successResponse({
      spaceName: '我的次元空间',
      theme: 'nebula',
      coverUrl: null,
      bio: null,
      visitCount: 0,
      avatarFrame: null,
      bgMusicUrl: null,
      particleStyle: 'aurora',
      showcaseItems: [],
    });
  }

  return successResponse(space);
});
