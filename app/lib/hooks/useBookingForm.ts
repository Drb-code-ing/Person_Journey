'use client';

import { useReducer, useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { estimateLocalPrice, calculateBasePrice, calculateAddOnsTotal } from '../pricing';
import type {
  BookingFormData,
  TripConfig,
  TravelPreferences,
  SelectedAddOn,
  AddOnConfig,
  ContactInfo,
  PriceBreakdown,
  RouteOption,
} from '../types/booking';
import { PROVINCES, getCitiesByProvince } from '../data/provinces';

/* ─── AI 推荐类型 ─── */

export interface TripDetails {
  transportType: string;
  transportReason: string;
  recommendedDays: number;
  daysReason: string;
  hotels: { name: string; stars: number; highlight: string }[];
}

export interface AIInterest {
  emoji: string;
  label: string;
}

/* ─── AI 缓存数据 ─── */

interface AICache {
  tripDetails: TripDetails | null;
  aiInterests: AIInterest[];
  aiDietary: string[];
  aiAddOns: AddOnConfig[];
}

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
  | { type: 'RESTORE_DRAFT'; payload: Partial<BookingFormState> }
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
    case 'RESTORE_DRAFT': {
      const d = action.payload;
      return {
        ...state,
        tripConfig: d.tripConfig ? {
          ...INITIAL.tripConfig,
          ...d.tripConfig,
          startDate: d.tripConfig.startDate || INITIAL.tripConfig.startDate,
          children: d.tripConfig.children ?? 0,
        } : state.tripConfig,
        preferences: d.preferences ? { ...state.preferences, ...d.preferences } : state.preferences,
        selectedAddOns: d.selectedAddOns ?? state.selectedAddOns,
        contact: (d.contact?.name || d.contact?.phone || d.contact?.email) ? d.contact : state.contact,
        priceBreakdown: d.priceBreakdown ?? state.priceBreakdown,
      };
    }
    case 'RESET':
      return INITIAL;
    default:
      return state;
  }
}

/* ─── 城市名中英映射 ─── */

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

function toEnglish(city: string): string {
  return CITY_EN[city] || city;
}

/* ─── localStorage ─── */

const STORAGE_KEY_MAP = { international: 'aurum_booking_draft', domestic: 'aurum_booking_draft_domestic' } as const;
const AI_STORAGE_KEY_MAP = { international: 'aurum_booking_ai', domestic: 'aurum_booking_ai_domestic' } as const;

export type BookingScope = 'international' | 'domestic';

const EMPTY_ADDON_PRICES: Record<string, number> = {};
const EMPTY_ADD_ONS: AddOnConfig[] = [];

export function useBookingForm(scope: BookingScope = 'international', addOnPrices: Record<string, number> = EMPTY_ADDON_PRICES) {
  const STORAGE_KEY = STORAGE_KEY_MAP[scope];
  const AI_STORAGE_KEY = AI_STORAGE_KEY_MAP[scope];
  const [state, dispatch] = useReducer(reducer, INITIAL);

  // 省份/城市状态
  const [selectedProvince, setSelectedProvince] = useState('');
  const cities = selectedProvince ? getCitiesByProvince(selectedProvince) : [];
  const provinces = PROVINCES;

  // 目的地数据
  const [destinations, setDestinations] = useState<{ id: string; city: string; country: string }[]>([]);

  // AI 推荐状态（带 localStorage 缓存）
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null);
  const [aiInterests, setAiInterests] = useState<AIInterest[]>([]);
  const [aiDietary, setAiDietary] = useState<string[]>([]);
  const [aiAddOns, setAiAddOns] = useState<AddOnConfig[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [prefsLoading, setPrefsLoading] = useState(false);
  const userSelectedRef = useRef(false);

  // 从 localStorage 恢复草稿 + AI 缓存
  useEffect(() => {
    try {
      // 恢复表单草稿
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const draft = JSON.parse(raw) as Partial<BookingFormState>;
        if (draft.tripConfig || draft.preferences || draft.selectedAddOns || draft.contact) {
          dispatch({ type: 'RESTORE_DRAFT', payload: draft });
        }
      }
      // 恢复 AI 推荐缓存
      const aiRaw = localStorage.getItem(AI_STORAGE_KEY);
      if (aiRaw) {
        const aiCache = JSON.parse(aiRaw) as AICache;
        if (aiCache.tripDetails) setTripDetails(aiCache.tripDetails);
        if (aiCache.aiInterests?.length) setAiInterests(aiCache.aiInterests);
        if (aiCache.aiDietary?.length) setAiDietary(aiCache.aiDietary);
        if (aiCache.aiAddOns?.length) setAiAddOns(aiCache.aiAddOns);
      }
    } catch { /* ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 获取所有目的地（按 scope 过滤）
  useEffect(() => {
    fetch(`/api/destinations?scope=${scope}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setDestinations(data); })
      .catch(() => {});
  }, [scope]);

  // 草稿自动保存（表单数据）
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

  // AI 推荐数据自动保存（独立于表单保存）
  const aiSaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (aiSaveTimer.current) clearTimeout(aiSaveTimer.current);
    aiSaveTimer.current = setTimeout(() => {
      try {
        const aiCache: AICache = { tripDetails, aiInterests, aiDietary, aiAddOns };
        localStorage.setItem(AI_STORAGE_KEY, JSON.stringify(aiCache));
      } catch { /* ignore */ }
    }, 500);
    return () => { if (aiSaveTimer.current) clearTimeout(aiSaveTimer.current); };
  }, [tripDetails, aiInterests, aiDietary, aiAddOns, AI_STORAGE_KEY]);

  // 目的地数据
  const selectedDestination = destinations.find((d) => d.id === state.tripConfig.destinationId);

  // 活跃附加服务：AI 优先，兜底用静态配置
  const activeAddOns: AddOnConfig[] = useMemo(
    () => aiAddOns.length > 0 ? aiAddOns : EMPTY_ADD_ONS,
    [aiAddOns],
  );
  const activeAddOnPrices: Record<string, number> = useMemo(
    () => aiAddOns.length > 0
      ? Object.fromEntries(aiAddOns.map((a) => [a.id, a.price]))
      : addOnPrices,
    [aiAddOns, addOnPrices],
  );

  // 本地价格兜底（AI 失败时使用）
  const dispatchLocalPriceFallback = useCallback(() => {
    const { days, adults, children, startDate } = state.tripConfig;
    const local = estimateLocalPrice({ scope, days, adults, children, travelDate: startDate });
    const basePrice = calculateBasePrice(local.perPersonPrice, adults, children);
    const addOnsTotal = calculateAddOnsTotal(state.selectedAddOns, activeAddOnPrices);
    dispatch({ type: 'SET_PRICE', payload: { basePrice, addOnsTotal, total: basePrice + addOnsTotal } });
  }, [scope, state.tripConfig, state.selectedAddOns, activeAddOnPrices]);

  // 确认行程信息 → 触发 AI 推荐
  const [aiLoading, setAiLoading] = useState(false);
  const confirmTrip = useCallback(() => {
    if (!selectedDestination || !state.tripConfig.origin) return;

    const originEn = toEnglish(state.tripConfig.origin);
    const destEn = toEnglish(selectedDestination.city ?? '') || selectedDestination.country;

    setAiLoading(true);
    setDetailsLoading(true);
    setPrefsLoading(true);
    dispatch({ type: 'SET_PRICE_LOADING' });

    Promise.all([
      fetch('/api/ai-trip-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin: originEn, destination: destEn, scope, adults: state.tripConfig.adults, children: state.tripConfig.children, travelDate: state.tripConfig.startDate }),
      }).then((r) => r.json()),

      fetch('/api/ai-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: destEn, scope }),
      }).then((r) => r.json()),

      fetch('/api/ai-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: originEn, destination: destEn, scope,
          days: state.tripConfig.days, adults: state.tripConfig.adults,
          children: state.tripConfig.children, travelDate: state.tripConfig.startDate,
        }),
      }).then((r) => r.json()),
    ])
      .then(([tripData, prefData, priceData]) => {
        if (!tripData.error) {
          setTripDetails(tripData);
          dispatch({ type: 'SET_TRIP', payload: { days: tripData.recommendedDays } });
        }
        setDetailsLoading(false);

        if (!prefData.error) {
          setAiInterests(prefData.interests ?? []);
          setAiDietary(prefData.dietary ?? []);
          if (Array.isArray(prefData.addOns) && prefData.addOns.length > 0) {
            setAiAddOns(prefData.addOns as AddOnConfig[]);
          }
        }
        setPrefsLoading(false);

        if (!priceData.error && priceData.basePrice > 0) {
          const addOnsTotal = calculateAddOnsTotal(state.selectedAddOns, activeAddOnPrices);
          dispatch({ type: 'SET_PRICE', payload: { basePrice: priceData.basePrice, addOnsTotal, total: priceData.basePrice + addOnsTotal } });
        } else {
          dispatchLocalPriceFallback();
        }
      })
      .catch(() => {
        setDetailsLoading(false);
        setPrefsLoading(false);
        dispatchLocalPriceFallback();
      })
      .finally(() => setAiLoading(false));
  }, [selectedDestination, state.tripConfig.origin, state.tripConfig.adults, state.tripConfig.children, state.tripConfig.startDate, state.tripConfig.days, scope, state.selectedAddOns, activeAddOnPrices, dispatchLocalPriceFallback]);

  // 附加项变化 → 更新总价
  useEffect(() => {
    if (!state.priceBreakdown) return;
    const addOnsTotal = calculateAddOnsTotal(state.selectedAddOns, activeAddOnPrices);
    if (addOnsTotal === state.priceBreakdown.addOnsTotal) return;
    dispatch({ type: 'SET_PRICE', payload: {
      basePrice: state.priceBreakdown.basePrice,
      addOnsTotal,
      total: state.priceBreakdown.basePrice + addOnsTotal,
    }});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedAddOns, activeAddOnPrices]);

  // 省份选择
  const setProvince = useCallback((province: string) => {
    setSelectedProvince(province);
    dispatch({ type: 'SET_TRIP', payload: { origin: '', routeId: '', destinationId: '', transitId: '' } });
    setTripDetails(null);
    setAiInterests([]);
    setAiDietary([]);
    setAiAddOns([]);
  }, []);

  // 便捷方法
  const setTrip = useCallback((p: Partial<TripConfig>) => {
    if (p.destinationId) userSelectedRef.current = true;
    dispatch({ type: 'SET_TRIP', payload: p });
  }, []);
  const setPrefs = useCallback((p: Partial<TravelPreferences>) => dispatch({ type: 'SET_PREFS', payload: p }), []);
  const toggleAddOn = useCallback((id: string) => dispatch({ type: 'TOGGLE_ADDON', payload: id }), []);
  const setContact = useCallback((p: Partial<ContactInfo>) => dispatch({ type: 'SET_CONTACT', payload: p }), []);
  const setErrors = useCallback((e: Record<string, string>) => dispatch({ type: 'SET_ERRORS', payload: e }), []);
  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
    setSelectedProvince('');
    setTripDetails(null);
    setAiInterests([]);
    setAiDietary([]);
    setAiAddOns([]);
    userSelectedRef.current = false;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(AI_STORAGE_KEY);
    }
  }, [STORAGE_KEY, AI_STORAGE_KEY]);

  // 提交到 TravelOrder
  const submit = useCallback(async () => {
    // 价格校验
    if (!state.priceBreakdown || state.priceBreakdown.total <= 0) {
      dispatch({ type: 'SET_SUBMIT_ERROR', payload: '请先确认行程信息并获取报价' });
      return;
    }

    dispatch({ type: 'SET_SUBMIT', payload: 'submitting' });
    const clientToken = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const formData: BookingFormData = {
      tripConfig: state.tripConfig,
      preferences: state.preferences,
      selectedAddOns: state.selectedAddOns,
      contact: state.contact,
    };

    // 包含 AI 推荐数据
    const aiData = {
      tripDetails,
      priceBreakdown: state.priceBreakdown,
      interests: aiInterests,
      dietary: aiDietary,
      addOns: aiAddOns,
    };

    try {
      const res = await fetch('/api/travel-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData, clientToken, aiData, scope }),
      });
      const data = await res.json();
      if (data.success) {
        dispatch({ type: 'SET_BOOKING_ID', payload: data.data.id });
        // 清空所有缓存
        if (typeof window !== 'undefined') {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(AI_STORAGE_KEY);
        }
      } else {
        dispatch({ type: 'SET_SUBMIT_ERROR', payload: data.error?.message || '提交失败' });
      }
    } catch {
      dispatch({ type: 'SET_SUBMIT_ERROR', payload: '网络连接失败，请稍后重试' });
    }
  }, [state, tripDetails, aiInterests, aiDietary, aiAddOns, STORAGE_KEY, AI_STORAGE_KEY]);

  return {
    state,
    provinces,
    cities,
    selectedProvince,
    setProvince,
    destinations,
    selectedDestination,
    tripDetails,
    detailsLoading,
    aiInterests,
    aiDietary,
    aiAddOns,
    activeAddOns,
    prefsLoading,
    aiLoading,
    confirmTrip,
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
