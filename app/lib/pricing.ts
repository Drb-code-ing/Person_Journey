import { getTourById } from './tours';
import { ADD_ONS, DEFAULT_BASE_PRICE } from './data/booking-config';
import type { PriceBreakdown } from './types/booking';

/* ─── 本地价格估算（AI 失败时兜底，也作为主逻辑） ─── */

interface LocalPriceInput {
  scope: 'international' | 'domestic';
  days: number;
  adults: number;
  children: number;
  transportType?: string;
  travelDate?: string;
}

// 旺季月份：春节(1-2)、暑假(7-8)、国庆(10)
function isPeakSeason(dateStr?: string): boolean {
  if (!dateStr) return false;
  const month = new Date(dateStr).getMonth() + 1;
  return [1, 2, 7, 8, 10].includes(month);
}

/** 基于规则的本地价格估算（人民币/人） */
export function estimateLocalPrice(input: LocalPriceInput): { perPersonPrice: number; reason: string } {
  const { scope, days, adults, children, transportType, travelDate } = input;

  let basePrice: number;
  let reason: string;

  if (scope === 'domestic') {
    // 国内：按天数区间
    if (days <= 3) { basePrice = 25000; reason = `国内短途${days}天奢华行程`; }
    else if (days <= 5) { basePrice = 45000; reason = `国内中途${days}天奢华行程`; }
    else { basePrice = 65000; reason = `国内长途${days}天奢华行程`; }

    // 高铁比航班便宜 20-30%
    if (transportType === 'highspeed-rail') {
      basePrice = Math.round(basePrice * 0.75);
      reason += '，高铁出行';
    }
  } else {
    // 国际：按天数区间
    if (days <= 7) { basePrice = 98000; reason = `国际短途${days}天奢华行程`; }
    else if (days <= 10) { basePrice = 135000; reason = `国际中途${days}天奢华行程`; }
    else { basePrice = 168000; reason = `国际长途${days}天奢华行程`; }
  }

  // 旺季上浮 20%
  if (isPeakSeason(travelDate)) {
    basePrice = Math.round(basePrice * 1.2);
    reason += '，旺季上浮';
  }

  return { perPersonPrice: basePrice, reason };
}

interface PriceInput {
  tourId: string | null;
  adults: number;
  children: number;
  selectedAddOnIds: string[];
}

/** 计算价格明细 */
export function calculatePrice(input: PriceInput): PriceBreakdown {
  const { tourId, adults, children, selectedAddOnIds } = input;

  // 基础价：关联 tour 用 tour.price，否则用默认价
  const tour = tourId ? getTourById(tourId) : null;
  const perPerson = tour?.price ?? DEFAULT_BASE_PRICE;
  const basePrice = perPerson * (adults + children);

  // 附加项
  const addOnsTotal = selectedAddOnIds.reduce((sum, id) => {
    const addon = ADD_ONS.find((a) => a.id === id);
    return sum + (addon?.price ?? 0);
  }, 0);

  return { basePrice, addOnsTotal, total: basePrice + addOnsTotal };
}

/** 格式化价格显示 */
export function formatPrice(yuan: number): string {
  return `¥${yuan.toLocaleString('zh-CN')}`;
}
