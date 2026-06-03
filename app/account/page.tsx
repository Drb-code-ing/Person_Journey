'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Loader2, LogOut } from 'lucide-react';
import { useAuth } from '../lib/contexts/AuthContext';
import { goldEase } from '../lib/constants';

import AvatarSection from './components/AvatarSection';
import MemberCard from './components/MemberCard';
import TripEntry from './components/TripEntry';
import TripHistory from './components/TripHistory';
import DimensionSpace from './components/DimensionSpace';
import AvatarModal from './components/AvatarModal';
import DarkAtmosphere from '../components/DarkAtmosphere';
import { useAccountAnimations } from './hooks/useAccountAnimations';

// 模拟行程数据（后续接入真实API）
const mockTrips = [
  { id: '1', destination: '马尔代夫 · 水上别墅私享之旅', date: '2026年3月15日', duration: '7天6晚', status: 'completed' as const },
  { id: '2', destination: '瑞士阿尔卑斯 · 云端秘境', date: '2026年5月20日', duration: '10天9晚', status: 'upcoming' as const },
];

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

  useAccountAnimations();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/account');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
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

  const userTier = 'gold';
  const totalSpend = 45000;
  const hasOrders = mockTrips.length > 0;

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
            name={user.name}
            email={user.email}
            phone={user.phone}
            avatar={user.avatar}
            tier={userTier}
            onAvatarClick={() => setAvatarModalOpen(true)}
          />
        </div>

        {/* ═══ 会员等级 + 行程入口 双栏 ═══ */}
        <div className="account-section account-tier-actions-grid">
          <div className="account-member-section">
            <MemberCard tier={userTier} totalSpend={totalSpend} />
          </div>
          <div>
            <TripEntry hasOrders={hasOrders} />
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
          <TripHistory trips={mockTrips} />
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
        currentName={user.name}
        currentAvatar={user.avatar}
      />
    </div>
  );
}
