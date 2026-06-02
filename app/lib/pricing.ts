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
    // 国内：固定成本（交通+酒店首晚）+ 每日费用
    const dailyRate = 6800;   // 每日奢华酒店+管家+餐饮
    const fixedCost = 12000;  // 交通+接机+保险
    basePrice = fixedCost + dailyRate * days;
    reason = `国内${days}天奢华行程`;

    // 高铁比航班便宜约 25%
    if (transportType === 'highspeed-rail') {
      basePrice = Math.round(basePrice * 0.82);
      reason += '，高铁出行';
    }
  } else {
    // 国际：固定成本（公务舱机票+签证+保险）+ 每日费用
    const dailyRate = 9500;   // 每日奢华酒店+管家+餐饮+当地交通
    const fixedCost = 38000;  // 公务舱往返+签证+保险+接机
    basePrice = fixedCost + dailyRate * days;
    reason = `国际${days}天奢华行程`;
  }

  // 旺季上浮 20%
  if (isPeakSeason(travelDate)) {
    basePrice = Math.round(basePrice * 1.2);
    reason += '，旺季上浮';
  }

  // 多人折扣（4人以上团体优惠）
  const totalPeople = adults + children;
  if (totalPeople >= 4) {
    basePrice = Math.round(basePrice * 0.92);
    reason += '，团体优惠';
  }

  return { perPersonPrice: basePrice, reason };
}

/** 儿童折扣系数 */
const CHILD_DISCOUNT = 0.7;

/** 计算基础行程总价（成人全价 + 儿童折扣） */
export function calculateBasePrice(perPerson: number, adults: number, children: number): number {
  return perPerson * adults + Math.round(perPerson * CHILD_DISCOUNT) * children;
}

/** 从 selectedAddOns + addOnPrices 计算附加项总价 */
export function calculateAddOnsTotal(
  selectedAddOns: { addOnId: string }[],
  addOnPrices: Record<string, number>,
): number {
  return selectedAddOns.reduce((sum, a) => sum + (addOnPrices[a.addOnId] ?? 0), 0);
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
