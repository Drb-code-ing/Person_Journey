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

export async function POST(request: NextRequest) {
  try {
    const body: TripDetailsRequest = await request.json();
    const { origin, destination, scope, adults, children, travelDate } = body;

    if (!origin || !destination) {
      return NextResponse.json({ error: 'Missing origin or destination' }, { status: 400 });
    }

    const prompt = `为以下奢华旅行推荐行程详情：
出发城市：${origin}
目的地：${destination}
类型：${scope === 'domestic' ? '国内旅行' : '国际旅行'}
出行人数：${adults}成人${children > 0 ? `，${children}儿童` : ''}
${travelDate ? `出行日期：${travelDate}` : ''}

推荐规则：
- 交通：国内800km以内推荐高铁，否则推荐航班；国际推荐航班
- 天数：根据目的地丰富度推荐3-7天
- 酒店：推荐当地3个顶级奢华酒店
- 如果提供了日期，请考虑该季节的特色活动和天气

请直接返回JSON格式（所有文字用中文）：
{
  "transportType": "flight" 或 "highspeed-rail",
  "transportReason": "推荐理由",
  "recommendedDays": 数字,
  "daysReason": "推荐理由",
  "hotels": [
    {"name": "酒店名称", "stars": 5, "highlight": "一句话亮点"}
  ]
}`;

    let response: Response;
    try {
      response = await fetch('https://api.xiaomimimo.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.MIMO_API_KEY}`,
        },
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
    } catch (fetchErr) {
      console.error('AI trip details fetch error:', fetchErr);
      return NextResponse.json({ error: 'AI 服务连接失败' }, { status: 502 });
    }

    if (!response.ok) {
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 502 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? '';
    const reasoning = data.choices?.[0]?.message?.reasoning_content ?? '';
    console.log('AI trip details content:', content || '(empty)');

    let jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch && reasoning) jsonMatch = reasoning.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'AI response parse error' }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('AI trip details error:', error);
    return NextResponse.json({ error: 'Failed to get trip details' }, { status: 500 });
  }
}
