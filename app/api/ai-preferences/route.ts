import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface PreferencesRequest {
  destination: string;
  scope: 'international' | 'domestic';
}

const AI_TIMEOUT = 15000;

export async function POST(request: NextRequest) {
  try {
    const body: PreferencesRequest = await request.json();
    const { destination, scope } = body;

    if (!destination) {
      return NextResponse.json({ error: 'Missing destination' }, { status: 400 });
    }

    // 优先 AI 推荐
    const aiResult = await tryAIPreferences(body);

    if (aiResult) {
      return NextResponse.json(aiResult);
    }

    // AI 失败 → 本地兜底
    console.warn('AI preferences failed, using local fallback');
    return NextResponse.json(buildLocalFallback(destination));
  } catch (error) {
    console.error('AI preferences error:', error);
    return NextResponse.json(buildLocalFallback(destination));
  }
}

/** 尝试 AI 推荐偏好选项 */
async function tryAIPreferences(body: PreferencesRequest): Promise<Record<string, unknown> | null> {
  const { destination, scope } = body;

  const prompt = `为${destination}（${scope === 'domestic' ? '国内' : '国际'}奢华旅行）推荐体验兴趣和饮食选项。

规则：
- 兴趣标签：5-10个，带emoji，贴合目的地独特体验和文化特色
- 饮食偏好：5-8个，贴合当地美食特色
- 示例：日本→🍣寿司体验、⛩️神社参拜、🍵茶道
- 示例：意大利→🍷品酒之旅、🎨艺术鉴赏、🏛️古迹探访
- 示例：四川→🌶️火锅体验、🐼熊猫基地、🍵盖碗茶

只返回JSON（中文）：
{"interests":[{"emoji":"🏔️","label":"体验名称"}],"dietary":["选项1","选项2"]}`;

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
    if (!Array.isArray(parsed.interests) || !Array.isArray(parsed.dietary)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** 本地兜底：通用奢华旅行兴趣和饮食 */
function buildLocalFallback(destination: string) {
  return {
    interests: [
      { emoji: '🏛️', label: '文化古迹探访' },
      { emoji: '🍷', label: '品酒美食之旅' },
      { emoji: '🎭', label: '当地艺术体验' },
      { emoji: '💆', label: '奢华水疗 SPA' },
      { emoji: '🛍️', label: '高端购物' },
      { emoji: '📸', label: '专业旅拍' },
    ],
    dietary: ['米其林餐厅', '当地特色美食', '素食', '清真'],
  };
}
