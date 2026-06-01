'use client';

import { useState, useCallback, Suspense } from 'react';
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <Loader2 size={32} className="text-[#C9A96E] animate-spin" />
      </div>
    }>
      <AuthPage />
    </Suspense>
  );
}

function AuthPage() {
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
    <div className="auth-page" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0a0a0a',
      overflow: 'hidden',
    }}>
      {/* 动态流动渐变背景 */}
      <motion.div
        animate={{
          background: [
            'linear-gradient(135deg, #0a0a0a 0%, #1a1510 25%, #0d0d0d 50%, #15120e 75%, #0a0a0a 100%)',
            'linear-gradient(135deg, #15120e 0%, #0a0a0a 25%, #1a1510 50%, #0d0d0d 75%, #15120e 100%)',
            'linear-gradient(135deg, #0d0d0d 0%, #15120e 25%, #0a0a0a 50%, #1a1510 75%, #0d0d0d 100%)',
          ],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        style={{ position: 'fixed', inset: 0, zIndex: 0 }}
      />

      {/* 金色光斑 - 柔和漂浮的光晕 */}
      <motion.div
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -50, 30, 0],
          scale: [1, 1.15, 0.85, 1],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'fixed', top: '15%', left: '10%',
          width: 500, height: 500, zIndex: 0,
          background: 'radial-gradient(circle, rgba(201,169,110,0.18) 0%, rgba(201,169,110,0.05) 40%, transparent 70%)',
          filter: 'blur(50px)',
        }}
      />
      <motion.div
        animate={{
          x: [0, -35, 45, 0],
          y: [0, 40, -35, 0],
          scale: [1, 0.85, 1.15, 1],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'fixed', top: '55%', right: '5%',
          width: 450, height: 450, zIndex: 0,
          background: 'radial-gradient(circle, rgba(245,217,156,0.15) 0%, rgba(201,169,110,0.05) 40%, transparent 70%)',
          filter: 'blur(45px)',
        }}
      />
      <motion.div
        animate={{
          x: [0, 50, -40, 0],
          y: [0, -30, 40, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'fixed', bottom: '5%', left: '45%',
          width: 400, height: 400, zIndex: 0,
          background: 'radial-gradient(circle, rgba(201,169,110,0.2) 0%, rgba(139,90,43,0.08) 40%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      {/* 额外光斑 - 增加层次感 */}
      <motion.div
        animate={{
          x: [0, -20, 25, 0],
          y: [0, 20, -15, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'fixed', top: '40%', left: '60%',
          width: 350, height: 350, zIndex: 0,
          background: 'radial-gradient(circle, rgba(201,169,110,0.12) 0%, transparent 60%)',
          filter: 'blur(55px)',
        }}
      />

      {/* 金色粒子系统 - 使用固定种子值避免 SSR 水合错误 */}
      {[
        { left: '12%', size: 5, opacity: 0.9, duration: 10, delay: 0, distance: 220 },
        { left: '28%', size: 6, opacity: 1, duration: 12, delay: 1.5, distance: 280 },
        { left: '45%', size: 4, opacity: 0.8, duration: 8, delay: 3, distance: 200 },
        { left: '62%', size: 7, opacity: 1, duration: 14, delay: 0.5, distance: 320 },
        { left: '78%', size: 5, opacity: 0.9, duration: 11, delay: 2, distance: 250 },
        { left: '8%', size: 6, opacity: 1, duration: 13, delay: 4, distance: 270 },
        { left: '35%', size: 4, opacity: 0.8, duration: 9, delay: 5.5, distance: 210 },
        { left: '52%', size: 5, opacity: 0.9, duration: 10.5, delay: 4.5, distance: 240 },
        { left: '68%', size: 6, opacity: 1, duration: 14.5, delay: 6, distance: 300 },
        { left: '85%', size: 4, opacity: 0.8, duration: 7.5, delay: 7, distance: 190 },
        { left: '18%', size: 7, opacity: 1, duration: 15, delay: 1, distance: 350 },
        { left: '42%', size: 5, opacity: 0.9, duration: 11.5, delay: 3.5, distance: 260 },
        { left: '58%', size: 6, opacity: 1, duration: 13.5, delay: 5, distance: 310 },
        { left: '75%', size: 4, opacity: 0.8, duration: 9.5, delay: 6.5, distance: 220 },
        { left: '92%', size: 5, opacity: 0.9, duration: 12.5, delay: 2.5, distance: 275 },
        { left: '5%', size: 6, opacity: 1, duration: 15.5, delay: 7.5, distance: 330 },
        { left: '25%', size: 4, opacity: 0.8, duration: 8.5, delay: 8, distance: 205 },
        { left: '48%', size: 7, opacity: 1, duration: 16, delay: 5.5, distance: 360 },
        { left: '72%', size: 5, opacity: 0.9, duration: 10, delay: 9, distance: 245 },
        { left: '88%', size: 6, opacity: 1, duration: 14, delay: 1.5, distance: 310 },
      ].map((particle, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -particle.distance],
            opacity: [0, particle.opacity, 0],
            scale: [0, 1, 0.5],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: 'easeOut',
          }}
          style={{
            position: 'fixed',
            left: particle.left,
            bottom: '-5%',
            width: particle.size,
            height: particle.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(201,169,110,${particle.opacity}) 0%, transparent 70%)`,
            boxShadow: `0 0 ${particle.size + 3}px rgba(201,169,110,0.3)`,
            zIndex: 0,
          }}
        />
      ))}

      {/* 装饰性几何线条 - 四角 (增强版) */}
      <div style={{
        position: 'fixed', top: 30, left: 30, zIndex: 0,
        width: 80, height: 80,
        borderTop: '2px solid rgba(201,169,110,0.3)',
        borderLeft: '2px solid rgba(201,169,110,0.3)',
        boxShadow: '-2px -2px 15px rgba(201,169,110,0.1)',
      }} />
      <div style={{
        position: 'fixed', top: 30, right: 30, zIndex: 0,
        width: 80, height: 80,
        borderTop: '2px solid rgba(201,169,110,0.3)',
        borderRight: '2px solid rgba(201,169,110,0.3)',
        boxShadow: '2px -2px 15px rgba(201,169,110,0.1)',
      }} />
      <div style={{
        position: 'fixed', bottom: 30, left: 30, zIndex: 0,
        width: 80, height: 80,
        borderBottom: '2px solid rgba(201,169,110,0.3)',
        borderLeft: '2px solid rgba(201,169,110,0.3)',
        boxShadow: '-2px 2px 15px rgba(201,169,110,0.1)',
      }} />
      <div style={{
        position: 'fixed', bottom: 30, right: 30, zIndex: 0,
        width: 80, height: 80,
        borderBottom: '2px solid rgba(201,169,110,0.3)',
        borderRight: '2px solid rgba(201,169,110,0.3)',
        boxShadow: '2px 2px 15px rgba(201,169,110,0.1)',
      }} />

      {/* 噪点纹理叠加 */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0,
        opacity: 0.06,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'repeat',
        backgroundSize: '256px 256px',
        mixBlendMode: 'overlay',
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

      {/* 表单卡片 - 带发光边框 */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: goldEase }}
        style={{ position: 'relative', zIndex: 1 }}
      >
        {/* 外层发光效果 */}
        <motion.div
          animate={{
            boxShadow: [
              '0 0 30px rgba(201,169,110,0.05), 0 0 60px rgba(201,169,110,0.03)',
              '0 0 40px rgba(201,169,110,0.08), 0 0 80px rgba(201,169,110,0.05)',
              '0 0 30px rgba(201,169,110,0.05), 0 0 60px rgba(201,169,110,0.03)',
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', inset: -1,
            border: '1px solid rgba(201,169,110,0.2)',
            pointerEvents: 'none',
          }}
        />

        <div style={{
          width: '100%', maxWidth: 440, padding: '48px 40px',
          background: 'rgba(15,15,15,0.9)',
          backdropFilter: 'blur(30px)',
          border: '1px solid rgba(201,169,110,0.1)',
          position: 'relative',
        }}>
          {/* 卡片内部顶部装饰线 */}
          <div style={{
            position: 'absolute', top: 0, left: '20%', right: '20%',
            height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.4), transparent)',
          }} />

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
        </div>
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
    <div style={{ position: 'relative', paddingTop: isActive ? 16 : 0, transition: 'padding-top 0.3s ease-out' }}>
      {/* 浮动标签 - 带逐字动画效果 */}
      <motion.label
        animate={{
          y: isActive ? -8 : 16,
          scale: isActive ? 0.78 : 1,
          color: focused ? '#C9A96E' : 'rgba(245,240,235,0.3)',
        }}
        transition={{
          duration: 0.35,
          ease: [0.34, 1.56, 0.64, 1], // 弹性缓动
        }}
        style={{
          position: 'absolute', left: 42, top: 0, transformOrigin: 'left center',
          pointerEvents: 'none', fontSize: '0.85rem', zIndex: 2,
          whiteSpace: 'nowrap',
          // 金色渐变扫光效果
          backgroundImage: focused
            ? 'linear-gradient(90deg, #C9A96E 0%, #F5D99C 50%, #C9A96E 100%)'
            : 'none',
          backgroundSize: '200% 100%',
          WebkitBackgroundClip: focused ? 'text' : 'unset',
          WebkitTextFillColor: focused ? 'transparent' : 'inherit',
          animation: focused ? 'shimmer 2s ease-in-out infinite' : 'none',
        }}
      >
        {label}
      </motion.label>

      {/* 输入框容器 - 带渐变边框效果 */}
      <div style={{ position: 'relative', padding: '1px' }}>
        {/* 渐变边框背景 */}
        <motion.div
          animate={{
            opacity: focused ? 1 : 0,
          }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(135deg, rgba(201,169,110,0.6) 0%, rgba(245,217,156,0.3) 50%, rgba(201,169,110,0.6) 100%)',
            backgroundSize: '200% 200%',
            animation: focused ? 'gradientShift 3s ease infinite' : 'none',
            borderRadius: 1,
          }}
        />

        {/* 主输入区域 */}
        <div style={{
          position: 'relative',
          border: `1px solid ${!valid && touched ? '#ef4444' : focused ? 'transparent' : 'rgba(245,240,235,0.15)'}`,
          background: focused ? 'rgba(20,20,20,0.95)' : 'rgba(245,240,235,0.03)',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(10px)',
        }}>
          {/* 图标 - 带弹跳动画 */}
          <motion.div
            animate={{
              color: focused ? '#C9A96E' : 'rgba(245,240,235,0.3)',
              scale: focused ? [1, 1.15, 1] : 1,
              rotate: focused ? [0, -8, 8, 0] : 0,
            }}
            transition={{
              color: { duration: 0.3 },
              scale: { duration: 0.5, ease: 'easeOut' },
              rotate: { duration: 0.5, ease: 'easeOut' },
            }}
            style={{
              position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {icon}
          </motion.div>

          {/* 输入框 */}
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => { setFocused(false); setTouched(true); }}
            placeholder={isActive ? '' : ' '}
            style={{
              width: '100%', padding: '16px 14px 16px 42px',
              background: 'transparent', border: 'none', color: '#F5F0EB',
              fontSize: '0.9rem', outline: 'none',
              caretColor: '#C9A96E',
            }}
          />

          {/* 右侧元素 */}
          {rightElement && (
            <motion.div
              animate={{
                color: focused ? '#C9A96E' : 'rgba(245,240,235,0.4)',
              }}
              transition={{ duration: 0.3 }}
              style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center' }}
            >
              {rightElement}
            </motion.div>
          )}

          {/* 底部光带指示器 */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{
              scaleX: focused ? 1 : 0,
              opacity: focused ? 1 : 0,
            }}
            transition={{
              duration: 0.4,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            style={{
              position: 'absolute', bottom: 0, left: '10%', right: '10%',
              height: 2,
              background: 'linear-gradient(90deg, transparent, #C9A96E, #F5D99C, #C9A96E, transparent)',
              transformOrigin: 'center',
              boxShadow: '0 0 12px rgba(201,169,110,0.5), 0 0 4px rgba(201,169,110,0.8)',
            }}
          />
        </div>
      </div>

      {/* 错误提示 */}
      <AnimatePresence>
        {error && touched && (
          <motion.p
            initial={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(4px)' }}
            transition={{ duration: 0.3 }}
            style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: 6, paddingLeft: 4 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
