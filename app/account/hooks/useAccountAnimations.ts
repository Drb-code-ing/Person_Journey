'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const goldEase = 'power3.inOut';

/**
 * 个人中心页面 GSAP 动效 hook
 * - 分层递进式入场动画
 * - 卡片 hover 光影效果
 * - 次元空间持续粒子动画
 */
export function useAccountAnimations() {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: goldEase } });
    timelineRef.current = tl;

    // ─── 页面入场：分层递进 ───
    // 1. 页面标题区
    tl.fromTo('.account-header', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 }, 0);

    // 2. 头像区 — 从左侧滑入 + 缩放
    tl.fromTo('.account-avatar-section',
      { opacity: 0, x: -40, scale: 0.9 },
      { opacity: 1, x: 0, scale: 1, duration: 0.7 },
      0.15
    );

    // 3. 会员卡片 — 从底部弹起
    tl.fromTo('.account-member-section',
      { opacity: 0, y: 40, rotateX: 5 },
      { opacity: 1, y: 0, rotateX: 0, duration: 0.6 },
      0.3
    );

    // 4. 行程入口 — 依次交错入场
    tl.fromTo('.account-action-card',
      { opacity: 0, y: 30, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1 },
      0.45
    );

    // 5. 行程历史 — 时间轴节点逐个出现
    tl.fromTo('.account-history-item',
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.08 },
      0.6
    );

    // 6. 次元空间 — 从底部渐显 + 粒子启动
    tl.fromTo('.dimension-space',
      { opacity: 0, y: 50, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8 },
      0.75
    );

    // 7. 次元空间标题 — 极光文字渐显
    tl.fromTo('.dimension-title',
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.5 },
      1.0
    );

    return () => {
      tl.kill();
    };
  }, []);

  // ─── 卡片 Hover 光影效果 ───
  useEffect(() => {
    const cards = document.querySelectorAll('.account-action-card, .member-tier-card, .account-history-card');

    const handleEnter = (e: Event) => {
      const card = e.currentTarget as HTMLElement;
      gsap.to(card, {
        boxShadow: '0 12px 48px rgba(0,0,0,0.4), 0 0 30px rgba(201,169,110,0.1)',
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleLeave = (e: Event) => {
      const card = e.currentTarget as HTMLElement;
      gsap.to(card, {
        boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.2)',
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    cards.forEach(card => {
      card.addEventListener('mouseenter', handleEnter);
      card.addEventListener('mouseleave', handleLeave);
    });

    return () => {
      cards.forEach(card => {
        card.removeEventListener('mouseenter', handleEnter);
        card.removeEventListener('mouseleave', handleLeave);
      });
    };
  }, []);

  // ─── 次元空间持续粒子动画增强 ───
  useEffect(() => {
    const particles = document.querySelectorAll('.dimension-particle');
    if (particles.length === 0) return;

    // 为每个粒子添加随机的水平漂移
    particles.forEach((particle, i) => {
      gsap.to(particle, {
        x: `random(-30, 30)`,
        duration: `random(4, 8)`,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: i * 0.2,
      });
    });
  }, []);
}
