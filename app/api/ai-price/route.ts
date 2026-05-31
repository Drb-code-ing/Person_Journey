import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface PriceRequest {
  origin: string;
  destination: string;
  scope: 'international' | 'domestic';
  days: number;
  adults: number;
  children: number;
  transportType?: string;
}

interface AIPriceResponse {
  perPersonPrice: number;
  reason: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: PriceRequest = await request.json();
    const { origin, destination, scope, days, adults, children, transportType } = body;

    if (!origin || !destination) {
      return NextResponse.json({ error: '请提供出发城市和目的地' }, { status: 400 });
    }

    const transportLabel = scope === 'domestic'
      ? (transportType === 'highspeed-rail' ? '高铁商务座' : transportType === 'flight' ? '国内航班头等舱' : transportType === 'helicopter' ? '私人直升机' : '专车')
      : '国际航班公务舱';

    const prompt = `你是一个奢华旅行定价专家。请根据以下信息估算每人价格（人民币元）。

出发城市：${origin}
目的地：${destination}
出行方式：${transportLabel}
行程天数：${days}天
成人：${adults}人，儿童：${children}人

定价参考：
- 国内短途（2-3天）：15,000-35,000元/人
- 国内中途（4-5天）：30,000-60,000元/人
- 国内长途（6-7天）：50,000-88,000元/人
- 国际短途（5-7天）：68,000-128,000元/人
- 国际中途（8-10天）：100,000-168,000元/人
- 国际长途（11-12天）：138,000-198,000元/人
- 高铁线路比航班便宜约20-30%
- 旺季（春节/国庆/暑假）上浮15-25%
- 儿童价格约为成人的70%

请直接返回 JSON 格式，不要有其他文字：
{"perPersonPrice": 数字, "reason": "定价理由简述"}`;

    const response = await fetch('https://api.xiaomimimo.com/anthropic', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'sk-ch2552z0v95vobx06rmse0ugf3xl1z3a5xsk0dutsd0fro29',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'mimo-v2.5',
        max_tokens: 256,
        messages: [
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      return NextResponse.json({ error: 'AI 服务暂时不可用' }, { status: 502 });
    }

    const data = await response.json();
    const content = data.content?.[0]?.text ?? '';

    // 从响应中提取 JSON
    const jsonMatch = content.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      console.error('AI response parse error:', content);
      return NextResponse.json({ error: 'AI 响应格式错误' }, { status: 500 });
    }

    const parsed: AIPriceResponse = JSON.parse(jsonMatch[0]);
    const perPerson = Math.round(parsed.perPersonPrice);

    // 计算总价
    const basePrice = perPerson * adults + Math.round(perPerson * 0.7) * children;

    return NextResponse.json({
      perPersonPrice: perPerson,
      basePrice,
      reason: parsed.reason,
    });
  } catch (error) {
    console.error('AI price calculation error:', error);
    return NextResponse.json({ error: '价格计算失败' }, { status: 500 });
  }
}
