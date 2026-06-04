'use client';

import { MapPin, Clock, CheckCircle, AlertCircle, CreditCard } from 'lucide-react';
import Link from 'next/link';

export interface Trip {
  id: string;
  origin?: string;
  destination: string;
  date: string;
  duration: string;
  status: 'pending' | 'upcoming' | 'completed' | 'cancelled';
  orderNo?: string;
  totalPrice?: number;
  transportType?: string;
}

interface TripHistoryProps {
  trips: Trip[];
}

/** 状态配置（纯数据，无 JSX） */
const STATUS_CONFIG = {
  pending:   { label: '待启程', color: '#C9A96E', bg: 'rgba(201,169,110,0.12)', border: 'rgba(201,169,110,0.25)', note: '24小时内可免费取消' },
  upcoming:  { label: '待开始', color: '#60A5FA', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.25)', note: '已支付定金 · 取消需联系客服' },
  completed: { label: '已结束', color: '#22C55E', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)', note: '' },
  cancelled: { label: '已取消', color: '#9CA3AF', bg: 'rgba(156,163,175,0.12)', border: 'rgba(156,163,175,0.25)', note: '' },
} as const;

function getStatusIcon(status: string) {
  switch (status) {
    case 'completed': return <CheckCircle size={12} />;
    case 'upcoming':  return <CreditCard size={12} />;
    default:          return <AlertCircle size={12} />;
  }
}

export default function TripHistory({ trips }: TripHistoryProps) {
  if (trips.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--aj-gold-glow)' }}>
          <MapPin size={24} style={{ color: 'var(--aj-gold)' }} />
        </div>
        <h3 className="text-lg mb-2" style={{ color: 'var(--aj-text-primary)' }}>暂无行程记录</h3>
        <p className="text-sm mb-6" style={{ color: 'var(--aj-text-muted)' }}>
          探索我们的奢华目的地，开启您的第一次旅程
        </p>
        <Link
          href="/destinations"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-lg transition-all duration-300"
          style={{ background: 'var(--aj-gold)', color: '#0D0D0D' }}
        >
          探索目的地
        </Link>
      </div>
    );
  }

  return (
    <div className="account-history">
      {trips.map((trip) => {
        const cfg = STATUS_CONFIG[trip.status] || STATUS_CONFIG.pending;
        const hasRoute = trip.origin && trip.destination;
        return (
          <div
            key={trip.id}
            className="account-history-item"
          >
            <div className="account-history-dot" style={{ background: cfg.color }} />
            <Link href={`/trips/${trip.id}`}>
              <div className="account-history-card" style={{ borderColor: cfg.border }}>
                {/* 日期 */}
                <div className="account-history-date">{trip.date}</div>

                {/* 路线：出发地 → 目的地 */}
                {hasRoute ? (
                  <div className="flex items-center gap-2 mb-2" style={{ flexWrap: 'wrap' }}>
                    <span
                      className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                      style={{ background: 'rgba(201,169,110,0.1)', color: 'var(--aj-gold)', border: '1px solid rgba(201,169,110,0.2)' }}
                    >
                      {trip.origin}
                    </span>
                    <span style={{ color: 'var(--aj-gold)', fontSize: 14 }}>→</span>
                    <span
                      className="inline-block px-2 py-0.5 rounded text-xs font-medium"
                      style={{ background: 'rgba(201,169,110,0.1)', color: 'var(--aj-gold)', border: '1px solid rgba(201,169,110,0.2)' }}
                    >
                      {trip.destination}
                    </span>
                  </div>
                ) : (
                  <div className="account-history-dest">{trip.destination}</div>
                )}

                {/* 行程信息 */}
                <div className="account-history-meta flex items-center gap-3" style={{ flexWrap: 'wrap' }}>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {trip.duration}
                  </span>
                  {trip.transportType && (
                    <span style={{ color: 'var(--aj-text-muted)', fontSize: 12 }}>
                      {trip.transportType === 'flight' ? '✈️ 航班' : trip.transportType === 'highspeed-rail' ? '🚄 高铁' : trip.transportType}
                    </span>
                  )}
                  {trip.totalPrice ? (
                    <span style={{ color: 'var(--aj-gold)', fontSize: 12, fontWeight: 500 }}>
                      ¥{trip.totalPrice.toLocaleString()}
                    </span>
                  ) : null}
                </div>

                {/* 状态标签 */}
                <div className="flex items-center justify-between mt-3">
                  <div
                    className="account-history-status"
                    style={{
                      color: cfg.color,
                      background: cfg.bg,
                      border: `1px solid ${cfg.border}`,
                    }}
                  >
                    {getStatusIcon(trip.status)}
                    {cfg.label}
                    {cfg.icon}
                    {cfg.label}
                  </div>
                  {cfg.note && (
                    <span style={{ color: 'var(--aj-text-muted)', fontSize: 11 }}>
                      {cfg.note}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
