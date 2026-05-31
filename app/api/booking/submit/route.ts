import { NextRequest, NextResponse } from 'next/server';
import { validateBookingForm } from '../../../lib/validation';
import { calculatePrice } from '../../../lib/pricing';
import type { SubmitBookingRequest, SubmitBookingResponse, BookingRecord } from '../../../lib/types/booking';

// 简易内存去重
const recentTokens = new Map<string, number>();

function isDuplicate(token: string): boolean {
  const now = Date.now();
  for (const [k, v] of recentTokens) {
    if (now - v > 60_000) recentTokens.delete(k);
  }
  if (recentTokens.has(token)) return true;
  recentTokens.set(token, now);
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const body: SubmitBookingRequest = await request.json();

    // 幂等检查
    if (isDuplicate(body.clientToken)) {
      return NextResponse.json(
        { success: false, error: { code: 'DUPLICATE_SUBMISSION', message: '请勿重复提交，我们正在处理您的申请' } } satisfies SubmitBookingResponse,
        { status: 409 },
      );
    }

    // 服务端校验
    const validationErrors = validateBookingForm(body.formData);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: validationErrors[0].message, field: validationErrors[0].field } } satisfies SubmitBookingResponse,
        { status: 400 },
      );
    }

    // 价格快照
    const priceSnapshot = calculatePrice({
      tourId: body.formData.tripConfig.tourId,
      adults: body.formData.tripConfig.adults,
      children: body.formData.tripConfig.children,
      selectedAddOnIds: body.formData.selectedAddOns.map((a) => a.addOnId),
    });

    // 生成记录
    const now = new Date().toISOString();
    const booking: BookingRecord = {
      id: `BK-${now.slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      status: 'submitted',
      formData: body.formData,
      priceSnapshot,
      createdAt: now,
    };

    console.log('[Booking Submitted]', booking.id);

    return NextResponse.json({ success: true, booking } satisfies SubmitBookingResponse, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器内部错误，请稍后重试' } } satisfies SubmitBookingResponse,
      { status: 500 },
    );
  }
}
