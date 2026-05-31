# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Development server (webpack, not Turbopack) at http://localhost:3000
npm run build     # Production build (webpack)
npm run start     # Start production server
npm run lint      # ESLint (eslint-config-next)
```

No test framework is configured.

## Architecture

This is a **Next.js 16 App Router** project — a Chinese-language luxury travel website ("旅行 -- 发现世界之美").

### Tech Stack
- **Next.js 16.2.6** with React 19, TypeScript, **Tailwind CSS v4** (CSS-first config, no tailwind.config file)
- **Framer Motion** for page transitions and micro-interactions
- **GSAP** is installed but unused (placeholder for future work)
- **Lucide React** for icons
- Scripts use `--webpack` flag explicitly (overrides Next 16's default Turbopack)

### Routing (`app/`)

| Route | File | Notes |
|---|---|---|
| `/` | `app/page.tsx` | Home — renders `HeroSection` |
| `/destinations` | `app/destinations/page.tsx` | Listing — renders `DestinationsSection` |
| `/destinations/[id]` | `app/destinations/[id]/page.tsx` | Dynamic tour detail (async params) |
| `/booking` | `app/booking/` | **Empty directory** — not yet implemented |
| `[...catchAll]` | `app/[...catchAll]/page.tsx` | Forces `notFound()` for undefined routes |

Navbar links to `/faq` and `/account` also exist but have no pages — they route to the custom 404 (`app/not-found.tsx`).

### Data Layer

All data is static in `app/lib/tours.ts` — exports a `tours` array and `getTourById()`. No database, no API routes, no middleware.

### Component Organization

- **`app/components/`** — Shared UI (`Navbar.tsx`)
- **`app/sections/`** — Page-level sections (`HeroSection`, `DestinationsSection`, `TourDetailSection`)
- **`app/components/Booking/`** — Empty, placeholder for booking feature

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
