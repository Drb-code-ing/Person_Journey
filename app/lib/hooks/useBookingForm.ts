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
  CalculatePriceResponse,
  SubmitBookingResponse,
} from '../types/booking';

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

const STORAGE_KEY = 'aurum_booking_draft';

function loadDraft(): Partial<BookingFormState> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveDraft(state: BookingFormState) {
  try {
    const { submitStatus, submitError, bookingId, priceLoading, errors, ...draft } = state;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch { /* ignore */ }
}

/* ─── Hook ─── */

export function useBookingForm() {
  const [state, dispatch] = useReducer(reducer, INITIAL, (init) => {
    const draft = loadDraft();
    return draft ? { ...init, ...draft } : init;
  });

  // 外部数据
  const [origins, setOrigins] = useState<string[]>([]);
  const [routes, setRoutes] = useState<RouteOption[]>([]);

  // 草稿自动保存
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveDraft(state), 800);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [state]);

  // 获取出发城市列表
  useEffect(() => {
    fetch('/api/origins').then((r) => r.json()).then(setOrigins).catch(() => {});
  }, []);

  // 出发城市变化 → 获取可用路线
  useEffect(() => {
    if (!state.tripConfig.origin) { setRoutes([]); return; }
    fetch(`/api/routes?origin=${encodeURIComponent(state.tripConfig.origin)}`)
      .then((r) => r.json())
      .then((data: RouteOption[]) => {
        setRoutes(data);
        // 如果当前选的路线不在新列表中，自动选第一条
        if (data.length > 0 && !data.find((r) => r.id === state.tripConfig.routeId)) {
          const first = data[0];
          dispatch({ type: 'SET_TRIP', payload: {
            routeId: first.id,
            destinationId: first.destinationId,
            transitId: first.transitId ?? '',
            days: first.days,
          }});
        }
      })
      .catch(() => {});
  }, [state.tripConfig.origin]);

  // 选中路线变化 → 更新价格
  const selectedRoute = routes.find((r) => r.id === state.tripConfig.routeId);
  useEffect(() => {
    if (!selectedRoute) return;
    const perPerson = selectedRoute.price;
    const basePrice = perPerson * (state.tripConfig.adults + state.tripConfig.children);
    const addOnsTotal = state.selectedAddOns.reduce((sum, a) => {
      // 附加项价格从 config 读取，这里用简单查找
      const prices: Record<string, number> = { helicopter: 38000, michelin: 15000, balloon: 8000 };
      return sum + (prices[a.addOnId] ?? 0);
    }, 0);
    dispatch({ type: 'SET_PRICE', payload: { basePrice, addOnsTotal, total: basePrice + addOnsTotal } });
  }, [selectedRoute, state.tripConfig.adults, state.tripConfig.children, state.selectedAddOns]);

  // 便捷方法
  const setTrip = useCallback((p: Partial<TripConfig>) => dispatch({ type: 'SET_TRIP', payload: p }), []);
  const setPrefs = useCallback((p: Partial<TravelPreferences>) => dispatch({ type: 'SET_PREFS', payload: p }), []);
  const toggleAddOn = useCallback((id: string) => dispatch({ type: 'TOGGLE_ADDON', payload: id }), []);
  const setContact = useCallback((p: Partial<ContactInfo>) => dispatch({ type: 'SET_CONTACT', payload: p }), []);
  const setErrors = useCallback((e: Record<string, string>) => dispatch({ type: 'SET_ERRORS', payload: e }), []);
  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
    localStorage.removeItem(STORAGE_KEY);
  }, []);

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
        localStorage.removeItem(STORAGE_KEY);
      } else {
        dispatch({ type: 'SET_SUBMIT_ERROR', payload: data.error.message });
      }
    } catch {
      dispatch({ type: 'SET_SUBMIT_ERROR', payload: '网络连接失败，请稍后重试' });
    }
  }, [state.tripConfig, state.preferences, state.selectedAddOns, state.contact]);

  return {
    state,
    origins,
    routes,
    selectedRoute,
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
