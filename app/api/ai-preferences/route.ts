import { NextRequest, NextResponse } from 'next/server';
import { callMimoAI } from '../../lib/ai';

export const dynamic = 'force-dynamic';

interface PreferencesRequest {
  destination: string;
  scope: 'international' | 'domestic';
}

/** AI 可选的 Lucide 图标列表 */
const AVAILABLE_ICONS = ['Plane', 'UtensilsCrossed', 'Ticket', 'Car', 'Shield', 'RotateCcw'] as const;

export async function POST(request: NextRequest) {
  let scope: 'international' | 'domestic' = 'international';
  try {
    const body: PreferencesRequest = await request.json();
    scope = body.scope;
    const { destination } = body;

    if (!destination) {
      return NextResponse.json({ error: 'Missing destination' }, { status: 400 });
    }

    // AI 优先
    const aiResult = await tryAIPreferences(body);
    if (aiResult) {
      console.log('[AI] preferences: using AI result');
      return NextResponse.json(aiResult);
    }

    // 本地兜底
    console.warn('[AI] preferences failed, using local fallback');
    return NextResponse.json(buildLocalFallback(scope));
  } catch (error) {
    console.error('[AI] preferences error:', error);
    return NextResponse.json(buildLocalFallback(scope));
  }
}

/**
 * 将 AI 返回的字段名归一化为英文（防御性处理）
 */
function normalizePreferences(parsed: Record<string, unknown>, scope: string) {
  const rawAddOns = parsed.addOns ?? parsed['附加'] ?? parsed['附加服务'] ?? parsed['附加项'];
  const addOns = normalizeAddOns(rawAddOns, scope);

  return {
    interests: parsed.interests ?? parsed['兴趣'] ?? parsed['兴趣标签'],
    dietary: parsed.dietary ?? parsed['饮食'] ?? parsed['饮食偏好'] ?? parsed['餐饮'],
    addOns,
  };
}

/**
 * 归一化附加服务：验证结构、确保 icon 合法、生成唯一 id
 */
function normalizeAddOns(raw: unknown, scope: string): Record<string, unknown>[] | null {
  if (!Array.isArray(raw) || raw.length === 0) return null;

  return raw.slice(0, 3).map((item, i) => {
    const name = item.name ?? item['名称'] ?? item['服务'] ?? `附加服务${i + 1}`;
    const price = typeof item.price === 'number' ? item.price : (typeof item['价格'] === 'number' ? item['价格'] : 0);
    let icon = item.icon ?? item['图标'] ?? 'Ticket';
    // 确保 icon 在可用列表中
    if (!AVAILABLE_ICONS.includes(icon as typeof AVAILABLE_ICONS[number])) icon = 'Ticket';
    const id = `ai-${scope}-${i}`;

    return { id, name: String(name), price: Math.round(price), icon: String(icon) };
  }).filter(item => item.name && item.price > 0);
}

async function tryAIPreferences(body: PreferencesRequest): Promise<Record<string, unknown> | null> {
  const { destination, scope } = body;

  const prompt = `为${destination}（${scope === 'domestic' ? '国内' : '国际'}奢华旅行）推荐体验兴趣、饮食选项和附加服务。

规则：
- 兴趣标签：5-10个，带emoji，贴合目的地独特体验和文化特色
- 饮食偏好：5-8个，贴合当地美食特色
- 附加服务：3个，贴合目的地特色的奢华体验项目，每个需包含名称、价格（人民币元）和图标
- 图标只能从以下选择：Plane, UtensilsCrossed, Ticket, Car, Shield, RotateCcw
- 示例：日本→🍣寿司体验、⛩️神社参拜、🍵茶道

严格按以下JSON格式返回，字段名必须是英文，内容用中文：
{"interests":[{"emoji":"🏔️","label":"体验名称"}],"dietary":["选项1"],"addOns":[{"name":"服务名","price":数字,"icon":"图标名"}]}`;

  const parsed = await callMimoAI(
    '你是奢华旅行专家。只返回JSON，不要其他文字。JSON字段名必须用英文（interests, dietary, emoji, label, addOns, name, price, icon），内容文字用中文。图标只能用：Plane, UtensilsCrossed, Ticket, Car, Shield, RotateCcw。',
    prompt,
  );

  if (!parsed) return null;

  // 归一化字段名
  const normalized = normalizePreferences(parsed, scope);

  if (!Array.isArray(normalized.interests) || !Array.isArray(normalized.dietary)) {
    console.warn('[AI] preferences validation failed:', { interests: typeof normalized.interests, dietary: typeof normalized.dietary });
    return null;
  }
  return normalized;
}

function buildLocalFallback(scope: string) {
  const isDomestic = scope === 'domestic';
  return {
    interests: isDomestic
      ? [
          { emoji: '🍵', label: '茶道禅修' },
          { emoji: '🏔️', label: '雪山徒步' },
          { emoji: '♨️', label: '温泉养生' },
          { emoji: '🏯', label: '古镇文化' },
          { emoji: '🍲', label: '地道美食' },
          { emoji: '📸', label: '摄影采风' },
        ]
      : [
          { emoji: '🏛️', label: '文化古迹探访' },
          { emoji: '🍷', label: '品酒美食之旅' },
          { emoji: '🎭', label: '当地艺术体验' },
          { emoji: '💆', label: '奢华水疗 SPA' },
          { emoji: '🛍️', label: '高端购物' },
          { emoji: '📸', label: '专业旅拍' },
        ],
    dietary: isDomestic
      ? ['米其林餐厅', '当地特色美食', '素食', '清真']
      : ['米其林餐厅', '当地特色美食', '素食', '清真'],
    addOns: isDomestic
      ? [
          { id: 'ai-domestic-0', name: '高铁商务座升级', price: 3800, icon: 'Plane' },
          { id: 'ai-domestic-1', name: '非遗传承人私享体验', price: 6800, icon: 'UtensilsCrossed' },
          { id: 'ai-domestic-2', name: '顶级温泉私汤体验', price: 5200, icon: 'Ticket' },
        ]
      : [
          { id: 'ai-international-0', name: '私人直升机接驳', price: 38000, icon: 'Plane' },
          { id: 'ai-international-1', name: '米其林三星主厨私宴', price: 15000, icon: 'UtensilsCrossed' },
          { id: 'ai-international-2', name: '热气球日出体验', price: 8000, icon: 'Ticket' },
        ],
  };
}
