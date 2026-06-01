import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { validateBookingForm } from '../../../lib/validation';
import { calculatePrice } from '../../../lib/pricing';
import type { SubmitBookingRequest, SubmitBookingResponse, BookingRecord } from '../../../lib/types/booking';

export async function POST(request: NextRequest) {
  try {
    const body: SubmitBookingRequest = await request.json();

    // 检查幂等令牌
    if (body.clientToken) {
      const existing = await prisma.booking.findUnique({
        where: { clientToken: body.clientToken },
      });
      if (existing) {
        return NextResponse.json(
          { success: false, error: { code: 'DUPLICATE_SUBMISSION', message: '请勿重复提交，我们正在处理您的申请' } } satisfies SubmitBookingResponse,
          { status: 409 },
        );
      }
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

    // 写入数据库
    const booking = await prisma.booking.create({
      data: {
        guestName: body.formData.contact.name,
        guestEmail: body.formData.contact.email,
        guestPhone: body.formData.contact.phone || null,
        origin: body.formData.tripConfig.origin || null,
        destinationId: body.formData.tripConfig.destinationId || null,
        routeId: body.formData.tripConfig.routeId || null,
        travelDate: body.formData.tripConfig.startDate || null,
        adults: body.formData.tripConfig.adults,
        children: body.formData.tripConfig.children,
        totalPrice: priceSnapshot.total,
        status: 'submitted',
        formData: JSON.stringify(body.formData),
        priceSnapshot: JSON.stringify(priceSnapshot),
        clientToken: body.clientToken || null,
      },
    });

    // 构建返回记录
    const bookingRecord: BookingRecord = {
      id: booking.id,
      status: 'submitted',
      formData: body.formData,
      priceSnapshot,
      createdAt: booking.createdAt.toISOString(),
    };

    console.log('[Booking Submitted]', booking.id);

    return NextResponse.json({ success: true, booking: bookingRecord } satisfies SubmitBookingResponse, { status: 201 });
  } catch (error) {
    console.error('Booking submit error:', error);
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器内部错误，请稍后重试' } } satisfies SubmitBookingResponse,
      { status: 500 },
    );
  }
}
