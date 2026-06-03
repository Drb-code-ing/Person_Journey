/** 项目级常量 — 集中管理，避免重复定义 */

/** 品牌缓动曲线（Framer Motion 用） */
export const goldEase = [0.76, 0, 0.24, 1] as const;

/** 会员等级配置 */
export const TIERS = [
  { id: 'silver', name: '银卡会员', icon: '🥈', minSpend: 0, benefits: '专属客服 · 优先预订' },
  { id: 'gold', name: '金卡会员', icon: '🥇', minSpend: 30000, benefits: '房型升级 · 早餐赠送' },
  { id: 'platinum', name: '铂金会员', icon: '💎', minSpend: 80000, benefits: '私人管家 · 机场贵宾' },
  { id: 'diamond', name: '黑钻会员', icon: '👑', minSpend: 200000, benefits: '全定制行程 · 全球礼遇' },
] as const;

export type TierId = typeof TIERS[number]['id'];

/** 根据等级 ID 获取图标 */
export function getTierIcon(tierId: string): string {
  return TIERS.find(t => t.id === tierId)?.icon || '🥇';
}

/** 根据等级 ID 获取配置 */
export function getTierConfig(tierId: string) {
  return TIERS.find(t => t.id === tierId) || TIERS[0];
}
