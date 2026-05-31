# Person Journey 开发日志

## 2026-05-30

### 目的地页轮播优化 ✅

**问题**: 右上角箭头按钮循环浏览时出现停顿/卡顿，自动滑动也失效。

**根因分析**:
1. `snap-x snap-mandatory` CSS 属性与无限循环 `onScroll` 回绕冲突——snap 强制吸附覆盖程序化滚动
2. 自动滚动 RAF 每帧覆写 `scrollLeft`，压死了箭头 `scrollBy({ behavior: "smooth" })` 的异步动画
3. `scrollPage` 中 `groupWRef.current` 初始值为 0，守卫 `if (groupW <= 0) return` 导致箭头点击被拦截

**解决方案** (commit `4ec0b78`):
1. 移除 `snap-x snap-mandatory` 及配套 `snap-start` 类
2. 箭头翻页改用**预回绕**策略：`scrollBy` 前检查终点是否越界，若是则先把 `scrollLeft` 瞬移到等价位置，保证 smooth scroll 全程不碰边界 → 不触发 onScroll 回绕 → 零冲突
3. 添加 `arrowAnimating` 标志位：箭头动画期间暂停自动滚动 RAF，800ms 后恢复
4. `groupWRef` 兜底读取：ref 未初始化时从 DOM `scrollWidth / 3` 实时计算
5. 添加自动滚动功能：RAF 驱动 0.6px/帧（~36px/s），悬停/拖拽/箭头动画时暂停

**修改文件**: `app/sections/DestinationsSection.tsx`, `.gitignore`

---

### 图片缺失修复 ✅

**问题**: 目的地列表只有挪威卡片能显示（CloudFront 视频），其余 6 个引用本地 `/img*.jpg` 但 `public/` 目录为空。

**解决方案**: 
- 10 张图片全部替换为 picsum.photos 在线图
- `next.config.ts` 添加 `picsum.photos` 到 `images.remotePatterns`
- 7 个目的地各分配一个现有 CloudFront 视频用于卡片背景

**修改文件**: `app/lib/tours.ts`, `next.config.ts`

---

### 中文内容替换 ✅

将所有页面文字翻译为中文：`layout.tsx` metadata、`HeroSection.tsx` 标题和描述、`Navbar.tsx` 导航链接、`DestinationsSection.tsx` 搜索和标签、`TourDetailSection.tsx` 信息字段、`tours.ts` 7 个目的地名称/描述/月/签证、`not-found.tsx` 404 信息。

**修改文件**: 全站 7 个文件

---

### 预订页面开发 ❌ (未完成，已回退)

**目标**: 基于墨刀原型模板 `C:\Users\Lenovo\Desktop\奢华旅行预定界面` 还原预订页。

**失败原因**:
1. 第一版：自创了暖米色背景双栏布局，与模板的深色奢华风格完全不匹配
2. 第二版：改了深色背景但排版比例失调——字体层级碎片化（8种不同大小）、网格比例失衡（`1fr_320px` 在宽屏下 4.75:1）、空 section 浪费空间、"01"水印不可见（3%透明度）
3. 第三版：只调了字体和间距数字，视觉效果无明显改善，用户感知不到变化

**教训**:
- 严格按模板逐段量尺寸后一比一照搬，不自行"设计"
- 先看清模板的实际设计语言（深色背景 `#0D0D0D`、Playfair Display 衬线标题、`#C9A96E` 暖金点缀、`#F5F0EB` 浅色文字）
- 只换文字内容，不改任何设计决策

**待完成**: `app/booking/page.tsx`, `app/sections/BookingSection.tsx`, `app/lib/booking.ts`

---

### 已生成的设计文档

- `C:\Users\Lenovo\Desktop\预订页面提示词.txt` — 4步预订流程完整提示词（可喂给模型）
- `C:\Users\Lenovo\Desktop\Person_Journey\DESIGN.md` — Stitch 设计系统规格
- `C:\Users\Lenovo\Desktop\Person_Journey\STITCH-PROMPTS.md` — 5 个 Stitch 屏幕生成提示词

---

## 2026-05-31

### 预订页面静态 Demo ✅

**目标**: 基于墨刀原型（`C:\Users\Lenovo\Desktop\奢华旅行预定界面`）一比一还原预订页面静态布局。

**实现方式**:
- 用 Playwright 打开本地原型 HTML，通过 snapshot 提取完整内容结构（所有文字、层级、标签）
- 用 mimo-ask（MIMO Vision）分析原型截图，获取颜色方案、布局节奏、视觉细节
- 严格按原型内容逐区块搬移，不自行设计

**页面结构** (从上到下):
1. **Hero** — 沉浸式背景图 + "Bespoke Luxury Travel" / "定制您的非凡旅程" + CTA
2. **01 行程概览** — 路线（巴黎→托斯卡纳→圣托里尼）+ 标签 + 基础参数（日期/人数）
3. **您的专属偏好** — 8个体验兴趣标签 + 8个饮食偏好标签 + 特殊场合/枕头/需求输入
4. **费用概览** — 基础费用 ¥128,000 + 3个可选附加项 + 估算总额
5. **您的尊享礼遇** — 6张礼遇卡片（管家/VIP/司导/餐厅/改签/礼宾）
6. **您的旅行管家团队** — 2张管家卡片（Claire Lin / Marco Rossi）
7. **CTA** — "提交定制申请" + 信任标识
8. **Footer** — AURUM VOYAGES 品牌信息

**设计系统**:
- 背景: `#0D0D0D` / `#111111` 交替
- 金色: `#C9A96E`
- 浅色文字: `#F5F0EB`
- 字体: Playfair Display（标题）+ Inter（正文）
- 响应式断点: 850px / 500px

**新增文件**:
- `app/booking/page.tsx` — 路由页面
- `app/sections/BookingSection.tsx` — 完整组件（含交互状态管理）

**修改文件**:
- `app/layout.tsx` — 添加 Playfair Display 字体
- `app/globals.css` — 追加 booking 深色主题样式（~400行）
- `app/components/Navbar.tsx` — 预订页桌面导航文字改为金色

**交互状态** (已预埋 useState，暂无动画):
- 兴趣标签 toggle
- 饮食偏好 toggle
- 附加费用 toggle
- 成人/儿童计数器

**下一步**: 添加 Framer Motion 入场动画、滚动触发、卡片交互反馈

---

### 重要经验：mimo-ask 使用规范

**问题**: 涉及识图/看图操作时，直接调用会导致崩溃。

**规则**: 凡是需要识别图片、分析截图、读取图片内容的操作，必须使用 `mimo-ask` skill（`~/.claude/skills/mimo-ask/mimo_vision.py`），通过 MIMO Vision API 进行。
