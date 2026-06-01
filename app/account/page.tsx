'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Phone, LogOut, MapPin, Calendar, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../lib/contexts/AuthContext';

const goldEase = [0.76, 0, 0.24, 1] as const;

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/account');
    }
  }, [user, loading, router]);

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

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: goldEase }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-px bg-[#C9A96E]/30" />
            <User size={20} className="text-[#C9A96E]" />
          </div>
          <h1 className="font-['Playfair_Display'] text-3xl text-[#F5F0EB]">
            个人中心
          </h1>
        </motion.div>

        {/* User Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: goldEase }}
          className="bg-white/[0.03] backdrop-blur-sm rounded-2xl border border-white/[0.06] p-8 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#C9A96E] to-[#F5D99C] flex items-center justify-center flex-shrink-0">
              <span className="text-[#0D0D0D] text-2xl font-bold font-['Playfair_Display']">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2 className="text-xl text-[#F5F0EB] font-semibold mb-3">{user.name}</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[#F5F0EB]/60 text-sm">
                  <Mail size={14} className="text-[#C9A96E]" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-[#F5F0EB]/60 text-sm">
                    <Phone size={14} className="text-[#C9A96E]" />
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-2.5 border border-white/10 rounded-lg text-[#F5F0EB]/60 hover:text-[#F5F0EB] hover:border-[#C9A96E]/30 transition-all duration-300"
            >
              <LogOut size={16} />
              <span className="text-sm">退出登录</span>
            </button>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: goldEase }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
        >
          <Link
            href="/booking"
            className="group bg-white/[0.02] backdrop-blur-sm rounded-xl border border-white/[0.05] p-6 hover:border-[#C9A96E]/20 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#C9A96E]/10 flex items-center justify-center group-hover:bg-[#C9A96E]/20 transition-colors">
                <MapPin size={20} className="text-[#C9A96E]" />
              </div>
              <div>
                <h3 className="text-[#F5F0EB] font-medium mb-1">预订旅行</h3>
                <p className="text-[#F5F0EB]/50 text-sm">探索奢华目的地</p>
              </div>
            </div>
          </Link>

          <div className="group bg-white/[0.02] backdrop-blur-sm rounded-xl border border-white/[0.05] p-6 opacity-50 cursor-not-allowed">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#C9A96E]/10 flex items-center justify-center">
                <Calendar size={20} className="text-[#C9A96E]" />
              </div>
              <div>
                <h3 className="text-[#F5F0EB] font-medium mb-1">我的行程</h3>
                <p className="text-[#F5F0EB]/50 text-sm">即将上线</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Coming Soon */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: goldEase }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 rounded-full bg-[#C9A96E]/10 flex items-center justify-center mx-auto mb-4">
            <Calendar size={24} className="text-[#C9A96E]" />
          </div>
          <h3 className="text-[#F5F0EB] text-lg mb-2">更多功能即将上线</h3>
          <p className="text-[#F5F0EB]/50 text-sm max-w-md mx-auto">
            我们正在开发订单管理、行程历史、个性化推荐等功能，敬请期待
          </p>
        </motion.div>
      </div>
    </div>
  );
}
