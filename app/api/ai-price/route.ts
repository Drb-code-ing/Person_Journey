import { NextRequest, NextResponse } from 'next/server';
import { estimateLocalPrice } from '../../lib/pricing';

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

// AI 超时时间（ms）
const AI_TIMEOUT = 15000;

export async function POST(request: NextRequest) {
  try {
    const body: PriceRequest = await request.json();
    const { origin, destination, scope, days, adults, children, transportType, travelDate } = body;

    if (!origin || !destination) {
      return NextResponse.json({ error: '请提供出发城市和目的地' }, { status: 400 });
    }

    // 本地公式计算（始终可用，作为兜底）
    const localResult = estimateLocalPrice({ scope, days, adults, children, transportType, travelDate });

    // 尝试 AI 增强定价（可选，失败不影响结果）
    const aiResult = await tryAIPricing(body);

    // AI 成功且返回合理价格时使用 AI 结果，否则用本地公式
    const perPerson = aiResult && aiResult.perPersonPrice > 1000
      ? aiResult.perPersonPrice
      : localResult.perPersonPrice;

    const reason = aiResult && aiResult.perPersonPrice > 1000
      ? aiResult.reason
      : localResult.reason;

    const basePrice = perPerson * adults + Math.round(perPerson * 0.7) * children;

    return NextResponse.json({ perPersonPrice: perPerson, basePrice, reason });
  } catch (error) {
    console.error('AI price calculation error:', error);
    return NextResponse.json({ error: '价格计算失败' }, { status: 500 });
  }
}

/** 尝试 AI 定价，超时或失败返回 null */
async function tryAIPricing(body: PriceRequest): Promise<{ perPersonPrice: number; reason: string } | null> {
  const { origin, destination, scope, days, adults, children, transportType, travelDate } = body;

  const transportLabel = scope === 'domestic'
    ? (transportType === 'highspeed-rail' ? '高铁商务座' : transportType === 'flight' ? '国内航班头等舱' : transportType === 'helicopter' ? '私人直升机' : '专车')
    : '国际航班公务舱';

  const prompt = `估算奢华旅行每人价格（人民币元）。
出发：${origin} → ${destination}，${transportLabel}，${days}天，${adults}成人${children}儿童
${travelDate ? `日期：${travelDate}` : ''}
参考：国内短途15000-35000，国际短途68000-128000，旺季上浮15-25%
只返回JSON：{"perPersonPrice":数字,"reason":"中文理由"}`;

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
          { role: 'system', content: '只返回JSON：{"perPersonPrice":数字,"reason":"中文理由"}。不要其他文字。' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    clearTimeout(timer);

    if (!response.ok) return null;

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? '';
    const reasoning = data.choices?.[0]?.message?.reasoning_content ?? '';

    // 从 content 或 reasoning 中提取 JSON
    let jsonMatch = content.match(/\{[\s\S]*?\}/);
    if (!jsonMatch && reasoning) jsonMatch = reasoning.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    return typeof parsed.perPersonPrice === 'number' ? parsed : null;
  } catch {
    // 超时、网络错误等 — 静默失败，返回 null 使用本地公式
    return null;
  }
}
