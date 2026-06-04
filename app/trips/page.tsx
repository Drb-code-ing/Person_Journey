'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** 行程列表已在个人中心展示，此页重定向 */
export default function TripsPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/account');
  }, [router]);
  return null;
}
