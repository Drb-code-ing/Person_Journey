'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Loader2, LogOut } from 'lucide-react';
import { useAuth } from '../lib/contexts/AuthContext';
import { goldEase } from '../lib/constants';

import AvatarSection from './components/AvatarSection';
import MemberCard from './components/MemberCard';
import TripEntry from './components/TripEntry';
import TripHistory, { type Trip } from './components/TripHistory';
import DimensionSpace from './components/DimensionSpace';
import AvatarModal from './components/AvatarModal';
import DarkAtmosphere from '../components/DarkAtmosphere';
import { useAccountAnimations } from './hooks/useAccountAnimations';

/** API 返回的行程数据 */
interface TripData {
  id: string;
  origin: string;
  destination: string;
  date: string;
  endDate: string;
  days: number;
  status: string;
  orderNo: string;
  scope: string;
  transportType: string;
  totalPrice?: number;
}

/** API 返回的会员等级 */
interface TierData {
  code: string;
  name: string;
  icon: string;
  benefits: string;
  discountRate: number;
  minSpend: number;
  levelUpTime: string | null;
}

/** API 返回的 profile 数据 */
interface ProfileData {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatar: string | null;
  tier: TierData;
  totalSpend: number;
  orderCount: number;
  hasOrders: boolean;
  activeOrderCount: number;
  recentTrips: TripData[];
  dimensionSpace: { spaceName: string; theme: string };
}

// 静态样式对象（提升到模块作用域，避免每次渲染重建）
const avatarCardStyle = {
  background: 'var(--aj-glass-white)',
  backdropFilter: 'blur(24px) saturate(1.2)',
  WebkitBackdropFilter: 'blur(24px) saturate(1.2)',
  border: '1px solid var(--aj-glass-border)',
  borderRadius: '20px',
  padding: '32px',
} as const;

const sectionDividerStyle = { background: 'var(--aj-gold)', opacity: 0.3 };
const footerBorderStyle = { borderTop: '1px solid var(--aj-glass-border)' };

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useAccountAnimations();

  // 登录检查
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/account');
    }
  }, [user, loading, router]);

  // 获取 profile 数据
  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      setProfileLoading(true);
      const res = await fetch('/api/users/me/profile');
      const json = await res.json();
      if (json.success) {
        setProfile(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setProfileLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // 头像上传成功后刷新 profile
  const handleAvatarSaved = useCallback(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <Loader2 size={32} className="text-[#C9A96E]" />
        </motion.div>
      </div>
    );
  }

  if (!user) return null;

  // profile 加载失败
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <div className="text-center">
          <p style={{ color: 'var(--aj-text-muted)' }}>加载失败，请刷新页面重试</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 rounded-lg text-sm"
            style={{ background: 'var(--aj-gold)', color: '#0D0D0D' }}
          >
            刷新页面
          </button>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  // 格式化行程日期为中文显示
  const formatTripDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  };

  // 订单状态 → 三种显示状态
  // submitted/confirmed → pending（待启程，24h内可取消）
  // paid/in_progress    → upcoming（待开始，已付定金）
  // completed           → completed（已结束）
  // cancelled/refunded  → cancelled
  const mapTripStatus = (status: string): Trip['status'] => {
    if (status === 'completed') return 'completed';
    if (status === 'cancelled' || status === 'refunded') return 'cancelled';
    if (status === 'paid' || status === 'in_progress') return 'upcoming';
    return 'pending'; // draft, submitted, confirmed
  };

  // 将 API 行程数据转换为 TripHistory 组件需要的格式
  const formattedTrips = profile.recentTrips.map((trip) => ({
    id: trip.id,
    origin: trip.origin || '',
    destination: trip.destination,
    date: formatTripDate(trip.date),
    duration: trip.days > 0 ? (trip.days === 1 ? '1天' : `${trip.days}天${trip.days - 1}晚`) : '',
    status: mapTripStatus(trip.status),
    orderNo: trip.orderNo,
    totalPrice: trip.totalPrice,
    transportType: trip.transportType,
  }));

  return (
    <div className="account-page">
      <DarkAtmosphere />
      <div className="account-inner">
        {/* ═══ 页面标题 ═══ */}
        <div className="account-header account-section">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-px" style={sectionDividerStyle} />
            <User size={20} style={{ color: 'var(--aj-gold)' }} />
          </div>
          <h1 className="font-['Playfair_Display'] text-3xl" style={{ color: 'var(--aj-text-primary)' }}>
            个人中心
          </h1>
        </div>

        {/* ═══ 用户头像区 ═══ */}
        <div className="account-avatar-section account-section" style={avatarCardStyle}>
          <AvatarSection
            name={profile.name}
            email={profile.email}
            phone={profile.phone || undefined}
            avatar={profile.avatar || undefined}
            tier={profile.tier.code}
            onAvatarClick={() => setAvatarModalOpen(true)}
          />
        </div>

        {/* ═══ 会员等级 + 行程入口 双栏 ═══ */}
        <div className="account-section account-tier-actions-grid">
          <div className="account-member-section">
            <MemberCard tier={profile.tier.code} totalSpend={profile.totalSpend} />
          </div>
          <div>
            <TripEntry hasOrders={profile.hasOrders} />
          </div>
        </div>

        {/* ═══ 行程历史 ═══ */}
        <div className="account-section">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-px" style={sectionDividerStyle} />
            <h2 className="font-['Playfair_Display'] text-xl" style={{ color: 'var(--aj-text-primary)' }}>
              行程历史
            </h2>
          </div>
          <TripHistory trips={formattedTrips} />
        </div>

        {/* ═══ 次元空间 ═══ */}
        <div className="account-section">
          <DimensionSpace />
        </div>

        {/* ═══ 底部设置区 ═══ */}
        <div className="account-section">
          <div className="flex items-center justify-between py-6" style={footerBorderStyle}>
            <span className="text-sm" style={{ color: 'var(--aj-text-secondary)' }}>
              Aurum Journey · 奢华次元旅行
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-sm transition-colors hover:text-[#C9A96E]"
              style={{ color: 'var(--aj-text-muted)' }}
            >
              <LogOut size={14} />
              退出登录
            </button>
          </div>
        </div>
      </div>

      <AvatarModal
        isOpen={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        currentName={profile.name}
        currentAvatar={profile.avatar || undefined}
        onSaved={handleAvatarSaved}
      />
    </div>
  );
}
