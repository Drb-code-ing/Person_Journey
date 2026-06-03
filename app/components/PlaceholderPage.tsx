'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, type LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { goldEase } from '../lib/constants';

interface PlaceholderPageProps {
  icon: LucideIcon;
  title: string;
  description: string;
  backHref?: string;
  backLabel?: string;
}

export default function PlaceholderPage({
  icon: Icon,
  title,
  description,
  backHref = '/account',
  backLabel = '返回个人中心',
}: PlaceholderPageProps) {
  return (
    <div className="account-page">
      <div className="account-inner flex items-center justify-center" style={{ minHeight: '60vh' }}>
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: goldEase }}
          className="text-center max-w-md mx-auto"
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'var(--aj-gold-glow)', border: '1px solid var(--aj-gold-border)' }}
          >
            <Icon size={32} style={{ color: 'var(--aj-gold)' }} />
          </div>
          <h1 className="font-['Playfair_Display'] text-2xl mb-4" style={{ color: 'var(--aj-text-primary)' }}>
            {title}
          </h1>
          <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--aj-text-muted)' }}>
            {description}
          </p>
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 px-6 py-3 border text-sm rounded-lg transition-all duration-300 hover:bg-[#C9A96E]/10"
            style={{ borderColor: 'var(--aj-gold-border)', color: 'var(--aj-gold)' }}
          >
            <ArrowLeft size={16} />
            {backLabel}
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
