"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Calendar,
  Minus,
  Plus,
  Shield,
  Plane,
  Car,
  UtensilsCrossed,
  RotateCcw,
  Ticket,
  Phone,
  Lock,
  FileCheck,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

const goldEase = [0.76, 0, 0.24, 1] as const;

/* ─── Data ─── */

const interests = [
  { emoji: "🍽️", label: "美食探索" },
  { emoji: "🍷", label: "葡萄酒品鉴" },
  { emoji: "🎨", label: "艺术文化" },
  { emoji: "⛰️", label: "户外探险" },
  { emoji: "🧘", label: "健康养生" },
  { emoji: "🛍️", label: "购物体验" },
  { emoji: "👨‍👩‍👧‍👦", label: "家庭活动" },
  { emoji: "🏆", label: "体育赛事" },
];

const dietaryOptions = [
  "素食", "纯素食", "无麸质", "无乳制品",
  "无坚果", "无贝类", "低糖", "无酒精",
];

const privileges = [
  {
    icon: Shield,
    title: "私人管家 24/7",
    desc: "您的专属管家将全程待命，无论是临时行程调整还是突发需求，皆能在瞬息间为您妥善安排。",
  },
  {
    icon: Plane,
    title: "机场 VIP 快速通关",
    desc: "告别繁琐的排队等待。在主要枢纽机场享受礼宾接机、VIP 休息室及专属安检通道服务。",
  },
  {
    icon: Car,
    title: "全程私享司导",
    desc: "配备精通当地语言的高级司导。豪华座驾每日深度清洁，备有您喜爱的饮品与香氛。",
  },
  {
    icon: UtensilsCrossed,
    title: "餐厅优先预订权",
    desc: "纵使是极难预约的米其林餐厅或景观位，我们凭借全球资源为您锁定最佳席位。",
  },
  {
    icon: RotateCcw,
    title: "行程灵活改签",
    desc: "计划赶不上变化？我们提供极具灵活性的取消与改签政策，确保您的旅程无后顾之忧。",
  },
  {
    icon: Ticket,
    title: "礼宾通道 VIP 入场",
    desc: "卢浮宫、梵蒂冈博物馆等世界级景点，均可享受免排队礼宾通道及私人专家导览。",
  },
];

const addOns = [
  { name: "私人直升机接驳", price: "+¥38,000" },
  { name: "米其林三星主厨私宴", price: "+¥15,000" },
  { name: "热气球日出体验", price: "+¥8,000" },
];

/* ─── Component ─── */

export default function BookingSection() {
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);

  const toggleInterest = (label: string) =>
    setSelectedInterests((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );

  const toggleDietary = (label: string) =>
    setSelectedDietary((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );

  const toggleAddOn = (name: string) =>
    setSelectedAddOns((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );

  return (
    <div className="booking-page">
      {/* ═══════════ Hero ═══════════ */}
      <section className="booking-hero">
        <div className="booking-hero-bg">
          <img
            src="https://picsum.photos/id/1015/1200/800"
            alt="Luxury travel"
            className="booking-hero-img"
          />
          <div className="booking-hero-overlay" />
        </div>
        <motion.div
          className="booking-hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: goldEase }}
        >
          <p className="booking-hero-eyebrow">Bespoke Luxury Travel</p>
          <h1 className="booking-hero-title">定制您的非凡旅程</h1>
          <p className="booking-hero-desc">
            让每一次出发，都成为传世记忆。从私人岛屿到极地秘境，为您编织独一无二的行旅史诗。
          </p>
          <button className="booking-cta-btn">开始定制</button>
        </motion.div>
      </section>

      {/* ═══════════ 01 · 行程概览 ═══════════ */}
      <section className="booking-section booking-overview">
        <div className="booking-inner">
          <div className="booking-section-header">
            <span className="booking-step-num">01</span>
            <h2 className="booking-section-title">行程概览</h2>
          </div>

          {/* Route */}
          <div className="booking-route">
            <div className="booking-route-stop">
              <span className="booking-route-label">起点</span>
              <span className="booking-route-city">巴黎</span>
              <span className="booking-route-sub">Paris, France</span>
            </div>
            <div className="booking-route-line" />
            <div className="booking-route-stop">
              <span className="booking-route-label">经停</span>
              <span className="booking-route-city">托斯卡纳</span>
              <span className="booking-route-sub">Tuscany, Italy</span>
            </div>
            <div className="booking-route-line" />
            <div className="booking-route-stop">
              <span className="booking-route-label">终点</span>
              <span className="booking-route-city">圣托里尼</span>
              <span className="booking-route-sub">Santorini, Greece</span>
            </div>
          </div>

          {/* Tags */}
          <div className="booking-tags">
            <span className="booking-tag">9天8晚</span>
            <span className="booking-tag">全程奢华五星酒店</span>
            <span className="booking-tag">私人公务机接驳</span>
          </div>

          {/* Basic params */}
          <div className="booking-params-card">
            <h3 className="booking-params-title">基础参数</h3>
            <div className="booking-params-grid">
              <div className="booking-param">
                <Calendar size={16} />
                <span>出行日期</span>
                <span className="booking-param-value">2026-07-15</span>
              </div>
              <div className="booking-param">
                <span>成人</span>
                <div className="booking-counter">
                  <button onClick={() => setAdults(Math.max(1, adults - 1))}>
                    <Minus size={14} />
                  </button>
                  <span>{adults}</span>
                  <button onClick={() => setAdults(adults + 1)}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <div className="booking-param">
                <span>儿童</span>
                <div className="booking-counter">
                  <button onClick={() => setChildren(Math.max(0, children - 1))}>
                    <Minus size={14} />
                  </button>
                  <span>{children}</span>
                  <button onClick={() => setChildren(children + 1)}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
            <p className="booking-note">
              * 最终行程将根据您的偏好进行微调，价格可能随季节波动。
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════ 您的专属偏好 ═══════════ */}
      <section className="booking-section booking-preferences">
        <div className="booking-inner">
          <h2 className="booking-section-title">您的专属偏好</h2>

          {/* Interests */}
          <div className="booking-pref-group">
            <div className="booking-pref-header">
              <MapPin size={16} />
              <span>体验兴趣选择</span>
            </div>
            <div className="booking-chip-grid">
              {interests.map((item) => (
                <button
                  key={item.label}
                  className={`booking-chip ${selectedInterests.includes(item.label) ? "active" : ""}`}
                  onClick={() => toggleInterest(item.label)}
                >
                  <span>{item.emoji}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dietary */}
          <div className="booking-pref-group">
            <div className="booking-pref-header">
              <UtensilsCrossed size={16} />
              <span>饮食偏好</span>
            </div>
            <div className="booking-chip-row">
              {dietaryOptions.map((opt) => (
                <button
                  key={opt}
                  className={`booking-chip-sm ${selectedDietary.includes(opt) ? "active" : ""}`}
                  onClick={() => toggleDietary(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Special occasion */}
          <div className="booking-pref-group">
            <label className="booking-pref-label">特殊场合与纪念日</label>
            <textarea
              className="booking-textarea"
              placeholder="请告诉我们更多细节..."
              rows={3}
            />
          </div>

          {/* Pillow & other */}
          <div className="booking-input-row">
            <div className="booking-input-group">
              <label className="booking-pref-label">枕头菜单偏好</label>
              <input
                className="booking-input"
                placeholder="如：鹅绒、记忆棉、薰衣草香氛..."
              />
            </div>
            <div className="booking-input-group">
              <label className="booking-pref-label">其他特殊需求</label>
              <input
                className="booking-input"
                placeholder="如：私人翻译、特定的座驾型号..."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ 费用概览 ═══════════ */}
      <section className="booking-section booking-cost">
        <div className="booking-inner">
          <h2 className="booking-section-title">费用概览</h2>

          <div className="booking-cost-base">
            <div>
              <p className="booking-cost-label">基础行程费用</p>
              <p className="booking-cost-desc">
                包含：全程公务舱、奢华酒店住宿、私人管家服务
              </p>
            </div>
            <p className="booking-cost-price">¥128,000</p>
          </div>

          <div className="booking-cost-addons">
            {addOns.map((addon) => (
              <div
                key={addon.name}
                className={`booking-addon ${selectedAddOns.includes(addon.name) ? "active" : ""}`}
                onClick={() => toggleAddOn(addon.name)}
              >
                <span>{addon.name}</span>
                <div className="booking-addon-right">
                  <span className="booking-addon-price">{addon.price}</span>
                  <CheckCircle2
                    size={18}
                    className={selectedAddOns.includes(addon.name) ? "text-[#C9A96E]" : "text-white/20"}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="booking-cost-total">
            <div>
              <p className="booking-cost-label">估算总额</p>
              <p className="booking-cost-desc-sm">含税及定制服务费</p>
            </div>
            <p className="booking-cost-total-price">¥128,000</p>
          </div>
        </div>
      </section>

      {/* ═══════════ 您的尊享礼遇 ═══════════ */}
      <section className="booking-section booking-privileges">
        <div className="booking-inner">
          <h2 className="booking-section-title">您的尊享礼遇</h2>
          <div className="booking-priv-grid">
            {privileges.map((p) => (
              <motion.div
                key={p.title}
                className="booking-priv-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, ease: goldEase }}
              >
                <div className="booking-priv-icon">
                  <p.icon size={20} />
                </div>
                <h3 className="booking-priv-title">{p.title}</h3>
                <p className="booking-priv-desc">{p.desc}</p>
                <ChevronDown size={16} className="booking-priv-arrow" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ 您的旅行管家团队 ═══════════ */}
      <section className="booking-section booking-team">
        <div className="booking-inner">
          <h2 className="booking-section-title">您的旅行管家团队</h2>
          <div className="booking-team-grid">
            {/* Claire Lin */}
            <div className="booking-team-card">
              <div className="booking-team-avatar">
                <img
                  src="https://picsum.photos/id/1027/200/200"
                  alt="Claire Lin"
                />
                <span className="booking-team-badge">高级策划师</span>
              </div>
              <div className="booking-team-info">
                <div className="booking-team-name">
                  <span>Claire Lin</span>
                  <span className="booking-team-name-cn">林婉清</span>
                </div>
                <p className="booking-team-bio">
                  10年奢华旅行定制经验，曾为多位知名企业家策划环球之旅。擅长挖掘目的地深层文化与隐秘奢华体验。
                </p>
                <div className="booking-team-lang">
                  <span>中文</span>
                  <span>英语</span>
                  <span>法语</span>
                </div>
                <button className="booking-team-btn">
                  <Phone size={14} />
                  预约通话
                </button>
              </div>
            </div>

            {/* Marco Rossi */}
            <div className="booking-team-card">
              <div className="booking-team-avatar">
                <img
                  src="https://picsum.photos/id/1005/200/200"
                  alt="Marco Rossi"
                />
                <span className="booking-team-badge">目的地专家</span>
              </div>
              <div className="booking-team-info">
                <div className="booking-team-name">
                  <span>Marco Rossi</span>
                </div>
                <p className="booking-team-bio">
                  托斯卡纳本地专家，精通欧洲文化遗产与顶级酒庄资源。为您开启那些不对公众开放的私人庄园大门。
                </p>
                <div className="booking-team-lang">
                  <span>意大利语</span>
                  <span>英语</span>
                  <span>中文</span>
                </div>
                <button className="booking-team-btn">
                  <Phone size={14} />
                  预约通话
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="booking-section booking-final-cta">
        <div className="booking-inner booking-final-cta-inner">
          <h2 className="booking-final-cta-title">准备好开启非凡之旅了吗？</h2>
          <p className="booking-final-cta-desc">
            点击下方按钮提交您的定制意向。我们的资深策划师将在 24 小时内与您取得联系，共同雕琢属于您的传世旅程。
          </p>
          <button className="booking-cta-btn booking-cta-btn-lg">
            提交定制申请
          </button>
          <div className="booking-trust">
            <div className="booking-trust-item">
              <Lock size={14} />
              <span>SSL 加密传输</span>
            </div>
            <div className="booking-trust-item">
              <FileCheck size={14} />
              <span>隐私保护协议</span>
            </div>
            <div className="booking-trust-item">
              <CheckCircle2 size={14} />
              <span>100% 满意保证</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ Footer ═══════════ */}
      <footer className="booking-footer">
        <div className="booking-inner">
          <div className="booking-footer-top">
            <div className="booking-footer-brand">
              <div className="booking-footer-logo">A</div>
              <span className="booking-footer-name">AURUM VOYAGES</span>
              <p className="booking-footer-about">
                奥睿旅行（AURUM VOYAGES）致力于为全球高净值人士提供超越期待的定制旅行体验。我们相信旅行不仅是空间的位移，更是心灵的洗礼与生命的积淀。
              </p>
            </div>
            <div className="booking-footer-links">
              <div>
                <h4>探索更多</h4>
                <a href="#">目的地指南</a>
                <a href="#">私人飞机租赁</a>
                <a href="#">奢华游艇航行</a>
                <a href="#">极地探险系列</a>
              </div>
              <div>
                <h4>联系我们</h4>
                <p>400-888-9999</p>
                <p>concierge@aurumvoyages.com</p>
                <p>上海市黄浦区外滩18号</p>
              </div>
            </div>
          </div>
          <div className="booking-footer-bottom">
            <p>© 2026 AURUM VOYAGES. ALL RIGHTS RESERVED.</p>
            <div>
              <a href="#">隐私政策</a>
              <a href="#">服务条款</a>
              <a href="#">法律声明</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
