import { NextRequest, NextResponse } from 'next/server';
import { callMimoAI } from '../../lib/ai';
import { estimateLocalPrice, calculateBasePrice } from '../../lib/pricing';

export const dynamic = 'force-dynamic';

interface PriceRequest {
  origin: string;
  destination: string;
  scope: 'international' | 'domestic';
  days: number;
  adults: number;
  children: number;
  transportType?: string;
  travelDate?: string;
}

export async function POST(request: NextRequest) {
  let body: PriceRequest | undefined;
  try {
    body = await request.json() as PriceRequest;
    const { origin, destination, scope, days, adults, children, transportType, travelDate } = body;

    if (!origin || !destination) {
      return NextResponse.json({ error: '请提供出发城市和目的地' }, { status: 400 });
    }

    // AI 优先
    const aiResult = await tryAIPricing(body);
    if (aiResult && aiResult.perPersonPrice > 1000) {
      console.log('[AI] price: using AI result', aiResult.perPersonPrice);
      const basePrice = calculateBasePrice(aiResult.perPersonPrice, adults, children);
      return NextResponse.json({ perPersonPrice: aiResult.perPersonPrice, basePrice, reason: aiResult.reason });
    }

    // 本地兜底
    console.warn('[AI] price failed, using local fallback');
    const local = estimateLocalPrice({ scope, days, adults, children, transportType, travelDate });
    const basePrice = calculateBasePrice(local.perPersonPrice, adults, children);
    return NextResponse.json({ perPersonPrice: local.perPersonPrice, basePrice, reason: local.reason });
  } catch (error) {
    console.error('[AI] price error:', error);
    const scope = body?.scope ?? 'international';
    const days = body?.days ?? 9;
    const adults = body?.adults ?? 2;
    const children = body?.children ?? 0;
    const local = estimateLocalPrice({ scope, days, adults, children });
    const basePrice = calculateBasePrice(local.perPersonPrice, adults, children);
    return NextResponse.json({ perPersonPrice: local.perPersonPrice, basePrice, reason: local.reason });
  }
}

async function tryAIPricing(body: PriceRequest): Promise<{ perPersonPrice: number; reason: string } | null> {
  const { origin, destination, scope, days, adults, children, transportType, travelDate } = body;

  const transportLabel = scope === 'domestic'
    ? (transportType === 'highspeed-rail' ? '高铁商务座' : transportType === 'flight' ? '国内航班头等舱' : transportType === 'helicopter' ? '私人直升机' : '专车')
    : '国际航班公务舱';

  const prompt = `估算奢华旅行每人价格（人民币元），综合考虑实际因素。
出发：${origin} → ${destination}
交通：${transportLabel}
天数：${days}天
人数：${adults}成人${children > 0 ? `${children}儿童` : ''}
${travelDate ? `出行日期：${travelDate}（分析该时段天气、是否旺季、当地节庆）` : ''}

定价需考虑：旺季上浮、目的地消费水平、交通方式成本、当季特色体验费用
严格按以下JSON格式返回，字段名必须是英文（perPersonPrice, reason），内容用中文：
{"perPersonPrice":数字,"reason":"简短中文理由（含季节/天气因素）"}`;

  const parsed = await callMimoAI<Record<string, unknown>>(
    '只返回JSON，不要其他文字。JSON字段名必须用英文（perPersonPrice, reason），内容文字用中文。',
    prompt,
  );

  // 归一化：处理 AI 返回中文字段名的情况
  const perPersonPrice = parsed?.perPersonPrice ?? parsed?.['每人价格'] ?? parsed?.['人均价格'];
  const reason = parsed?.reason ?? parsed?.['理由'] ?? parsed?.['原因'] ?? '';

  return perPersonPrice && typeof perPersonPrice === 'number'
    ? { perPersonPrice: Math.round(perPersonPrice), reason: String(reason) }
    : null;
}
