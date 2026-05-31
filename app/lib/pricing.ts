import { getTourById } from './tours';
import { ADD_ONS, DEFAULT_BASE_PRICE } from './data/booking-config';
import type { PriceBreakdown } from './types/booking';

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
