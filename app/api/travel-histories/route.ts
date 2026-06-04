/**
 * GET /api/travel-histories
 * 查询行程历史列表（已完结行程归档）
 */

import { NextRequest } from 'next/server';
import { prisma } from '../../lib/prisma';
import { requireAuth } from '../../lib/utils/auth';
import { withErrorHandling } from '../../lib/utils/error-handler';
import { paginatedResponse, buildPagination, parsePagination } from '../../lib/utils/response';

export const dynamic = 'force-dynamic';

export const GET = withErrorHandling(async (request: Request) => {
  const auth = requireAuth(request);
  const url = new URL(request.url);
  const { page, pageSize } = parsePagination(url.searchParams);

  const where = { userId: auth.userId };

  const [total, histories] = await Promise.all([
    prisma.travelHistory.count({ where }),
    prisma.travelHistory.findMany({
      where,
      orderBy: { archivedTime: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        orderNo: true,
        scope: true,
        origin: true,
        destinationName: true,
        transportType: true,
        travelDate: true,
        endDate: true,
        days: true,
        adults: true,
        children: true,
        totalPrice: true,
        coverImageUrl: true,
        rating: true,
        reviewText: true,
        diaryTitle: true,
        isPublic: true,
        archivedTime: true,
      },
    }),
  ]);

  const pagination = buildPagination(page, pageSize, total);

  return paginatedResponse(
    histories.map((h) => ({
      id: h.id,
      orderNo: h.orderNo,
      scope: h.scope,
      origin: h.origin,
      destination: h.destinationName || '未知目的地',
      transportType: h.transportType,
      travelDate: h.travelDate?.toISOString().split('T')[0] || null,
      endDate: h.endDate?.toISOString().split('T')[0] || null,
      days: h.days,
      adults: h.adults,
      children: h.children,
      totalPrice: h.totalPrice ? Number(h.totalPrice) : null,
      coverImage: h.coverImageUrl,
      rating: h.rating,
      hasReview: !!h.reviewText,
      hasDiary: !!h.diaryTitle,
      isPublic: h.isPublic,
      archivedTime: h.archivedTime.toISOString(),
    })),
    pagination
  );
});
