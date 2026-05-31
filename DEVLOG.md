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

---

### 预订页面交互动画 ✅

在静态 Demo 基础上添加 Framer Motion 交互：

**新增交互**:
1. **滚动入场动画** — 每个区块进入视口时淡入上移（`useInView` + `fadeUp` variants）
2. **子元素交错出现** — 路线站点、标签、附加项卡片逐个延迟出现（`staggerChildren: 0.06`）
3. **"开始定制"平滑滚动** — 点击后 `scrollIntoView({ behavior: "smooth" })` 滚到偏好表单区
4. **价格动态计算** — toggle 附加项时总额自动更新，数字用 `animate()` 平滑过渡（`AnimatedPrice` 组件）
5. **标签微交互** — 点击时 `scale: 0.95` 压缩反馈，悬停时 `scale: 1.03` 轻微放大
6. **计数器动画** — 成人/儿童数字切换时 scale + fade 动效，按钮 `whileTap` 缩放
7. **卡片悬停效果** — 礼遇卡片上移 4px、管家卡片上移 6px + 阴影加深
8. **按钮反馈** — CTA 按钮悬停放大 + 按压缩缩，"预约通话"悬停金色底色
9. **附加项选中动画** — 勾选图标 `scale: [1, 1.2, 1]` 弹跳效果

**新增组件**: `AnimatedSection`（滚动触发包装器）、`AnimatedPrice`（数字动画）

**修改文件**: `app/sections/BookingSection.tsx`

---

### 目的地页点击跳转修复 ✅

**问题**: 目的地列表页中，部分目的地卡片点击后无法跳转到详情页，反应不灵敏。

**根因**: `DestinationsSection.tsx` 中的拖拽处理使用了 `el.setPointerCapture(e.pointerId)`，将所有指针事件劫持到滚动容器上。这导致子元素 `<Link>` 的点击事件无法正常冒泡和触发导航。

**解决方案** (待提交):
1. 移除 `el.setPointerCapture(e.pointerId)` — 不再劫持指针事件
2. 只在 `drag.current.moved` 为 true 时才修改 `scrollLeft` — 防止点击时意外移动滚动位置
3. 移除 `scrollSnapType` 的手动切换（CSS 已无 snap 属性）

**修改文件**: `app/sections/DestinationsSection.tsx`

---

### 开发服务器性能优化 ✅

**问题**: 每次进入页面或点击事件需等待 10-15 秒，开发体验极差。

**根因分析**:
1. `npm run dev` 使用 `--webpack` 标志，Next.js 16 的 webpack 模式编译极慢
2. `gsap`（6.1MB）和 `date-fns` 被安装但从未使用，仍被打包
3. `framer-motion` 未做动态导入，全量打包

**解决方案**:
1. 开发脚本改为 `next dev`（默认 Turbopack），构建保留 `--webpack`
2. `npm uninstall gsap date-fns` 移除两个未使用的依赖
3. Turbopack 首页加载从 ~1500ms 降至 ~299ms，应用代码仅 48ms

**性能对比**:

| 指标 | Webpack | Turbopack |
|---|---|---|
| 启动 | ~385ms | ~300ms |
| /booking | ~1500ms | ~299ms |
| 应用代码 | ~1385ms | ~48ms |

**修改文件**: `package.json`

---

### BookingSection 代码质量优化 ✅（/simplify）

通过 4 个并行 review agent（Reuse/Simplification/Efficiency/Altitude）审查后批量修复：

**已修复**:
1. 删除 `prefRef`、`useTransform`/`rounded`、未用 `useEffect` import（死代码）
2. `addOns` + `addOnPrices` 双重数据合并为单一数组
3. `toggleInterest`/`toggleDietary`/`toggleAddOn` 提取为 `toggleArray` 辅助 + `useCallback`
4. 成人/儿童计数器提取为 `Counter` 组件（~50行→~15行）
5. 两张管家卡片提取为 `teamMembers` 数据 + `.map()`（~70行→~15行）
6. 路线站点改为数据数组 `.map()`
7. 内联动画对象（`whileHover`/`whileTap`/`transition`）全部提升为模块级常量
8. `Array.includes()` 改为 `Set.has()` O(1) 查找
9. `total` 计算从 `addOns` 直接查找，消除重建 `addOnPrices` 对象

**已跳过**:
- CSS 模块化（需大范围重构）
- `goldEase` 跨文件提取（需改动其他 section）
- Navbar 主题系统（需架构级改动）
- `setPointerCapture` 边界情况（低频场景）

**修改文件**: `app/sections/BookingSection.tsx`（620行→~380行，减少 ~40%）

---

### 预订页面数据交互实现 ✅

**目标**: 将静态 Demo 转为真实数据驱动的预订系统，修复所有"死"交互。

**架构决策**:
- `useReducer` 管理表单状态（不引入 Zustand）
- API 路由处理价格计算（前后端共享校验逻辑）
- 价格单位：元（非分），保持简单
- localStorage 草稿持久化（800ms 节流）

**新增文件**:

| 文件 | 说明 |
|---|---|
| `app/lib/types/booking.ts` | 完整类型定义（TripConfig, ContactInfo, PriceBreakdown 等） |
| `app/lib/data/booking-config.ts` | 静态配置数据（附加项、兴趣、礼遇、管家） |
| `app/lib/pricing.ts` | 价格计算引擎 + formatPrice |
| `app/lib/validation.ts` | 表单校验（姓名、手机号、邮箱、兴趣） |
| `app/lib/hooks/useBookingForm.ts` | 核心 hook（useReducer + localStorage + 自动价格计算） |
| `app/api/booking/calculate-price/route.ts` | 价格计算 API |
| `app/api/booking/submit/route.ts` | 提交 API（幂等 + 校验 + 价格快照） |

**BookingSection.tsx 改造**:
1. 从 `useState` 迁移到 `useBookingForm` hook
2. 所有数据从 `booking-config.ts` import（不再硬编码）
3. 文本输入框全部绑定 state（特殊场合、枕头偏好、其他需求）
4. 新增联系信息表单（姓名、手机号、邮箱）
5. 提交按钮完整实现：校验→loading→API→成功确认卡片
6. 日期输入框改为可编辑的 `<input type="date">`
7. 错误提示：琥珀色温和文案，自动滚动到错误字段

**API 端点**:
- `POST /api/booking/calculate-price` → 价格计算
- `POST /api/booking/submit` → 提交预订（幂等 token + 服务端校验 + 价格快照）

**修改文件**: `app/sections/BookingSection.tsx`, `app/globals.css`

---

### 数据库 + 自选路线系统 ✅

**目标**: 用户可自选出发城市和路线，系统推荐途经点，数据从数据库读取。

**技术选型**: Prisma 6 + SQLite
- 零外部服务，单文件数据库
- 完整类型安全（Prisma Client 自动生成 TypeScript 类型）
- 未来一行改 `provider = "postgresql"` 可迁移

**数据模型**:
- `Destination` — 9 个目的地（挪威、坦桑尼亚、瑞士、冰岛、克罗地亚、摩洛哥、圣托里尼、托斯卡纳、巴黎）
- `Route` — 14 条路线（从上海/北京/广州/深圳出发，含途经推荐）
- `Booking` — 预订记录表

**种子数据**:
- 4 个出发城市：上海、北京、广州、深圳
- 14 条路线，价格 ¥118,000 ~ ¥218,000
- 含 3 条带途经点的路线（如 上海→巴黎→托斯卡纳→圣托里尼）

**API 端点**:
- `GET /api/origins` → 出发城市列表
- `GET /api/destinations` → 目的地列表
- `GET /api/routes?origin=上海` → 按出发城市查路线（含目的地和途经详情）

**前端改造**:
- `TripConfig` 类型扩展（增加 origin/destinationId/transitId/routeId）
- `useBookingForm` hook：自动获取出发城市和路线，选择后联动价格
- 行程概览区块：3 个下拉选择器（出发城市→路线→途经自动显示）
- 价格从选中路线实时计算（不再硬编码）

**新增文件**:
- `prisma/schema.prisma` — 数据模型定义
- `prisma/seed.ts` — 种子数据（9 目的地 + 14 路线）
- `app/lib/prisma.ts` — Prisma 单例客户端
- `app/api/destinations/route.ts`
- `app/api/origins/route.ts`
- `app/api/routes/route.ts`

**修改文件**: `app/lib/types/booking.ts`, `app/lib/hooks/useBookingForm.ts`, `app/sections/BookingSection.tsx`, `app/globals.css`, `package.json`, `.gitignore`

---

### 真实全球航线数据导入 ✅

**数据来源**: [OpenFlights](https://github.com/jpatokal/openflights) (ODbL License)
- `airports.dat` — 7,698 个全球机场（含 IATA 代码、坐标）
- `routes.dat` — 67,663 条航线数据

**导入结果**:
- 7 个中国出发城市：上海(PVG)、北京(PEK)、厦门(XMN)、广州(CAN)、成都(CTU)、杭州(HGH)、深圳(SZX)
- 33 个全球奢华目的地（含中文描述、最佳旅行时间、签证信息）
- 123 条航线（直飞 + 中转），价格基于实际飞行距离计算
- 12 条中转路线（经巴黎/伦敦/迪拜/悉尼/维也纳/伊斯坦布尔等枢纽）

**目的地覆盖**:
- 欧洲：巴黎、伦敦、罗马、巴塞罗那、圣托里尼、阿姆斯特丹、苏黎世、维也纳、布拉格、奥斯陆、杜布罗夫尼克、尼斯、佛罗伦萨、雷克雅未克
- 亚洲：东京、京都、首尔、曼谷、新加坡、河内、巴厘岛、马尔代夫、伊斯坦布尔
- 美洲：纽约、坎昆
- 大洋洲：悉尼、皇后镇
- 非洲：开普敦、马拉喀什
- 中东：迪拜

**数据处理**:
- Haversine 公式计算飞行距离，按 850 km/h 估算飞行时间
- 价格按距离系数浮动（<2000km ×0.8, 2000-5000km ×1.0, 5000-10000km ×1.2, >10000km ×1.5）
- 城市名中英映射（手动维护 30+ 个常用城市）
- OpenFlights 城市名别名处理（如 Bali→Denpasar, Maldives→Male, Kyoto→Osaka）

**新增文件**: `prisma/seed-import.ts`（数据导入脚本）, `data/raw/airports.dat`, `data/raw/routes.dat`

### SSR Hydration Mismatch 修复 ✅

**问题**: 页面出现 `Hydration failed because the server rendered HTML didn't match the client` 错误。

**根因分析**:

1. **HIGH** `app/lib/hooks/useBookingForm.ts` L125-128 — `useReducer` 初始化函数中调用 `loadDraft()` 读取 localStorage，导致服务端渲染用 `INITIAL` 状态，客户端渲染用草稿状态，HTML 不匹配。
2. **MEDIUM** `app/lib/pricing.ts` L32 — `toLocaleString()` 未指定 locale，服务端/客户端可能使用不同默认区域格式（如 `1,000,000` vs `1.000.000`）。

**修复**:

1. 将 localStorage 草稿读取从 `useReducer` 初始化函数移至 `useEffect`，确保 SSR 和客户端首次渲染都用 `INITIAL` 状态：
```typescript
const [state, dispatch] = useReducer(reducer, INITIAL);
useEffect(() => {
  const draft = loadDraft();
  if (draft) { /* dispatch 恢复草稿 */ }
}, []);
```

2. `toLocaleString()` → `toLocaleString('zh-CN')`，显式指定中文区域格式。

**修改文件**: `app/lib/hooks/useBookingForm.ts`, `app/lib/pricing.ts`

### 国内奢华旅行专属页面 ✅

**需求**: 新增国内奢华旅行页面，与国际页面分离，服务更贴合国内奢侈旅行场景。

**实现**:

1. **Prisma schema 扩展**
   - `Destination` 新增: `scope`(`"domestic"`|`"international"`)、`region`、`transport`(JSON)、`bestSeason`
   - `Route` 新增: `scope`、`transportType`(`"flight"`|`"highspeed-rail"`|`"helicopter"`|`"cruise"`)
   - 所有新字段均有默认值，向后兼容现有数据

2. **国内种子数据** (`prisma/seed-domestic.ts`)
   - 15个国内奢华目的地（丽江、大理、香格里拉、杭州、莫干山、三亚、西安、敦煌、腾冲、长白山、稻城亚丁、拉萨、桂林、成都、厦门）
   - 64条国内路线（高铁商务座 + 国内航班头等舱 + 专车）
   - 7个出发城市（上海、北京、广州、深圳、成都、杭州、厦门）
   - 6大主题区域（西南/华东/华南/西北/东北）

3. **国内专属配置** (`app/lib/data/booking-config-domestic.ts`)
   - 附加项: 高铁商务座升级(¥3,800)、非遗传承人私享(¥6,800)、顶级温泉私汤(¥5,200)
   - 兴趣标签: 茶道禅修、雪山徒步、温泉养生、古镇文化等
   - 饮食偏好: 川味火锅、粤式早茶、清真等中国特色选项
   - 尊享礼遇: 私人管家、高铁站/机场专车、顶级中餐厅私宴、非遗体验、直升机/游艇可选

4. **页面结构**
   - `/booking-domestic` — 国内奢华旅行专属页面
   - `BookingSectionDomestic` — 独立组件，文案/服务完全国内化
   - 国际页添加 🏮 引导入口："更想探索祖国的大好河山？"
   - 国内页添加 🌍 引导入口："心向远方？探索国际航线"

5. **API 扩展**
   - `/api/origins?scope=domestic` — 获取国内出发城市
   - `/api/routes?origin=xxx&scope=domestic` — 获取国内路线
   - `useBookingForm` hook 支持 `scope` 和 `addOnPrices` 参数

6. **Navbar 更新**
   - 导航拆分为"国内奢旅"和"国际预订"
   - 两个页面均显示金色文字

**新增文件**:
- `prisma/seed-domestic.ts`
- `app/lib/data/booking-config-domestic.ts`
- `app/booking-domestic/page.tsx`
- `app/sections/BookingSectionDomestic.tsx`

**修改文件**: `prisma/schema.prisma`, `app/api/origins/route.ts`, `app/api/routes/route.ts`, `app/lib/hooks/useBookingForm.ts`, `app/sections/BookingSection.tsx`, `app/components/Navbar.tsx`, `app/globals.css`, `CLAUDE.md`

### 国内页面运行时错误修复 ✅

**问题**: 国际和国内预订页面均报错无法正常使用。

**错误清单**:
1. `origins.map is not a function` — API 返回 `{error: '数据库查询失败'}` 对象而非数组
2. `addOnPrices is not defined` — hook 参数声明为可选但未处理 undefined
3. `useEffect` 依赖数组大小变化 — `Previous: [] Incoming: [aurum_booking_draft]`

**根因**: Prisma Client 缓存未更新（schema 新增字段后未重启 dev server），导致 API 查询失败。

**修复**:
- `useBookingForm` 的 `addOnPrices` 参数改为空对象默认值 `{}`
- 所有 `useEffect` 移除会随渲染变化的依赖项（`STORAGE_KEY`、`scope`），用 `eslint-disable` 注释
- API fetch 返回值增加 `Array.isArray()` 校验，防止非数组数据污染状态
- 重启 dev server 清除旧的 Prisma Client 缓存

**修改文件**: `app/lib/hooks/useBookingForm.ts`

### 预约通话按钮功能修复 ✅

**问题**: 管家团队区域的"预约通话"按钮点击无反应。

**修复**: 为国际和国内 BookingSection 的"预约通话"按钮添加 onClick 事件，点击后显示管家联系提示。

**修改文件**: `app/sections/BookingSection.tsx`, `app/sections/BookingSectionDomestic.tsx`

### 引导按钮点击失效修复 ✅

**问题**: "探索国内奢旅"和"探索国际航线"按钮点击无反应。

**根因**: CSS `.booking-domestic-hint::before` 伪元素（呼吸灯光效）覆盖了按钮，拦截了 pointer events。

**修复**:
- `::before` 添加 `pointer-events: none`
- 子元素设置 `position: relative; z-index: 1` 确保在伪元素之上

**修改文件**: `app/globals.css`

### 省份城市选择器 + AI 动态定价 ✅

**需求**:
1. 出发城市改为省份→城市两级联动选择器
2. 价格改为调用 AI 模型动态计算

**实现**:

1. **省份数据** (`app/lib/data/provinces.ts`)
   - 全国 34 个省级行政区及下辖城市
   - 提供 `getCitiesByProvince()`、`getProvinceByCity()` 等工具函数

2. **AI 定价 API** (`app/api/ai-price/route.ts`)
   - POST 接口，接收 `{origin, destination, scope, days, adults, children, transportType}`
   - 调用 mimo-v2.5 模型 (`https://api.xiaomimimo.com/anthropic`)
   - 返回 `{perPersonPrice, basePrice, reason}`
   - AI 失败时降级使用数据库价格

3. **useBookingForm hook 更新**
   - 移除 origins API fetch，改用本地省份数据
   - 新增 `provinces`、`cities`、`selectedProvince`、`setProvince` 状态
   - 价格计算改为调用 `/api/ai-price` API
   - 附加项变化时直接更新总价，不重新调用 AI

4. **BookingSection 组件更新**
   - 出发城市选择改为：省份下拉 → 城市下拉（两级联动）
   - 价格区域增加 "AI 计算中..." 加载动画
   - 提示信息根据选择状态动态变化

**新增文件**:
- `app/lib/data/provinces.ts`
- `app/api/ai-price/route.ts`

**修改文件**: `app/lib/hooks/useBookingForm.ts`, `app/sections/BookingSection.tsx`, `app/sections/BookingSectionDomestic.tsx`

### AI 定价 API 修复 ✅

**问题**: 选择目的地后价格未计算，AI API 返回空响应。

**根因**:
1. API 端点格式错误（应为 `/v1/chat/completions`，非 `/anthropic`）
2. `max_tokens=256` 太小，模型在 reasoning 阶段就用完了 token
3. 中文城市名在 HTTP 传输中编码异常

**修复**:
- 改用 OpenAI 兼容格式 `/v1/chat/completions`
- `max_tokens` 增加到 2048
- 城市名自动翻译为英文后再发送给 AI
- 添加 system message 引导模型返回 JSON
- 增加 JSON 解析容错（支持代码块格式）

**修改文件**: `app/api/ai-price/route.ts`, `app/lib/hooks/useBookingForm.ts`

### AI 智能推荐系统 ✅

**需求**: 选择目的地后，交通方式、推荐天数、酒店、兴趣标签、饮食偏好都由 AI 动态生成。

**实现**:

1. **行程详情 API** (`app/api/ai-trip-details/route.ts`)
   - 返回交通方式（航班/高铁）、推荐天数、3个奢华酒店推荐
   - 根据距离自动推荐：国内 <800km 推荐高铁，否则航班

2. **偏好推荐 API** (`app/api/ai-preferences/route.ts`)
   - 返回 5-10 个兴趣标签（带 emoji）
   - 返回 5-8 个饮食偏好选项
   - 根据目的地特色生成（如日本→寿司/怀石，四川→火锅/川菜）

3. **useBookingForm hook 更新**
   - 新增 `tripDetails`、`aiInterests`、`aiDietary` 状态
   - 新增 `detailsLoading`、`prefsLoading` 加载状态
   - 目的地变化时并行调用三个 AI API（行程/偏好/价格）
   - 人数变化时只重新计算价格

4. **BookingSection 组件更新**
   - 标签区显示 AI 推荐的交通方式和天数
   - 兴趣标签使用 AI 生成的选项（加载时显示骨架屏）
   - 饮食偏好使用 AI 生成的选项（加载时显示骨架屏）
   - AI 失败时降级到静态数据

**新增文件**:
- `app/api/ai-trip-details/route.ts`
- `app/api/ai-preferences/route.ts`

**修改文件**: `app/lib/hooks/useBookingForm.ts`, `app/sections/BookingSection.tsx`, `app/sections/BookingSectionDomestic.tsx`

### 修复：所有城市均可选择目的地 ✅

**问题**: 只有数据库中有预设路线的城市（北上广深等）才能选择目的地，其他城市无法选择。

**修复**:
- 目的地列表改为从 `/api/destinations` 获取所有目的地，不再按出发城市过滤
- 任何城市出发都能看到全部目的地选项
- 价格由 AI 根据出发城市 + 目的地动态计算

**修改文件**: `app/lib/hooks/useBookingForm.ts`, `app/sections/BookingSection.tsx`, `app/sections/BookingSectionDomestic.tsx`

### AI 定价 API 修复 ✅

**问题**: 选择目的地后价格未计算，AI API 返回空响应。

**根因**:
1. API 端点格式错误（应为 `/v1/chat/completions`，非 `/anthropic`）
2. `max_tokens=256` 太小，模型在 reasoning 阶段就用完了 token
3. 中文城市名在 HTTP 传输中编码异常

**修复**:
- 改用 OpenAI 兼容格式 `/v1/chat/completions`
- `max_tokens` 增加到 2048
- 城市名自动翻译为英文后再发送给 AI
- 添加 system message 引导模型返回 JSON
- 增加 JSON 解析容错（支持代码块格式）

**修改文件**: `app/api/ai-price/route.ts`, `app/lib/hooks/useBookingForm.ts`

### AI 智能推荐系统 ✅

**需求**: 选择目的地后，交通方式、推荐天数、酒店、兴趣标签、饮食偏好都由 AI 动态生成。

**实现**:

1. **行程详情 API** (`app/api/ai-trip-details/route.ts`)
   - 返回交通方式（航班/高铁）、推荐天数、3个奢华酒店推荐
   - 根据距离自动推荐：国内 <800km 推荐高铁，否则航班

2. **偏好推荐 API** (`app/api/ai-preferences/route.ts`)
   - 返回 5-10 个兴趣标签（带 emoji）
   - 返回 5-8 个饮食偏好选项
   - 根据目的地特色生成（如日本→寿司/怀石，四川→火锅/川菜）

3. **useBookingForm hook 更新**
   - 新增 `tripDetails`、`aiInterests`、`aiDietary` 状态
   - 新增 `detailsLoading`、`prefsLoading` 加载状态
   - 目的地变化时并行调用三个 AI API（行程/偏好/价格）
   - 人数变化时只重新计算价格

4. **BookingSection 组件更新**
   - 标签区显示 AI 推荐的交通方式和天数
   - 兴趣标签使用 AI 生成的选项（加载时显示骨架屏）
   - 饮食偏好使用 AI 生成的选项（加载时显示骨架屏）
   - AI 失败时降级到静态数据

**新增文件**:
- `app/api/ai-trip-details/route.ts`
- `app/api/ai-preferences/route.ts`

**修改文件**: `app/lib/hooks/useBookingForm.ts`, `app/sections/BookingSection.tsx`, `app/sections/BookingSectionDomestic.tsx`

### AI 推荐系统修复 ✅

**问题**:
1. 国际页面出现国内城市（目的地未按 scope 过滤）
2. AI 返回英文内容
3. 交通/天数/酒店显示固定值（未正确使用 AI 返回数据）
4. 未选择就触发 AI 计算（localStorage 恢复草稿时误触发）

**修复**:
1. `/api/destinations` 增加 `scope` 参数过滤
2. 三个 AI API 的 prompt 改为中文，要求返回中文结果
3. 添加 `userSelectedRef` 标记，只在用户主动选择目的地后触发 AI
4. reset 时清除 `userSelectedRef`

**修改文件**: `app/api/destinations/route.ts`, `app/api/ai-price/route.ts`, `app/api/ai-trip-details/route.ts`, `app/api/ai-preferences/route.ts`, `app/lib/hooks/useBookingForm.ts`

### 国内目的地扩充 + AI 推荐调试 ✅

**问题**:
1. 国内目的地只有 15 个，太少
2. AI 推荐始终显示固定值（五天四晚、航班、五星级酒店）

**修复**:
1. 新增 15 个国内目的地（武汉、长沙、青岛、大连、南京、苏州、重庆、昆明、贵阳、兰州、西宁、海口、南宁、哈尔滨等），总计 30 个
2. 添加调试日志定位 AI 调用问题

**修改文件**: `prisma/seed-domestic.ts`, `app/lib/hooks/useBookingForm.ts`

### AI 推荐改为按钮触发模式 ✅

**问题**: 用户快速切换表单会触发多次 AI 调用，浪费资源且 UI 闪烁。

**修复**:
- 移除自动触发的 useEffect
- 添加"✨ 确认信息，获取 AI 推荐"按钮
- 用户选择出发城市和目的地后，点击按钮统一触发三个 AI API
- 使用 Promise.all 并行调用，提高效率
- 添加 aiLoading 状态，按钮显示"AI 分析中..."

**优势**:
- 用户可多次修改选择后再确认，避免无效调用
- 数据验证：确保出发城市和目的地都已选择
- 更好的用户体验：明确的触发时机

**修改文件**: `app/lib/hooks/useBookingForm.ts`, `app/sections/BookingSection.tsx`, `app/sections/BookingSectionDomestic.tsx`

### 用户登录/注册系统 ✅

**需求**: 用户认证系统，支持登录/注册、会员认证、私密页面保护。

**实现**:

1. **数据库** - Prisma 新增 User 模型
   - email (unique), password (bcrypt hashed), name, phone, avatar
   - Booking 模型关联 userId（可选）

2. **认证 API**
   - `/api/auth/register` - 注册（邮箱、密码、姓名）
   - `/api/auth/login` - 登录（邮箱、密码）
   - `/api/auth/me` - 获取当前用户
   - `/api/auth/logout` - 退出登录
   - JWT token 存 httpOnly cookie，有效期 7 天

3. **AuthContext** (`app/lib/contexts/AuthContext.tsx`)
   - 全局认证状态管理
   - localStorage 缓存用户信息
   - 提供 login, register, logout, checkAuth 方法

4. **登录/注册页面** (`app/login/page.tsx`)
   - 奢华风格设计（深色背景、金色点缀）
   - 浮动标签输入框
   - 密码强度指示器（弱/中/强）
   - 登录成功动画（金色勾 + 跳转）
   - 实时表单验证

5. **UserMenu 组件** (`app/components/UserMenu.tsx`)
   - 右上角用户图标（汉堡菜单左侧）
   - 未登录：点击跳转登录页
   - 已登录：下拉菜单（头像、姓名、退出）

6. **登录拦截**
   - 点击"提交定制申请" → 未登录跳转 `/login?redirect=/booking`
   - 登录成功后跳转回原页面

**新增文件**:
- `app/lib/contexts/AuthContext.tsx`
- `app/components/UserMenu.tsx`
- `app/components/ClientProviders.tsx`
- `app/login/page.tsx`
- `app/api/auth/register/route.ts`
- `app/api/auth/login/route.ts`
- `app/api/auth/me/route.ts`
- `app/api/auth/logout/route.ts`

**修改文件**: `prisma/schema.prisma`, `app/layout.tsx`, `app/sections/BookingSection.tsx`, `app/sections/BookingSectionDomestic.tsx`

**依赖**: `bcryptjs`, `jsonwebtoken`, `@types/bcryptjs`, `@types/jsonwebtoken`

---

### 登录页面视觉修复 ✅

**问题**:
1. 浮动标签（placeholder）位置偏移，未与输入框正确对齐
2. 输入框获得焦点时，浏览器默认文字选择高亮（蓝色）与浅色文字重叠，视觉效果差
3. 页面非输入元素（标题、标签、按钮等）可被鼠标选中，影响奢华感

**根因分析**:
1. 浮动标签使用 `position: absolute; left: 42; top: '50%'` 但缺少正确的垂直居中计算，且上浮动画 `y: -24` 导致位置偏移过大
2. 浏览器默认 `::selection` 高亮颜色为蓝色，与金色/浅色主题冲突
3. 未对页面元素设置 `user-select: none`

**解决方案**:

1. **浮动标签位置重构**
   - 改用 `paddingTop` 动态调整容器空间，label 从 `top: 0` 上浮到 `y: -6`
   - 设置 `transformOrigin: 'left center'` 确保缩放原点正确
   - 添加 `whiteSpace: 'nowrap'` 防止标签换行
   - 使用 `ease: 'easeOut'` 优化动画曲线

2. **自定义文字选择高亮**
   - 使用 `::selection` 伪元素设置金色半透明高亮 `rgba(201, 169, 110, 0.35)`
   - 同时覆盖 `::-moz-selection` 兼容 Firefox

3. **禁止非输入元素选中**
   - `.auth-page` 添加 `user-select: none`
   - `input` 和 `textarea` 单独设置 `user-select: text` 允许选中
   - 按钮单独设置 `user-select: none`

4. **输入框优化**
   - 设置 `caret-color: #C9A96E` 金色光标
   - 添加 `:-webkit-autofill` 样式覆盖，防止自动填充破坏主题

**修改文件**:
- `app/login/page.tsx` — 浮动标签组件重构
- `app/globals.css` — 添加 `.auth-page` 专属样式（~50行）

**效果**:
- 浮动标签与输入框正确对齐，上浮动画平滑
- 文字选择高亮变为金色半透明，与主题一致
- 非输入元素不可选中，提升奢华感

---

### 登录页面交互动画升级 ✅

**目标**: 将单调的浮动标签动画升级为"炫技级"交互体验。

**新增动画效果**:

| 元素 | 动画效果 | 技术实现 |
|------|----------|----------|
| **浮动标签** | 上浮时弹性缓动 + 金色渐变扫光 | `[0.34, 1.56, 0.64, 1]` 弹性曲线 + `background-clip: text` + shimmer 关键帧 |
| **底部光带** | 从中间向两边展开的金色光带 | `scaleX: 0→1` + `transformOrigin: center` + 双层 box-shadow |
| **图标** | 焦点时轻微弹跳 + 左右摇晃 | `scale: [1, 1.15, 1]` + `rotate: [0, -8, 8, 0]` |
| **边框** | 渐变流动边框（替代纯色） | 伪元素渐变背景 + `gradientShift` 关键帧 |
| **输入区** | 焦点时玻璃拟态背景变深 | `background: rgba(20,20,20,0.95)` + `backdrop-filter: blur(10px)` |
| **错误提示** | 模糊淡入 + 上移 | `filter: blur(4px→0)` + `y: -8→0` |

**CSS 关键帧**:
```css
@keyframes shimmer {
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}
```

**设计原则**:
- 弹性缓动曲线让动画更有"生命力"
- 渐变扫光增加奢华质感
- 底部光带提供明确的焦点指示
- 图标动画增加趣味性和响应感
- 所有动画时长控制在 0.3-0.5s，避免拖沓

**修改文件**:
- `app/login/page.tsx` — FloatingInput 组件动画升级
- `app/globals.css` — 添加 shimmer/gradientShift 关键帧

---

### 登录页面奢华背景升级 ✅

**目标**: 提升登录页面背景的"贵气"感，打造高端奢华视觉体验。

**新增背景元素**:

| 元素 | 效果 | 技术实现 |
|------|------|----------|
| **动态流动渐变** | 深色渐变缓慢流动变化 | `motion.div` + `animate` 循环 3 组渐变，20s 周期 |
| **金色光斑** | 柔和漂浮的金色光晕 | 3 个 `radial-gradient` + `blur(50-60px)` + 独立运动轨迹 |
| **金色粒子系统** | 20 个缓慢上升的金色微粒 | 固定种子值数组 + `y/opacity/scale` 动画，8-20s 周期 |
| **装饰几何线条** | 四角金色 L 形装饰线 | 4 个 `border` 组合，15% 透明度 |
| **噪点纹理** | 细腻的噪点叠加增加质感 | SVG `feTurbulence` + `mix-blend-mode: overlay`，3% 透明度 |

**表单卡片增强**:
- 外层呼吸光晕：`boxShadow` 4s 周期脉动
- 内层顶部装饰线：金色渐变从中间向两边淡出
- 背景更深：`rgba(15,15,15,0.9)` + `blur(30px)`

**修复**:
- 粒子系统 `Math.random()` 导致 SSR 水合错误 → 改用固定种子值数组

**设计原则**:
- 所有动画都是"安静"的——缓慢、柔和、不抢夺注意力
- 金色元素透明度控制在 5-15%，避免喧宾夺主
- 粒子系统增加"呼吸感"和"生命力"
- 噪点纹理增加"真实感"，避免纯数字的廉价感

**修改文件**:
- `app/login/page.tsx` — 背景系统重构 + 粒子系统 + 卡片增强

---

### 登录页面背景效果增强 ✅

**问题**: 用户反馈背景效果不够强烈，不明显。

**增强内容**:

| 元素 | 之前 | 之后 |
|------|------|------|
| **金色光斑透明度** | 6-10% | 15-20% |
| **金色光斑尺寸** | 300-400px | 400-500px |
| **光斑数量** | 3 个 | 4 个（新增层次感） |
| **粒子尺寸** | 2-5px | 4-7px |
| **粒子透明度** | 0.5-0.8 | 0.8-1.0 |
| **粒子飞行距离** | 110-220px | 190-360px |
| **粒子动画时长** | 8-20s | 7.5-16s（更快） |
| **角装饰线宽度** | 1px | 2px |
| **角装饰线透明度** | 15% | 30% |
| **角装饰线尺寸** | 60x60px | 80x80px |
| **角装饰线阴影** | 无 | 添加 15px 发光 |
| **噪点纹理透明度** | 3% | 6% |

**修改文件**:
- `app/login/page.tsx` — 所有背景元素参数增强
