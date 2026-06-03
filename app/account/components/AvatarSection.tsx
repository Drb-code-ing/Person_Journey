'use client';

import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import { getTierIcon } from '../../lib/constants';

interface AvatarSectionProps {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  tier: string;
  onAvatarClick: () => void;
}

export default function AvatarSection({ name, email, phone, avatar, tier, onAvatarClick }: AvatarSectionProps) {
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
          <span className="text-xs">{getTierIcon(tier)}</span>
        </div>
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
    </div>
  );
}
