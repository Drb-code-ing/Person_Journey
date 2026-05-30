"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const goldEase = [0.76, 0, 0.24, 1] as const;

export default function NotFound() {
  return (
    <div className="bg-[#f3ebe4] min-h-screen flex flex-col items-center justify-center font-sans selection:bg-black selection:text-white">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: goldEase }}
        className="text-[120px] font-light leading-none tracking-[-0.04em] text-black/10 select-none"
      >
        404
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: goldEase, delay: 0.15 }}
        className="text-2xl font-light tracking-tight text-black mt-4 mb-3"
      >
        页面未找到
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: goldEase, delay: 0.25 }}
        className="text-sm text-black/40 mb-10"
      >
        该页面尚未创建。
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: goldEase, delay: 0.35 }}
      >
        <Link
          href="/"
          className="text-[13px] tracking-widest font-medium text-black border-b border-black/20 pb-0.5 hover:border-black transition-colors duration-200"
        >
          返回首页
        </Link>
      </motion.div>
    </div>
  );
}
