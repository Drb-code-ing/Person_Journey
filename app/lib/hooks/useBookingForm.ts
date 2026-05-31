'use client';

import { useReducer, useCallback, useEffect, useRef, useState } from 'react';
import type {
  BookingFormData,
  TripConfig,
  TravelPreferences,
  SelectedAddOn,
  ContactInfo,
  PriceBreakdown,
  RouteOption,
  SubmitBookingResponse,
} from '../types/booking';
import { PROVINCES, getCitiesByProvince } from '../data/provinces';

/* ─── State ─── */

interface BookingFormState {
  tripConfig: TripConfig;
  preferences: TravelPreferences;
  selectedAddOns: SelectedAddOn[];
  contact: ContactInfo;
  priceBreakdown: PriceBreakdown | null;
  priceLoading: boolean;
  errors: Record<string, string>;
  submitStatus: 'idle' | 'submitting' | 'success' | 'error';
  submitError: string | null;
  bookingId: string | null;
}

/* ─── Actions ─── */

type BookingAction =
  | { type: 'SET_TRIP'; payload: Partial<TripConfig> }
  | { type: 'SET_PREFS'; payload: Partial<TravelPreferences> }
  | { type: 'TOGGLE_ADDON'; payload: string }
  | { type: 'SET_CONTACT'; payload: Partial<ContactInfo> }
  | { type: 'SET_PRICE'; payload: PriceBreakdown }
  | { type: 'SET_PRICE_LOADING' }
  | { type: 'SET_ERRORS'; payload: Record<string, string> }
  | { type: 'SET_SUBMIT'; payload: BookingFormState['submitStatus'] }
  | { type: 'SET_SUBMIT_ERROR'; payload: string }
  | { type: 'SET_BOOKING_ID'; payload: string }
  | { type: 'RESET' };

/* ─── Initial state ─── */

const INITIAL: BookingFormState = {
  tripConfig: {
    tourId: null, origin: '', destinationId: '', transitId: '', routeId: '',
    startDate: '2026-07-15', days: 9, adults: 2, children: 0,
  },
  preferences: { interests: [], dietary: [], specialOccasion: '', pillowPreference: '', otherRequirements: '' },
  selectedAddOns: [],
  contact: { name: '', phone: '', email: '' },
  priceBreakdown: null,
  priceLoading: false,
  errors: {},
  submitStatus: 'idle',
  submitError: null,
  bookingId: null,
};

/* ─── Reducer ─── */

function reducer(state: BookingFormState, action: BookingAction): BookingFormState {
  switch (action.type) {
    case 'SET_TRIP':
      return { ...state, tripConfig: { ...state.tripConfig, ...action.payload } };
    case 'SET_PREFS':
      return { ...state, preferences: { ...state.preferences, ...action.payload } };
    case 'TOGGLE_ADDON': {
      const id = action.payload;
      const exists = state.selectedAddOns.find((a) => a.addOnId === id);
      return {
        ...state,
        selectedAddOns: exists
          ? state.selectedAddOns.filter((a) => a.addOnId !== id)
          : [...state.selectedAddOns, { addOnId: id, quantity: 1 }],
      };
    }
    case 'SET_CONTACT':
      return { ...state, contact: { ...state.contact, ...action.payload } };
    case 'SET_PRICE':
      return { ...state, priceBreakdown: action.payload, priceLoading: false };
    case 'SET_PRICE_LOADING':
      return { ...state, priceLoading: true };
    case 'SET_ERRORS':
      return { ...state, errors: action.payload };
    case 'SET_SUBMIT':
      return { ...state, submitStatus: action.payload };
    case 'SET_SUBMIT_ERROR':
      return { ...state, submitError: action.payload, submitStatus: 'error' };
    case 'SET_BOOKING_ID':
      return { ...state, bookingId: action.payload, submitStatus: 'success' };
    case 'RESET':
      return INITIAL;
    default:
      return state;
  }
}

/* ─── localStorage ─── */

const STORAGE_KEY_MAP = { international: 'aurum_booking_draft', domestic: 'aurum_booking_draft_domestic' } as const;

export type BookingScope = 'international' | 'domestic';

export function useBookingForm(scope: BookingScope = 'international', addOnPrices: Record<string, number> = {}) {
  const STORAGE_KEY = STORAGE_KEY_MAP[scope];
  const [state, dispatch] = useReducer(reducer, INITIAL);

  // 省份/城市状态
  const [selectedProvince, setSelectedProvince] = useState('');
  const cities = selectedProvince ? getCitiesByProvince(selectedProvince) : [];
  const provinces = PROVINCES;

  // 路线数据
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [destinations, setDestinations] = useState<{ id: string; city: string; country: string }[]>([]);

  // 从 localStorage 恢复草稿
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as Partial<BookingFormState>;
      if (draft.tripConfig) {
        dispatch({
          type: 'SET_TRIP',
          payload: {
            ...draft.tripConfig,
            startDate: draft.tripConfig.startDate || INITIAL.tripConfig.startDate,
            children: draft.tripConfig.children ?? 0,
          },
        });
      }
      if (draft.preferences) dispatch({ type: 'SET_PREFS', payload: draft.preferences });
      if (draft.selectedAddOns && draft.selectedAddOns.length > 0) {
        for (const addOn of draft.selectedAddOns) {
          dispatch({ type: 'TOGGLE_ADDON', payload: addOn.addOnId });
        }
      }
      if (draft.contact?.name || draft.contact?.phone || draft.contact?.email) {
        dispatch({ type: 'SET_CONTACT', payload: draft.contact });
      }
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 获取所有目的地（不按出发城市过滤）
  useEffect(() => {
    fetch(`/api/destinations`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setDestinations(data);
      })
      .catch(() => {});
  }, []);

  // 草稿自动保存
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        const { submitStatus, submitError, bookingId, priceLoading, errors, ...draft } = state;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      } catch { /* ignore */ }
    }, 800);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  // 目的地选择 → AI 动态定价
  const selectedDestination = destinations.find((d) => d.id === state.tripConfig.destinationId);
  useEffect(() => {
    if (!selectedDestination || !state.tripConfig.origin) return;

    dispatch({ type: 'SET_PRICE_LOADING' });

    // 城市名中英映射
    const CITY_EN: Record<string, string> = {
      '上海': 'Shanghai', '北京': 'Beijing', '广州': 'Guangzhou', '深圳': 'Shenzhen',
      '成都': 'Chengdu', '杭州': 'Hangzhou', '厦门': 'Xiamen', '三亚': 'Sanya',
      '西安': "Xi'an", '昆明': 'Kunming', '大理': 'Dali', '丽江': 'Lijiang',
      '拉萨': 'Lhasa', '桂林': 'Guilin', '重庆': 'Chongqing', '武汉': 'Wuhan',
      '南京': 'Nanjing', '苏州': 'Suzhou', '天津': 'Tianjin', '长沙': 'Changsha',
      '青岛': 'Qingdao', '大连': 'Dalian', '哈尔滨': 'Harbin', '沈阳': 'Shenyang',
      '济南': 'Jinan', '福州': 'Fuzhou', '郑州': 'Zhengzhou', '合肥': 'Hefei',
      '南昌': 'Nanchang', '贵阳': 'Guiyang', '兰州': 'Lanzhou', '太原': 'Taiyuan',
      '石家庄': 'Shijiazhuang', '南宁': 'Nanning', '海口': 'Haikou', '银川': 'Yinchuan',
      '西宁': 'Xining', '呼和浩特': 'Hohhot', '乌鲁木齐': 'Urumqi',
      '巴黎': 'Paris', '伦敦': 'London', '东京': 'Tokyo', '纽约': 'New York',
      '悉尼': 'Sydney', '迪拜': 'Dubai', '新加坡': 'Singapore', '曼谷': 'Bangkok',
      '首尔': 'Seoul', '罗马': 'Rome', '巴塞罗那': 'Barcelona', '阿姆斯特丹': 'Amsterdam',
    };

    const originEn = CITY_EN[state.tripConfig.origin] || state.tripConfig.origin;
    const destEn = CITY_EN[selectedDestination.city ?? ''] || selectedDestination.city || selectedDestination.country;

    fetch('/api/ai-price', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        origin: originEn,
        destination: destEn,
        scope,
        days: state.tripConfig.days,
        adults: state.tripConfig.adults,
        children: state.tripConfig.children,
        transportType: scope === 'domestic' ? 'flight' : 'flight',
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          dispatch({ type: 'SET_PRICE', payload: { basePrice: 0, addOnsTotal: 0, total: 0 } });
        } else {
          const addOnsTotal = state.selectedAddOns.reduce((sum, a) => sum + (addOnPrices[a.addOnId] ?? 0), 0);
          dispatch({ type: 'SET_PRICE', payload: { basePrice: data.basePrice, addOnsTotal, total: data.basePrice + addOnsTotal } });
        }
      })
      .catch(() => {
        dispatch({ type: 'SET_PRICE', payload: { basePrice: 0, addOnsTotal: 0, total: 0 } });
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDestination?.id, state.tripConfig.origin, state.tripConfig.adults, state.tripConfig.children]);

  // 附加项变化 → 更新总价（不重新调用 AI）
  useEffect(() => {
    if (!state.priceBreakdown) return;
    const addOnsTotal = state.selectedAddOns.reduce((sum, a) => sum + (addOnPrices[a.addOnId] ?? 0), 0);
    dispatch({ type: 'SET_PRICE', payload: {
      basePrice: state.priceBreakdown.basePrice,
      addOnsTotal,
      total: state.priceBreakdown.basePrice + addOnsTotal,
    }});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedAddOns]);

  // 省份选择
  const setProvince = useCallback((province: string) => {
    setSelectedProvince(province);
    dispatch({ type: 'SET_TRIP', payload: { origin: '', routeId: '', destinationId: '', transitId: '' } });
    setRoutes([]);
  }, []);

  // 便捷方法
  const setTrip = useCallback((p: Partial<TripConfig>) => dispatch({ type: 'SET_TRIP', payload: p }), []);
  const setPrefs = useCallback((p: Partial<TravelPreferences>) => dispatch({ type: 'SET_PREFS', payload: p }), []);
  const toggleAddOn = useCallback((id: string) => dispatch({ type: 'TOGGLE_ADDON', payload: id }), []);
  const setContact = useCallback((p: Partial<ContactInfo>) => dispatch({ type: 'SET_CONTACT', payload: p }), []);
  const setErrors = useCallback((e: Record<string, string>) => dispatch({ type: 'SET_ERRORS', payload: e }), []);
  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
    setSelectedProvince('');
    setRoutes([]);
    if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY);
  }, [STORAGE_KEY]);

  // 提交
  const submit = useCallback(async () => {
    dispatch({ type: 'SET_SUBMIT', payload: 'submitting' });
    const clientToken = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const formData: BookingFormData = {
      tripConfig: state.tripConfig,
      preferences: state.preferences,
      selectedAddOns: state.selectedAddOns,
      contact: state.contact,
    };
    try {
      const res = await fetch('/api/booking/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData, clientToken }),
      });
      const data: SubmitBookingResponse = await res.json();
      if (data.success) {
        dispatch({ type: 'SET_BOOKING_ID', payload: data.booking.id });
        if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY);
      } else {
        dispatch({ type: 'SET_SUBMIT_ERROR', payload: data.error.message });
      }
    } catch {
      dispatch({ type: 'SET_SUBMIT_ERROR', payload: '网络连接失败，请稍后重试' });
    }
  }, [state.tripConfig, state.preferences, state.selectedAddOns, state.contact]);

  return {
    state,
    provinces,
    cities,
    selectedProvince,
    setProvince,
    destinations,
    selectedDestination,
    setTrip,
    setPrefs,
    toggleAddOn,
    setContact,
    setErrors,
    submit,
    reset,
    total: state.priceBreakdown?.total ?? 0,
  };
}
