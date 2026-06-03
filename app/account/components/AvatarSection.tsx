'use client';

import { motion } from 'framer-motion';
import { Crown, Camera } from 'lucide-react';

interface AvatarSectionProps {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  tier: string;
  onAvatarClick: () => void;
  onLogout: () => void;
}

export default function AvatarSection({ name, email, phone, avatar, tier, onAvatarClick, onLogout }: AvatarSectionProps) {
  const tierIcons: Record<string, string> = {
    silver: '🥈',
    gold: '🥇',
    platinum: '💎',
    diamond: '👑',
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
      {/* 头像 */}
      <div className="account-avatar-wrap" onClick={onAvatarClick}>
        <div className="account-avatar-glow" />
        <div className="account-avatar">
          {avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatar} alt={name} className="w-full h-full object-cover" />
          ) : (
            <span className="account-avatar-letter">
              {name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="account-avatar-badge">
          <span className="text-xs">{tierIcons[tier] || '🥇'}</span>
        </div>
        {/* 相机图标 overlay */}
        <motion.div
          className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 z-10 cursor-pointer"
          whileHover={{ opacity: 1 }}
        >
          <Camera size={20} className="text-white" />
        </motion.div>
      </div>

      {/* 用户信息 */}
      <div className="flex-1">
        <h2 className="text-xl font-semibold mb-1" style={{ color: 'var(--aj-text-primary)' }}>
          {name}
        </h2>
        <p className="text-sm mb-3" style={{ color: 'var(--aj-text-muted)' }}>
          {email}
        </p>
        {phone && (
          <p className="text-sm" style={{ color: 'var(--aj-text-muted)' }}>
            {phone}
          </p>
        )}
      </div>

      {/* 退出按钮 */}
      <button
        onClick={onLogout}
        className="flex items-center gap-2 px-5 py-2.5 border rounded-lg text-sm transition-all duration-300 hover:border-[#C9A96E]/30 hover:text-[#F5F0EB]"
        style={{ borderColor: 'var(--aj-glass-border)', color: 'var(--aj-text-secondary)' }}
      >
        退出登录
      </button>
    </div>
  );
}
