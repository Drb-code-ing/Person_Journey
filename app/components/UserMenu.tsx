'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/contexts/AuthContext';

const goldEase = [0.76, 0, 0.24, 1] as const;

export default function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    setOpen(false);
    router.push('/');
  };

  // 未登录：显示登录图标
  if (!user) {
    return (
      <motion.button
        onClick={() => router.push('/login')}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          position: 'fixed', top: 30, right: 70, zIndex: 1001,
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'inherit', padding: 4,
        }}
        title="登录"
      >
        <User size={24} />
      </motion.button>
    );
  }

  // 已登录：显示用户菜单
  return (
    <div ref={ref} style={{ position: 'fixed', top: 30, right: 70, zIndex: 1001 }}>
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
          color: 'inherit', padding: 4,
        }}
      >
        {/* 头像 */}
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg, #C9A96E, #a88a4e)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.8rem', fontWeight: 600, color: '#0D0D0D',
        }}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }}>
          <ChevronDown size={14} />
        </motion.div>
      </motion.button>

      {/* 下拉菜单 */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: goldEase }}
            style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 8,
              width: 200, padding: '8px 0',
              background: 'rgba(20,20,20,0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(201,169,110,0.2)',
            }}
          >
            {/* 用户信息 */}
            <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(201,169,110,0.1)' }}>
              <p style={{ color: '#F5F0EB', fontSize: '0.9rem', fontWeight: 600 }}>{user.name}</p>
              <p style={{ color: 'rgba(245,240,235,0.4)', fontSize: '0.75rem', marginTop: 2 }}>{user.email}</p>
            </div>

            {/* 菜单项 */}
            <MenuItem
              icon={<Settings size={16} />}
              label="账户设置"
              onClick={() => { router.push('/account'); setOpen(false); }}
            />
            <MenuItem
              icon={<LogOut size={16} />}
              label="退出登录"
              onClick={handleLogout}
              danger
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({ icon, label, onClick, danger }: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ backgroundColor: 'rgba(201,169,110,0.1)' }}
      style={{
        width: '100%', padding: '10px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'none', border: 'none', cursor: 'pointer',
        color: danger ? '#ef4444' : '#F5F0EB',
        fontSize: '0.85rem',
      }}
    >
      {icon}
      {label}
    </motion.button>
  );
}
