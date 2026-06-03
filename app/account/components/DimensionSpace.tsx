'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function DimensionSpace() {
  // 12 个 CSS 粒子
  const particles = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <motion.div
      className="dimension-space"
      whileHover={{ scale: 1.005 }}
      transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
    >
      {/* 粒子层 */}
      <div className="dimension-particles">
        {particles.map(i => (
          <div key={i} className="dimension-particle" />
        ))}
      </div>

      {/* 内容 */}
      <div className="dimension-content">
        <div>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles size={18} style={{ color: 'var(--aj-aurora-violet)' }} />
            <span className="text-xs tracking-widest uppercase" style={{ color: 'var(--aj-aurora-violet)' }}>
              Dimension Space
            </span>
          </div>

          <h2 className="dimension-title">次元空间</h2>

          <p className="dimension-desc">
            在这里，打造你的梦幻空间。穿越次元壁，探索属于你的专属旅行维度。
          </p>

          <button className="dimension-cta">
            <Sparkles size={14} />
            进入次元空间
          </button>
        </div>
      </div>
    </motion.div>
  );
}
