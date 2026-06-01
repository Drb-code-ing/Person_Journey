# AURUM VOYAGES 产品规划与技术路线图

> **文档版本**: v1.0
> **创建日期**: 2026-06-01
> **维护人**: DRB-code-ing
> **状态**: 草案（待讨论确认）

---

## 目录

- [第一部分：现状诊断](#第一部分现状诊断)
- [第二部分：优化补充方案](#第二部分优化补充方案)
- [第三部分：未来发展规划](#第三部分未来发展规划)
- [第四部分：技术架构演进](#第四部分技术架构演进)
- [第五部分：待讨论问题](#第五部分待讨论问题)
- [第六部分：行动清单](#第六部分行动清单)

---

## 第一部分：现状诊断

### 1.1 项目概况

**项目名称**: Person Journey (AURUM VOYAGES)
**项目定位**: 中国高端奢华旅行预订平台
**技术栈**: Next.js 16 + React 19 + TypeScript + Prisma 6 + SQLite + Framer Motion
**当前阶段**: MVP 原型（功能基本完成，但未形成交易闭环）

### 1.2 核心数据流

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              用户终端 (浏览器)                                    │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              Next.js App Router                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ 首页 /   │  │目的地列表│  │ 目的地   │  │ 预订页面 │  │ 登录页面 │          │
│  │HeroSection│  │DestSection│  │ 详情    │  │ Booking  │  │  Login   │          │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │
│       │              │              │              │              │              │
│       │         tours.ts       tours.ts      useBookingForm    AuthContext       │
│       │         (静态数据)      (静态数据)    (useReducer)      (Context)        │
│       │              │              │              │              │              │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│    Prisma + SQLite   │  │    MIMO AI API       │  │    Auth API          │
│  ┌────────────────┐  │  │  ┌────────────────┐  │  │  ┌────────────────┐  │
│  │  Destination   │  │  │  │ ai-price       │  │  │  │ /auth/login    │  │
│  │  Route         │  │  │  │ ai-trip-details│  │  │  │ /auth/register │  │
│  │  User          │  │  │  │ ai-preferences │  │  │  │ /auth/me       │  │
│  │  Booking       │  │  │  └────────────────┘  │  │  │ /auth/logout   │  │
│  └────────────────┘  │  └──────────────────────┘  │  └────────────────┘  │
└──────────────────────┘                            └──────────────────────┘
```

### 1.3 现有功能清单

#### 页面模块

| 路由 | 功能 | 状态 |
|------|------|------|
| `/` | 首页 Hero 区域（分屏视频+品牌文字） | ✅ 完成 |
| `/destinations` | 目的地列表（无限轮播、搜索过滤） | ✅ 完成 |
| `/destinations/[id]` | 目的地详情（视频背景+信息卡片） | ✅ 完成 |
| `/booking` | 国际预订（多步表单+AI推荐） | ✅ 完成 |
| `/booking-domestic` | 国内预订（省份联动+高铁/航班） | ✅ 完成 |
| `/login` | 登录/注册（奢华动画背景） | ✅ 完成 |
| `/faq` | 常见问题 | ❌ 缺失（死链） |
| `/account` | 用户中心 | ❌ 缺失（死链） |

#### API 模块

| 端点 | 功能 | 状态 |
|------|------|------|
| `/api/auth/*` | 认证系统（登录/注册/登出/获取用户） | ✅ 完成 |
| `/api/destinations` | 目的地查询 | ✅ 完成 |
| `/api/origins` | 出发城市查询 | ✅ 完成 |
| `/api/routes` | 路线查询 | ✅ 完成 |
| `/api/booking/calculate-price` | 价格计算 | ✅ 完成 |
| `/api/booking/submit` | 预订提交 | ⚠️ 未持久化 |
| `/api/ai-price` | AI 智能定价 | ✅ 完成 |
| `/api/ai-trip-details` | AI 行程推荐 | ✅ 完成 |
| `/api/ai-preferences` | AI 偏好推荐 | ✅ 完成 |

#### 数据模型

```prisma
Destination (目的地)     — 30个国际 + 30个国内
Route (路线)             — 123条国际 + 64条国内
User (用户)              — 支持注册/登录
Booking (预订记录)       — 已定义但未使用
```

### 1.4 🔴 关键问题

#### 问题 1：预订数据未持久化 [紧急度: 🔴🔴🔴]

**现状**: `/api/booking/submit` 仅 `console.log`，未写入 Booking 表
**影响**: 用户提交预订后数据丢失，业务无法运转
**位置**: `app/api/booking/submit/route.ts`

#### 问题 2：双轨数据源 [紧急度: 🔴🔴]

**现状**:
- 目的地浏览：`tours.ts` 静态数组（7条）
- 预订系统：Prisma 数据库（30+ 目的地）

**影响**: 两套数据不一致，用户体验混乱
**位置**: `app/lib/tours.ts` vs `prisma/schema.prisma`

#### 问题 3：死链页面 [紧急度: 🔴]

**现状**: Navbar 中 `/faq`、`/account` 链接指向 404
**影响**: 用户体验差，品牌形象受损
**位置**: `app/components/Navbar.tsx`

### 1.5 🟡 架构缺陷

| 问题 | 现状 | 影响 | 位置 |
|------|------|------|------|
| **AI 依赖单一** | 3个 API 依赖小米 MIMO，无降级方案 | AI 服务不可用时预订流程阻塞 | `app/api/ai-*/route.ts` |
| **JWT Secret 硬编码** | `aurum-voyages-secret-key-2026` 写在代码中 | 安全隐患 | `app/api/auth/*/route.ts` |
| **无错误边界** | 页面 JS 错误会导致白屏 | 用户体验差 | 全局缺失 |
| **CSS 硬编码** | 颜色值散落在各组件中 | 维护困难 | 各组件 |
| **无加载状态** | 各页面加载状态不统一 | 体验不一致 | 各页面 |
| **SSR 水合风险** | 部分组件使用 Math.random() | 服务端/客户端不一致 | `app/login/page.tsx` |

### 1.6 🟢 功能缺口

| 模块 | 缺失功能 | 用户价值 | 优先级 |
|------|----------|----------|--------|
| **用户中心** | 无个人中心页面 | 用户无法查看历史订单、修改资料 | P1 |
| **订单管理** | 无订单列表、详情、取消 | 用户无法追踪预订状态 | P0 |
| **FAQ** | 无常见问题页面 | 用户疑问无法自助解决 | P1 |
| **搜索** | 目的地搜索仅前端过滤 | 无法支持全文搜索、筛选 | P2 |
| **支付** | 无支付集成 | 无法完成交易闭环 | P0 |
| **通知** | 无邮件/短信通知 | 用户无法收到订单确认 | P1 |
| **收藏** | 无收藏功能 | 用户无法保存心仪目的地 | P2 |

---

## 第二部分：优化补充方案

### 2.1 阶段一：基础补全（1-2周）

#### 2.1.1 预订数据持久化 [P0]

**目标**: 让用户提交的预订真正保存到数据库

**实现方案**:

```typescript
// app/api/booking/submit/route.ts
export async function POST(request: Request) {
  const body = await request.json();

  // 1. 验证用户（可选）
  const user = await getUserFromCookie(request);

  // 2. 服务端校验
  const validation = validateBookingForm(body);
  if (!validation.valid) {
    return NextResponse.json({ success: false, error: validation.error }, { status: 400 });
  }

  // 3. 价格计算
  const priceBreakdown = calculatePrice(body);

  // 4. 写入数据库
  const booking = await prisma.booking.create({
    data: {
      userId: user?.id,
      routeId: body.tripConfig.routeId,
      guestName: body.contact.name,
      guestEmail: body.contact.email,
      guestPhone: body.contact.phone,
      travelDate: body.tripConfig.date,
      adults: body.tripConfig.adults,
      children: body.tripConfig.children,
      totalPrice: priceBreakdown.total,
      status: 'pending',
      notes: JSON.stringify({
        preferences: body.preferences,
        addOns: body.selectedAddOns,
        aiRecommendations: body.aiData,
      }),
    },
  });

  // 5. 返回预订编号
  return NextResponse.json({
    success: true,
    data: {
      bookingId: booking.id,
      bookingNo: `BK-${formatDate(booking.createdAt)}-${booking.id.slice(-6).toUpperCase()}`,
    },
  });
}
```

**预计工作量**: 2-3 小时

#### 2.1.2 数据源统一 [P0]

**目标**: 废弃 `tours.ts`，统一使用 Prisma 数据

**实现方案**:

1. 修改 `app/destinations/page.tsx`，从 API 获取数据
2. 修改 `app/destinations/[id]/page.tsx`，从 API 获取数据
3. 删除或废弃 `app/lib/tours.ts`

```typescript
// app/destinations/page.tsx
export default async function DestinationsPage() {
  const destinations = await prisma.destination.findMany({
    where: { scope: 'international' },
    include: {
      routesAsDest: {
        take: 1,
        orderBy: { price: 'asc' },
        select: { price: true },
      },
    },
  });

  return <DestinationsSection destinations={destinations} />;
}
```

**预计工作量**: 3-4 小时

#### 2.1.3 补全死链页面 [P1]

**目标**: 实现 `/faq` 和 `/account` 页面

**FAQ 页面** (静态内容):
```typescript
// app/faq/page.tsx
export default function FAQPage() {
  return (
    <div className="faq-page">
      <h1>常见问题</h1>
      <FAQSection title="预订相关" items={bookingFAQs} />
      <FAQSection title="支付相关" items={paymentFAQs} />
      <FAQSection title="行程相关" items={tripFAQs} />
      <FAQSection title="取消退款" items={cancelFAQs} />
    </div>
  );
}
```

**用户中心页面** (需登录):
```typescript
// app/account/page.tsx
'use client';

export default function AccountPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);

  if (!user) redirect('/login?redirect=/account');

  return (
    <div className="account-page">
      <UserProfile user={user} />
      <BookingList bookings={bookings} />
      <AccountSettings />
    </div>
  );
}
```

**预计工作量**: 4-5 小时

#### 2.1.4 安全加固 [P0]

**JWT Secret 环境变量化**:

```typescript
// .env.local
JWT_SECRET=your-super-secret-key-here

// app/api/auth/login/route.ts
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
```

**预计工作量**: 0.5 小时

### 2.2 阶段二：用户体验提升（2-3周）

#### 2.2.1 Error Boundary [P1]

```typescript
// app/components/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-fallback">
          <h2>抱歉，出现了一些问题</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            重试
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

**预计工作量**: 1-2 小时

#### 2.2.2 CSS 变量系统 [P1]

```css
/* app/globals.css */
:root {
  /* 品牌色彩 */
  --color-gold: #C9A96E;
  --color-gold-light: #F5D99C;
  --color-gold-dark: #8B5A2B;

  /* 背景色 */
  --color-bg-dark: #0D0D0D;
  --color-bg-card: #111111;
  --color-bg-light: #f3ebe4;

  /* 文字色 */
  --color-text-light: #F5F0EB;
  --color-text-muted: rgba(245, 240, 235, 0.5);
  --color-text-dark: #1c1c1c;

  /* 功能色 */
  --color-error: #ef4444;
  --color-success: #22c55e;
  --color-warning: #f59e0b;

  /* 字体 */
  --font-heading: 'Playfair Display', serif;
  --font-body: 'Inter', sans-serif;

  /* 间距 */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  /* 动画 */
  --ease-gold: cubic-bezier(0.76, 0, 0.24, 1);
  --duration-fast: 0.2s;
  --duration-normal: 0.3s;
  --duration-slow: 0.5s;
}
```

**预计工作量**: 2-3 小时

#### 2.2.3 统一加载状态 [P1]

```typescript
// app/components/Skeleton.tsx
export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn('animate-pulse bg-white/10 rounded', className)}
      {...props}
    />
  );
}

// 使用示例
export function BookingSkeleton() {
  return (
    <div className="booking-skeleton">
      <Skeleton className="h-8 w-48 mb-4" />
      <Skeleton className="h-12 w-full mb-2" />
      <Skeleton className="h-12 w-full mb-2" />
      <Skeleton className="h-12 w-3/4" />
    </div>
  );
}
```

**预计工作量**: 2-3 小时

#### 2.2.4 AI 降级方案 [P1]

```typescript
// app/lib/ai-with-fallback.ts
export async function getAIPreferencesWithFallback(destination: string, scope: string) {
  try {
    // 尝试 AI 推荐
    const aiResult = await fetch('/api/ai-preferences', {
      method: 'POST',
      body: JSON.stringify({ destination }),
    });

    if (aiResult.ok) {
      return await aiResult.json();
    }

    throw new Error('AI request failed');
  } catch (error) {
    // 降级到静态配置
    console.warn('AI preferences failed, using fallback:', error);
    return getDefaultPreferences(scope);
  }
}

function getDefaultPreferences(scope: string) {
  const config = scope === 'domestic'
    ? require('./data/booking-config-domestic')
    : require('./data/booking-config');

  return {
    interests: config.interests,
    dietary: config.dietaryOptions,
  };
}
```

**预计工作量**: 2-3 小时

### 2.3 阶段三：订单系统完善（2-3周）

#### 2.3.1 订单状态机

```typescript
// app/lib/order-status.ts
export const ORDER_STATUS = {
  PENDING: 'pending',           // 待确认
  CONFIRMED: 'confirmed',       // 已确认
  PAID: 'paid',                 // 已支付
  IN_PROGRESS: 'in_progress',   // 旅行中
  COMPLETED: 'completed',       // 已完成
  CANCELLED: 'cancelled',       // 已取消
  REFUNDED: 'refunded',         // 已退款
} as const;

export const STATUS_TRANSITIONS = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.CONFIRMED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED]: [ORDER_STATUS.PAID, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PAID]: [ORDER_STATUS.IN_PROGRESS, ORDER_STATUS.REFUNDED],
  [ORDER_STATUS.IN_PROGRESS]: [ORDER_STATUS.COMPLETED],
  [ORDER_STATUS.COMPLETED]: [],
  [ORDER_STATUS.CANCELLED]: [],
  [ORDER_STATUS.REFUNDED]: [],
};

export function canTransition(from: string, to: string): boolean {
  return STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}
```

#### 2.3.2 订单管理 API

```typescript
// GET  /api/bookings              — 我的订单列表（分页、筛选）
// GET  /api/bookings/[id]         — 订单详情
// POST /api/bookings/[id]/cancel  — 取消订单
// POST /api/bookings/[id]/pay     — 发起支付
```

#### 2.3.3 订单管理页面

```
app/account/
├── page.tsx              — 个人中心概览
├── orders/
│   ├── page.tsx          — 订单列表
│   └── [id]/page.tsx     — 订单详情
└── settings/
    └── page.tsx          — 账户设置
```

**预计工作量**: 8-10 小时

---

## 第三部分：未来发展规划

### 3.1 产品路线图

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              产品路线图                                          │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  [现在]          [Q3 2026]        [Q4 2026]        [Q1 2027]        [Q2 2027]   │
│    │                │                │                │                │         │
│    ▼                ▼                ▼                ▼                ▼         │
│  ┌─────┐        ┌─────┐        ┌─────┐        ┌─────┐        ┌─────┐          │
│  │ MVP │───────▶│ 交易 │───────▶│ 运营 │───────▶│ 扩展 │───────▶│ 生态 │          │
│  │ 原型 │        │ 闭环 │        │ 增长 │        │ 多元 │        │ 平台 │          │
│  └─────┘        └─────┘        └─────┘        └─────┘        └─────┘          │
│    │                │                │                │                │         │
│  • 展示           • 支付           • 会员           • 目的地         • 供应商    │
│  • 预订表单       • 订单管理       • 营销           • 定制游         • 分销      │
│  • AI推荐         • 用户中心       • 数据分析       • 签证服务       • 开放API   │
│  • 认证           • 通知系统       • 客服           • 保险           • 生态合作   │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Q3 2026：交易闭环

**目标**: 让用户可以完成从浏览到支付的完整流程

| 功能 | 技术方案 | 优先级 | 预计工作量 |
|------|----------|--------|------------|
| **支付集成** | 微信支付 + 支付宝（国内）/ Stripe（国际） | P0 | 16h |
| **订单状态机** | pending → paid → confirmed → completed | P0 | 8h |
| **邮件通知** | Resend / SendGrid | P1 | 4h |
| **订单详情页** | 展示行程单、电子票 | P1 | 6h |
| **用户中心** | 个人资料、订单列表 | P1 | 8h |

**数据流**:
```
用户选择行程
    ↓
AI定价
    ↓
用户确认
    ↓
创建订单(pending)
    ↓
发起支付 → 微信/支付宝/Stripe
    ↓
支付回调 → 订单更新(paid)
    ↓
后台确认(confirmed)
    ↓
旅行完成(completed)
```

### 3.3 Q4 2026：运营增长

**目标**: 建立用户粘性和复购机制

| 功能 | 技术方案 | 商业价值 | 预计工作量 |
|------|----------|----------|------------|
| **会员等级** | 青铜/白银/黄金/钻石 | 提升复购率 | 16h |
| **积分系统** | 消费积分 + 签到积分 | 用户粘性 | 12h |
| **优惠券** | 满减/折扣/新人券 | 拉新转化 | 12h |
| **收藏夹** | 收藏目的地/行程 | 促进转化 | 6h |
| **浏览历史** | 个性化推荐 | 提升体验 | 8h |
| **客服系统** | 在线客服/工单 | 服务质量 | 20h |
| **营销活动** | 限时折扣、拼团、早鸟价 | 拉动销售 | 16h |

**新增数据模型**:
```prisma
model MemberLevel {
  id          String   @id @default(cuid())
  userId      String   @unique
  level       String   @default("bronze")  // bronze/silver/gold/diamond
  points      Int      @default(0)
  totalSpent  Int      @default(0)
  user        User     @relation(fields: [userId], references: [id])
}

model PointsHistory {
  id          String   @id @default(cuid())
  userId      String
  type        String   // earn/spend
  amount      Int
  source      String   // booking/checkin/referral
  description String
  createdAt   DateTime @default(now())
}

model Coupon {
  id          String   @id @default(cuid())
  code        String   @unique
  type        String   // fixed/percentage
  value       Int
  minAmount   Int?
  maxDiscount Int?
  expiresAt   DateTime
  usageLimit  Int      @default(1)
  usedCount   Int      @default(0)
}

model Favorite {
  id            String      @id @default(cuid())
  userId        String
  destinationId String
  user          User        @relation(fields: [userId], references: [id])
  destination   Destination @relation(fields: [destinationId], references: [id])
  createdAt     DateTime    @default(now())

  @@unique([userId, destinationId])
}
```

### 3.4 Q1 2027：业务扩展

**目标**: 扩展服务边界，增加收入来源

| 功能 | 商业价值 | 技术复杂度 | 预计工作量 |
|------|----------|------------|------------|
| **定制游** | 高客单价（10万+） | 中 | 40h |
| **签证服务** | 增值服务费（500-2000/人） | 低 | 20h |
| **旅行保险** | 佣金收入（保费5-15%） | 中 | 24h |
| **当地体验** | 增值服务（门票/活动） | 高 | 40h |
| **企业团建** | B端市场（高客单价） | 高 | 60h |
| **蜜月/婚拍** | 细分市场 | 中 | 30h |

**定制游流程**:
```
用户提交定制需求
    ↓
AI 生成初步方案
    ↓
旅行顾问人工优化
    ↓
用户确认方案
    ↓
支付定金（30%）
    ↓
资源采购（酒店/机票/活动）
    ↓
行前通知
    ↓
旅行进行
    ↓
支付尾款（70%）
    ↓
旅行完成 + 评价
```

### 3.5 Q2 2027：平台生态

**目标**: 从自营走向平台

```
┌─────────────────────────────────────────────────────────────────┐
│                        AURUM VOYAGES 平台                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐          │
│  │   供应商    │    │   分销商    │    │   用户      │          │
│  │  (酒店/航空) │    │  (旅行社)   │    │  (C端/B端)  │          │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘          │
│         │                  │                  │                  │
│         ▼                  ▼                  ▼                  │
│  ┌─────────────────────────────────────────────────────┐        │
│  │                   开放 API 层                        │        │
│  │  • 商品管理  • 订单同步  • 价格查询  • 库存管理      │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                 │
│  ┌─────────────────────────────────────────────────────┐        │
│  │                   核心业务层                         │        │
│  │  • 搜索推荐  • 价格引擎  • 订单中心  • 用户中心      │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                 │
│  ┌─────────────────────────────────────────────────────┐        │
│  │                   数据智能层                         │        │
│  │  • 用户画像  • 智能推荐  • 动态定价  • 风控系统      │        │
│  └─────────────────────────────────────────────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**开放 API 示例**:
```
供应商 API:
- POST /api/supplier/products      — 上传商品
- PUT  /api/supplier/products/:id  — 更新商品
- GET  /api/supplier/orders        — 查看订单
- POST /api/supplier/orders/:id/confirm — 确认订单

分销商 API:
- GET  /api/agent/products         — 查询商品
- POST /api/agent/orders           — 创建订单
- GET  /api/agent/commission       — 查看佣金
```

---

## 第四部分：技术架构演进

### 4.1 当前架构 → 目标架构

```
[当前]                              [目标]
┌───────────────┐                  ┌───────────────┐
│   单体应用    │        →         │   微服务拆分   │
│  Next.js全栈  │                  │               │
└───────────────┘                  │  ┌─────────┐  │
                                   │  │ 前端服务 │  │
┌───────────────┐                  │  └─────────┘  │
│   SQLite      │        →         │  ┌─────────┐  │
│   本地文件    │                  │  │ API网关  │  │
└───────────────┘                  │  └─────────┘  │
                                   │  ┌─────────┐  │
┌───────────────┐                  │  │ 业务服务 │  │
│   无缓存      │        →         │  └─────────┘  │
│   无队列      │                  │  ┌─────────┐  │
└───────────────┘                  │  │ 数据服务 │  │
                                   │  └─────────┘  │
                                   └───────────────┘
```

### 4.2 技术选型演进

| 阶段 | 数据库 | 缓存 | 队列 | 部署 | 监控 |
|------|--------|------|------|------|------|
| **当前** | SQLite | 无 | 无 | 本地 | 无 |
| **Q3 2026** | PostgreSQL | Redis | 无 | Vercel | Sentry |
| **Q4 2026** | PostgreSQL | Redis | BullMQ | Vercel/AWS | Sentry + Datadog |
| **Q1 2027** | PostgreSQL集群 | Redis集群 | RabbitMQ | AWS | 完整监控 |
| **Q2 2027** | 分库分表 | 集群 | 集群 | K8s | APM |

### 4.3 数据库迁移计划

**阶段 1：SQLite → PostgreSQL** (Q3 2026)

```bash
# 1. 备份当前数据
cp prisma/dev.db prisma/dev.db.backup

# 2. 修改 schema
# prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

# 3. 创建远程数据库（推荐 Supabase）
# 获取连接字符串

# 4. 配置环境变量
# .env
DATABASE_URL="postgresql://..."

# 5. 运行迁移
npx prisma migrate deploy

# 6. 导入种子数据
npx prisma db seed

# 7. 验证
npx prisma studio
```

**阶段 2：读写分离** (Q1 2027)

```
写库 (Primary)
    ↓ 异步复制
读库 (Replica 1)  ←  查询请求
读库 (Replica 2)  ←  查询请求
```

**阶段 3：分库分表** (Q2 2027，如需要)

```
按用户 ID 哈希分片：
- Shard 0: 用户 0-999999
- Shard 1: 用户 1000000-1999999
- Shard 2: 用户 2000000-2999999
```

### 4.4 缓存策略

```typescript
// Redis 缓存层
const CACHE_KEYS = {
  DESTINATION: (id: string) => `destination:${id}`,
  DESTINATION_LIST: (scope: string) => `destinations:${scope}`,
  USER: (id: string) => `user:${id}`,
  AI_PRICE: (params: string) => `ai:price:${params}`,
};

const CACHE_TTL = {
  DESTINATION: 3600,      // 1 小时
  DESTINATION_LIST: 1800, // 30 分钟
  USER: 300,              // 5 分钟
  AI_PRICE: 86400,        // 24 小时（价格相对稳定）
};

// 使用示例
async function getDestination(id: string) {
  const cached = await redis.get(CACHE_KEYS.DESTINATION(id));
  if (cached) return JSON.parse(cached);

  const destination = await prisma.destination.findUnique({ where: { id } });
  await redis.setex(CACHE_KEYS.DESTINATION(id), CACHE_TTL.DESTINATION, JSON.stringify(destination));

  return destination;
}
```

### 4.5 队列系统

```typescript
// BullMQ 任务队列
import { Queue, Worker } from 'bullmq';

// 邮件队列
const emailQueue = new Queue('email', { connection: redis });

// 发送邮件
await emailQueue.add('send-confirmation', {
  to: booking.guestEmail,
  bookingId: booking.id,
  bookingNo: bookingNo,
});

// 邮件 Worker
const emailWorker = new Worker('email', async (job) => {
  if (job.name === 'send-confirmation') {
    await sendConfirmationEmail(job.data);
  }
}, { connection: redis });
```

---

## 第五部分：待讨论问题

### 5.1 商业模式定位 [已决策 ✅]

**决策**:
- **模式**: 自营 + 轻定制
- **客群**: 轻奢旅行（客单价 3-8万）
- **企业客户**: 作为增值服务，不作为主业务

**执行方案**:
- 初期聚焦 **3-8万** 客单价区间
- 打造 **标准化轻奢产品**（5-7天行程，五星酒店+商务舱/高铁商务座）
- 提供 **有限定制**（可选附加项，非完全定制）
- 积累口碑后逐步开放 **供应商入驻**

### 5.2 支付方案选择 [已决策 ✅]

**决策**: 暂无企业资质，需要解决

**过渡方案**:
1. **现阶段**: 预订表单 → 后台人工确认 → 线下收款（银行转账/微信转账）
2. **短期目标**: 申请企业资质（个体工商户或公司）
3. **获得资质后**: 接入微信支付 + 支付宝

**时间线**:
- [ ] 注册个体工商户/公司（1-2周）
- [ ] 申请微信支付商户号（1-2周）
- [ ] 申请支付宝商家账号（1周）
- [ ] 技术对接（1-2周）

**国际支付**: 暂不支持，后续可接入 Stripe

### 5.3 AI 服务策略 [已决策 ✅]

**决策**: 搭建多模型备份体系

**技术方案**:

```typescript
// app/lib/ai-provider.ts
interface AIProvider {
  name: string;
  chat(messages: Message[], options: ChatOptions): Promise<string>;
}

// 主模型：小米 MIMO
const primaryProvider: AIProvider = {
  name: 'mimo',
  chat: async (messages, options) => {
    const response = await fetch('https://api.xiaomimimo.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.MIMO_API_KEY}` },
      body: JSON.stringify({
        model: 'mimo-v2.5',
        messages,
        temperature: options.temperature || 0.3,
        max_tokens: options.maxTokens || 2048,
      }),
    });
    return response.json();
  },
};

// 备用模型：OpenAI
const fallbackProvider: AIProvider = {
  name: 'openai',
  chat: async (messages, options) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: options.temperature || 0.3,
        max_tokens: options.maxTokens || 2048,
      }),
    });
    return response.json();
  },
};

// 智能路由：主模型失败自动切换备用
export async function chatWithFallback(messages: Message[], options: ChatOptions) {
  try {
    return await primaryProvider.chat(messages, options);
  } catch (error) {
    console.warn('Primary AI failed, switching to fallback:', error);
    return await fallbackProvider.chat(messages, options);
  }
}
```

**模型配置**:

| 用途 | 主模型 | 备用模型 | 降级方案 |
|------|--------|----------|----------|
| **智能定价** | MIMO v2.5 | GPT-4o-mini | 静态价格表 |
| **行程推荐** | MIMO v2.5 | GPT-4o-mini | 静态配置 |
| **偏好推荐** | MIMO v2.5 | GPT-4o-mini | 默认标签 |

**环境变量**:
```env
MIMO_API_KEY=your-mimo-api-key
OPENAI_API_KEY=sk-your-openai-key
```

**预计工作量**: 6-8 小时

### 5.4 部署与运维 [已决策 ✅]

**决策**: AWS + 阿里云混合部署

**架构设计**:

```
┌─────────────────────────────────────────────────────────────────┐
│                        全球用户                                  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Cloudflare CDN                               │
│  • 静态资源加速（图片/视频/CSS/JS）                               │
│  • DDoS 防护                                                     │
│  • SSL 证书                                                      │
└─────────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│      AWS (海外用户)      │     │    阿里云 (国内用户)      │
│  ┌─────────────────┐    │     │  ┌─────────────────┐    │
│  │  EC2 / ECS      │    │     │  │  ECS            │    │
│  │  Next.js 应用   │    │     │  │  Next.js 应用   │    │
│  └─────────────────┘    │     │  └─────────────────┘    │
│  ┌─────────────────┐    │     │  ┌─────────────────┐    │
│  │  RDS PostgreSQL │    │     │  │  RDS PostgreSQL │    │
│  │  (主数据库)     │    │     │  │  (从数据库)     │    │
│  └─────────────────┘    │     │  └─────────────────┘    │
│  ┌─────────────────┐    │     │  ┌─────────────────┐    │
│  │  ElastiCache    │    │     │  │  Redis          │    │
│  │  Redis          │    │     │  │  (缓存)         │    │
│  └─────────────────┘    │     │  └─────────────────┘    │
└─────────────────────────┘     └─────────────────────────┘
            │                               │
            └───────────────┬───────────────┘
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     共享服务                                      │
│  • MIMO AI API（小米云）                                          │
│  • 微信支付 / 支付宝（国内）                                      │
│  • 邮件服务（阿里云邮件 / AWS SES）                               │
│  • 对象存储（阿里云 OSS / AWS S3）                                │
└─────────────────────────────────────────────────────────────────┘
```

**AWS 配置**:

| 服务 | 用途 | 规格 | 预估成本/月 |
|------|------|------|-------------|
| EC2 | 应用服务器 | t3.medium (2vCPU, 4GB) | $30 |
| RDS | PostgreSQL | db.t3.micro | $15 |
| ElastiCache | Redis | cache.t3.micro | $15 |
| S3 | 图片/视频存储 | 100GB | $2 |
| CloudFront | CDN | 100GB 流量 | $10 |
| **合计** | | | **~$72/月** |

**阿里云配置**:

| 服务 | 用途 | 规格 | 预估成本/月 |
|------|------|------|-------------|
| ECS | 应用服务器 | 2vCPU, 4GB | ¥200 |
| RDS | PostgreSQL | 2vCPU, 4GB | ¥150 |
| Redis | 缓存 | 1GB | ¥50 |
| OSS | 图片/视频存储 | 100GB | ¥10 |
| CDN | 加速 | 100GB 流量 | ¥20 |
| **合计** | | | **~¥430/月** |

**部署流程**:

```bash
# 1. 代码推送到 GitHub
git push origin main

# 2. GitHub Actions 自动构建
# .github/workflows/deploy.yml

# 3. 构建 Docker 镜像
docker build -t aurum-voyages .

# 4. 推送到容器镜像仓库
# AWS ECR / 阿里云 ACR

# 5. 部署到 ECS
# AWS ECS / 阿里云 ECS

# 6. 健康检查 + 流量切换
```

**预计工作量**: 16-24 小时（首次部署）

---

## 第六部分：行动清单

### 6.1 🔴 本周必须完成（P0）

| 任务 | 负责 | 预计时间 | 状态 |
|------|------|----------|------|
| 预订数据持久化 | 后端 | 2-3h | ✅ 已完成 |
| JWT Secret 改为环境变量 | 后端 | 0.5h | ✅ 已完成 |
| 补全 `/faq` 页面 | 前端 | 2h | ✅ 已完成（含全面重构） |
| 修复 Navbar 死链 | 前端 | 0.5h | ✅ 已完成 |

### 6.2 🟡 本周争取完成（P1）

| 任务 | 负责 | 预计时间 | 状态 |
|------|------|----------|------|
| 统一数据源（废弃 tours.ts） | 全栈 | 3-4h | ⬜ |
| 添加 Error Boundary | 前端 | 1-2h | ⬜ |
| 提取 CSS 变量 | 前端 | 2-3h | ⬜ |
| 统一加载状态组件 | 前端 | 2-3h | ⬜ |

### 6.3 🟢 下周规划（P2）

| 任务 | 负责 | 预计时间 | 状态 |
|------|------|----------|------|
| 用户中心页面 | 前端 | 4-5h | ⬜ 待开发 |
| 订单列表 API | 后端 | 2-3h | ⬜ |
| 订单状态机 | 后端 | 3-4h | ⬜ |
| AI 降级方案 | 后端 | 2-3h | ⬜ |

### 6.4 📅 本月规划（Q3 2026）

| 周次 | 重点任务 | 里程碑 | 状态 |
|------|----------|--------|------|
| **第1周** | 基础补全（P0任务） | 数据持久化、死链修复、FAQ页面 | ✅ 已完成 |
| **第2周** | 用户体验提升（P1任务） | Error Boundary、CSS变量 | ⬜ 进行中 |
| **第3周** | 订单系统完善 | 订单状态机、订单API | ⬜ |
| **第4周** | 支付集成调研 | 支付方案选型、技术调研 | ⬜ |

---

## 附录

### A. 关键文件清单

```
app/
├── api/
│   ├── auth/           — 认证 API（4个端点）
│   ├── booking/        — 预订 API（2个端点）
│   ├── ai-*/           — AI API（3个端点）
│   ├── destinations/   — 目的地查询
│   ├── origins/        — 出发城市查询
│   └── routes/         — 路线查询
├── components/
│   ├── Navbar.tsx      — 导航栏
│   ├── UserMenu.tsx    — 用户菜单
│   └── ClientProviders.tsx — 全局 Provider
├── lib/
│   ├── contexts/
│   │   └── AuthContext.tsx — 认证上下文
│   ├── hooks/
│   │   └── useBookingForm.ts — 预订表单 Hook
│   ├── data/
│   │   ├── booking-config.ts — 国际配置
│   │   ├── booking-config-domestic.ts — 国内配置
│   │   └── provinces.ts — 省份数据
│   ├── types/
│   │   └── booking.ts — 类型定义
│   ├── pricing.ts     — 价格计算
│   ├── validation.ts  — 表单校验
│   ├── prisma.ts      — Prisma 客户端
│   └── tours.ts       — 静态数据（待废弃）
├── sections/
│   ├── HeroSection.tsx
│   ├── DestinationsSection.tsx
│   ├── TourDetailSection.tsx
│   ├── BookingSection.tsx
│   └── BookingSectionDomestic.tsx
└── login/
    └── page.tsx        — 登录页面

prisma/
├── schema.prisma       — 数据模型
├── seed.ts            — 国际种子数据
├── seed-domestic.ts   — 国内种子数据
└── dev.db             — SQLite 数据库
```

### B. 环境变量清单

```env
# .env.local
DATABASE_URL="file:./dev.db"          # 数据库连接
JWT_SECRET="your-secret-key"          # JWT 密钥
MIMO_API_KEY="your-mimo-api-key"     # MIMO AI API
STRIPE_SECRET_KEY="sk_test_..."       # Stripe 支付（未来）
RESEND_API_KEY="re_..."              # Resend 邮件（未来）
REDIS_URL="redis://localhost:6379"    # Redis 缓存（未来）
```

### C. 版本历史

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2026-06-01 | 初始版本，现状诊断 + 未来规划 |

---

*本文档将随项目演进持续更新*
