'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, ArrowLeft, Clock, CreditCard, CheckCircle, AlertCircle, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '../../lib/contexts/AuthContext';
import { useToast } from '../../components/Toast';
import DarkAtmosphere from '../../components/DarkAtmosphere';

interface OrderDetail {
  id: string;
  orderNo: string;
  scope: string;
  status: string;
  guestName: string;
  guestPhone: string;
  guestEmail: string;
  origin: string;
  destinationName: string;
  routeName: string;
  transportType: string;
  travelDate: string;
  endDate: string;
  days: number;
  adults: number;
  children: number;
  basePrice: number;
  addOnsTotal: number;
  totalPrice: number;
  createdTime: string;
}

const STATUS_MAP: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string }> = {
  submitted:    { label: '待确认', icon: <AlertCircle size={16} />, color: '#C9A96E', bg: 'rgba(201,169,110,0.12)' },
  confirmed:    { label: '已确认', icon: <AlertCircle size={16} />, color: '#C9A96E', bg: 'rgba(201,169,110,0.12)' },
  paid:         { label: '已支付', icon: <CreditCard size={16} />, color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' },
  in_progress:  { label: '进行中', icon: <Clock size={16} />, color: '#60A5FA', bg: 'rgba(96,165,250,0.12)' },
  completed:    { label: '已结束', icon: <CheckCircle size={16} />, color: '#22C55E', bg: 'rgba(34,197,94,0.12)' },
  cancelled:    { label: '已取消', icon: <AlertCircle size={16} />, color: '#9CA3AF', bg: 'rgba(156,163,175,0.12)' },
};

const goldEase = [0.76, 0, 0.24, 1] as const;

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/travel-orders/${params.id}`);
      const json = await res.json();
      if (json.success) {
        setOrder(json.data);
      } else {
        toast('订单不存在', 'error');
        router.replace('/account');
      }
    } catch {
      toast('加载失败', 'error');
    } finally {
      setLoading(false);
    }
  }, [user, params.id, toast, router]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login?redirect=/account');
      return;
    }
    fetchOrder();
  }, [authLoading, user, fetchOrder, router]);

  const handleDelete = async () => {
    if (!confirm('确定要删除这个行程吗？')) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/travel-orders/${params.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        toast('行程已删除', 'success');
        router.replace('/account');
      } else {
        toast(json.error?.message || '删除失败', 'error');
      }
    } catch {
      toast('网络错误', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] flex items-center justify-center">
        <Loader2 size={32} className="text-[#C9A96E] animate-spin" />
      </div>
    );
  }

  if (!order) return null;

  const statusCfg = STATUS_MAP[order.status] || STATUS_MAP.submitted;
  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

  return (
    <div className="min-h-screen bg-[#0D0D0D] relative overflow-hidden">
      <DarkAtmosphere />
      <div className="relative z-10 max-w-2xl mx-auto px-6 py-24">
        {/* 返回按钮 */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: goldEase }}
          onClick={() => router.push('/account')}
          className="flex items-center gap-2 mb-8 text-sm transition-colors hover:text-[#C9A96E]"
          style={{ color: 'var(--aj-text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <ArrowLeft size={16} />
          返回个人中心
        </motion.button>

        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: goldEase }}
          className="mb-8"
        >
          <h1 className="font-['Playfair_Display'] text-2xl mb-2" style={{ color: 'var(--aj-text-primary)' }}>
            {order.destinationName || '行程详情'}
          </h1>
          <p className="text-sm" style={{ color: 'var(--aj-text-muted)' }}>
            订单号: {order.orderNo}
          </p>
        </motion.div>

        {/* 状态卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: goldEase }}
          className="rounded-2xl p-6 mb-6"
          style={{
            background: 'var(--aj-glass-white)',
            backdropFilter: 'blur(24px)',
            border: '1px solid var(--aj-glass-border)',
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm" style={{ color: 'var(--aj-text-muted)' }}>当前状态</span>
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
              style={{ color: statusCfg.color, background: statusCfg.bg }}
            >
              {statusCfg.icon}
              {statusCfg.label}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span style={{ color: 'var(--aj-text-muted)' }}>出发地</span>
              <p style={{ color: 'var(--aj-text-primary)' }}>{order.origin || '-'}</p>
            </div>
            <div>
              <span style={{ color: 'var(--aj-text-muted)' }}>交通方式</span>
              <p style={{ color: 'var(--aj-text-primary)' }}>{order.transportType || '-'}</p>
            </div>
            <div>
              <span style={{ color: 'var(--aj-text-muted)' }}>出发日期</span>
              <p style={{ color: 'var(--aj-text-primary)' }}>{formatDate(order.travelDate)}</p>
            </div>
            <div>
              <span style={{ color: 'var(--aj-text-muted)' }}>返回日期</span>
              <p style={{ color: 'var(--aj-text-primary)' }}>{formatDate(order.endDate)}</p>
            </div>
            <div>
              <span style={{ color: 'var(--aj-text-muted)' }}>行程天数</span>
              <p style={{ color: 'var(--aj-text-primary)' }}>{order.days}天{order.days > 1 ? (order.days - 1) : 0}晚</p>
            </div>
            <div>
              <span style={{ color: 'var(--aj-text-muted)' }}>出行人数</span>
              <p style={{ color: 'var(--aj-text-primary)' }}>{order.adults}位成人{order.children > 0 ? ` + ${order.children}位儿童` : ''}</p>
            </div>
          </div>
        </motion.div>

        {/* 价格信息 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: goldEase }}
          className="rounded-2xl p-6 mb-6"
          style={{
            background: 'var(--aj-glass-white)',
            backdropFilter: 'blur(24px)',
            border: '1px solid var(--aj-glass-border)',
          }}
        >
          <h3 className="text-sm font-medium mb-4" style={{ color: 'var(--aj-text-primary)' }}>费用明细</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span style={{ color: 'var(--aj-text-muted)' }}>基础费用</span>
              <span style={{ color: 'var(--aj-text-primary)' }}>¥{order.basePrice.toLocaleString()}</span>
            </div>
            {order.addOnsTotal > 0 && (
              <div className="flex justify-between">
                <span style={{ color: 'var(--aj-text-muted)' }}>附加服务</span>
                <span style={{ color: 'var(--aj-text-primary)' }}>¥{order.addOnsTotal.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t" style={{ borderColor: 'var(--aj-glass-border)' }}>
              <span className="font-medium" style={{ color: 'var(--aj-text-primary)' }}>总计</span>
              <span className="font-medium" style={{ color: 'var(--aj-gold)' }}>¥{order.totalPrice.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>

        {/* 删除按钮（测试用） */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: goldEase }}
        >
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm transition-all"
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#EF4444',
              cursor: deleting ? 'not-allowed' : 'pointer',
              opacity: deleting ? 0.6 : 1,
            }}
          >
            {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            {deleting ? '删除中...' : '删除行程（测试）'}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
