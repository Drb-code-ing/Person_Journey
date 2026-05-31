import { NextRequest, NextResponse } from 'next/server';
import { calculatePrice } from '../../../lib/pricing';
import type { CalculatePriceRequest, CalculatePriceResponse } from '../../../lib/types/booking';

export async function POST(request: NextRequest) {
  try {
    const body: CalculatePriceRequest = await request.json();

    if (body.adults < 1) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: '至少需要1位出行人' } } satisfies CalculatePriceResponse,
        { status: 400 },
      );
    }

    const breakdown = calculatePrice({
      tourId: body.tourId,
      adults: body.adults,
      children: body.children,
      selectedAddOnIds: body.selectedAddOnIds,
    });

    return NextResponse.json({ success: true, breakdown } satisfies CalculatePriceResponse);
  } catch {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } } satisfies CalculatePriceResponse,
      { status: 500 },
    );
  }
}
