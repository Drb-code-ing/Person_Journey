'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * 个人中心页面 GSAP 动效 hook
 * - 分层递进式入场动画
 * - 卡片 hover 和粒子动画由 CSS 处理（更高效）
 */
export function useAccountAnimations() {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' } });
    timelineRef.current = tl;

    // ─── 页面入场：分层递进 ───
    tl.fromTo('.account-header', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, 0);
    tl.fromTo('.account-avatar-section', { opacity: 0, x: -40, scale: 0.9 }, { opacity: 1, x: 0, scale: 1, duration: 0.7 }, 0.15);
    tl.fromTo('.account-member-section', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6 }, 0.3);
    tl.fromTo('.account-action-card', { opacity: 0, y: 30, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1 }, 0.45);
    tl.fromTo('.account-history-item', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.08 }, 0.6);
    tl.fromTo('.dimension-space', { opacity: 0, y: 50, scale: 0.98 }, { opacity: 1, y: 0, scale: 1, duration: 0.8 }, 0.75);
    tl.fromTo('.dimension-title', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5 }, 1.0);

    return () => { tl.kill(); };
  }, []);
}
