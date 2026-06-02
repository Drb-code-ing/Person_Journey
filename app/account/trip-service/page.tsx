'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Calendar, Users, Plane, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const goldEase = [0.76, 0, 0.24, 1] as const;

export default function TripServicePage() {
  const [loading] = useState(false);

  // 模拟行程数据（后续接入真实 API）
  const trip = {
    destination: '巴黎',
    country: '法国',
    startDate: '2026-07-15',
    days: 9,
    adults: 2,
    status: 'confirmed',
    concierge: 'Claire Lin',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 size={32} className="text-[#C9A96E]" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D0D] pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* 返回按钮 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: goldEase }}
          className="mb-8"
        >
          <Link
            href="/account"
            className="flex items-center gap-2 text-[#F5F0EB]/50 hover:text-[#F5F0EB] transition-colors text-sm"
          >
            <ArrowLeft size={16} />
            返回个人中心
          </Link>
        </motion.div>

        {/* 行程标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: goldEase }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-px bg-[#C9A96E]/30" />
            <span className="text-[#C9A96E] text-xs tracking-widest uppercase">行程详情</span>
          </div>
          <h1 className="font-['Playfair_Display'] text-3xl text-[#F5F0EB]">
            {trip.destination}奢华之旅
          </h1>
        </motion.div>

        {/* 行程信息卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: goldEase }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8 mb-6"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C9A96E]/10 flex items-center justify-center">
                <MapPin size={18} className="text-[#C9A96E]" />
              </div>
              <div>
                <p className="text-[#F5F0EB]/40 text-xs">目的地</p>
                <p className="text-[#F5F0EB] text-sm font-medium">{trip.destination} · {trip.country}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C9A96E]/10 flex items-center justify-center">
                <Calendar size={18} className="text-[#C9A96E]" />
              </div>
              <div>
                <p className="text-[#F5F0EB]/40 text-xs">出发日期</p>
                <p className="text-[#F5F0EB] text-sm font-medium">{trip.startDate}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C9A96E]/10 flex items-center justify-center">
                <Plane size={18} className="text-[#C9A96E]" />
              </div>
              <div>
                <p className="text-[#F5F0EB]/40 text-xs">行程天数</p>
                <p className="text-[#F5F0EB] text-sm font-medium">{trip.days}天{trip.days - 1}晚</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C9A96E]/10 flex items-center justify-center">
                <Users size={18} className="text-[#C9A96E]" />
              </div>
              <div>
                <p className="text-[#F5F0EB]/40 text-xs">出行人数</p>
                <p className="text-[#F5F0EB] text-sm font-medium">{trip.adults}位成人</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 服务内容（占位） */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: goldEase }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-6 sm:p-8"
        >
          <h2 className="font-['Playfair_Display'] text-xl text-[#F5F0EB] mb-6">专属服务</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: '行程规划', desc: '您的专属管家正在为您精心规划每日行程', status: '进行中' },
              { title: '酒店安排', desc: '已为您预订巴黎丽兹酒店豪华套房', status: '已确认' },
              { title: '交通接驳', desc: '机场VIP接送机服务已安排', status: '待确认' },
              { title: '餐饮预订', desc: '米其林餐厅预订服务筹备中', status: '筹备中' },
            ].map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.5, ease: goldEase }}
                className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-[#C9A96E]/15 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-[#F5F0EB]/80 text-sm font-medium">{service.title}</h3>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                    service.status === '已确认'
                      ? 'bg-green-500/10 text-green-400'
                      : service.status === '进行中'
                      ? 'bg-[#C9A96E]/10 text-[#C9A96E]'
                      : 'bg-white/[0.05] text-[#F5F0EB]/40'
                  }`}>
                    {service.status}
                  </span>
                </div>
                <p className="text-[#F5F0EB]/40 text-xs">{service.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
