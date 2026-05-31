"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const goldEase = [0.76, 0, 0.24, 1] as const;

const desktopLinks = [
  { label: "关于", href: "/" },
  { label: "目的地", href: "/destinations" },
  { label: "预订", href: "/booking" },
  { label: "常见问题", href: "/faq" },
  { label: "账户", href: "/account" },
];

const mobileLinks = [
  { label: "关于", href: "/" },
  { label: "目的地", href: "/destinations" },
  { label: "预订", href: "/booking" },
  { label: "常见问题", href: "/faq" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isBooking = pathname === "/booking";
  const isTourDetail =
    pathname.startsWith("/destinations/") && pathname !== "/destinations";

  const starColor = menuOpen
    ? "black"
    : isTourDetail
    ? "white"
    : isHome
    ? "max-[850px]:text-white min-[851px]:text-black"
    : "black";

  const hamburgerColor = isHome || isTourDetail ? "text-white" : "text-black";

  return (
    <>
      {/* Star icon */}
      <Star
        size={30}
        fill="currentColor"
        strokeWidth={0}
        className={`fixed top-[30px] left-[30px] z-[1001] ${starColor}`}
      />

      {/* Hamburger */}
      <button
        onClick={() => setMenuOpen(true)}
        className={`fixed top-7 right-7.5 z-[300] ${hamburgerColor} hover:scale-110 transition-all duration-300 ease-out cursor-pointer`}
      >
        <Menu size={32} />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.75, ease: goldEase }}
            className="fixed inset-0 z-[2000] bg-white flex flex-col items-center justify-center"
          >
            <button
              onClick={() => setMenuOpen(false)}
              className="absolute top-7 right-7 hover:rotate-90 transition-transform duration-300 cursor-pointer"
            >
              <X size={32} />
            </button>
            <nav className="flex flex-col items-center gap-6">
              {mobileLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.3 + i * 0.07,
                    duration: 0.55,
                    ease: goldEase,
                  }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="text-5xl md:text-7xl font-light tracking-tighter hover:italic transition-all"
                  >
                    {pathname === link.href && (
                      <span className="mr-1">/</span>
                    )}
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop nav */}
      {!isTourDetail && (
        <nav className="fixed bottom-10 left-10 z-[100] hidden min-[851px]:flex flex-col gap-1">
          {desktopLinks.map((link, i) => (
            <motion.div
              key={link.href}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: 0.4 + i * 0.08,
                duration: 0.6,
                ease: goldEase,
              }}
            >
              <Link
                href={link.href}
                className={`text-[13px] tracking-widest font-medium hover:opacity-60 transition-opacity ${isBooking ? "text-[#C9A96E]" : "text-black"}`}
              >
                {pathname === link.href && (
                  <span className="mr-0.5">/</span>
                )}
                {link.label}
              </Link>
            </motion.div>
          ))}
        </nav>
      )}
    </>
  );
}
