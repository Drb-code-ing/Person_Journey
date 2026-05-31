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

    const prompt = `Estimate per-person price in CNY for this luxury trip:
From: ${origin}
To: ${destination}
Transport: ${transportLabel}
Duration: ${days} days
Adults: ${adults}, Children: ${children}

Reference ranges (CNY/person):
- Domestic 2-3 days: 15000-35000
- Domestic 4-5 days: 30000-60000
- Domestic 6-7 days: 50000-88000
- International 5-7 days: 68000-128000
- International 8-10 days: 100000-168000
- International 11-12 days: 138000-198000
- High-speed rail is 20-30% cheaper than flights

Return JSON: {"perPersonPrice":number,"reason":"brief reason"}`;

    const response = await fetch('https://api.xiaomimimo.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer sk-ch2552z0v95vobx06rmse0ugf3xl1z3a5xsk0dutsd0fro29`,
      },
      body: JSON.stringify({
        model: 'mimo-v2.5',
        max_tokens: 2048,
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: 'You are a luxury travel pricing expert. Always respond with valid JSON only, no other text. Use this format: {"perPersonPrice":number,"reason":"string"}',
          },
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
    const content = data.choices?.[0]?.message?.content ?? '';
    console.log('AI response:', content);

    // 从响应中提取 JSON（支持代码块格式）
    let jsonMatch = content.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      // 尝试从代码块中提取
      const codeBlockMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
      if (codeBlockMatch) {
        jsonMatch = codeBlockMatch[1].match(/\{[\s\S]*?\}/);
      }
    }
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
