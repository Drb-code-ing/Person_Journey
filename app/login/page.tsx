'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Check, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../lib/contexts/AuthContext';

const goldEase = [0.76, 0, 0.24, 1] as const;

// 密码强度计算
function getPasswordStrength(password: string): { level: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { level: 1, label: '弱', color: '#ef4444' };
  if (score <= 3) return { level: 2, label: '中', color: '#f59e0b' };
  return { level: 3, label: '强', color: '#22c55e' };
}

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { login, register } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // 实时验证
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordStrength = getPasswordStrength(password);
  const nameValid = name.length >= 2;

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (mode === 'login') {
        result = await login(email, password);
      } else {
        if (!nameValid) {
          setError('请输入至少2个字符的姓名');
          setLoading(false);
          return;
        }
        result = await register(email, password, name);
      }

      if (result.success) {
        setSuccess(true);
        setTimeout(() => router.push(redirect), 1500);
      } else {
        setError(result.error || '操作失败');
      }
    } catch {
      setError('网络连接失败');
    } finally {
      setLoading(false);
    }
  }, [mode, email, password, name, nameValid, login, register, router, redirect]);

  return (
    <div className="booking-page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* 背景 */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        background: 'radial-gradient(circle at 30% 50%, rgba(201,169,110,0.08) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(201,169,110,0.05) 0%, transparent 50%)',
      }} />

      {/* 成功动画 */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 100,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(13,13,13,0.95)',
            }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              style={{
                width: 80, height: 80, borderRadius: '50%',
                border: '2px solid #C9A96E', display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 24,
              }}
            >
              <Check size={40} color="#C9A96E" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              style={{ color: '#F5F0EB', fontSize: '1.5rem', fontFamily: 'Playfair Display, serif' }}
            >
              {mode === 'login' ? '欢迎回来' : '注册成功'}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{ color: 'rgba(245,240,235,0.5)', marginTop: 8 }}
            >
              即将跳转...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 表单卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: goldEase }}
        style={{
          position: 'relative', zIndex: 1,
          width: '100%', maxWidth: 440, padding: '48px 40px',
          background: 'rgba(20,20,20,0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(201,169,110,0.15)',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 48, height: 48, margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(201,169,110,0.3)',
            fontSize: '1.5rem', color: '#C9A96E', fontFamily: 'Playfair Display, serif',
          }}>
            A
          </div>
          <h1 style={{ color: '#F5F0EB', fontSize: '1.8rem', fontFamily: 'Playfair Display, serif', marginBottom: 8 }}>
            {mode === 'login' ? '欢迎回来' : '加入我们'}
          </h1>
          <p style={{ color: 'rgba(245,240,235,0.5)', fontSize: '0.85rem' }}>
            {mode === 'login' ? '登录您的 AURUM VOYAGES 账户' : '创建您的专属账户'}
          </p>
        </div>

        {/* 切换登录/注册 */}
        <div style={{
          display: 'flex', marginBottom: 32,
          border: '1px solid rgba(201,169,110,0.2)',
          overflow: 'hidden',
        }}>
          {(['login', 'register'] as const).map((m) => (
            <motion.button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              style={{
                flex: 1, padding: '10px 0', fontSize: '0.85rem', fontWeight: 600,
                background: mode === m ? 'rgba(201,169,110,0.15)' : 'transparent',
                color: mode === m ? '#C9A96E' : 'rgba(245,240,235,0.5)',
                border: 'none', cursor: 'pointer',
                borderBottom: mode === m ? '2px solid #C9A96E' : '2px solid transparent',
                transition: 'all 0.3s',
              }}
              whileTap={{ scale: 0.98 }}
            >
              {m === 'login' ? '登录' : '注册'}
            </motion.button>
          ))}
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
              transition={{ duration: 0.3 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 20 }}
            >
              {/* 姓名（仅注册） */}
              {mode === 'register' && (
                <FloatingInput
                  icon={<User size={18} />}
                  label="姓名"
                  value={name}
                  onChange={setName}
                  touched={nameTouched}
                  setTouched={setNameTouched}
                  valid={nameValid || !nameTouched}
                  error={nameTouched && !nameValid ? '至少2个字符' : undefined}
                />
              )}

              {/* 邮箱 */}
              <FloatingInput
                icon={<Mail size={18} />}
                label="邮箱地址"
                type="email"
                value={email}
                onChange={setEmail}
                touched={emailTouched}
                setTouched={setEmailTouched}
                valid={emailValid || !emailTouched}
                error={emailTouched && !emailValid ? '请输入有效邮箱' : undefined}
              />

              {/* 密码 */}
              <div>
                <FloatingInput
                  icon={<Lock size={18} />}
                  label="密码"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={setPassword}
                  touched={passwordTouched}
                  setTouched={setPasswordTouched}
                  valid={password.length >= 6 || !passwordTouched}
                  error={passwordTouched && password.length < 6 ? '至少6位' : undefined}
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ background: 'none', border: 'none', color: 'rgba(245,240,235,0.4)', cursor: 'pointer', padding: 0 }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                />
                {/* 密码强度指示器 */}
                {mode === 'register' && password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <div style={{ flex: 1, height: 3, background: 'rgba(245,240,235,0.1)', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(passwordStrength.level / 3) * 100}%` }}
                        style={{ height: '100%', background: passwordStrength.color }}
                      />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: passwordStrength.color }}>
                      {passwordStrength.label}
                    </span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* 错误提示 */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                style={{ color: '#ef4444', fontSize: '0.8rem', textAlign: 'center', marginTop: 16 }}
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* 提交按钮 */}
          <motion.button
            type="submit"
            disabled={loading || (mode === 'login' ? !email || !password : !email || !password || !name)}
            whileHover={loading ? {} : { scale: 1.02, backgroundColor: '#d4b87d' }}
            whileTap={loading ? {} : { scale: 0.98 }}
            style={{
              width: '100%', marginTop: 24, padding: '14px 0',
              background: '#C9A96E', color: '#0D0D0D',
              border: 'none', fontSize: '0.95rem', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" />处理中...</>
            ) : (
              <>{mode === 'login' ? '登录' : '注册'}<ArrowRight size={18} /></>
            )}
          </motion.button>
        </form>

        {/* 底部链接 */}
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: '0.8rem', color: 'rgba(245,240,235,0.4)' }}>
          {mode === 'login' ? '还没有账户？' : '已有账户？'}
          <button
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
            style={{ background: 'none', border: 'none', color: '#C9A96E', cursor: 'pointer', marginLeft: 4, textDecoration: 'underline' }}
          >
            {mode === 'login' ? '立即注册' : '去登录'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}

/* ─── 浮动标签输入框 ─── */
function FloatingInput({
  icon, label, type = 'text', value, onChange, touched, setTouched, valid, error, rightElement,
}: {
  icon: React.ReactNode;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  touched: boolean;
  setTouched: (v: boolean) => void;
  valid: boolean;
  error?: string;
  rightElement?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const isActive = focused || value.length > 0;

  return (
    <div>
      <div style={{
        position: 'relative',
        border: `1px solid ${!valid && touched ? '#ef4444' : focused ? '#C9A96E' : 'rgba(245,240,235,0.15)'}`,
        background: 'rgba(245,240,235,0.03)',
        transition: 'border-color 0.3s',
      }}>
        {/* 图标 */}
        <div style={{
          position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
          color: focused ? '#C9A96E' : 'rgba(245,240,235,0.3)',
          transition: 'color 0.3s',
        }}>
          {icon}
        </div>

        {/* 浮动标签 */}
        <motion.label
          animate={{
            y: isActive ? -10 : 0,
            scale: isActive ? 0.75 : 1,
            color: focused ? '#C9A96E' : 'rgba(245,240,235,0.3)',
          }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'absolute', left: 42, top: '50%', transformOrigin: 'left',
            pointerEvents: 'none', fontSize: '0.9rem',
          }}
        >
          {label}
        </motion.label>

        {/* 输入框 */}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); setTouched(true); }}
          style={{
            width: '100%', padding: '16px 14px 16px 42px',
            background: 'transparent', border: 'none', color: '#F5F0EB',
            fontSize: '0.9rem', outline: 'none',
          }}
        />

        {/* 右侧元素 */}
        {rightElement && (
          <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}>
            {rightElement}
          </div>
        )}
      </div>

      {/* 错误提示 */}
      <AnimatePresence>
        {error && touched && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 4, paddingLeft: 4 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
