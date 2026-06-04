/**
 * GET /api/users/me/profile
 * 个人中心核心接口 - 聚合返回用户全部信息
 *
 * PUT /api/users/me/profile
 * 修改个人资料 - 更新 name, phone, gender, birthday
 */

import { prisma } from '../../../../lib/prisma';
import { requireAuth } from '../../../../lib/utils/auth';
import { withErrorHandling, Errors } from '../../../../lib/utils/error-handler';
import { successResponse } from '../../../../lib/utils/response';

export const dynamic = 'force-dynamic';

// ─── GET: 获取个人中心完整信息 ───
export const GET = withErrorHandling(async (request: Request) => {
  const auth = requireAuth(request);

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: {
      id: true,
      email: true,
      name: true,
      status: true,
      avatar: true,
      createdAt: true,
      profile: {
        select: {
          phone: true,
          nickname: true,
          gender: true,
          birthday: true,
        },
      },
      member: {
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
      },
      dimensionSpace: {
        select: {
          spaceName: true,
          theme: true,
        },
      },
    },
  });

  if (!user) throw Errors.userNotFound();

  // 查询有效订单数量
  const activeOrderCount = await prisma.travelOrder.count({
    where: {
      userId: auth.userId,
      status: { in: ['submitted', 'confirmed', 'paid', 'in_progress'] },
      deletedTime: null,
    },
  });

  // 查询最近 5 条行程记录
  const recentTrips = await prisma.travelOrder.findMany({
    where: {
      userId: auth.userId,
      deletedTime: null,
      status: { notIn: ['draft'] },
    },
    orderBy: { createdTime: 'desc' },
    take: 5,
    select: {
      id: true,
      orderNo: true,
      origin: true,
      destinationName: true,
      travelDate: true,
      endDate: true,
      days: true,
      status: true,
      transportType: true,
      scope: true,
      totalPrice: true,
    },
  });

  const formattedTrips = recentTrips.map((trip) => ({
    id: trip.id,
    origin: trip.origin || '',
    destination: trip.destinationName || '未知目的地',
    date: trip.travelDate?.toISOString().split('T')[0] || '',
    endDate: trip.endDate?.toISOString().split('T')[0] || '',
    days: trip.days || 0,
    status: trip.status as string,
    orderNo: trip.orderNo,
    scope: trip.scope,
    transportType: trip.transportType,
    totalPrice: trip.totalPrice ? Number(trip.totalPrice) : undefined,
  }));

  const member = user.member;
  const tier = member?.level || null;

  return successResponse({
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.profile?.phone || null,
    avatar: user.avatar,
    tier: tier
      ? {
          code: tier.levelCode,
          name: tier.levelName,
          icon: tier.icon,
          benefits: tier.benefits,
          discountRate: Number(tier.discountRate),
          minSpend: Number(tier.minSpend),
          levelUpTime: member?.levelUpTime?.toISOString() || null,
        }
      : {
          code: 'silver',
          name: '银卡会员',
          icon: '🥈',
          benefits: '专属客服 · 优先预订',
          discountRate: 1,
          minSpend: 0,
          levelUpTime: null,
        },
    totalSpend: member ? Number(member.totalSpend) : 0,
    orderCount: member?.orderCount || 0,
    hasOrders: activeOrderCount > 0,
    activeOrderCount,
    recentTrips: formattedTrips,
    dimensionSpace: user.dimensionSpace
      ? { spaceName: user.dimensionSpace.spaceName, theme: user.dimensionSpace.theme }
      : { spaceName: '我的次元空间', theme: 'nebula' },
  });
});

// ─── PUT: 修改个人资料 ───
export const PUT = withErrorHandling(async (request: Request) => {
  const auth = requireAuth(request);
  const body = await request.json();
  const { name, phone, gender, birthday } = body;

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 1) {
      throw Errors.validation('姓名不能为空', 'name');
    }
    await prisma.user.update({
      where: { id: auth.userId },
      data: { name: name.trim() },
    });
  }

  const profileData: Record<string, unknown> = {};
  if (phone !== undefined) profileData.phone = phone || null;
  if (gender !== undefined) profileData.gender = Number(gender);
  if (birthday !== undefined) profileData.birthday = birthday ? new Date(birthday) : null;

  if (Object.keys(profileData).length > 0) {
    await prisma.userProfile.upsert({
      where: { userId: auth.userId },
      create: { userId: auth.userId, ...profileData },
      update: profileData,
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: {
      id: true,
      email: true,
      name: true,
      profile: { select: { phone: true, gender: true, birthday: true } },
    },
  });

  if (!user) throw Errors.userNotFound();

  return successResponse({
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.profile?.phone || null,
  }, '资料更新成功');
});
