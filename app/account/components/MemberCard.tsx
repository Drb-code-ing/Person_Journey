'use client';

import { motion } from 'framer-motion';
import { Crown, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { TIERS, goldEase } from '../../lib/constants';

interface MemberCardProps {
  tier: string;
  totalSpend: number;
}

export default function MemberCard({ tier, totalSpend }: MemberCardProps) {
  const currentLevel = TIERS.find(l => l.id === tier) || TIERS[0];
  const currentIndex = TIERS.indexOf(currentLevel);
  const nextLevel = currentIndex < TIERS.length - 1 ? TIERS[currentIndex + 1] : null;
  const progress = nextLevel
    ? Math.min(100, (totalSpend / nextLevel.minSpend) * 100)
    : 100;

  return (
    <Link href="/member" className="block">
      <motion.div
        className="member-tier-card shimmer-gold"
        data-tier={tier}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.3, ease: goldEase }}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="member-tier-icon">
            <Crown size={24} />
          </div>
          <ChevronRight size={18} style={{ color: 'var(--aj-text-muted)' }} />
        </div>

        <div className="member-tier-name">{currentLevel.name}</div>
        <div className="member-tier-subtitle">{currentLevel.benefits}</div>

        <div className="member-tier-progress-track">
          <motion.div
            className="member-tier-progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.2, delay: 0.5, ease: goldEase }}
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
