"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

const goldEase = [0.76, 0, 0.24, 1] as const;

function HeroContent() {
  return (
    <div
      id="topContent"
      className="flex flex-col items-center justify-center transform -translate-y-[40px] md:-translate-y-[20px] px-6"
    >
      <div className="overflow-hidden">
        <motion.h1
          initial={{ y: "110%" }}
          animate={{ y: 0 }}
          transition={{ duration: 1.1, ease: goldEase }}
          className="font-light leading-[1.05] tracking-[-0.04em] text-[clamp(42px,6vw,80px)]"
        >
          发现世界
        </motion.h1>
      </div>
      <div className="overflow-hidden mb-8">
        <motion.h1
          initial={{ y: "110%" }}
          animate={{ y: 0 }}
          transition={{ duration: 1.1, ease: goldEase, delay: 0.08 }}
          className="font-light leading-[1.05] tracking-[-0.04em] text-[clamp(42px,6vw,80px)]"
        >
          无尽之美
        </motion.h1>
      </div>
      <motion.p
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: goldEase, delay: 0.55 }}
        className="text-[clamp(14px,1vw,16px)] leading-[1.7] max-w-[550px] mx-auto opacity-80 font-light tracking-wide"
      >
        逃离平凡，在地球最令人惊叹的角落寻找灵感。
        我们为你量身定制独一无二的旅行体验，契合你的节奏与心境。
      </motion.p>
    </div>
  );
}

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});
    const onLoaded = () => v.play().catch(() => {});
    v.addEventListener("loadeddata", onLoaded);
    return () => v.removeEventListener("loadeddata", onLoaded);
  }, []);

  return (
    <div className="bg-[#f3ebe4] selection:bg-black selection:text-white min-h-screen overflow-hidden font-sans">
      <main className="hero-container">
        {/* Left half — solid background */}
        <div className="left-bg" />

        {/* Right half — video + gem card */}
        <div className="right-bg">
          <div className="bg-image-wrapper">
            <motion.div
              className="relative w-full h-full"
              initial={{ scale: 1.06 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2.2, ease: goldEase }}
            >
              <video
                ref={videoRef}
                src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_220929_e6719f25-1ba0-45c2-97fc-0148805d9fb9.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="absolute inset-0 w-full h-full object-cover object-left"
              />
            </motion.div>
            <div className="absolute inset-0 bg-black/20 md:bg-transparent" />
          </div>

          {/* Gem card */}
          <motion.div
            className="gem-card"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1.1, ease: goldEase, delay: 0.5 }}
          >
            <div className="gem-image-box relative shrink-0 overflow-hidden">
              <video
                src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260509_073207_eeb9b7e5-7df4-4204-80c2-163eb46466e8.mp4"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
            <div className="gem-content gap-[20px]">
              <div className="mb-5 md:mb-0">
                <h3 className="font-semibold text-[#1c1c1c] text-xl md:text-base mb-2">
                  秘境之地
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed">
                  探索我们精心挑选的原生态住宿与隐秘度假地，
                  自然与舒适在此完美交融。
                </p>
              </div>
              <Link
                id="explorebtn"
                href="/destinations"
                className="bg-black text-white px-8 py-4 md:px-5 md:py-2.5 rounded-full text-xs flex items-center gap-2 self-start hover:bg-zinc-800 transition-all duration-300 active:scale-95 cursor-pointer"
              >
                探索更多 <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Split-screen text layers */}
        <div className="text-layer-wrapper text-black-side">
          <HeroContent />
        </div>
        <div className="text-layer-wrapper text-white-side">
          <HeroContent />
        </div>
      </main>
    </div>
  );
}
