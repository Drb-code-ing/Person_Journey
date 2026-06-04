/**
 * GET /api/travel-orders
 * 查询用户行程订单列表
 *
 * POST /api/travel-orders
 * 创建新行程订单（替代 /api/booking/submit）
 */

import { prisma } from '../../lib/prisma';
import { requireAuth } from '../../lib/utils/auth';
import { withErrorHandling, Errors } from '../../lib/utils/error-handler';
import { paginatedResponse, successResponse, buildPagination, parsePagination } from '../../lib/utils/response';

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

// ─── POST: 创建行程订单 ───
export const POST = withErrorHandling(async (request: Request) => {
  const auth = requireAuth(request);
  const body = await request.json();
  const { formData, clientToken, aiData } = body;

  // 基础校验
  if (!formData) throw Errors.validation('缺少表单数据');
  if (!clientToken) throw Errors.validation('缺少幂等令牌');

  const { tripConfig, preferences, selectedAddOns, contact } = formData;

  // 联系人校验
  if (!contact?.name || contact.name.length < 2) {
    throw Errors.validation('联系人姓名至少2个字符', 'contact.name');
  }
  if (!contact?.phone || !/^1[3-9]\d{9}$/.test(contact.phone)) {
    throw Errors.validation('请输入正确的手机号', 'contact.phone');
  }

  // 幂等检查
  const existing = await prisma.travelOrder.findUnique({ where: { clientToken } });
  if (existing) {
    throw Errors.bookingDuplicate();
  }

  // 查询目的地名称
  let destinationName = '';
  if (tripConfig.destinationId) {
    const dest = await prisma.destination.findUnique({
      where: { id: tripConfig.destinationId },
      select: { country: true, city: true },
    });
    if (dest) {
      destinationName = dest.city ? `${dest.country} · ${dest.city}` : dest.country;
    }
  }

  // 查询路线信息
  let routeName = '';
  let transportType = '';
  if (tripConfig.routeId) {
    const route = await prisma.route.findUnique({
      where: { id: tripConfig.routeId },
      select: { name: true, transportType: true },
    });
    if (route) {
      routeName = route.name;
      transportType = route.transportType;
    }
  }

  // 生成订单编号: AJ + 日期 + 4位随机
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  const orderNo = `AJ${dateStr}${rand}`;

  // 计算总价
  const basePrice = aiData?.priceBreakdown?.basePrice ?? 0;
  const addOnsTotal = aiData?.priceBreakdown?.addOnsTotal ?? 0;
  const totalPrice = basePrice + addOnsTotal;

  // 日期处理
  const travelDate = tripConfig.startDate ? new Date(tripConfig.startDate) : null;
  const endDate = travelDate && tripConfig.days
    ? new Date(travelDate.getTime() + (tripConfig.days - 1) * 86400000)
    : null;

  // 创建订单
  const order = await prisma.travelOrder.create({
    data: {
      orderNo,
      userId: auth.userId,
      routeId: tripConfig.routeId || null,
      scope: tripConfig.destinationId ? 'international' : 'domestic', // TODO: 从 body 传入
      status: 'submitted',
      guestName: contact.name,
      guestPhone: contact.phone,
      guestEmail: contact.email || null,
      origin: tripConfig.origin || null,
      destinationName: destinationName || null,
      destinationId: tripConfig.destinationId || null,
      transitId: tripConfig.transitId || null,
      routeName: routeName || null,
      transportType: transportType || null,
      travelDate,
      endDate,
      days: tripConfig.days || null,
      adults: tripConfig.adults || 2,
      children: tripConfig.children || 0,
      basePrice: BigInt(basePrice),
      addOnsTotal: BigInt(addOnsTotal),
      totalPrice: BigInt(totalPrice),
      tripConfigSnapshot: tripConfig,
      preferencesSnapshot: preferences,
      addOnsSnapshot: selectedAddOns,
      priceSnapshot: { basePrice, addOnsTotal, total: totalPrice },
      clientToken,
    },
  });

  return successResponse({
    id: order.id,
    orderNo: order.orderNo,
    status: order.status,
    totalPrice: Number(order.totalPrice),
  }, '预订成功', 201);
});
