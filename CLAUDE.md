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

## Booking Page Context

Three attempts at a booking page were reverted (see `DEVLOG.md`). Design requirements: dark luxury aesthetic (`#0D0D0D` background, Playfair Display serif, `#C9A96E` gold accents, `#F5F0EB` light text). Must follow Moqups prototype pixel-by-pixel.
