import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface TripDetailsRequest {
  origin: string;
  destination: string;
  scope: 'international' | 'domestic';
  adults: number;
  children: number;
  travelDate?: string;
}

const AI_TIMEOUT = 15000;

export async function POST(request: NextRequest) {
  try {
    const body: TripDetailsRequest = await request.json();
    const { origin, destination, scope, adults, children, travelDate } = body;

    if (!origin || !destination) {
      return NextResponse.json({ error: 'Missing origin or destination' }, { status: 400 });
    }

    // 优先 AI 分析
    const aiResult = await tryAITripDetails(body);

    if (aiResult) {
      return NextResponse.json(aiResult);
    }

    // AI 失败 → 本地兜底
    console.warn('AI trip details failed, using local fallback');
    return NextResponse.json(buildLocalFallback(body));
  } catch (error) {
    console.error('AI trip details error:', error);
    // 异常也返回本地兜底，不返回 error
    return NextResponse.json(buildLocalFallback(await request.json().catch(() => ({} as TripDetailsRequest))));
  }
}

/** 尝试 AI 推荐行程详情 */
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

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), AI_TIMEOUT);

    const response = await fetch('https://api.xiaomimimo.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MIMO_API_KEY}`,
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'mimo-v2.5',
        max_tokens: 4096,
        temperature: 0.3,
        messages: [
          { role: 'system', content: '你是奢华旅行专家。只返回JSON，不要其他文字。所有文字必须用中文。' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    clearTimeout(timer);

    if (!response.ok) return null;

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? '';
    const reasoning = data.choices?.[0]?.message?.reasoning_content ?? '';

    let jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch && reasoning) jsonMatch = reasoning.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    // 验证关键字段存在
    if (!parsed.transportType || !parsed.recommendedDays || !parsed.hotels) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** 本地兜底：基于距离和目的地的默认推荐 */
function buildLocalFallback(body: TripDetailsRequest) {
  const { destination, scope } = body;

  // 国内 800km 内默认高铁，否则航班
  const domesticRailCities = ['杭州', '苏州', '南京', '无锡', '常州', '嘉兴', '绍兴', '合肥'];
  const useRail = scope === 'domestic' && domesticRailCities.some(c => destination.includes(c));

  // 根据 scope 推荐天数
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
