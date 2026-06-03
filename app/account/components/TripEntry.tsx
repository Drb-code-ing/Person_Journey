'use client';

import { motion } from 'framer-motion';
import { Compass, Calendar, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface TripEntryProps {
  hasOrders: boolean;
}

export default function TripEntry({ hasOrders }: TripEntryProps) {
  return (
    <div className="account-actions-grid">
      {/* 定制旅程入口 */}
      <Link href={hasOrders ? '/trips' : '/account/no-trips'}>
        <motion.div
          className="account-action-card"
          data-status="active"
          whileHover={{ y: -2 }}
          transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="account-action-icon">
            <Compass size={20} />
          </div>
          <div>
            <div className="account-action-title">定制旅程</div>
            <div className="account-action-desc">
              {hasOrders ? '查看您的专属行程服务' : '开启您的第一次奢华旅行'}
            </div>
          </div>
          <div className="account-action-arrow">
            <ArrowRight size={16} />
          </div>
        </motion.div>
      </Link>

      {/* 预订入口 */}
      <Link href="/destinations">
        <motion.div
          className="account-action-card"
          data-status="active"
          whileHover={{ y: -2 }}
          transition={{ duration: 0.3, delay: 0.05, ease: [0.76, 0, 0.24, 1] }}
        >
          <div className="account-action-icon">
            <Calendar size={20} />
          </div>
          <div>
            <div className="account-action-title">预订旅行</div>
            <div className="account-action-desc">探索全球奢华目的地</div>
          </div>
          <div className="account-action-arrow">
            <ArrowRight size={16} />
          </div>
        </motion.div>
      </Link>
    </div>
  );
}
