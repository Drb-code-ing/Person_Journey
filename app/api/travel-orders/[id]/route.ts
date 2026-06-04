/**
 * GET /api/travel-orders/:id
 * 查询订单详情
 *
 * PUT /api/travel-orders/:id/cancel
 * 取消订单
 */

import { prisma } from '../../../lib/prisma';
import { requireAuth } from '../../../lib/utils/auth';
import { withErrorHandling, Errors } from '../../../lib/utils/error-handler';
import { successResponse } from '../../../lib/utils/response';

export const dynamic = 'force-dynamic';

// ─── GET: 查询订单详情 ───
export const GET = withErrorHandling(async (request: Request, ctx: { params: Promise<{ id: string }> }) => {
  const auth = requireAuth(request);
  const { id } = await ctx.params;

  const order = await prisma.travelOrder.findFirst({
    where: {
      id,
      userId: auth.userId,
      deletedTime: null,
    },
    select: {
      id: true,
      orderNo: true,
      scope: true,
      status: true,
      guestName: true,
      guestPhone: true,
      guestEmail: true,
      origin: true,
      destinationName: true,
      transportType: true,
      travelDate: true,
      endDate: true,
      days: true,
      adults: true,
      children: true,
      basePrice: true,
      addOnsTotal: true,
      discountAmount: true,
      totalPrice: true,
      currency: true,
      tripConfigSnapshot: true,
      preferencesSnapshot: true,
      addOnsSnapshot: true,
      priceSnapshot: true,
      notes: true,
      paidTime: true,
      confirmedTime: true,
      completedTime: true,
      cancelledTime: true,
      cancelledReason: true,
      createdTime: true,
      updatedTime: true,
    },
  });

  if (!order) throw Errors.bookingNotFound();

  return successResponse({
    ...order,
    basePrice: Number(order.basePrice),
    addOnsTotal: Number(order.addOnsTotal),
    discountAmount: Number(order.discountAmount),
    totalPrice: Number(order.totalPrice),
  });
});

// ─── PUT: 取消订单 ───
export const PUT = withErrorHandling(async (request: Request, ctx: { params: Promise<{ id: string }> }) => {
  const auth = requireAuth(request);
  const { id } = await ctx.params;
  const body = await request.json().catch(() => ({}));

  const order = await prisma.travelOrder.findFirst({
    where: {
      id,
      userId: auth.userId,
      deletedTime: null,
    },
  });

  if (!order) throw Errors.bookingNotFound();

  // 只有 submitted/confirmed 状态可以取消
  if (!['submitted', 'confirmed'].includes(order.status)) {
    throw Errors.bookingStatusInvalid(`当前状态「${order.status}」不允许取消`);
  }

  // 校验取消理由长度
  if (body.reason && typeof body.reason === 'string' && body.reason.length > 500) {
    throw Errors.validation('取消理由不能超过500字', 'reason');
  }

  const updated = await prisma.travelOrder.update({
    where: { id },
    data: {
      status: 'cancelled',
      cancelledTime: new Date(),
      cancelledReason: body.reason || null,
    },
  });

  return successResponse({
    id: updated.id,
    orderNo: updated.orderNo,
    status: updated.status,
  }, '订单已取消');
});

// ─── DELETE: 删除订单（软删除，仅限测试） ───
export const DELETE = withErrorHandling(async (request: Request, ctx: { params: Promise<{ id: string }> }) => {
  const auth = requireAuth(request);
  const { id } = await ctx.params;

  const order = await prisma.travelOrder.findFirst({
    where: { id, userId: auth.userId, deletedTime: null },
  });

  if (!order) throw Errors.bookingNotFound();

  await prisma.travelOrder.update({
    where: { id },
    data: { deletedTime: new Date() },
  });

  return successResponse({ id }, '行程已删除');
});
