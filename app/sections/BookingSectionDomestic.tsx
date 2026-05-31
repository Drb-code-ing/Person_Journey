"use client";

import { useCallback, useRef } from "react";
import { motion, useInView, useMotionValue, animate } from "framer-motion";
import { useState } from "react";
import {
  MapPin, Calendar, Minus, Plus, Phone, Lock, FileCheck, CheckCircle2, ChevronDown,
  Shield, Plane, Car, UtensilsCrossed, RotateCcw, Ticket, Loader2, Check, AlertCircle, Train,
} from "lucide-react";
import { useBookingForm } from "../lib/hooks/useBookingForm";
import { DOMESTIC_INTERESTS, DOMESTIC_DIETARY_OPTIONS, DOMESTIC_ADD_ONS, DOMESTIC_PRIVILEGES, DOMESTIC_TEAM_MEMBERS } from "../lib/data/booking-config-domestic";
import { validateBookingForm, errorsToMap } from "../lib/validation";
import { formatPrice } from "../lib/pricing";
import type { BookingFormData } from "../lib/types/booking";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/contexts/AuthContext";

const goldEase = [0.76, 0, 0.24, 1] as const;

/* ─── Icon map ─── */
const ICONS: Record<string, React.ElementType> = { Shield, Plane, Car, UtensilsCrossed, RotateCcw, Ticket, Train };

/* ─── Shared animation constants ─── */
const fadeUp = { hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.06 } } };
const chipPop = { hidden: { opacity: 0, scale: 0.85 }, visible: { opacity: 1, scale: 1 } };
const quickTrans = { duration: 0.3, ease: goldEase };
const popIn = { initial: { scale: 1.3, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { duration: 0.2 } };
const tapBtn = { scale: 0.9 };
const tapSm = { scale: 0.95 };
const tapMd = { scale: 0.98 };
const tapLg = { scale: 0.97 };
const hoverChip = { scale: 1.03 };
const hoverPriv = { borderColor: "rgba(201,169,110,0.3)", y: -4 };
const hoverTeam = { y: -6, boxShadow: "0 16px 48px rgba(0,0,0,0.4)" };
const hoverTeamBtn = { backgroundColor: "rgba(201,169,110,0.15)" };
const hoverAddon = { borderColor: "rgba(201,169,110,0.4)" };
const hoverCta = { scale: 1.03, backgroundColor: "#d4b87d" };
const addonCheckActive = { scale: [1, 1.2, 1] };

/* ─── 附加项价格映射 ─── */
const ADDON_PRICES: Record<string, number> = Object.fromEntries(DOMESTIC_ADD_ONS.map((a) => [a.id, a.price]));

/* ─── AnimatedSection ─── */
function AnimatedSection({ children, className, id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });
  return (
    <motion.section ref={ref} id={id} className={className} initial="hidden" animate={inView ? "visible" : "hidden"} variants={fadeUp} transition={{ duration: 0.7, ease: goldEase }}>
      {children}
    </motion.section>
  );
}

/* ─── AnimatedPrice ─── */
function AnimatedPrice({ value }: { value: number }) {
  const motionVal = useMotionValue(value);
  const [display, setDisplay] = useState(() => formatPrice(value));
  const prevVal = useRef(value);
  if (prevVal.current !== value) {
    prevVal.current = value;
    animate(motionVal, value, { duration: 0.6, ease: goldEase, onUpdate: (v) => setDisplay(formatPrice(Math.round(v))) });
  }
  return <motion.p className="booking-cost-total-price">{display}</motion.p>;
}

/* ─── Counter ─── */
function Counter({ value, min, onDec, onInc }: { value: number; min: number; onDec: () => void; onInc: () => void }) {
  return (
    <div className="booking-counter">
      <motion.button whileTap={tapBtn} onClick={onDec}><Minus size={14} /></motion.button>
      <motion.span key={value} {...popIn}>{value}</motion.span>
      <motion.button whileTap={tapBtn} onClick={onInc}><Plus size={14} /></motion.button>
    </div>
  );
}

/* ─── Transport badge ─── */
function TransportBadge({ type }: { type: string }) {
  const label = type === 'highspeed-rail' ? '🚄 高铁' : type === 'flight' ? '✈️ 航班' : type === 'helicopter' ? '🚁 直升机' : '🚗 专车';
  return <span className="booking-tag">{label}</span>;
}

/* ─── Component ─── */
export default function BookingSectionDomestic() {
  const router = useRouter();
  const { user } = useAuth();
  const { state, provinces, cities, selectedProvince, setProvince, destinations, selectedDestination, tripDetails, detailsLoading, aiInterests, aiDietary, prefsLoading, aiLoading, confirmTrip, setTrip, setPrefs, toggleAddOn, setContact, setErrors, submit, reset, total } = useBookingForm('domestic', ADDON_PRICES);
  const { tripConfig, preferences, selectedAddOns, contact, errors, submitStatus, submitError, bookingId, priceLoading } = state;

  // 是否可以确认（出发城市和目的地都已选择）
  const canConfirm = tripConfig.origin && tripConfig.destinationId;

  const selectedAddOnsSet = new Set(selectedAddOns.map((a) => a.addOnId));
  const selectedInterestsSet = new Set(preferences.interests);
  const selectedDietarySet = new Set(preferences.dietary);

  const toggleInterest = useCallback((label: string) => {
    setPrefs({ interests: selectedInterestsSet.has(label) ? preferences.interests.filter((l) => l !== label) : [...preferences.interests, label] });
  }, [preferences.interests, setPrefs]);

  const toggleDietary = useCallback((label: string) => {
    setPrefs({ dietary: selectedDietarySet.has(label) ? preferences.dietary.filter((l) => l !== label) : [...preferences.dietary, label] });
  }, [preferences.dietary, setPrefs]);

  const scrollToPrefs = useCallback(() => {
    document.getElementById("booking-prefs")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const handleSubmit = useCallback(async () => {
    // 未登录则跳转登录页
    if (!user) {
      router.push('/login?redirect=/booking-domestic');
      return;
    }

    const formData: BookingFormData = {
      tripConfig, preferences, selectedAddOns, contact,
    };
    const errs = validateBookingForm(formData);
    if (errs.length > 0) {
      setErrors(errorsToMap(errs));
      const firstField = document.querySelector(`[data-field="${errs[0].field}"]`);
      firstField?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setErrors({});
    await submit();
  }, [tripConfig, preferences, selectedAddOns, contact, submit, setErrors, user, router]);

  /* ─── 提交成功状态 ─── */
  if (submitStatus === 'success' && bookingId) {
    return (
      <div className="booking-page">
        <motion.div
          className="booking-confirm-card"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: goldEase }}
        >
          <div className="booking-confirm-icon"><Check size={40} /></div>
          <h2>您的国内旅程已收到</h2>
          <p>旅行管家将在 24 小时内与您联系</p>
          <div className="booking-confirm-id">申请编号：{bookingId}</div>
          <button className="booking-cta-btn" onClick={reset}>返回</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      {/* ═══════════ Hero ═══════════ */}
      <section className="booking-hero">
        <div className="booking-hero-bg">
          <img src="https://picsum.photos/id/1039/1200/800" alt="国内奢华旅行" className="booking-hero-img" />
          <div className="booking-hero-overlay" />
        </div>
        <motion.div className="booking-hero-content" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: goldEase }}>
          <p className="booking-hero-eyebrow">Domestic Luxury Travel</p>
          <h1 className="booking-hero-title">探索祖国的辽阔秘境</h1>
          <p className="booking-hero-desc">无需签证，说走就走。从雪山之巅到古镇深巷，高铁穿行山河，直升机俯瞰大地，为您编织独一无二的中式奢享之旅。</p>
          <button className="booking-cta-btn" onClick={scrollToPrefs}>开始定制</button>
        </motion.div>
      </section>

      {/* ═══════════ 切换提示 ═══════════ */}
      <div className="booking-domestic-switch-hint">
        <div className="booking-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🌍</span>
            <div>
              <p style={{ color: '#F5F0EB', fontWeight: 600, fontSize: '0.95rem' }}>心向远方？</p>
              <p style={{ color: 'rgba(245,240,235,0.6)', fontSize: '0.85rem' }}>探索我们的国际奢华航线，飞往全球33个顶级目的地</p>
            </div>
          </div>
          <Link href="/booking" className="booking-cta-btn" style={{ padding: '0.6rem 1.5rem', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
            探索国际航线 →
          </Link>
        </div>
      </div>

      {/* ═══════════ 01 · 行程概览 ═══════════ */}
      <AnimatedSection className="booking-section booking-overview">
        <div className="booking-inner">
          <div className="booking-section-header">
            <span className="booking-step-num">01</span>
            <h2 className="booking-section-title">行程概览</h2>
          </div>

          <motion.div className="booking-route" variants={stagger}>
            {/* 省份选择 */}
            <motion.div className="booking-route-stop" variants={fadeUp}>
              <span className="booking-route-label">出发省份</span>
              <select
                className="booking-select"
                value={selectedProvince}
                onChange={(e) => setProvince(e.target.value)}
              >
                <option value="">请选择省份</option>
                {provinces.map((p) => <option key={p.province} value={p.province}>{p.province}</option>)}
              </select>
            </motion.div>

            {/* 城市选择（省份选中后显示） */}
            {cities.length > 0 && (
              <>
                <div className="booking-route-line" />
                <motion.div className="booking-route-stop" variants={fadeUp}>
                  <span className="booking-route-label">出发城市</span>
                  <select
                    className="booking-select"
                    value={tripConfig.origin}
                    onChange={(e) => setTrip({ origin: e.target.value, routeId: '', destinationId: '', transitId: '' })}
                  >
                    <option value="">请选择城市</option>
                    {cities.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </motion.div>
              </>
            )}

            {/* 目的地选择 */}
            {tripConfig.origin && destinations.length > 0 && (
              <>
                <div className="booking-route-line" />
                <motion.div className="booking-route-stop" variants={fadeUp}>
                  <span className="booking-route-label">选择目的地</span>
                  <select
                    className="booking-select"
                    value={tripConfig.destinationId}
                    onChange={(e) => {
                      const dest = destinations.find((d) => d.id === e.target.value);
                      if (dest) setTrip({ destinationId: dest.id, routeId: '', transitId: '' });
                    }}
                  >
                    <option value="">请选择目的地</option>
                    {destinations.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.city ?? d.country}
                      </option>
                    ))}
                  </select>
                  {selectedDestination && (
                    <>
                      <span className="booking-route-city">{selectedDestination.city ?? selectedDestination.country}</span>
                      <span className="booking-route-sub">{selectedDestination.country}</span>
                    </>
                  )}
                </motion.div>
              </>
            )}

            {/* 提示信息 */}
            {!selectedProvince && (
              <motion.div className="booking-route-stop" variants={fadeUp}>
                <span className="booking-route-sub" style={{ opacity: 0.5 }}>← 请先选择出发省份</span>
              </motion.div>
            )}
            {selectedProvince && !tripConfig.origin && (
              <motion.div className="booking-route-stop" variants={fadeUp}>
                <span className="booking-route-sub" style={{ opacity: 0.5 }}>← 请选择出发城市</span>
              </motion.div>
            )}
          </motion.div>

          {/* 确认按钮 - 触发 AI 推荐 */}
          {canConfirm && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{ marginTop: '16px', textAlign: 'center' }}
            >
              <motion.button
                className="booking-cta-btn"
                style={{ padding: '10px 28px', fontSize: '14px' }}
                whileHover={aiLoading ? {} : { scale: 1.03 }}
                whileTap={aiLoading ? {} : { scale: 0.97 }}
                onClick={confirmTrip}
                disabled={aiLoading}
              >
                {aiLoading ? 'AI 分析中...' : '✨ 确认信息，获取 AI 推荐'}
              </motion.button>
              <p style={{ fontSize: '11px', color: 'rgba(245,240,235,0.4)', marginTop: '6px' }}>
                确认出发地和目的地后，AI 将为您推荐行程、交通、酒店和专属偏好
              </p>
            </motion.div>
          )}

          <motion.div className="booking-tags" variants={stagger}>
            {detailsLoading ? (
              <motion.span className="booking-tag animate-pulse" variants={chipPop}>AI 推荐中...</motion.span>
            ) : tripDetails ? (
              <>
                <motion.span className="booking-tag" variants={chipPop}>{tripDetails.recommendedDays}天{tripDetails.recommendedDays - 1}晚</motion.span>
                <motion.span className="booking-tag" variants={chipPop}>{tripDetails.transportType === 'highspeed-rail' ? '🚄 高铁商务座' : '✈️ 航班'}</motion.span>
                <motion.span className="booking-tag" variants={chipPop}>全程五星酒店</motion.span>
              </>
            ) : (
              <>
                <motion.span className="booking-tag" variants={chipPop}>{tripConfig.days}天{tripConfig.days - 1}晚</motion.span>
                <motion.span className="booking-tag" variants={chipPop}>全程五星酒店</motion.span>
                <motion.span className="booking-tag" variants={chipPop}>高铁/航班可选</motion.span>
              </>
            )}
          </motion.div>

          <motion.div className="booking-params-card" variants={fadeUp}>
            <h3 className="booking-params-title">基础参数</h3>
            <div className="booking-params-grid">
              <div className="booking-param" data-field="tripConfig.startDate">
                <Calendar size={16} /><span>出行日期</span>
                <input
                  type="date"
                  className="booking-param-value booking-date-input"
                  value={tripConfig.startDate}
                  onChange={(e) => setTrip({ startDate: e.target.value })}
                />
              </div>
              <div className="booking-param">
                <span>成人</span>
                <Counter value={tripConfig.adults} min={1} onDec={() => setTrip({ adults: Math.max(1, tripConfig.adults - 1) })} onInc={() => setTrip({ adults: tripConfig.adults + 1 })} />
              </div>
              <div className="booking-param">
                <span>儿童</span>
                <Counter value={tripConfig.children} min={0} onDec={() => setTrip({ children: Math.max(0, tripConfig.children - 1) })} onInc={() => setTrip({ children: tripConfig.children + 1 })} />
              </div>
            </div>
            <p className="booking-note">* 国内行程可灵活调整，支持48小时内出发。价格随季节浮动。</p>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ═══════════ 您的专属偏好 ═══════════ */}
      <AnimatedSection className="booking-section booking-preferences" id="booking-prefs">
        <div className="booking-inner">
          <h2 className="booking-section-title">您的专属偏好</h2>

          <div className="booking-pref-group" data-field="preferences.interests">
            <div className="booking-pref-header"><MapPin size={16} /><span>体验兴趣选择</span></div>
            {prefsLoading ? (
              <div className="booking-chip-grid">
                {[1,2,3,4,5].map((i) => (
                  <div key={i} className="booking-chip animate-pulse" style={{ height: '36px', background: 'rgba(201,169,110,0.1)' }} />
                ))}
              </div>
            ) : (
              <motion.div className="booking-chip-grid" variants={stagger}>
                {(aiInterests.length > 0 ? aiInterests : DOMESTIC_INTERESTS).map((item) => (
                  <motion.button key={item.label} className={`booking-chip${selectedInterestsSet.has(item.label) ? " active" : ""}`} onClick={() => toggleInterest(item.label)} variants={chipPop} whileTap={tapSm} whileHover={hoverChip}>
                    <span>{item.emoji}</span><span>{item.label}</span>
                  </motion.button>
                ))}
              </motion.div>
            )}
            {errors['preferences.interests'] && <p className="booking-error-msg">{errors['preferences.interests']}</p>}
          </div>

          <div className="booking-pref-group">
            <div className="booking-pref-header"><UtensilsCrossed size={16} /><span>饮食偏好</span></div>
            {prefsLoading ? (
              <div className="booking-chip-row">
                {[1,2,3,4].map((i) => (
                  <div key={i} className="booking-chip-sm animate-pulse" style={{ height: '28px', background: 'rgba(201,169,110,0.1)' }} />
                ))}
              </div>
            ) : (
              <motion.div className="booking-chip-row" variants={stagger}>
                {(aiDietary.length > 0 ? aiDietary : DOMESTIC_DIETARY_OPTIONS).map((opt) => (
                  <motion.button key={opt} className={`booking-chip-sm${selectedDietarySet.has(opt) ? " active" : ""}`} onClick={() => toggleDietary(opt)} variants={chipPop} whileTap={tapSm}>{opt}</motion.button>
                ))}
              </motion.div>
            )}
          </div>

          <div className="booking-pref-group">
            <label className="booking-pref-label">特殊场合与纪念日</label>
            <textarea className="booking-textarea" placeholder="如：生日、结婚纪念日、家庭团聚..." rows={3} value={preferences.specialOccasion} onChange={(e) => setPrefs({ specialOccasion: e.target.value })} />
          </div>

          <div className="booking-input-row">
            <div className="booking-input-group">
              <label className="booking-pref-label">枕头菜单偏好</label>
              <input className="booking-input" placeholder="如：荞麦枕、记忆棉、薰衣草香氛..." value={preferences.pillowPreference} onChange={(e) => setPrefs({ pillowPreference: e.target.value })} />
            </div>
            <div className="booking-input-group">
              <label className="booking-pref-label">其他特殊需求</label>
              <textarea className="booking-textarea" placeholder="如：轮椅通道、婴儿床、宠物同行..." rows={2} value={preferences.otherRequirements} onChange={(e) => setPrefs({ otherRequirements: e.target.value })} />
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* ═══════════ 费用概览 ═══════════ */}
      <AnimatedSection className="booking-section booking-cost">
        <div className="booking-inner">
          <h2 className="booking-section-title">费用概览</h2>
          <div className="booking-cost-base">
            <div>
              <p className="booking-cost-label">基础行程费用</p>
              <p className="booking-cost-desc">
                包含：交通接驳、五星酒店住宿、私人管家服务
              </p>
            </div>
            <p className="booking-cost-price">{priceLoading ? <span className="animate-pulse">AI 计算中...</span> : selectedDestination ? formatPrice(total - (state.priceBreakdown?.addOnsTotal ?? 0)) : '---'}</p>
          </div>

          <motion.div className="booking-cost-addons" variants={stagger}>
            {DOMESTIC_ADD_ONS.map((addon) => {
              const isActive = selectedAddOnsSet.has(addon.id);
              return (
                <motion.div key={addon.id} className={`booking-addon${isActive ? " active" : ""}`} onClick={() => toggleAddOn(addon.id)} variants={fadeUp} whileTap={tapMd} whileHover={hoverAddon}>
                  <span>{addon.name}</span>
                  <div className="booking-addon-right">
                    <span className="booking-addon-price">+{formatPrice(addon.price)}</span>
                    <motion.div animate={isActive ? addonCheckActive : {}} transition={quickTrans}>
                      <CheckCircle2 size={18} className={isActive ? "text-[#C9A96E]" : "text-white/20"} />
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="booking-cost-total">
            <div><p className="booking-cost-label">估算总额</p><p className="booking-cost-desc-sm">含税及定制服务费</p></div>
            <AnimatedPrice value={total} />
          </div>
        </div>
      </AnimatedSection>

      {/* ═══════════ 尊享礼遇 ═══════════ */}
      <AnimatedSection className="booking-section booking-privileges">
        <div className="booking-inner">
          <h2 className="booking-section-title">您的尊享礼遇</h2>
          <motion.div className="booking-priv-grid" variants={stagger}>
            {DOMESTIC_PRIVILEGES.map((p) => {
              const Icon = ICONS[p.icon] || Shield;
              return (
                <motion.div key={p.title} className="booking-priv-card" variants={chipPop} whileHover={hoverPriv} transition={quickTrans}>
                  <div className="booking-priv-icon"><Icon size={20} /></div>
                  <h3 className="booking-priv-title">{p.title}</h3>
                  <p className="booking-priv-desc">{p.desc}</p>
                  <ChevronDown size={16} className="booking-priv-arrow" />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ═══════════ 管家团队 ═══════════ */}
      <AnimatedSection className="booking-section booking-team">
        <div className="booking-inner">
          <h2 className="booking-section-title">您的旅行管家团队</h2>
          <motion.div className="booking-team-grid" variants={stagger}>
            {DOMESTIC_TEAM_MEMBERS.map((m) => (
              <motion.div key={m.name} className="booking-team-card" variants={fadeUp} whileHover={hoverTeam} transition={quickTrans}>
                <div className="booking-team-avatar">
                  <img src={m.avatar} alt={m.name} />
                  <span className="booking-team-badge">{m.badge}</span>
                </div>
                <div className="booking-team-info">
                  <div className="booking-team-name">
                    <span>{m.name}</span>
                    {m.nameCn && <span className="booking-team-name-cn">{m.nameCn}</span>}
                  </div>
                  <p className="booking-team-bio">{m.bio}</p>
                  <div className="booking-team-lang">{m.langs.map((l) => <span key={l}>{l}</span>)}</div>
                  <motion.button className="booking-team-btn" whileHover={hoverTeamBtn} whileTap={tapLg} onClick={() => alert(`${m.name} 的专属管家将在24小时内与您联系`)}><Phone size={14} />预约通话</motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ═══════════ CTA + 联系信息 ═══════════ */}
      <AnimatedSection className="booking-section booking-final-cta">
        <div className="booking-inner booking-final-cta-inner">
          <h2 className="booking-final-cta-title">准备好探索祖国了吗？</h2>
          <p className="booking-final-cta-desc">点击下方按钮提交您的定制意向。我们的资深策划师将在 24 小时内与您取得联系，为您雕琢一段难忘的中式奢享之旅。</p>

          {/* 联系信息表单 */}
          <div className="booking-contact-form">
            <div className="booking-contact-row">
              <div className="booking-input-group" data-field="contact.name">
                <label className="booking-pref-label">您的称呼 *</label>
                <input className={`booking-input${errors['contact.name'] ? ' booking-input-error' : ''}`} placeholder="姓名" value={contact.name} onChange={(e) => setContact({ name: e.target.value })} />
                {errors['contact.name'] && <p className="booking-error-msg">{errors['contact.name']}</p>}
              </div>
              <div className="booking-input-group" data-field="contact.phone">
                <label className="booking-pref-label">手机号 *</label>
                <input className={`booking-input${errors['contact.phone'] ? ' booking-input-error' : ''}`} placeholder="11位手机号" value={contact.phone} onChange={(e) => setContact({ phone: e.target.value })} />
                {errors['contact.phone'] && <p className="booking-error-msg">{errors['contact.phone']}</p>}
              </div>
            </div>
            <div className="booking-input-group" data-field="contact.email">
              <label className="booking-pref-label">电子邮箱（选填）</label>
              <input className={`booking-input${errors['contact.email'] ? ' booking-input-error' : ''}`} placeholder="your@email.com" value={contact.email} onChange={(e) => setContact({ email: e.target.value })} />
              {errors['contact.email'] && <p className="booking-error-msg">{errors['contact.email']}</p>}
            </div>
          </div>

          {/* 提交错误提示 */}
          {submitStatus === 'error' && submitError && (
            <motion.div className="booking-submit-error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <AlertCircle size={16} />{submitError}
            </motion.div>
          )}

          <motion.button
            className="booking-cta-btn booking-cta-btn-lg"
            whileHover={submitStatus === 'submitting' ? {} : hoverCta}
            whileTap={submitStatus === 'submitting' ? {} : tapLg}
            onClick={handleSubmit}
            disabled={submitStatus === 'submitting'}
          >
            {submitStatus === 'submitting' ? <><Loader2 size={16} className="animate-spin" />提交中...</> : '提交定制申请'}
          </motion.button>

          <motion.div className="booking-trust" variants={stagger}>
            <motion.div className="booking-trust-item" variants={fadeUp}><Lock size={14} /><span>SSL 加密传输</span></motion.div>
            <motion.div className="booking-trust-item" variants={fadeUp}><FileCheck size={14} /><span>隐私保护协议</span></motion.div>
            <motion.div className="booking-trust-item" variants={fadeUp}><CheckCircle2 size={14} /><span>100% 满意保证</span></motion.div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ═══════════ Footer ═══════════ */}
      <footer className="booking-footer">
        <div className="booking-inner">
          <div className="booking-footer-top">
            <div className="booking-footer-brand">
              <div className="booking-footer-logo">A</div>
              <span className="booking-footer-name">AURUM VOYAGES</span>
              <p className="booking-footer-about">奥睿旅行（AURUM VOYAGES）致力于为中国高净值人士提供超越期待的国内定制旅行体验。我们相信最美的风景就在脚下，最深的感动源于故土。</p>
            </div>
            <div className="booking-footer-links">
              <div><h4>探索更多</h4><a href="#">国内目的地指南</a><a href="#">高铁奢旅系列</a><a href="#">直升机空中游览</a><a href="#">亲子奢享行程</a></div>
              <div><h4>联系我们</h4><p>400-888-9999</p><p>concierge@aurumvoyages.com</p><p>上海市黄浦区外滩18号</p></div>
            </div>
          </div>
          <div className="booking-footer-bottom">
            <p>© 2026 AURUM VOYAGES. ALL RIGHTS RESERVED.</p>
            <div><a href="#">隐私政策</a><a href="#">服务条款</a><a href="#">法律声明</a></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
