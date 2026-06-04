import type { BookingFormData } from './types/booking';

export interface ValidationError {
  field: string;
  message: string;
}

/** 校验表单数据，返回错误列表（空 = 通过） */
export function validateBookingForm(data: BookingFormData): ValidationError[] {
  const errors: ValidationError[] = [];

  // 出发城市
  if (!data.tripConfig.origin) {
    errors.push({ field: 'tripConfig.origin', message: '请选择出发城市' });
  }

  // 目的地
  if (!data.tripConfig.destinationId) {
    errors.push({ field: 'tripConfig.destinationId', message: '请选择目的地' });
  }

  // 出发日期
  if (!data.tripConfig.startDate) {
    errors.push({ field: 'tripConfig.startDate', message: '请选择出发日期' });
  }

  // 联系人姓名
  if (!data.contact.name || data.contact.name.trim().length < 2) {
    errors.push({ field: 'contact.name', message: '请填写您的称呼' });
  }

  // 手机号（必填）
  if (!data.contact.phone) {
    errors.push({ field: 'contact.phone', message: '请留下手机号，管家将与您联系' });
  } else if (!/^1[3-9]\d{9}$/.test(data.contact.phone)) {
    errors.push({ field: 'contact.phone', message: '手机号似乎不太对，请检查一下' });
  }

  // 邮箱（必填）
  if (!data.contact.email) {
    errors.push({ field: 'contact.email', message: '请填写邮箱，用于接收行程确认' });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.contact.email)) {
    errors.push({ field: 'contact.email', message: '邮箱格式似乎不太对' });
  }

  // 至少选一个兴趣
  if (data.preferences.interests.length === 0) {
    errors.push({ field: 'preferences.interests', message: '请至少选择一个您感兴趣的方向' });
  }

  return errors;
}

/** 错误数组转 field→message 映射 */
export function errorsToMap(errors: ValidationError[]): Record<string, string> {
  return Object.fromEntries(errors.map((e) => [e.field, e.message]));
}
