'use client';

import { MapPin } from 'lucide-react';
import PlaceholderPage from '../../components/PlaceholderPage';

export default function TripDetailPage() {
  return (
    <PlaceholderPage
      icon={MapPin}
      title="行程详情"
      description="行程详情页面正在独立设计中，将为您呈现完整的定制旅程体验记录"
      backHref="/trips"
      backLabel="返回行程列表"
    />
  );
}
