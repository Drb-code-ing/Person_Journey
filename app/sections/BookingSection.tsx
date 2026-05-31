"use client";

import { useCallback, useRef } from "react";
import { motion, useInView, useMotionValue, animate } from "framer-motion";
import { useState } from "react";
import {
  MapPin, Calendar, Minus, Plus, Phone, Lock, FileCheck, CheckCircle2, ChevronDown,
  Shield, Plane, Car, UtensilsCrossed, RotateCcw, Ticket, Loader2, Check, AlertCircle,
} from "lucide-react";
import { useBookingForm } from "../lib/hooks/useBookingForm";
import { INTERESTS, DIETARY_OPTIONS, ADD_ONS, PRIVILEGES, TEAM_MEMBERS } from "../lib/data/booking-config";
import { validateBookingForm, errorsToMap } from "../lib/validation";
import { formatPrice } from "../lib/pricing";
import type { BookingFormData } from "../lib/types/booking";

const goldEase = [0.76, 0, 0.24, 1] as const;

/* ─── Icon map ─── */
const ICONS: Record<string, React.ElementType> = { Shield, Plane, Car, UtensilsCrossed, RotateCcw, Ticket };

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

/* ─── Component ─── */
export default function BookingSection() {
  const { state, origins, routes, selectedRoute, setTrip, setPrefs, toggleAddOn, setContact, setErrors, submit, reset, total } = useBookingForm();
  const { tripConfig, preferences, selectedAddOns, contact, errors, submitStatus, submitError, bookingId } = state;

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
    const formData: BookingFormData = {
      tripConfig, preferences, selectedAddOns, contact,
    };
    const errs = validateBookingForm(formData);
    if (errs.length > 0) {
      setErrors(errorsToMap(errs));
      // 滚动到第一个错误字段
      const firstField = document.querySelector(`[data-field="${errs[0].field}"]`);
      firstField?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setErrors({});
    await submit();
  }, [tripConfig, preferences, selectedAddOns, contact, submit, setErrors]);

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
          <h2>您的旅程已收到</h2>
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
          <img src="https://picsum.photos/id/1015/1200/800" alt="Luxury travel" className="booking-hero-img" />
          <div className="booking-hero-overlay" />
        </div>
        <motion.div className="booking-hero-content" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: goldEase }}>
          <p className="booking-hero-eyebrow">Bespoke Luxury Travel</p>
          <h1 className="booking-hero-title">定制您的非凡旅程</h1>
          <p className="booking-hero-desc">让每一次出发，都成为传世记忆。从私人岛屿到极地秘境，为您编织独一无二的行旅史诗。</p>
          <button className="booking-cta-btn" onClick={scrollToPrefs}>开始定制</button>
        </motion.div>
      </section>

      {/* ═══════════ 01 · 行程概览 ═══════════ */}
      <AnimatedSection className="booking-section booking-overview">
        <div className="booking-inner">
          <div className="booking-section-header">
            <span className="booking-step-num">01</span>
            <h2 className="booking-section-title">行程概览</h2>
          </div>

          <motion.div className="booking-route" variants={stagger}>
            {/* 起点选择 */}
            <motion.div className="booking-route-stop" variants={fadeUp}>
              <span className="booking-route-label">出发城市</span>
              <select
                className="booking-select"
                value={tripConfig.origin}
                onChange={(e) => setTrip({ origin: e.target.value, routeId: '', destinationId: '', transitId: '' })}
              >
                <option value="">请选择出发城市</option>
                {origins.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </motion.div>

            {/* 途经点（从选中路线读取） */}
            {selectedRoute?.transit && (
              <>
                <div className="booking-route-line" />
                <motion.div className="booking-route-stop" variants={fadeUp}>
                  <span className="booking-route-label">途经</span>
                  <span className="booking-route-city">{selectedRoute.transit.city ?? selectedRoute.transit.country}</span>
                  <span className="booking-route-sub">系统推荐</span>
                </motion.div>
              </>
            )}

            {/* 终点/路线选择 */}
            {routes.length > 0 && (
              <>
                <div className="booking-route-line" />
                <motion.div className="booking-route-stop" variants={fadeUp}>
                  <span className="booking-route-label">选择路线</span>
                  <select
                    className="booking-select"
                    value={tripConfig.routeId}
                    onChange={(e) => {
                      const r = routes.find((r) => r.id === e.target.value);
                      if (r) setTrip({ routeId: r.id, destinationId: r.destinationId, transitId: r.transitId ?? '', days: r.days });
                    }}
                  >
                    {routes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.destination.city ?? r.destination.country} · {formatPrice(r.price)}/人 · {r.days}天
                      </option>
                    ))}
                  </select>
                  {selectedRoute && (
                    <>
                      <span className="booking-route-city">{selectedRoute.destination.city ?? selectedRoute.destination.country}</span>
                      <span className="booking-route-sub">{selectedRoute.name}</span>
                    </>
                  )}
                </motion.div>
              </>
            )}

            {/* 未选出发城市的提示 */}
            {tripConfig.origin === '' && (
              <motion.div className="booking-route-stop" variants={fadeUp}>
                <span className="booking-route-sub" style={{ opacity: 0.5 }}>← 请先选择出发城市</span>
              </motion.div>
            )}
          </motion.div>

          <motion.div className="booking-tags" variants={stagger}>
            {[
              selectedRoute ? `${selectedRoute.days}天${selectedRoute.days - 1}晚` : `${tripConfig.days}天${tripConfig.days - 1}晚`,
              "全程奢华五星酒店",
              "私人公务机接驳",
            ].map((t) => (
              <motion.span key={t} className="booking-tag" variants={chipPop}>{t}</motion.span>
            ))}
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
            <p className="booking-note">* 最终行程将根据您的偏好进行微调，价格可能随季节波动。</p>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ═══════════ 您的专属偏好 ═══════════ */}
      <AnimatedSection className="booking-section booking-preferences" id="booking-prefs">
        <div className="booking-inner">
          <h2 className="booking-section-title">您的专属偏好</h2>

          <div className="booking-pref-group" data-field="preferences.interests">
            <div className="booking-pref-header"><MapPin size={16} /><span>体验兴趣选择</span></div>
            <motion.div className="booking-chip-grid" variants={stagger}>
              {INTERESTS.map((item) => (
                <motion.button key={item.label} className={`booking-chip${selectedInterestsSet.has(item.label) ? " active" : ""}`} onClick={() => toggleInterest(item.label)} variants={chipPop} whileTap={tapSm} whileHover={hoverChip}>
                  <span>{item.emoji}</span><span>{item.label}</span>
                </motion.button>
              ))}
            </motion.div>
            {errors['preferences.interests'] && <p className="booking-error-msg">{errors['preferences.interests']}</p>}
          </div>

          <div className="booking-pref-group">
            <div className="booking-pref-header"><UtensilsCrossed size={16} /><span>饮食偏好</span></div>
            <motion.div className="booking-chip-row" variants={stagger}>
              {DIETARY_OPTIONS.map((opt) => (
                <motion.button key={opt} className={`booking-chip-sm${selectedDietarySet.has(opt) ? " active" : ""}`} onClick={() => toggleDietary(opt)} variants={chipPop} whileTap={tapSm}>{opt}</motion.button>
              ))}
            </motion.div>
          </div>

          <div className="booking-pref-group">
            <label className="booking-pref-label">特殊场合与纪念日</label>
            <textarea className="booking-textarea" placeholder="请告诉我们更多细节..." rows={3} value={preferences.specialOccasion} onChange={(e) => setPrefs({ specialOccasion: e.target.value })} />
          </div>

          <div className="booking-input-row">
            <div className="booking-input-group">
              <label className="booking-pref-label">枕头菜单偏好</label>
              <input className="booking-input" placeholder="如：鹅绒、记忆棉、薰衣草香氛..." value={preferences.pillowPreference} onChange={(e) => setPrefs({ pillowPreference: e.target.value })} />
            </div>
            <div className="booking-input-group">
              <label className="booking-pref-label">其他特殊需求</label>
              <textarea className="booking-textarea" placeholder="如：私人翻译、特定的座驾型号..." rows={2} value={preferences.otherRequirements} onChange={(e) => setPrefs({ otherRequirements: e.target.value })} />
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
              <p className="booking-cost-desc">包含：全程公务舱、奢华酒店住宿、私人管家服务</p>
            </div>
            <p className="booking-cost-price">{selectedRoute ? formatPrice(selectedRoute.price * (tripConfig.adults + tripConfig.children)) : '---'}</p>
          </div>

          <motion.div className="booking-cost-addons" variants={stagger}>
            {ADD_ONS.map((addon) => {
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
            {PRIVILEGES.map((p) => {
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
            {TEAM_MEMBERS.map((m) => (
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
                  <motion.button className="booking-team-btn" whileHover={hoverTeamBtn} whileTap={tapLg}><Phone size={14} />预约通话</motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* ═══════════ CTA + 联系信息 ═══════════ */}
      <AnimatedSection className="booking-section booking-final-cta">
        <div className="booking-inner booking-final-cta-inner">
          <h2 className="booking-final-cta-title">准备好开启非凡之旅了吗？</h2>
          <p className="booking-final-cta-desc">点击下方按钮提交您的定制意向。我们的资深策划师将在 24 小时内与您取得联系，共同雕琢属于您的传世旅程。</p>

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
              <p className="booking-footer-about">奥睿旅行（AURUM VOYAGES）致力于为全球高净值人士提供超越期待的定制旅行体验。我们相信旅行不仅是空间的位移，更是心灵的洗礼与生命的积淀。</p>
            </div>
            <div className="booking-footer-links">
              <div><h4>探索更多</h4><a href="#">目的地指南</a><a href="#">私人飞机租赁</a><a href="#">奢华游艇航行</a><a href="#">极地探险系列</a></div>
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
