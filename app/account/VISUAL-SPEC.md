# Aurum Journey — 个人中心视觉设计规范

> 版本：v1.0 | 基调：轻奢奢旅 + 梦幻次元融合风 | 日期：2026-06-03

---

## 一、色值规范

### 1.1 品牌主色板

```css
:root {
  /* ─── 主色（品牌锚定）─── */
  --aj-bg-deep:       #0D0D0D;       /* 深黑底色 */
  --aj-bg-card:       #111111;       /* 卡片底色（比主底色亮一级） */
  --aj-bg-elevated:   #161616;       /* 浮层/弹窗底色 */
  --aj-gold:          #C9A96E;       /* 品牌金（核心强调色） */
  --aj-gold-light:    #F5D99C;       /* 亮金（渐变终点 / 高光） */
  --aj-gold-dark:     #A88B4A;       /* 暗金（阴影 / 低调强调） */
  --aj-text-primary:  #F5F0EB;       /* 暖白主文字 */
  --aj-text-secondary: rgba(245, 240, 235, 0.6);  /* 次级文字 */
  --aj-text-muted:    rgba(245, 240, 235, 0.35);  /* 弱化文字 */
  --aj-beige:         #f3ebe4;       /* 品牌米色（亮色主题页用） */

  /* ─── 辅色（次元融合）─── */
  --aj-aurora-violet: #7B68EE;       /* 极光紫 — 梦幻感 */
  --aj-aurora-blue:   #4FC3F7;       /* 极光蓝 — 次元感 */
  --aj-aurora-teal:   #26C6DA;       /* 极光青 — 科技感 */
  --aj-aurora-pink:   #E88DCE;       /* 极光粉 — 柔和点缀 */
  --aj-nebula-deep:   #1A0A2E;       /* 星云深紫 — 背景叠加 */
  --aj-nebula-mid:    #2D1B4E;       /* 星云中紫 */

  /* ─── 功能色 ─── */
  --aj-success:       #4CAF7D;       /* 成功 / 已确认 */
  --aj-warning:       #E8B44E;       /* 警告 / 待处理 */
  --aj-error:         #D4564E;       /* 错误 / 已取消 */
  --aj-info:          #5B9BD5;       /* 信息 / 进行中 */

  /* ─── 透明度层 ─── */
  --aj-glass-white:   rgba(255, 255, 255, 0.04);  /* 玻璃白底 */
  --aj-glass-border:  rgba(255, 255, 255, 0.08);  /* 玻璃边框 */
  --aj-gold-glow:     rgba(201, 169, 110, 0.15);  /* 金色光晕 */
  --aj-gold-border:   rgba(201, 169, 110, 0.3);   /* 金色边框 */
}
```

### 1.2 模块专属配色方案

| 模块 | 主色 | 辅助色 | 氛围 |
|------|------|--------|------|
| **用户头像区** | `aj-gold` 渐变 `aj-gold-light` | `aj-gold-glow` 光晕 | 温暖、尊贵 |
| **会员等级卡** | `aj-gold` + `aj-aurora-violet` | 等级专属渐变（见下） | 梦幻、等级感 |
| **我的行程入口** | `aj-gold` | `aj-glass-white` | 简洁、行动导向 |
| **行程历史** | `aj-text-primary` | `aj-gold` 时间轴线 | 叙事、时间感 |
| **次元空间** | `aj-aurora-violet` + `aj-aurora-blue` | `aj-nebula-deep` 背景 | 梦幻、沉浸 |
| **设置区** | `aj-text-secondary` | `aj-glass-border` | 低调、功能型 |

### 1.3 会员等级渐变色

```css
:root {
  /* 银卡 */
  --tier-silver-from:  #B0B0B0;
  --tier-silver-to:    #D4D4D4;
  --tier-silver-glow:  rgba(176, 176, 176, 0.2);

  /* 金卡 */
  --tier-gold-from:    #C9A96E;
  --tier-gold-to:      #F5D99C;
  --tier-gold-glow:    rgba(201, 169, 110, 0.25);

  /* 铂金卡 */
  --tier-platinum-from: #8B9DC3;
  --tier-platinum-to:   #C5D5E8;
  --tier-platinum-glow: rgba(139, 157, 195, 0.2);

  /* 黑钻卡 */
  --tier-diamond-from:  #7B68EE;
  --tier-diamond-to:    #E88DCE;
  --tier-diamond-glow:  rgba(123, 104, 238, 0.3);
}
```

### 1.4 渐变色定义

```css
:root {
  /* 品牌金渐变 */
  --grad-gold:         linear-gradient(135deg, #C9A96E 0%, #F5D99C 100%);
  --grad-gold-soft:    linear-gradient(135deg, rgba(201,169,110,0.2) 0%, rgba(245,217,156,0.05) 100%);
  --grad-gold-radial:  radial-gradient(circle at 30% 30%, rgba(201,169,110,0.15) 0%, transparent 70%);

  /* 次元极光渐变 */
  --grad-aurora:       linear-gradient(135deg, #7B68EE 0%, #4FC3F7 50%, #26C6DA 100%);
  --grad-aurora-soft:  linear-gradient(135deg, rgba(123,104,238,0.15) 0%, rgba(79,195,247,0.08) 50%, rgba(38,198,218,0.05) 100%);
  --grad-nebula:       radial-gradient(ellipse at 20% 80%, rgba(123,104,238,0.12) 0%, transparent 50%),
                       radial-gradient(ellipse at 80% 20%, rgba(79,195,247,0.08) 0%, transparent 50%);

  /* 卡片底色渐变 */
  --grad-card:         linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
  --grad-card-hover:   linear-gradient(145deg, rgba(201,169,110,0.08) 0%, rgba(255,255,255,0.03) 100%);

  /* 页面顶部氛围渐变 */
  --grad-page-top:     linear-gradient(180deg, rgba(26,10,46,0.4) 0%, rgba(13,13,13,0) 40%);
}
```

### 1.5 光影效果色值

```css
:root {
  /* 金色光晕（头像、按钮 hover） */
  --shadow-gold-glow:   0 0 40px rgba(201, 169, 110, 0.2),
                        0 0 80px rgba(201, 169, 110, 0.08);

  /* 卡片悬浮阴影 */
  --shadow-card:        0 8px 32px rgba(0, 0, 0, 0.3),
                        0 2px 8px rgba(0, 0, 0, 0.2);
  --shadow-card-hover:  0 12px 48px rgba(0, 0, 0, 0.4),
                        0 4px 12px rgba(0, 0, 0, 0.25);

  /* 极光光晕（次元空间模块） */
  --shadow-aurora-glow: 0 0 60px rgba(123, 104, 238, 0.15),
                        0 0 120px rgba(79, 195, 247, 0.08);

  /* 内发光（等级卡片内边） */
  --shadow-inner-gold:  inset 0 1px 0 rgba(245, 217, 156, 0.15);
}
```

---

## 二、组件样式规范

### 2.1 用户头像区

**结构**：外层光环环 + 头像容器 + 等级徽章 + 用户信息

```css
/* ─── 头像容器 ─── */
.account-avatar-wrap {
  position: relative;
  width: 96px;
  height: 96px;
  flex-shrink: 0;
}

/* 外层光晕环 */
.account-avatar-glow {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  background: var(--grad-gold);
  opacity: 0.3;
  filter: blur(12px);
  animation: avatarGlowPulse 3s ease-in-out infinite;
  pointer-events: none;
}

@keyframes avatarGlowPulse {
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50%      { opacity: 0.4; transform: scale(1.05); }
}

/* 头像主体 */
.account-avatar {
  position: relative;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  border: 2px solid var(--aj-gold);
  background: var(--grad-gold);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  z-index: 1;
  transition: transform 0.4s cubic-bezier(0.76, 0, 0.24, 1),
              box-shadow 0.4s cubic-bezier(0.76, 0, 0.24, 1);
}

.account-avatar:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-gold-glow);
}

.account-avatar-letter {
  font-family: 'Playfair Display', serif;
  font-size: 36px;
  font-weight: 600;
  color: var(--aj-bg-deep);
  line-height: 1;
}

.account-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 等级徽章（头像右下角） */
.account-avatar-badge {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--aj-bg-deep);
  border: 2px solid var(--aj-gold);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  font-size: 12px;
}
```

**尺寸规格**：
- PC 端头像：96px x 96px
- 移动端头像：72px x 72px
- 光晕扩展：外扩 6px
- 边框：2px 实线，`var(--aj-gold)`
- Hover 缩放：`scale(1.05)`，过渡 `0.4s goldEase`
- 徽章尺寸：28px，位于头像右下角偏移 (2px, 2px)

### 2.2 会员等级卡片

**结构**：玻璃拟态卡片 + 等级图标 + 进度条 + 权益摘要

```css
/* ─── 等级卡片容器 ─── */
.member-tier-card {
  position: relative;
  background: var(--aj-glass-white);
  backdrop-filter: blur(24px) saturate(1.2);
  -webkit-backdrop-filter: blur(24px) saturate(1.2);
  border: 1px solid var(--aj-glass-border);
  border-radius: 20px;
  padding: 32px;
  overflow: hidden;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.member-tier-card:hover {
  border-color: var(--aj-gold-border);
  box-shadow: var(--shadow-card-hover);
}

/* 卡片内渐变叠加层（底部氛围光） */
.member-tier-card::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120px;
  background: var(--grad-gold-radial);
  pointer-events: none;
  opacity: 0.5;
}

/* 等级专属渐变叠加（通过 data-tier 属性切换） */
.member-tier-card[data-tier="silver"]::before {
  background: radial-gradient(circle at 30% 100%, var(--tier-silver-glow) 0%, transparent 70%);
}
.member-tier-card[data-tier="gold"]::before {
  background: radial-gradient(circle at 30% 100%, var(--tier-gold-glow) 0%, transparent 70%);
}
.member-tier-card[data-tier="platinum"]::before {
  background: radial-gradient(circle at 30% 100%, var(--tier-platinum-glow) 0%, transparent 70%);
}
.member-tier-card[data-tier="diamond"]::before {
  background: radial-gradient(circle at 30% 100%, var(--tier-diamond-glow) 0%, transparent 70%);
}

/* 等级图标 */
.member-tier-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: var(--grad-gold-soft);
  border: 1px solid var(--aj-gold-border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--aj-gold);
  margin-bottom: 16px;
}

/* 等级名称 */
.member-tier-name {
  font-family: 'Playfair Display', serif;
  font-size: 22px;
  font-weight: 500;
  color: var(--aj-text-primary);
  margin-bottom: 4px;
}

.member-tier-subtitle {
  font-size: 13px;
  color: var(--aj-text-muted);
  margin-bottom: 20px;
}

/* 经验值进度条 */
.member-tier-progress-track {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
}

.member-tier-progress-fill {
  height: 100%;
  background: var(--grad-gold);
  border-radius: 2px;
  transition: width 0.8s cubic-bezier(0.76, 0, 0.24, 1);
}

.member-tier-progress-label {
  font-size: 12px;
  color: var(--aj-text-muted);
  text-align: right;
}
```

**参数规格**：
- 玻璃拟态：`backdrop-filter: blur(24px) saturate(1.2)`
- 底色：`rgba(255, 255, 255, 0.04)`
- 边框：`1px solid rgba(255, 255, 255, 0.08)`
- 圆角：`20px`
- 内边距：`32px`
- 渐变方向：`135deg`（对角线，左上→右下）
- 进度条高度：`4px`，填充渐变 `var(--grad-gold)`
- Hover 边框色：`rgba(201, 169, 110, 0.3)`

### 2.3 我的行程入口卡片

**结构**：图标 + 标题 + 描述 + 箭头，2列网格

```css
/* ─── 行程入口网格 ─── */
.account-actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

/* ─── 入口卡片 ─── */
.account-action-card {
  position: relative;
  background: var(--aj-glass-white);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--aj-glass-border);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.76, 0, 0.24, 1);
  overflow: hidden;
}

.account-action-card:hover {
  border-color: var(--aj-gold-border);
  background: var(--grad-card-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-card);
}

/* 图标容器 */
.account-action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: var(--aj-gold-glow);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--aj-gold);
  transition: background 0.3s ease;
}

.account-action-card:hover .account-action-icon {
  background: rgba(201, 169, 110, 0.2);
}

.account-action-title {
  font-family: 'Playfair Display', serif;
  font-size: 17px;
  font-weight: 500;
  color: var(--aj-text-primary);
}

.account-action-desc {
  font-size: 13px;
  line-height: 1.6;
  color: var(--aj-text-secondary);
}

/* 右下角箭头 */
.account-action-arrow {
  position: absolute;
  bottom: 16px;
  right: 16px;
  color: var(--aj-gold-dark);
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.3s ease;
}

.account-action-card:hover .account-action-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* 状态区分 */
.account-action-card[data-status="active"] {
  border-color: var(--aj-gold-border);
}

.account-action-card[data-status="disabled"] {
  opacity: 0.45;
  cursor: not-allowed;
  pointer-events: none;
}

.account-action-card[data-status="coming-soon"] {
  opacity: 0.6;
}

.account-action-card[data-status="coming-soon"] .account-action-badge {
  display: inline-block;
  padding: 3px 10px;
  background: rgba(201, 169, 110, 0.1);
  border: 1px solid var(--aj-gold-border);
  font-size: 11px;
  color: var(--aj-gold);
  letter-spacing: 0.5px;
  border-radius: 4px;
}
```

**图标风格**：Lucide React 线性图标，`stroke-width: 1.5`，`size: 20`，金色。

### 2.4 行程历史

**结构**：左侧时间轴 + 右侧行程卡片列表

```css
/* ─── 行程历史容器 ─── */
.account-history {
  position: relative;
  padding-left: 32px;
}

/* 时间轴线 */
.account-history::before {
  content: '';
  position: absolute;
  left: 7px;
  top: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(180deg,
    var(--aj-gold) 0%,
    rgba(201, 169, 110, 0.2) 70%,
    transparent 100%);
}

/* 时间轴节点 */
.account-history-item {
  position: relative;
  padding-bottom: 28px;
}

.account-history-item:last-child {
  padding-bottom: 0;
}

/* 时间轴圆点 */
.account-history-dot {
  position: absolute;
  left: -32px;
  top: 4px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--aj-bg-deep);
  border: 2px solid var(--aj-gold);
  z-index: 1;
}

/* 当前/最新节点：实心金点 */
.account-history-item:first-child .account-history-dot {
  background: var(--aj-gold);
  box-shadow: 0 0 12px rgba(201, 169, 110, 0.3);
}

/* 行程卡片 */
.account-history-card {
  background: var(--aj-glass-white);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--aj-glass-border);
  border-radius: 14px;
  padding: 20px;
  transition: border-color 0.3s ease;
}

.account-history-card:hover {
  border-color: var(--aj-gold-border);
}

.account-history-date {
  font-size: 11px;
  letter-spacing: 1.5px;
  text-transform: uppercase;
  color: var(--aj-gold);
  margin-bottom: 8px;
}

.account-history-dest {
  font-family: 'Playfair Display', serif;
  font-size: 17px;
  font-weight: 500;
  color: var(--aj-text-primary);
  margin-bottom: 4px;
}

.account-history-meta {
  font-size: 13px;
  color: var(--aj-text-muted);
}

/* 行程状态标签 */
.account-history-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 11px;
  letter-spacing: 0.5px;
  margin-top: 10px;
}

.account-history-status[data-status="completed"] {
  background: rgba(76, 175, 125, 0.1);
  color: var(--aj-success);
  border: 1px solid rgba(76, 175, 125, 0.2);
}

.account-history-status[data-status="upcoming"] {
  background: rgba(201, 169, 110, 0.1);
  color: var(--aj-gold);
  border: 1px solid var(--aj-gold-border);
}

.account-history-status[data-status="cancelled"] {
  background: rgba(212, 86, 78, 0.1);
  color: var(--aj-error);
  border: 1px solid rgba(212, 86, 78, 0.2);
}
```

**时间轴设计**：
- 轴线：1px 宽，金色渐变（从不透明到透明）
- 节点圆点：14px，最新节点实心金色 + 光晕，其余空心金色描边
- 卡片左侧留白：32px（给时间轴让位）
- 模块间距：28px（卡片之间）

### 2.5 次元空间模块

**结构**：粒子背景 + 极光渐变 + 交互入口

```css
/* ─── 次元空间容器 ─── */
.dimension-space {
  position: relative;
  background: var(--aj-nebula-deep);
  border-radius: 20px;
  overflow: hidden;
  min-height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 星云背景渐变叠加 */
.dimension-space::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--grad-nebula);
  pointer-events: none;
}

/* 粒子画布层 */
.dimension-particles {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

/* 粒子效果 CSS 实现（纯 CSS 方案，无需 Canvas） */
.dimension-particle {
  position: absolute;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(123, 104, 238, 0.6);
  animation: particleFloat linear infinite;
}

.dimension-particle:nth-child(odd) {
  background: rgba(79, 195, 247, 0.5);
  width: 2px;
  height: 2px;
}

.dimension-particle:nth-child(3n) {
  background: rgba(232, 141, 206, 0.4);
  width: 2px;
  height: 2px;
}

@keyframes particleFloat {
  0% {
    transform: translateY(0) translateX(0) scale(1);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    transform: translateY(-280px) translateX(40px) scale(0.3);
    opacity: 0;
  }
}

/* 粒子分布（12-16个粒子，CSS 变量控制位置和延迟） */
.dimension-particle:nth-child(1)  { left: 10%; bottom: -5%; animation-duration: 6s; animation-delay: 0s; }
.dimension-particle:nth-child(2)  { left: 25%; bottom: -5%; animation-duration: 8s; animation-delay: 1.2s; }
.dimension-particle:nth-child(3)  { left: 40%; bottom: -5%; animation-duration: 7s; animation-delay: 0.5s; }
.dimension-particle:nth-child(4)  { left: 55%; bottom: -5%; animation-duration: 9s; animation-delay: 2s; }
.dimension-particle:nth-child(5)  { left: 70%; bottom: -5%; animation-duration: 6.5s; animation-delay: 0.8s; }
.dimension-particle:nth-child(6)  { left: 85%; bottom: -5%; animation-duration: 8.5s; animation-delay: 1.5s; }
.dimension-particle:nth-child(7)  { left: 15%; bottom: -5%; animation-duration: 7.5s; animation-delay: 3s; }
.dimension-particle:nth-child(8)  { left: 35%; bottom: -5%; animation-duration: 6s; animation-delay: 2.5s; }
.dimension-particle:nth-child(9)  { left: 60%; bottom: -5%; animation-duration: 9.5s; animation-delay: 0.3s; }
.dimension-particle:nth-child(10) { left: 80%; bottom: -5%; animation-duration: 7s; animation-delay: 1.8s; }
.dimension-particle:nth-child(11) { left: 45%; bottom: -5%; animation-duration: 8s; animation-delay: 3.5s; }
.dimension-particle:nth-child(12) { left: 92%; bottom: -5%; animation-duration: 6.8s; animation-delay: 0.7s; }

/* 次元空间内容 */
.dimension-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 48px 32px;
}

.dimension-title {
  font-family: 'Playfair Display', serif;
  font-size: 28px;
  font-weight: 500;
  color: var(--aj-text-primary);
  margin-bottom: 12px;
  background: var(--grad-aurora);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.dimension-desc {
  font-size: 14px;
  line-height: 1.8;
  color: var(--aj-text-secondary);
  max-width: 400px;
  margin: 0 auto 24px;
}

.dimension-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  background: transparent;
  border: 1px solid var(--aj-aurora-violet);
  color: var(--aj-aurora-violet);
  font-size: 13px;
  font-family: 'Inter', sans-serif;
  letter-spacing: 0.5px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.dimension-cta:hover {
  background: rgba(123, 104, 238, 0.1);
  box-shadow: 0 0 24px rgba(123, 104, 238, 0.15);
}
```

**粒子效果参数**：
- 粒子数量：12 个（CSS 方案），Canvas 方案可扩展至 50+
- 粒子尺寸：2-3px
- 颜色：极光紫 `rgba(123,104,238,0.6)`、极光蓝 `rgba(79,195,247,0.5)`、极光粉 `rgba(232,141,206,0.4)`
- 动画时长：6s - 9.5s（随机错开）
- 运动方向：底部向上漂浮 + 轻微水平漂移
- 透明度：0→1→1→0（10% 和 90% 处为峰值）

---

## 三、布局规范

### 3.1 PC 端布局

```css
.account-page {
  min-height: 100vh;
  background: var(--aj-bg-deep);
  color: var(--aj-text-primary);
  font-family: 'Inter', sans-serif;
  overflow-x: hidden;
}

/* 页面顶部氛围层 */
.account-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 50vh;
  background: var(--grad-page-top);
  pointer-events: none;
  z-index: 0;
}

.account-inner {
  position: relative;
  z-index: 1;
  max-width: 1080px;
  margin: 0 auto;
  padding: 120px 24px 80px;
}
```

**布局网格**：

```
┌─────────────────────────────────────────────────────────┐
│                    max-width: 1080px                     │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  页面标题区（标题 + 面包屑）                        │ │
│  │  padding-top: 120px (navbar高度 + 呼吸感)          │ │
│  │  margin-bottom: 48px                                │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │  用户信息卡片（全宽）                               │ │
│  │  margin-bottom: 32px                                │ │
│  ├───────────────────────┬─────────────────────────────┤ │
│  │  会员等级卡片          │  快捷入口网格              │ │
│  │  (左侧 40%)           │  (右侧 60%)                │ │
│  │  gap: 24px            │  2列 x 2行                  │ │
│  ├───────────────────────┴─────────────────────────────┤ │
│  │  模块间距: 48px                                     │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │  行程历史区（全宽）                                 │ │
│  │  section-title + 时间轴列表                         │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │  模块间距: 48px                                     │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │  次元空间模块（全宽）                               │ │
│  │  沉浸式卡片                                         │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │  模块间距: 48px                                     │ │
│  ├─────────────────────────────────────────────────────┤ │
│  │  设置 / 退出区（全宽）                              │ │
│  └─────────────────────────────────────────────────────┘ │
│  padding-bottom: 80px                                    │
└─────────────────────────────────────────────────────────┘
```

### 3.2 移动端自适应

```css
/* ─── 断点：850px（平板 / 大手机）─── */
@media (max-width: 850px) {
  .account-inner {
    padding: 100px 20px 60px;
  }

  /* 两栏布局变单栏 */
  .account-tier-and-actions {
    flex-direction: column;
    gap: 20px;
  }

  /* 行程入口 2列 → 2列（保持） */
  .account-actions-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  /* 模块间距缩小 */
  .account-section {
    margin-bottom: 36px;
  }

  /* 等级卡片内边距缩小 */
  .member-tier-card {
    padding: 24px;
  }
}

/* ─── 断点：500px（手机）─── */
@media (max-width: 500px) {
  .account-inner {
    padding: 88px 16px 48px;
  }

  /* 头像缩小 */
  .account-avatar-wrap {
    width: 72px;
    height: 72px;
  }
  .account-avatar {
    width: 72px;
    height: 72px;
  }
  .account-avatar-letter {
    font-size: 28px;
  }

  /* 行程入口 2列 → 1列 */
  .account-actions-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  /* 次元空间最小高度缩小 */
  .dimension-space {
    min-height: 220px;
  }

  .dimension-title {
    font-size: 22px;
  }

  .dimension-content {
    padding: 36px 20px;
  }

  /* 时间轴节点缩小 */
  .account-history {
    padding-left: 24px;
  }
  .account-history-dot {
    left: -24px;
    width: 12px;
    height: 12px;
  }

  /* 模块间距进一步缩小 */
  .account-section {
    margin-bottom: 28px;
  }
}
```

### 3.3 间距系统

```css
:root {
  /* ─── 间距 Token ─── */
  --space-xs:    8px;     /* 紧凑间距（标签与内容之间） */
  --space-sm:    12px;    /* 小间距（行内元素之间） */
  --space-md:    16px;    /* 中间距（卡片内元素之间） */
  --space-lg:    24px;    /* 大间距（卡片内边距） */
  --space-xl:    32px;    /* 加大间距（section 内部） */
  --space-2xl:   48px;    /* 超大间距（section 之间） */
  --space-3xl:   64px;    /* 页面级间距 */

  /* ─── 模块呼吸感 ─── */
  --section-gap:  48px;   /* 标准模块间距 */
  --section-gap-mobile: 28px; /* 移动端模块间距 */
}
```

---

## 四、材质与纹理

### 4.1 玻璃拟态系统

```css
/* ─── 玻璃拟态层级 ─── */

/* 一级玻璃（卡片底板） */
.glass-level-1 {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px) saturate(1.1);
  -webkit-backdrop-filter: blur(12px) saturate(1.1);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
}

/* 二级玻璃（重要卡片：等级卡、用户卡） */
.glass-level-2 {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(24px) saturate(1.2);
  -webkit-backdrop-filter: blur(24px) saturate(1.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  box-shadow: var(--shadow-inner-gold);
}

/* 三级玻璃（弹窗 / 浮层） */
.glass-level-3 {
  background: rgba(22, 22, 22, 0.85);
  backdrop-filter: blur(40px) saturate(1.3);
  -webkit-backdrop-filter: blur(40px) saturate(1.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.5);
}
```

### 4.2 渐变叠加方案

```css
/* ─── 卡片悬浮态渐变叠加 ─── */
.card-hover-overlay {
  position: relative;
  overflow: hidden;
}

.card-hover-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(201, 169, 110, 0.06) 0%,
    transparent 50%,
    rgba(123, 104, 238, 0.04) 100%
  );
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.card-hover-overlay:hover::after {
  opacity: 1;
}

/* ─── 页面顶部氛围叠加 ─── */
.page-atmosphere {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60vh;
  background:
    radial-gradient(ellipse at 20% 0%, rgba(123, 104, 238, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 0%, rgba(201, 169, 110, 0.06) 0%, transparent 50%),
    linear-gradient(180deg, rgba(26, 10, 46, 0.3) 0%, transparent 100%);
  pointer-events: none;
  z-index: 0;
}
```

### 4.3 微光 / 流光效果

```css
/* ─── 金色流光扫过效果（用于等级卡片、按钮）─── */
@keyframes shimmerGold {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}

.shimmer-gold {
  background-image: linear-gradient(
    110deg,
    transparent 25%,
    rgba(245, 217, 156, 0.15) 37%,
    transparent 63%
  );
  background-size: 200% 100%;
  animation: shimmerGold 3s ease-in-out infinite;
}

/* ─── 极光流光效果（用于次元空间标题）─── */
@keyframes shimmerAurora {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.shimmer-aurora {
  background-image: linear-gradient(
    90deg,
    #7B68EE 0%,
    #4FC3F7 25%,
    #E88DCE 50%,
    #7B68EE 75%,
    #4FC3F7 100%
  );
  background-size: 300% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: shimmerAurora 4s ease-in-out infinite;
}

/* ─── 微光边框效果（用于重要卡片 hover）─── */
@keyframes borderGlow {
  0%, 100% {
    border-color: rgba(201, 169, 110, 0.15);
  }
  50% {
    border-color: rgba(201, 169, 110, 0.35);
  }
}

.border-glow-pulse {
  animation: borderGlow 3s ease-in-out infinite;
}

/* ─── 渐变边框流动效果（用于等级卡片）─── */
.gradient-border-flow {
  position: relative;
}

.gradient-border-flow::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(
    var(--gradient-angle, 135deg),
    var(--aj-gold) 0%,
    var(--aj-aurora-violet) 50%,
    var(--aj-gold-light) 100%
  );
  background-size: 300% 300%;
  animation: gradientShift 6s ease infinite;
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}
```

---

## 五、动效规范

### 5.1 页面入场动画

```css
/* ─── 模块入场（Stagger 效果）─── */
@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.account-section {
  opacity: 0;
  animation: fadeSlideUp 0.6s cubic-bezier(0.76, 0, 0.24, 1) forwards;
}

/* Stagger 延迟（通过 CSS 变量或 nth-child 控制） */
.account-section:nth-child(1) { animation-delay: 0s; }
.account-section:nth-child(2) { animation-delay: 0.1s; }
.account-section:nth-child(3) { animation-delay: 0.2s; }
.account-section:nth-child(4) { animation-delay: 0.3s; }
.account-section:nth-child(5) { animation-delay: 0.4s; }
```

### 5.2 交互动效

```css
/* ─── 卡片 Hover 微抬起 ─── */
.card-lift {
  transition: transform 0.3s cubic-bezier(0.76, 0, 0.24, 1),
              box-shadow 0.3s ease;
}

.card-lift:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
}

/* ─── 按钮点击涟漪 ─── */
.btn-ripple {
  position: relative;
  overflow: hidden;
}

.btn-ripple::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle, rgba(201,169,110,0.3) 0%, transparent 70%);
  transform: scale(0);
  opacity: 0;
  transition: transform 0.5s ease, opacity 0.5s ease;
}

.btn-ripple:active::after {
  transform: scale(2.5);
  opacity: 1;
  transition: 0s;
}
```

### 5.3 全局缓动函数

```css
:root {
  /* 品牌标准缓动 */
  --ease-gold: cubic-bezier(0.76, 0, 0.24, 1);

  /* 弹性缓动（用于趣味交互） */
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* 平滑缓动（用于持续动画） */
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 六、字体规范

```css
:root {
  /* ─── 字体族 ─── */
  --font-display: 'Playfair Display', 'Noto Serif SC', serif;
  --font-body:    'Inter', 'Noto Sans SC', system-ui, sans-serif;

  /* ─── 字号 ─── */
  --text-display:  clamp(28px, 4vw, 40px);    /* 页面主标题 */
  --text-h1:       clamp(22px, 3vw, 32px);    /* Section 标题 */
  --text-h2:       22px;                       /* 卡片标题 */
  --text-h3:       17px;                       /* 子标题 */
  --text-body:     14px;                       /* 正文 */
  --text-caption:  13px;                       /* 说明文字 */
  --text-overline: 11px;                       /* 标签 / 时间 */

  /* ─── 行高 ─── */
  --leading-tight:  1.2;
  --leading-normal: 1.6;
  --leading-loose:  1.8;

  /* ─── 字间距 ─── */
  --tracking-tight:   -0.01em;
  --tracking-normal:  0;
  --tracking-wide:    0.5px;
  --tracking-wider:   1px;
  --tracking-overline: 2px;   /* 标签类文字 */
}
```

---

## 七、完整 CSS 变量汇总

将以下变量定义放在页面组件的 CSS 或 `globals.css` 的个人中心区块中：

```css
/* ═══════════════════════════════════════════
   ACCOUNT PAGE — 个人中心视觉系统
   ═══════════════════════════════════════════ */

.account-page {
  /* 主色 */
  --aj-bg-deep:       #0D0D0D;
  --aj-bg-card:       #111111;
  --aj-bg-elevated:   #161616;
  --aj-gold:          #C9A96E;
  --aj-gold-light:    #F5D99C;
  --aj-gold-dark:     #A88B4A;
  --aj-text-primary:  #F5F0EB;
  --aj-text-secondary: rgba(245, 240, 235, 0.6);
  --aj-text-muted:    rgba(245, 240, 235, 0.35);
  --aj-beige:         #f3ebe4;

  /* 辅色 */
  --aj-aurora-violet: #7B68EE;
  --aj-aurora-blue:   #4FC3F7;
  --aj-aurora-teal:   #26C6DA;
  --aj-aurora-pink:   #E88DCE;
  --aj-nebula-deep:   #1A0A2E;
  --aj-nebula-mid:    #2D1B4E;

  /* 功能色 */
  --aj-success:       #4CAF7D;
  --aj-warning:       #E8B44E;
  --aj-error:         #D4564E;
  --aj-info:          #5B9BD5;

  /* 透明度层 */
  --aj-glass-white:   rgba(255, 255, 255, 0.04);
  --aj-glass-border:  rgba(255, 255, 255, 0.08);
  --aj-gold-glow:     rgba(201, 169, 110, 0.15);
  --aj-gold-border:   rgba(201, 169, 110, 0.3);

  /* 等级渐变 */
  --tier-silver-from:  #B0B0B0;
  --tier-silver-to:    #D4D4D4;
  --tier-silver-glow:  rgba(176, 176, 176, 0.2);
  --tier-gold-from:    #C9A96E;
  --tier-gold-to:      #F5D99C;
  --tier-gold-glow:    rgba(201, 169, 110, 0.25);
  --tier-platinum-from: #8B9DC3;
  --tier-platinum-to:   #C5D5E8;
  --tier-platinum-glow: rgba(139, 157, 195, 0.2);
  --tier-diamond-from:  #7B68EE;
  --tier-diamond-to:    #E88DCE;
  --tier-diamond-glow:  rgba(123, 104, 238, 0.3);

  /* 渐变 */
  --grad-gold:         linear-gradient(135deg, #C9A96E 0%, #F5D99C 100%);
  --grad-gold-soft:    linear-gradient(135deg, rgba(201,169,110,0.2) 0%, rgba(245,217,156,0.05) 100%);
  --grad-gold-radial:  radial-gradient(circle at 30% 30%, rgba(201,169,110,0.15) 0%, transparent 70%);
  --grad-aurora:       linear-gradient(135deg, #7B68EE 0%, #4FC3F7 50%, #26C6DA 100%);
  --grad-aurora-soft:  linear-gradient(135deg, rgba(123,104,238,0.15) 0%, rgba(79,195,247,0.08) 50%, rgba(38,198,218,0.05) 100%);
  --grad-nebula:       radial-gradient(ellipse at 20% 80%, rgba(123,104,238,0.12) 0%, transparent 50%),
                       radial-gradient(ellipse at 80% 20%, rgba(79,195,247,0.08) 0%, transparent 50%);
  --grad-card:         linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
  --grad-card-hover:   linear-gradient(145deg, rgba(201,169,110,0.08) 0%, rgba(255,255,255,0.03) 100%);
  --grad-page-top:     linear-gradient(180deg, rgba(26,10,46,0.4) 0%, rgba(13,13,13,0) 40%);

  /* 阴影 */
  --shadow-gold-glow:   0 0 40px rgba(201, 169, 110, 0.2), 0 0 80px rgba(201, 169, 110, 0.08);
  --shadow-card:        0 8px 32px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2);
  --shadow-card-hover:  0 12px 48px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.25);
  --shadow-aurora-glow: 0 0 60px rgba(123, 104, 238, 0.15), 0 0 120px rgba(79, 195, 247, 0.08);
  --shadow-inner-gold:  inset 0 1px 0 rgba(245, 217, 156, 0.15);

  /* 间距 */
  --space-xs:    8px;
  --space-sm:    12px;
  --space-md:    16px;
  --space-lg:    24px;
  --space-xl:    32px;
  --space-2xl:   48px;
  --space-3xl:   64px;

  /* 字体 */
  --font-display: 'Playfair Display', 'Noto Serif SC', serif;
  --font-body:    'Inter', 'Noto Sans SC', system-ui, sans-serif;

  /* 缓动 */
  --ease-gold:    cubic-bezier(0.76, 0, 0.24, 1);
  --ease-bounce:  cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth:  cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 八、设计说明

### 设计理念

个人中心页面在品牌「暗黑轻奢」的基础上引入「次元融合」语言，通过极光紫、极光蓝等辅色点缀，在不破坏品牌统一性的前提下，营造出超越现实的梦幻旅行氛围。

**三个视觉锚点**：
1. **金色系统一**：所有功能性元素（按钮、边框、图标、进度条）统一使用品牌金色，确保奢旅调性。
2. **极光点缀克制**：次元辅色仅用于「次元空间」模块和等级卡片的渐变边框，不泛化到全页面。
3. **玻璃拟态层级分明**：三个层级的毛玻璃效果区分信息优先级，避免视觉扁平化。

**模块设计逻辑**：
- 用户信息区 → 温暖、亲切（金色渐变头像 + 光晕）
- 会员等级区 → 等级感、成就（渐变边框 + 等级专属配色）
- 行程入口区 → 行动导向、简洁（图标 + 标题 + 箭头）
- 行程历史区 → 叙事、时间感（时间轴 + 状态标签）
- 次元空间区 → 梦幻、沉浸（粒子 + 极光渐变 + 星云背景）
- 设置/退出区 → 低调、功能型（文字为主）
