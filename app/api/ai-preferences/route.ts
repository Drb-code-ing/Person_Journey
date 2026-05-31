import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface PreferencesRequest {
  destination: string;
  scope: 'international' | 'domestic';
}

export async function POST(request: NextRequest) {
  try {
    const body: PreferencesRequest = await request.json();
    const { destination, scope } = body;

    if (!destination) {
      return NextResponse.json({ error: 'Missing destination' }, { status: 400 });
    }

    const prompt = `为${destination}（${scope === 'domestic' ? '国内' : '国际'}奢华旅行）推荐体验兴趣和饮食选项。

规则：
- 兴趣标签：5-10个，带emoji，贴合目的地独特体验
- 饮食偏好：5-8个，贴合当地美食特色
- 示例：日本→🍣寿司体验、⛩️神社参拜、🍵茶道
- 示例：意大利→🍷品酒之旅、🎨艺术鉴赏、🏛️古迹探访
- 示例：四川→🌶️火锅体验、🐼熊猫基地、🍵盖碗茶

请直接返回JSON格式（所有文字用中文）：
{
  "interests": [
    {"emoji": "🏔️", "label": "体验名称"}
  ],
  "dietary": ["选项1", "选项2"]
}`;

    const response = await fetch('https://api.xiaomimimo.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sk-ch2552z0v95vobx06rmse0ugf3xl1z3a5xsk0dutsd0fro29',
      },
      body: JSON.stringify({
        model: 'mimo-v2.5',
        max_tokens: 2048,
        temperature: 0.3,
        messages: [
          { role: 'system', content: 'You are a luxury travel expert. Return valid JSON only.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'AI service unavailable' }, { status: 502 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? '';

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'AI response parse error' }, { status: 500 });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('AI preferences error:', error);
    return NextResponse.json({ error: 'Failed to get preferences' }, { status: 500 });
  }
}
