import { NextRequest, NextResponse } from 'next/server';
import { callMimoAI } from '../../lib/ai';

export const dynamic = 'force-dynamic';

interface TripDetailsRequest {
  origin: string;
  destination: string;
  scope: 'international' | 'domestic';
  adults: number;
  children: number;
  travelDate?: string;
}

export async function POST(request: NextRequest) {
  let body: TripDetailsRequest | undefined;
  try {
    body = await request.json() as TripDetailsRequest;
    const { origin, destination, scope, adults, children, travelDate } = body;

    if (!origin || !destination) {
      return NextResponse.json({ error: 'Missing origin or destination' }, { status: 400 });
    }

    // AI 优先
    const aiResult = await tryAITripDetails(body);
    if (aiResult) {
      console.log('[AI] trip details: using AI result');
      return NextResponse.json(aiResult);
    }

    // 本地兜底
    console.warn('[AI] trip details failed, using local fallback');
    return NextResponse.json(buildLocalFallback(body));
  } catch (error) {
    console.error('[AI] trip details error:', error);
    return NextResponse.json(buildLocalFallback(body ?? {} as TripDetailsRequest));
  }
}

/**
 * 将 AI 返回的字段名归一化为英文（防御性处理）
 * 即使 prompt 要求英文字段名，AI 仍可能返回中文
 */
function normalizeTripDetails(parsed: Record<string, unknown>) {
  return {
    transportType: parsed.transportType ?? parsed['交通类型'],
    transportReason: parsed.transportReason ?? parsed['交通原因'] ?? parsed['交通理由'],
    recommendedDays: parsed.recommendedDays ?? parsed['推荐天数'],
    daysReason: parsed.daysReason ?? parsed['天数原因'] ?? parsed['天数理由'],
    hotels: parsed.hotels ?? parsed['酒店'],
  };
}

async function tryAITripDetails(body: TripDetailsRequest): Promise<Record<string, unknown> | null> {
  const { origin, destination, scope, adults, children, travelDate } = body;

  const prompt = `推荐奢华行程：${origin}→${destination}（${scope === 'domestic' ? '国内' : '国际'}），${adults}人${travelDate ? `，${travelDate}` : ''}

严格按以下 JSON 格式返回，字段名必须是英文，内容用中文：
{"transportType":"flight或highspeed-rail","transportReason":"中文10字内","recommendedDays":数字,"daysReason":"中文10字内","hotels":[{"name":"酒店中文名","highlight":"中文10字内亮点"}]}`;

  const parsed = await callMimoAI(
    '你是奢华旅行专家。只返回JSON，不要其他文字。JSON字段名必须用英文（transportType, transportReason, recommendedDays, daysReason, hotels, name, highlight），内容文字用中文。',
    prompt,
  );

  if (!parsed) return null;

  // 归一化字段名（处理 AI 返回中文字段名的情况）
  const normalized = normalizeTripDetails(parsed);

  // 验证关键字段
  if (!normalized.transportType || !normalized.recommendedDays || !normalized.hotels) {
    console.warn('[AI] trip details validation failed:', { transportType: normalized.transportType, recommendedDays: normalized.recommendedDays, hasHotels: !!normalized.hotels });
    return null;
  }
  return normalized;
}

function buildLocalFallback(body: TripDetailsRequest) {
  const { destination, scope } = body;

  const domesticRailCities = ['杭州', '苏州', '南京', '无锡', '常州', '嘉兴', '绍兴', '合肥'];
  const useRail = scope === 'domestic' && domesticRailCities.some(c => destination?.includes(c));
  const recommendedDays = scope === 'domestic' ? 5 : 9;

  return {
    transportType: useRail ? 'highspeed-rail' : 'flight',
    transportReason: useRail ? '距离较近，高铁商务座更便捷舒适' : '推荐公务舱航班，享受空中奢华体验',
    recommendedDays,
    daysReason: scope === 'domestic'
      ? '5天行程从容深度，不赶路不压缩体验'
      : '9天行程涵盖经典与深度体验，节奏舒适',
    hotels: [
      { name: '丽思卡尔顿', stars: 5, highlight: '城市地标级奢华，无可挑剔的服务' },
      { name: '安缦', stars: 5, highlight: '隐世哲学，极致私密与宁静' },
      { name: '半岛', stars: 5, highlight: '百年传承，经典优雅与现代奢华的完美融合' },
    ],
  };
}
