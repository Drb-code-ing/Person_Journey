'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, Compass } from 'lucide-react';
import Link from 'next/link';

const goldEase = [0.76, 0, 0.24, 1] as const;

export default function NoTripsPage() {
  return (
    <div className="account-page">
      <div className="account-inner flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: goldEase }}
          className="text-center max-w-md mx-auto"
        >
          {/* 图标 */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'var(--aj-gold-glow)' }}
          >
            <Compass size={32} style={{ color: 'var(--aj-gold)' }} />
          </div>

          {/* 标题 */}
          <h1
            className="font-['Playfair_Display'] text-2xl mb-4"
            style={{ color: 'var(--aj-text-primary)' }}
          >
            暂无行程
          </h1>

          {/* 描述 */}
          <p
            className="text-sm mb-8 leading-relaxed"
            style={{ color: 'var(--aj-text-secondary)' }}
          >
            您还没有任何行程记录。开启您的第一次奢华旅行，探索世界的无限可能。
          </p>

          {/* 操作按钮 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/account"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm rounded-lg transition-all duration-300"
              style={{
                border: '1px solid var(--aj-gold-border)',
                color: 'var(--aj-gold)',
              }}
            >
              <ArrowLeft size={16} />
              返回个人中心
            </Link>
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-lg transition-all duration-300"
              style={{
                background: 'var(--aj-gold)',
                color: '#0D0D0D',
              }}
            >
              探索目的地
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
