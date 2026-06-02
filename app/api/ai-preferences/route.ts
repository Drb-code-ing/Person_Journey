import { NextRequest, NextResponse } from 'next/server';
import { callMimoAI } from '../../lib/ai';

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

    // AI 优先
    const aiResult = await tryAIPreferences(body);
    if (aiResult) return NextResponse.json(aiResult);

    // 本地兜底
    console.warn('AI preferences failed, using local fallback');
    return NextResponse.json(buildLocalFallback());
  } catch (error) {
    console.error('AI preferences error:', error);
    return NextResponse.json(buildLocalFallback());
  }
}

async function tryAIPreferences(body: PreferencesRequest): Promise<Record<string, unknown> | null> {
  const { destination, scope } = body;

  const prompt = `为${destination}（${scope === 'domestic' ? '国内' : '国际'}奢华旅行）推荐体验兴趣和饮食选项。

规则：
- 兴趣标签：5-10个，带emoji，贴合目的地独特体验和文化特色
- 饮食偏好：5-8个，贴合当地美食特色
- 示例：日本→🍣寿司体验、⛩️神社参拜、🍵茶道

只返回JSON（中文）：
{"interests":[{"emoji":"🏔️","label":"体验名称"}],"dietary":["选项1","选项2"]}`;

  const parsed = await callMimoAI(
    '你是奢华旅行专家。只返回JSON，不要其他文字。所有文字必须用中文。',
    prompt,
  );

  if (!parsed || !Array.isArray(parsed.interests) || !Array.isArray(parsed.dietary)) return null;
  return parsed;
}

function buildLocalFallback() {
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
