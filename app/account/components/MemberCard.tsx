'use client';

import { motion } from 'framer-motion';
import { Crown, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const memberLevels = [
  { id: 'silver', name: '银卡会员', minSpend: 0, icon: '🥈', benefits: '专属客服 · 优先预订' },
  { id: 'gold', name: '金卡会员', minSpend: 30000, icon: '🥇', benefits: '房型升级 · 早餐赠送' },
  { id: 'platinum', name: '铂金会员', minSpend: 80000, icon: '💎', benefits: '私人管家 · 机场贵宾' },
  { id: 'diamond', name: '黑钻会员', minSpend: 200000, icon: '👑', benefits: '全定制行程 · 全球礼遇' },
];

interface MemberCardProps {
  tier: string;
  totalSpend: number;
}

export default function MemberCard({ tier, totalSpend }: MemberCardProps) {
  const currentLevel = memberLevels.find(l => l.id === tier) || memberLevels[0];
  const nextLevel = memberLevels[memberLevels.indexOf(currentLevel) + 1];
  const progress = nextLevel
    ? Math.min(100, (totalSpend / nextLevel.minSpend) * 100)
    : 100;

  return (
    <Link href="/member" className="block">
      <motion.div
        className="member-tier-card shimmer-gold"
        data-tier={tier}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="member-tier-icon">
            <Crown size={24} />
          </div>
          <ChevronRight size={18} style={{ color: 'var(--aj-text-muted)' }} />
        </div>

        <div className="member-tier-name">{currentLevel.name}</div>
        <div className="member-tier-subtitle">{currentLevel.benefits}</div>

        {/* 进度条 */}
        <div className="member-tier-progress-track">
          <motion.div
            className="member-tier-progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.76, 0, 0.24, 1] }}
          />
        </div>
        <div className="member-tier-progress-label">
          {nextLevel
            ? `距${nextLevel.name}还需 ¥${(nextLevel.minSpend - totalSpend).toLocaleString()}`
            : '已达最高等级'}
        </div>
      </motion.div>
    </Link>
  );
}
