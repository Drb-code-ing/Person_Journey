'use client';

/**
 * 深色页面共享大气层组件
 * 四层叠加：噪点纹理 + 氛围光晕 (::before/::after 由 CSS 驱动)
 * + 网格骨架 + 浮动粒子
 */

const PARTICLE_COLORS = [
  'gold','violet','blue','pink','gold','violet','blue','gold','violet','blue',
  'pink','gold','violet','blue','gold','violet','blue','gold','violet','pink',
];

export default function DarkAtmosphere() {
  return (
    <>
      <div className="dark-atmo-grid" />
      <div className="dark-atmo-particles">
        {PARTICLE_COLORS.map((color, i) => (
          <div key={i} className={`atmo-particle atmo-particle--${color}`} />
        ))}
      </div>
    </>
  );
}
