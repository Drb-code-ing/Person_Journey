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
    if (aiResult) return NextResponse.json(aiResult);

    // 本地兜底
    console.warn('AI trip details failed, using local fallback');
    return NextResponse.json(buildLocalFallback(body));
  } catch (error) {
    console.error('AI trip details error:', error);
    return NextResponse.json(buildLocalFallback(body ?? {} as TripDetailsRequest));
  }
}

async function tryAITripDetails(body: TripDetailsRequest): Promise<Record<string, unknown> | null> {
  const { origin, destination, scope, adults, children, travelDate } = body;

  const prompt = `为奢华旅行推荐行程详情，综合考虑天气、交通、目的地特色。
出发：${origin} → ${destination}（${scope === 'domestic' ? '国内' : '国际'}）
人数：${adults}成人${children > 0 ? `${children}儿童` : ''}
${travelDate ? `出行日期：${travelDate}（请分析该日期的天气和季节特点）` : ''}

要求：
- 交通：根据距离和实际情况推荐（国内800km内高铁，否则航班；国际航班）
- 天数：根据目的地丰富度和游玩节奏推荐（不要压缩行程）
- 酒店：推荐当地3个真实存在的顶级奢华酒店
- 考虑该季节的天气、节庆、淡旺季因素

只返回JSON（中文）：
{"transportType":"flight或highspeed-rail","transportReason":"推荐理由","recommendedDays":数字,"daysReason":"推荐理由","hotels":[{"name":"酒店名","stars":5,"highlight":"亮点"}]}`;

  const parsed = await callMimoAI(
    '你是奢华旅行专家。只返回JSON，不要其他文字。所有文字必须用中文。',
    prompt,
  );

  // 验证关键字段
  if (!parsed || !parsed.transportType || !parsed.recommendedDays || !parsed.hotels) return null;
  return parsed;
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
