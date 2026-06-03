'use client';

import { motion } from 'framer-motion';
import { Crown, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const goldEase = [0.76, 0, 0.24, 1] as const;

export default function MemberPage() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] pt-24 pb-20 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: goldEase }}
        className="text-center max-w-md mx-auto px-6"
      >
        <div className="w-20 h-20 rounded-full bg-[#C9A96E]/10 border border-[#C9A96E]/20 flex items-center justify-center mx-auto mb-6">
          <Crown size={32} className="text-[#C9A96E]" />
        </div>
        <h1 className="font-['Playfair_Display'] text-2xl text-[#F5F0EB] mb-4">
          会员中心
        </h1>
        <p className="text-[#F5F0EB]/50 text-sm mb-8 leading-relaxed">
          尊享会员权益体系正在精心打造中，敬请期待专属奢旅礼遇
        </p>
        <Link
          href="/account"
          className="inline-flex items-center gap-2 px-6 py-3 border border-[#C9A96E]/30 text-[#C9A96E] text-sm hover:bg-[#C9A96E]/10 transition-all duration-300 rounded-lg"
        >
          <ArrowLeft size={16} />
          返回个人中心
        </Link>
      </motion.div>
    </div>
  );
}
