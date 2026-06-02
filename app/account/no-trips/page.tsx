'use client';

import { motion } from 'framer-motion';
import { MapPin, ArrowLeft, Compass, Sparkles } from 'lucide-react';
import Link from 'next/link';

const goldEase = [0.76, 0, 0.24, 1] as const;

export default function NoTripsPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center px-4">
      {/* 背景装饰 */}
      <div className="fixed top-1/4 left-1/4 w-64 h-64 bg-[#C9A96E]/[0.03] rounded-full blur-[120px]" />
      <div className="fixed bottom-1/4 right-1/4 w-48 h-48 bg-[#C9A96E]/[0.02] rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: goldEase }}
        className="relative max-w-md w-full text-center"
      >
        {/* 图标 */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5, ease: goldEase }}
          className="relative mx-auto mb-8"
        >
          <div className="w-24 h-24 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto backdrop-blur-xl">
            <MapPin size={36} className="text-[#C9A96E]/60" />
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-28 h-28 rounded-full border border-[#C9A96E]/10" />
          </motion.div>
        </motion.div>

        {/* 文字 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5, ease: goldEase }}
        >
          <h1 className="font-['Playfair_Display'] text-2xl text-[#F5F0EB] mb-3">
            暂无行程记录
          </h1>
          <p className="text-[#F5F0EB]/50 text-sm mb-8 leading-relaxed">
            您还没有预订过任何旅程<br />
            让我们为您开启第一段奢华之旅
          </p>
        </motion.div>

        {/* 操作按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5, ease: goldEase }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link
            href="/booking"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#C9A96E] to-[#F5D99C] text-[#0D0D0D] rounded-xl font-medium text-sm hover:shadow-[0_0_30px_rgba(201,169,110,0.3)] transition-all duration-300"
          >
            <Compass size={16} />
            探索目的地
          </Link>
          <Link
            href="/account"
            className="flex items-center gap-2 px-6 py-3 border border-white/10 text-[#F5F0EB]/60 rounded-xl text-sm hover:border-[#C9A96E]/30 hover:text-[#F5F0EB] transition-all duration-300"
          >
            <ArrowLeft size={16} />
            返回个人中心
          </Link>
        </motion.div>

        {/* 底部装饰 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="mt-12 flex items-center justify-center gap-2"
        >
          <Sparkles size={12} className="text-[#C9A96E]/30" />
          <p className="text-[#F5F0EB]/20 text-[11px] tracking-widest uppercase">
            AURUM VOYAGES
          </p>
          <Sparkles size={12} className="text-[#C9A96E]/30" />
        </motion.div>
      </motion.div>
    </div>
  );
}
