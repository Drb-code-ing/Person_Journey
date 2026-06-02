'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import {
  User, Mail, Phone, LogOut, MapPin, Calendar, Loader2,
  Crown, Compass, Sparkles, Headphones, Star, ChevronRight,
  Heart, Gift, Settings, HelpCircle, Clock, Globe
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../lib/contexts/AuthContext';

const goldEase = [0.76, 0, 0.24, 1] as const;

/* ─── 会员等级系统 ─── */
const TIERS = [
  { name: '探索者', icon: Compass, color: '#8B8B8B', minSpend: 0 },
  { name: '品鉴家', icon: Star, color: '#C9A96E', minSpend: 100000 },
  { name: '鉴赏家', icon: Crown, color: '#F5D99C', minSpend: 300000 },
  { name: '至尊', icon: Sparkles, color: '#FFD700', minSpend: 800000 },
];

function getUserTier(spend: number) {
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (spend >= TIERS[i].minSpend) return TIERS[i];
  }
  return TIERS[0];
}

/* ─── 星空粒子 Canvas ─── */
function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      ctx.scale(2, 2);
    };
    resize();

    const stars: { x: number; y: number; r: number; speed: number; opacity: number }[] = [];
    for (let i = 0; i < 60; i++) {
      stars.push({
        x: Math.random() * canvas.offsetWidth,
        y: Math.random() * canvas.offsetHeight,
        r: Math.random() * 1.5 + 0.5,
        speed: Math.random() * 0.3 + 0.1,
        opacity: Math.random() * 0.6 + 0.2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
      for (const s of stars) {
        s.opacity += Math.sin(Date.now() * 0.001 * s.speed) * 0.005;
        s.opacity = Math.max(0.1, Math.min(0.8, s.opacity));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(201, 169, 110, ${s.opacity})`;
        ctx.fill();
      }
      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.6 }}
    />
  );
}

/* ─── 计数动画 Hook ─── */
function useCountUp(target: number, duration = 1500) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const counted = useRef(false);

  useEffect(() => {
    if (counted.current) return;
    counted.current = true;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return { value, ref };
}

/* ─── 3D 卡片组件 ─── */
function Card3D({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [8, -8]);
  const rotateY = useTransform(x, [-100, 100], [-8, 8]);

  const handleMouse = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  }, [x, y]);

  const handleLeave = useCallback(() => {
    animate(x, 0, { duration: 0.5, ease: goldEase });
    animate(y, 0, { duration: 0.5, ease: goldEase });
  }, [x, y]);

  return (
    <motion.div
      className={className}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      onMouseMove={handleMouse}
      onMouseLeave={handleLeave}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

/* ─── 动画变体 ─── */
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};
const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};
const cardHover = {
  rest: { scale: 1 },
  hover: { scale: 1.02, y: -4 },
};

/* ─── 主组件 ─── */
export default function AccountPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [hasOrders, setHasOrders] = useState(false);

  // 模拟数据（后续接入真实 API）
  const mockData = {
    totalTrips: 3,
    totalSpend: 258000,
    destinations: 5,
    memberSince: '2025',
  };

  const tier = getUserTier(mockData.totalSpend);
  const TierIcon = tier.icon;
  const nextTier = TIERS[TIERS.indexOf(tier) + 1];
  const progress = nextTier
    ? ((mockData.totalSpend - tier.minSpend) / (nextTier.minSpend - tier.minSpend)) * 100
    : 100;

  const tripCount = useCountUp(mockData.totalTrips);
  const destCount = useCountUp(mockData.destinations);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/account');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 size={32} className="text-[#C9A96E]" />
        </motion.div>
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] pt-24 pb-20 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* ═══ Hero区: 头像 + 会员卡 ═══ */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="mb-10"
        >
          <Card3D className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl p-6 sm:p-8">
            {/* 背景装饰 */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C9A96E]/[0.04] rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#C9A96E]/[0.03] rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

            <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-8">
              {/* 头像 */}
              <motion.div variants={fadeUp} className="relative flex-shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-[#C9A96E] to-[#F5D99C] flex items-center justify-center shadow-[0_0_40px_rgba(201,169,110,0.3)]">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-[#0D0D0D] text-3xl sm:text-4xl font-bold font-['Playfair_Display']">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                {/* 会员等级徽章 */}
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center border-2 border-[#0D0D0D]"
                  style={{ backgroundColor: tier.color + '20', borderColor: tier.color }}>
                  <TierIcon size={14} style={{ color: tier.color }} />
                </div>
              </motion.div>

              {/* 用户信息 */}
              <motion.div variants={fadeUp} className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="font-['Playfair_Display'] text-2xl sm:text-3xl text-[#F5F0EB] truncate">
                    {user.name}
                  </h1>
                  <Link
                    href="#"
                    onClick={(e) => { e.preventDefault(); alert('会员中心即将上线，敬请期待！'); }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all hover:scale-105"
                    style={{
                      backgroundColor: tier.color + '15',
                      color: tier.color,
                      border: `1px solid ${tier.color}30`,
                    }}
                  >
                    <TierIcon size={12} />
                    {tier.name}
                    <ChevronRight size={10} />
                  </Link>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[#F5F0EB]/50 text-sm mb-4">
                  <span className="flex items-center gap-1.5">
                    <Mail size={13} className="text-[#C9A96E]" />
                    {user.email}
                  </span>
                  {user.phone && (
                    <span className="flex items-center gap-1.5">
                      <Phone size={13} className="text-[#C9A96E]" />
                      {user.phone}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#C9A96E]" />
                    {mockData.memberSince}年加入
                  </span>
                </div>

                {/* 会员进度条 */}
                {nextTier && (
                  <div className="max-w-sm">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[#F5F0EB]/40">{tier.name}</span>
                      <span className="text-[#C9A96E]/60">{nextTier.name}</span>
                    </div>
                    <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-[#C9A96E] to-[#F5D99C]"
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(progress, 100)}%` }}
                        transition={{ duration: 1.5, ease: goldEase, delay: 0.5 }}
                      />
                    </div>
                    <p className="text-[#F5F0EB]/30 text-[11px] mt-1">
                      距离{nextTier.name}还需消费 ¥{(nextTier.minSpend - mockData.totalSpend).toLocaleString()}
                    </p>
                  </div>
                )}
              </motion.div>

              {/* 统计 + 退出 */}
              <motion.div variants={fadeUp} className="flex lg:flex-col items-center gap-6 lg:gap-4 flex-shrink-0">
                <div className="flex gap-6 lg:gap-4">
                  <div className="text-center">
                    <span ref={tripCount.ref} className="block font-['Playfair_Display'] text-2xl text-[#C9A96E]">
                      {tripCount.value}
                    </span>
                    <span className="text-[11px] text-[#F5F0EB]/40">已完成行程</span>
                  </div>
                  <div className="text-center">
                    <span ref={destCount.ref} className="block font-['Playfair_Display'] text-2xl text-[#C9A96E]">
                      {destCount.value}
                    </span>
                    <span className="text-[11px] text-[#F5F0EB]/40">已探索目的地</span>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg text-[#F5F0EB]/50 hover:text-[#F5F0EB] hover:border-[#C9A96E]/30 transition-all duration-300 text-sm"
                >
                  <LogOut size={14} />
                  退出
                </button>
              </motion.div>
            </div>
          </Card3D>
        </motion.div>

        {/* ═══ Bento Grid 主区域 ═══ */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
        >
          {/* ── 我的行程（大卡片） ── */}
          <motion.div variants={fadeUp} className="md:col-span-1 lg:col-span-2">
            <Link href={hasOrders ? '/account/trip-service' : '/account/no-trips'}>
              <Card3D className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl p-6 sm:p-8 h-full cursor-pointer">
                <div className="absolute top-0 right-0 w-40 h-40 bg-[#C9A96E]/[0.03] rounded-full blur-[80px]" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#C9A96E]/10 flex items-center justify-center group-hover:bg-[#C9A96E]/20 transition-colors">
                      <MapPin size={18} className="text-[#C9A96E]" />
                    </div>
                    <div>
                      <h3 className="text-[#F5F0EB] font-semibold text-lg">我的行程</h3>
                      <p className="text-[#F5F0EB]/40 text-xs">管理您的奢华旅程</p>
                    </div>
                  </div>
                  {hasOrders ? (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <div className="w-8 h-8 rounded-lg bg-[#C9A96E]/10 flex items-center justify-center">
                        <Globe size={14} className="text-[#C9A96E]" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[#F5F0EB]/80 text-sm">巴黎奢华之旅</p>
                        <p className="text-[#F5F0EB]/40 text-xs">2026年7月15日出发</p>
                      </div>
                      <ChevronRight size={16} className="text-[#F5F0EB]/30" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                      <div className="w-8 h-8 rounded-lg bg-[#C9A96E]/10 flex items-center justify-center">
                        <Sparkles size={14} className="text-[#C9A96E]" />
                      </div>
                      <p className="text-[#F5F0EB]/50 text-sm">开启您的第一段奢华旅程</p>
                      <ChevronRight size={16} className="text-[#F5F0EB]/30 ml-auto" />
                    </div>
                  )}
                </div>
              </Card3D>
            </Link>
          </motion.div>

          {/* ── 专属管家 ── */}
          <motion.div variants={fadeUp}>
            <Card3D className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl p-6 h-full cursor-pointer">
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#C9A96E]/[0.03] rounded-full blur-[60px] translate-y-1/2" />
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-[#C9A96E]/10 flex items-center justify-center mb-4 group-hover:bg-[#C9A96E]/20 transition-colors">
                  <Headphones size={18} className="text-[#C9A96E]" />
                </div>
                <h3 className="text-[#F5F0EB] font-semibold mb-1">专属管家</h3>
                <p className="text-[#F5F0EB]/40 text-sm mb-4">24小时随时待命</p>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C9A96E] to-[#F5D99C] flex items-center justify-center text-[#0D0D0D] text-xs font-bold">
                    C
                  </div>
                  <div>
                    <p className="text-[#F5F0EB]/80 text-sm">Claire Lin</p>
                    <p className="text-[#C9A96E]/60 text-[11px]">高级策划师 · 在线</p>
                  </div>
                </div>
              </div>
            </Card3D>
          </motion.div>

          {/* ── 行程历史 ── */}
          <motion.div variants={fadeUp} className="md:col-span-1 lg:col-span-2">
            <Card3D className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl p-6 sm:p-8 h-full">
              <div className="absolute top-0 left-1/2 w-48 h-48 bg-[#C9A96E]/[0.02] rounded-full blur-[100px] -translate-x-1/2" />
              <div className="relative">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#C9A96E]/10 flex items-center justify-center">
                      <Clock size={18} className="text-[#C9A96E]" />
                    </div>
                    <div>
                      <h3 className="text-[#F5F0EB] font-semibold text-lg">行程历史</h3>
                      <p className="text-[#F5F0EB]/40 text-xs">回顾您的旅行足迹</p>
                    </div>
                  </div>
                </div>
                {/* 横向滚动行程卡片 */}
                <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar -mx-2 px-2">
                  {[
                    { dest: '东京', date: '2025年12月', emoji: '🗼', days: 7 },
                    { dest: '巴厘岛', date: '2025年8月', emoji: '🏝️', days: 8 },
                    { dest: '巴黎', date: '2025年4月', emoji: '🗼', days: 9 },
                  ].map((trip, i) => (
                    <motion.div
                      key={i}
                      className="flex-shrink-0 w-48 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-[#C9A96E]/20 transition-colors cursor-pointer"
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="text-2xl mb-2 block">{trip.emoji}</span>
                      <p className="text-[#F5F0EB]/80 text-sm font-medium">{trip.dest}</p>
                      <p className="text-[#F5F0EB]/40 text-xs">{trip.date} · {trip.days}天</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </Card3D>
          </motion.div>

          {/* ── 次元空间（创意卡片） ── */}
          <motion.div variants={fadeUp}>
            <div className="relative overflow-hidden rounded-2xl border border-[#C9A96E]/10 bg-gradient-to-br from-[#0D0D0D] to-[#111] h-full min-h-[220px]">
              <StarField />
              <div className="relative z-10 p-6 flex flex-col items-center justify-center h-full text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="w-12 h-12 rounded-full border border-[#C9A96E]/20 flex items-center justify-center mb-4"
                >
                  <Sparkles size={20} className="text-[#C9A96E]" />
                </motion.div>
                <h3 className="font-['Playfair_Display'] text-lg text-[#F5F0EB] mb-2">次元空间</h3>
                <p className="text-[#C9A96E]/70 text-sm italic">在这里，打造你的梦幻空间</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ═══ 更多服务网格 ═══ */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={fadeUp} className="flex items-center gap-3 mb-5">
            <div className="w-8 h-px bg-[#C9A96E]/30" />
            <h2 className="font-['Playfair_Display'] text-lg text-[#F5F0EB]/70">更多服务</h2>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Heart, label: '偏好设置', desc: '定制您的旅行偏好', href: '#' },
              { icon: Gift, label: '专属礼遇', desc: '查看您的会员权益', href: '#' },
              { icon: Star, label: '推荐有礼', desc: '邀请好友获取奖励', href: '#' },
              { icon: HelpCircle, label: '帮助中心', desc: '常见问题与支持', href: '/faq' },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Link href={item.href}>
                  <motion.div
                    className="group relative overflow-hidden rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 sm:p-5 hover:border-[#C9A96E]/20 transition-all duration-300"
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#C9A96E]/8 flex items-center justify-center mb-3 group-hover:bg-[#C9A96E]/15 transition-colors">
                      <item.icon size={16} className="text-[#C9A96E]" />
                    </div>
                    <h4 className="text-[#F5F0EB]/80 text-sm font-medium mb-0.5">{item.label}</h4>
                    <p className="text-[#F5F0EB]/30 text-[11px] hidden sm:block">{item.desc}</p>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* ═══ 底部品牌标语 ═══ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="text-center mt-16 mb-8"
        >
          <p className="text-[#F5F0EB]/15 text-xs tracking-[4px] uppercase">
            AURUM VOYAGES · 专属奢华旅程
          </p>
        </motion.div>
      </div>
    </div>
  );
}
