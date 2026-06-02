# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Development server (Turbopack) at http://localhost:3000
npm run build     # Production build (webpack)
npm run start     # Start production server
npm run lint      # ESLint (eslint-config-next)
```

No test framework is configured.

## Architecture

This is a **Next.js 16 App Router** project — a Chinese-language luxury travel website ("旅行 -- 发现世界之美").

### Business Model
- **Mode**: Self-operated + Light Luxury (自营 + 轻奢)
- **Target**: 30,000 - 80,000 CNY per trip
- **Strategy**: Standardized luxury products with limited customization
- **Payment**: WeChat Pay + Alipay (pending business license)
- **AI**: Multi-model backup (MIMO primary + OpenAI fallback)
- **Deployment**: AWS (international) + Alibaba Cloud (China)

### Tech Stack
- **Next.js 16.2.6** with React 19, TypeScript, **Tailwind CSS v4** (CSS-first config, no tailwind.config file)
- **Prisma 6 + SQLite** — local database (`prisma/dev.db`), schema in `prisma/schema.prisma`, seed in `prisma/seed.ts`
- **Framer Motion** for page transitions and micro-interactions
- **GSAP** and **date-fns** were removed (unused dependencies)
- **Lucide React** for icons
- Scripts: `dev` uses **Turbopack** (fast), `build` uses `--webpack` (stable production)

### Routing (`app/`)

| Route | File | Notes |
|---|---|---|
| `/` | `app/page.tsx` | Home — renders `HeroSection` |
| `/destinations` | `app/destinations/page.tsx` | Listing — renders `DestinationsSection` |
| `/destinations/[id]` | `app/destinations/[id]/page.tsx` | Dynamic tour detail (async params) |
| `/booking` | `app/booking/page.tsx` | International booking form |
| `/booking-domestic` | `app/booking-domestic/page.tsx` | Domestic luxury travel booking |
| `/api/origins` | `app/api/origins/route.ts` | GET origin cities (accepts `?scope=domestic\|international`) |
| `/api/destinations` | `app/api/destinations/route.ts` | GET all destinations |
| `/api/routes` | `app/api/routes/route.ts` | GET routes by origin (accepts `?scope=domestic\|international`) |
| `/api/booking/calculate-price` | `app/api/booking/calculate-price/route.ts` | POST price calculation |
| `/api/booking/submit` | `app/api/booking/submit/route.ts` | POST booking submission |
| `[...catchAll]` | `app/[...catchAll]/page.tsx` | Forces `notFound()` for undefined routes |

Navbar links to `/faq` and `/account` also exist but have no pages — they route to the custom 404 (`app/not-found.tsx`).

### Data Layer

Tour data is static in `app/lib/tours.ts` — exports a `tours` array and `getTourById()`.

**Database** (Prisma 6 + SQLite):
- `prisma/schema.prisma` — Destination, Route, Booking models (Destination/Route have `scope` field: `"domestic"` | `"international"`)
- `prisma/seed.ts` — 30 international destinations, 123 routes, 7 origin cities
- `prisma/seed-domestic.ts` — 15 domestic destinations, 64 routes (高铁/航班/专车)
- `app/lib/prisma.ts` — singleton Prisma client

**Booking system** has its own data layer:
- `app/lib/types/booking.ts` — TypeScript types for the booking form, pricing, and API
- `app/lib/data/booking-config.ts` — international static config (add-ons, interests, privileges, team)
- `app/lib/data/booking-config-domestic.ts` — domestic static config (国内专属附加项、兴趣、礼遇、管家团队)
- `app/lib/pricing.ts` — price calculation engine + `formatPrice()`
- `app/lib/validation.ts` — form validation (shared front/back end)
- `app/lib/hooks/useBookingForm.ts` — `useReducer` state hook with localStorage persistence, accepts `scope` and `addOnPrices` params
- `app/api/booking/calculate-price/route.ts` — price calculation API
- `app/api/booking/submit/route.ts` — booking submission API (idempotent)

No database — API routes log to console. Future: Supabase or similar.

### Component Organization

- **`app/components/`** — Shared UI (`Navbar.tsx`)
- **`app/sections/`** — Page-level sections (`HeroSection`, `DestinationsSection`, `TourDetailSection`, `BookingSection`, `BookingSectionDomestic`)
- **`app/lib/`** — Data, types, hooks, pricing, validation

### Styling Conventions

- Tailwind v4 via `@import "tailwindcss"` in `globals.css` — no `tailwind.config.*` file
- Complex layout classes (`.hero-container`, `.gem-card`, etc.) are defined in `globals.css`, not as Tailwind utilities
- Responsive breakpoints use `@media` queries in `globals.css` at 1000px, 850px, 500px — not Tailwind breakpoints
- Hero split-screen effect uses `clip-path: inset()` to create dual-color text across left (beige `#f3ebe4`) and right (video) halves
- Custom easing constant used project-wide: `goldEase = [0.76, 0, 0.24, 1]`
- All images use `picsum.photos` remote URLs (empty `public/` directory); videos are hosted on CloudFront
- `.no-scrollbar` utility hides scrollbars cross-browser

### Key Patterns

- **All interactive pages are `"use client"`** components
- **No global state** — local `useState` + `useRef` for imperative DOM control
- **Infinite carousel** in DestinationsSection uses triple-copy array concatenation with scroll-position wrapping, auto-scroll via `requestAnimationFrame`, and pointer drag with 3px dead zone
- **Next.js 15+ async params pattern**: `params` is a Promise in dynamic routes (`const { id } = await params`)
- **`next/image`** requires `picsum.photos` in `next.config.ts` remotePatterns

## Skill 使用规范

> ⚠️ **强制要求**: 以下场景必须使用对应的 Skill，不得绕过。

### 前端设计与 UI 动画

| 场景 | 必须使用 | 说明 |
|------|----------|------|
| CSS 动画、过渡效果、微交互 | `frontend-design` skill | 设计稿还原、动效实现 |
| GSAP 时间线、滚动动画、复杂序列 | `gsap-skills` skill | ScrollTrigger、Timeline、高级动画 |
| Framer Motion 动画 | `frontend-design` skill | 页面转场、组件入场/退出 |
| 响应式布局、视觉还原 | `frontend-design` skill | 像素级还原设计稿 |

```bash
# ✅ 正确：使用 skill 处理动画需求
# "实现首页 hero 的滚动视差效果" → 调用 gsap-skills
# "设计预订卡片的 hover 动画" → 调用 frontend-design

# ❌ 错误：直接手写复杂动画而不使用 skill
```

### 识图与图片分析

| 场景 | 必须使用 | 说明 |
|------|----------|------|
| 分析设计稿/截图 | `mimo-ask` skill | 识别布局、颜色、间距 |
| 读取图片中的文字/内容 | `mimo-ask` skill | OCR 级别的图片理解 |
| 对比设计稿与实现差异 | `mimo-ask` skill | 视觉 diff 分析 |
| 从原型图提取交互逻辑 | `mimo-ask` skill | 理解设计意图 |

```bash
# ✅ 正确：使用 mimo-ask
/mimo-ask 请分析这张截图的布局、颜色方案和间距

# ❌ 错误：直接用其他方式调用 Vision API
```

### 方案规划与复杂任务

| 场景 | 必须使用 | 说明 |
|------|----------|------|
| 架构设计方案 | `superpowers` skill + 多 Agent | 多视角思考，避免盲区 |
| 复杂功能的技术选型 | `superpowers` skill + 多 Agent | 并行评估多个方案 |
| 代码审查 / 重构规划 | `superpowers` skill + 多 Agent | 多维度审查（安全/性能/可维护性） |
| 跨模块改动的影响分析 | `superpowers` skill + 多 Agent | 全面评估影响范围 |
| 需求分析与任务拆解 | `superpowers` skill + 多 Agent | 结构化思考 |

```bash
# ✅ 正确：使用 superpowers + 多 Agent 并行
# "规划预订系统的重构方案"
# → 启动多个 Agent 分别从 性能/安全/可维护性/用户体验 角度分析
# → 使用 superpowers 进行综合思考和审查

# ❌ 错误：单 Agent 拍脑袋决定架构方案
```

### Skill 调用决策树

```
任务类型？
├── 前端 UI / 动画 / 视觉 → frontend-design 或 gsap-skills
├── 需要看图/识图 → mimo-ask
├── 复杂规划 / 架构 / 审查 → superpowers + 多 Agent 并行
├── 简单代码修改 → 直接执行
└── 不确定 → 优先使用 skill（宁多勿少）
```

## Booking Page Context

Three attempts at a booking page were reverted (see `DEVLOG.md`). Design requirements: dark luxury aesthetic (`#0D0D0D` background, Playfair Display serif, `#C9A96E` gold accents, `#F5F0EB` light text). Must follow Moqups prototype pixel-by-pixel.
