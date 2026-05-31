/* 预订系统 — 类型定义 */

export type BookingStatus = 'draft' | 'submitted' | 'confirmed' | 'paid' | 'cancelled';

/** 行程参数 */
export interface TripConfig {
  tourId: string | null;
  origin: string;          // 出发城市，如"上海"
  destinationId: string;   // 目的地 ID
  transitId: string;       // 途经目的地 ID（可为空）
  routeId: string;         // 选中的路线 ID
  startDate: string;
  days: number;
  adults: number;
  children: number;
}

/** 路线选项（API 返回） */
export interface RouteOption {
  id: string;
  slug: string;
  name: string;
  description: string;
  origin: string;
  transitId: string | null;
  destinationId: string;
  price: number;
  days: number;
  transportType?: string;  // "flight" | "highspeed-rail" | "helicopter" | "cruise" | "car"
  imageUrl: string;
  destination: { id: string; slug: string; country: string; city: string | null; images: string };
  transit: { id: string; slug: string; country: string; city: string | null } | null;
}

/** 偏好 */
export interface TravelPreferences {
  interests: string[];     // 兴趣标签 label 列表
  dietary: string[];       // 饮食偏好 label 列表
  specialOccasion: string; // 特殊场合描述
  pillowPreference: string;
  otherRequirements: string;
}

/** 附加项配置 */
export interface AddOnConfig {
  id: string;
  name: string;
  price: number;           // 单价（元）
  icon: string;            // Lucide icon name
}

/** 已选附加项 */
export interface SelectedAddOn {
  addOnId: string;
  quantity: number;
}

/** 联系方式 */
export interface ContactInfo {
  name: string;
  phone: string;
  email: string;
}

/** 价格明细 */
export interface PriceBreakdown {
  basePrice: number;
  addOnsTotal: number;
  total: number;
}

/** 完整表单数据 */
export interface BookingFormData {
  tripConfig: TripConfig;
  preferences: TravelPreferences;
  selectedAddOns: SelectedAddOn[];
  contact: ContactInfo;
}

/** 预订记录（含系统字段） */
export interface BookingRecord {
  id: string;
  status: BookingStatus;
  formData: BookingFormData;
  priceSnapshot: PriceBreakdown;
  createdAt: string;
}

/* ─── API 类型 ─── */

export interface SubmitBookingRequest {
  formData: BookingFormData;
  clientToken: string;
}

export type SubmitBookingResponse =
  | { success: true; booking: BookingRecord }
  | { success: false; error: BookingApiError };

export interface CalculatePriceRequest {
  tourId: string | null;
  adults: number;
  children: number;
  selectedAddOnIds: string[];
}

export type CalculatePriceResponse =
  | { success: true; breakdown: PriceBreakdown }
  | { success: false; error: BookingApiError };

export interface BookingApiError {
  code: 'VALIDATION_ERROR' | 'TOUR_NOT_FOUND' | 'DUPLICATE_SUBMISSION' | 'INTERNAL_ERROR';
  message: string;
  field?: string;
}
