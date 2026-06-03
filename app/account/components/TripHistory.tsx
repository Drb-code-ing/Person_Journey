'use client';

import { MapPin, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface Trip {
  id: string;
  destination: string;
  date: string;
  duration: string;
  status: 'completed' | 'upcoming';
  coverImage?: string;
}

interface TripHistoryProps {
  trips: Trip[];
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
      {trips.map((trip, index) => (
        <div
          key={trip.id}
          className="account-history-item"
        >
          <div className="account-history-dot" />
          <Link href={`/trips/${trip.id}`}>
            <div className="account-history-card">
              <div className="account-history-date">{trip.date}</div>
              <div className="account-history-dest">{trip.destination}</div>
              <div className="account-history-meta flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {trip.duration}
                </span>
              </div>
              <div className="account-history-status" data-status={trip.status}>
                {trip.status === 'completed' ? (
                  <>
                    <CheckCircle size={12} />
                    已完成
                  </>
                ) : (
                  <>
                    <Clock size={12} />
                    即将出发
                  </>
                )}
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
