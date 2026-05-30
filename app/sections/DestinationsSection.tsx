"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { tours } from "../lib/tours";

const LOOP_COPIES = 3;
const WILL_CHANGE = { willChange: "scroll-position" } as const;
const STAGGER_MS = 70;

export default function DestinationsSection() {
  const [query, setQuery] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const isLooping = query.trim() === "";
  const groupWRef = useRef(0);
  const hovered = useRef(false);
  const arrowAnimating = useRef(false);

  // memoized filtering + display array
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return tours.filter((t) => t.name.toLowerCase().includes(q));
  }, [query]);

  const displayTours = useMemo(
    () => (isLooping ? Array.from({ length: LOOP_COPIES }, () => filtered).flat() : filtered),
    [isLooping, filtered]
  );

  // —— Pointer drag (imperative, no re-renders) ——
  const drag = useRef({ active: false, startX: 0, scrollStart: 0, moved: false });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      drag.current = { active: true, startX: e.clientX, scrollStart: el.scrollLeft, moved: false };
      el.setPointerCapture(e.pointerId);
      el.style.scrollSnapType = "none";
    };
    const onMove = (e: PointerEvent) => {
      if (!drag.current.active) return;
      const dx = e.clientX - drag.current.startX;
      if (Math.abs(dx) > 3) drag.current.moved = true;
      el.scrollLeft = drag.current.scrollStart - dx;
    };
    const onUp = () => {
      drag.current.active = false;
      el.style.scrollSnapType = "";
    };
    const onClick = (e: MouseEvent) => {
      if (drag.current.moved) { e.preventDefault(); e.stopPropagation(); drag.current.moved = false; }
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    el.addEventListener("click", onClick, { capture: true });
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
      el.removeEventListener("click", onClick, { capture: true });
    };
  }, []);

  // —— Infinite loop + init position (single effect) ——
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !isLooping || filtered.length === 0) return;

    // init to middle group
    el.scrollLeft = el.scrollWidth / LOOP_COPIES;
    // cache groupWidth to avoid reflow on every scroll tick
    let groupW = el.scrollWidth / LOOP_COPIES;
    groupWRef.current = groupW;

    const onResize = () => {
      groupW = el.scrollWidth / LOOP_COPIES;
      groupWRef.current = groupW;
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(el);

    const onScroll = () => {
      if (el.scrollLeft >= groupW * 2) el.scrollLeft -= groupW;
      else if (el.scrollLeft <= 0) el.scrollLeft += groupW;
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => { el.removeEventListener("scroll", onScroll); ro.disconnect(); };
  }, [isLooping, filtered.length]);

  // —— Search resets scroll ——
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
  }, [query]);

  // —— Auto-scroll (pauses on hover / drag, only in loop mode) ——
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !isLooping || filtered.length === 0) return;

    const SPEED = 0.6; // px/frame ≈ 36px/s
    let rafId = 0;

    const tick = () => {
      if (!hovered.current && !drag.current.active && !arrowAnimating.current) {
        el.scrollLeft += SPEED;
      }
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isLooping, filtered.length]);

  // —— Arrow navigation (pre-wrap + native smooth scroll, no boundary crossing) ——
  const scrollPage = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    let groupW = groupWRef.current;
    if (groupW <= 0) {
      groupW = el.scrollWidth / LOOP_COPIES;
      groupWRef.current = groupW;
    }
    if (groupW <= 0) return;

    const distance = el.clientWidth * 0.75;
    const targetDelta = dir === "left" ? -distance : distance;
    const rawEnd = el.scrollLeft + targetDelta;

    // 预回绕：如果动画终点会越过边界，先把起点瞬移到等价位置
    if (rawEnd >= groupW * 2) {
      el.scrollLeft -= groupW;
    } else if (rawEnd < 0) {
      el.scrollLeft += groupW;
    }

    // 暂停自动滚动，让 smooth scroll 独占 scrollLeft
    arrowAnimating.current = true;
    el.scrollBy({ left: targetDelta, behavior: "smooth" });
    // smooth scroll 通常 300-500ms，800ms 后恢复自动滚动
    setTimeout(() => { arrowAnimating.current = false; }, 800);
  };

  return (
    <div className="bg-[#f3ebe4] min-h-screen font-sans selection:bg-black selection:text-white">
      <div id="destcontainer" className="transition-all duration-500">
        {/* Search */}
        <div className="flex justify-center mb-10 animate-entrance">
          <input
            id="searchInput"
            placeholder="搜索目的地"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full max-w-2xl bg-transparent text-[clamp(24px,4vw,42px)] font-light tracking-[-0.02em] outline-none placeholder-black/20 caret-black/40 text-center"
          />
        </div>

        {/* Label + Arrows */}
        <div className="flex items-center justify-between mb-[15px] animate-entrance" style={{ animationDelay: "150ms" }}>
          <p className="text-sm font-medium tracking-widest opacity-60">热门目的地</p>
          <div className="flex gap-2">
            <button onClick={() => scrollPage("left")} className="w-9 h-9 rounded-full border border-black/15 flex items-center justify-center hover:bg-black/5 active:scale-90 transition-all duration-200 cursor-pointer" aria-label="上一页">
              <ChevronLeft size={18} className="text-black/60" />
            </button>
            <button onClick={() => scrollPage("right")} className="w-9 h-9 rounded-full border border-black/15 flex items-center justify-center hover:bg-black/5 active:scale-90 transition-all duration-200 cursor-pointer" aria-label="下一页">
              <ChevronRight size={18} className="text-black/60" />
            </button>
          </div>
        </div>

        {/* Tour cards */}
        <div
          className="relative cursor-grab active:cursor-grabbing"
          onMouseEnter={() => { hovered.current = true; }}
          onMouseLeave={() => { hovered.current = false; }}
        >
          <div ref={scrollRef} className="flex gap-5 overflow-x-auto pb-6 no-scrollbar" style={WILL_CHANGE}>
            {displayTours.length === 0 ? (
              <p className="text-black/40 text-sm pt-4">未找到 &quot;{query}&quot; 相关目的地</p>
            ) : (
              displayTours.map((tour, i) => (
                <div
                  key={`${tour.id}-${i}`}
                  className="animate-entrance"
                  style={{ width: tour.w, flexShrink: 0, animationDelay: `${100 + (i % filtered.length) * STAGGER_MS}ms` }}
                >
                  <Link href={`/destinations/${tour.id}`} className="flex flex-col gap-3 group">
                    <div className="relative rounded-2xl overflow-hidden" style={{ height: tour.imgH }}>
                      {tour.video ? (
                        <video src={`${tour.video}#t=0.1`} muted playsInline preload="metadata" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                      ) : (
                        <Image src={tour.image} alt={tour.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium leading-tight">{tour.name}</h3>
                      <p className="text-sm text-black/45 mt-1">{tour.priceDisplay} / 人</p>
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
