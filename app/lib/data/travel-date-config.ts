/** 行程日期配置常量 */
export const MIN_LEAD_DAYS = 15;    // 最少提前天数
export const DEFAULT_LEAD_DAYS = 30; // 默认出发日期提前天数

/** 计算最小可选日期（YYYY-MM-DD） */
export function getMinTravelDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + MIN_LEAD_DAYS);
  return d.toISOString().split('T')[0];
}

/** 计算默认出发日期（YYYY-MM-DD） */
export function getDefaultTravelDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + DEFAULT_LEAD_DAYS);
  return d.toISOString().split('T')[0];
}
