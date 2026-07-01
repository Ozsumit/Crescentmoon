"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import LiteModeBanner from "@/components/litemodebanner";

import {
  Home,
  Film,
  Tv,
  Search,
  Heart,
  Settings,
  Menu,
  X,
  ArrowRight,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";

// --- PLACEHOLDERS ---
import Logo from "./Logo";
// --------------------
const ALTERNATE_DOMAINS = [
  "skq.qzz.io",
  "comsic.qzz.io",
  "movie.sumit.info.np",
];

const QuickSearch = dynamic(() => import("../searchbar"), {
  ssr: false,
});

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [showDomainNotice, setShowDomainNotice] = useState(true);

  const pathname = usePathname();
  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);

  // --- LOGIC ---
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollY.current;
    const scrolledDown = latest > previous && latest > 50;
    const isAtTop = latest < 50;

    setIsScrolled(!isAtTop);

    // Prevent hiding the header if the mobile menu is open
    if (scrolledDown && !isMobileMenuOpen) {
      setIsHidden(true);
    } else {
      setIsHidden(false);
    }
    lastScrollY.current = latest;
  });

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsQuickSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/movie", label: "Movies", icon: Film },
    { href: "/series", label: "Series", icon: Tv },
  ];

  return (
    <>
      <motion.header
        initial={{ y: 0 }}
        animate={isHidden ? { y: "-100%" } : { y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-[100] border-b transition-all duration-300 flex flex-col ${
          isScrolled || isMobileMenuOpen
            ? "bg-neutral-950/90 backdrop-blur-md border-white/10"
            : "bg-black/98 backdrop-blur-md border-transparent"
        }`}
      >
        {/* --- LITE MODE BANNER --- */}
        <LiteModeBanner />

        {/* SWISS GRID LAYOUT (Main Nav) */}
        <div className="w-full h-16 md:h-20 flex items-stretch relative z-20">
          {/* 1. BRANDING (Left) */}
          <div className="flex items-center px-6 md:px-10 border-r border-white/5 bg-gradient-to-r from-black/20 to-transparent">
            <div
              onClick={handleLogoClick}
              className="relative z-50 cursor-pointer"
            >
              <Logo />
            </div>
          </div>

          {/* 2. NAVIGATION (Center - Centered) */}
          <div className="hidden xl:flex flex-1 items-center justify-center">
            <nav className="flex items-center gap-10">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group relative py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold uppercase tracking-[0.15em] transition-colors duration-300 ${
                          isActive
                            ? "text-white"
                            : "text-neutral-400 group-hover:text-neutral-300"
                        }`}
                      >
                        {link.label}
                      </span>
                    </div>

                    {/* Active Line Indicator */}
                    <span
                      className={`absolute bottom-0 left-0 h-[1px] bg-white transition-all duration-300 ease-out ${
                        isActive ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Spacer for Mobile */}
          <div className="xl:hidden flex-1" />

          {/* 3. ACTIONS (Right) */}
          <div className="flex items-center">
            {/* Search */}
            <div
              className="hidden md:flex items-center h-full px-6 border-l border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
              onClick={() => setIsQuickSearchOpen(true)}
            >
              <button className="flex items-center gap-3 text-neutral-400 group-hover:text-white transition-colors">
                <Search size={18} />
                <span className="text-xs font-bold uppercase tracking-wider hidden lg:block">
                  Search
                </span>
                <span className="text-[10px] font-mono border border-white/10 px-1.5 py-0.5 rounded-sm bg-white/5 text-neutral-500">
                  ⌘K
                </span>
              </button>
            </div>

            {/* Mobile Search Icon */}
            <button
              onClick={() => setIsQuickSearchOpen(true)}
              className="md:hidden flex items-center justify-center h-full w-14 border-l border-white/5 text-white hover:bg-white/5"
            >
              <Search size={20} />
            </button>

            {/* Favorites */}
            <div className="flex items-center justify-center h-full w-14 md:w-16 border-l border-white/5 hover:bg-white/5 transition-colors">
              <Link href="/favourites" className="text-white">
                <Heart
                  size={18}
                  className={`transition-transform duration-300 ${
                    pathname === "/favourites"
                      ? "fill-white"
                      : "hover:scale-110"
                  }`}
                />
              </Link>
            </div>

            {/* Settings */}
            <div className="flex items-center justify-center h-full w-14 md:w-16 border-l border-white/5 hover:bg-white/5 transition-colors">
              <Link href="/settings" className="text-white">
                <Settings
                  size={18}
                  className={`transition-all duration-300 ${
                    pathname === "/settings"
                      ? "rotate-90 text-indigo-400"
                      : "hover:rotate-45"
                  }`}
                />
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="xl:hidden flex items-center justify-center h-full w-16 border-l border-white/5">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white hover:rotate-90 transition-transform duration-300"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* --- ALTERNATE DOMAIN TICKER --- */}
        <AnimatePresence>
          {showDomainNotice && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full bg-white/[0.01] backdrop-blur-md border-t border-white/5 overflow-hidden relative z-10"
            >
              <div className="w-full px-4 h-8 flex items-center justify-between gap-4 text-[10px] tracking-wider font-mono text-neutral-400">
                <div className="flex-1 min-w-0 flex items-center gap-3 overflow-x-auto snap-x scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <div className="flex items-center gap-1.5 shrink-0 text-white/40">
                    <AlertCircle size={12} />
                    <span className="hidden sm:block">MIRRORS:</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {ALTERNATE_DOMAINS.map((domain) => (
                      <a
                        key={domain}
                        href={`https://${domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="snap-start shrink-0 text-neutral-400 hover:text-white transition-colors flex items-center gap-1"
                      >
                        {domain}
                      </a>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 pl-3 border-l border-white/5 bg-gradient-to-l from-transparent to-transparent">
                  <Link
                    href="/legal/domains"
                    className="text-white hover:underline uppercase font-bold tracking-normal"
                  >
                    <span className="hidden sm:inline">All Mirrors</span>
                    <span className="sm:hidden">More</span>
                  </Link>
                  <button
                    onClick={() => setShowDomainNotice(false)}
                    className="text-neutral-500 hover:text-white transition-colors"
                    aria-label="Dismiss notice"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- MOBILE MENU --- */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              // top-full forces it to attach perfectly below whichever banners are visible
              className="absolute top-full left-0 right-0 h-[100dvh] bg-neutral-950/95 backdrop-blur-xl border-t border-white/10"
            >
              {/* Added bottom padding (pb-[25vh]) so users can scroll down all the way to the footer */}
              <div className="flex flex-col h-full overflow-y-auto p-8 pb-[25vh]">
                <nav className="flex flex-col space-y-6">
                  {navLinks.map((item, i) => (
                    <motion.div
                      key={item.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="group flex items-center justify-between"
                      >
                        <span
                          className={`text-4xl font-black uppercase tracking-tighter transition-colors ${
                            pathname === item.href
                              ? "text-white"
                              : "text-transparent bg-clip-text bg-gradient-to-br from-neutral-400 to-neutral-700 group-hover:text-white"
                          }`}
                        >
                          {item.label}
                        </span>
                        <ArrowRight
                          size={24}
                          className="text-white opacity-0 group-hover:opacity-100 -rotate-45 group-hover:rotate-0 transition-all"
                        />
                      </Link>
                    </motion.div>
                  ))}
                </nav>

                <div className="mt-auto border-t border-white/5 pt-6">
                  <p className="text-[10px] text-neutral-500 font-mono uppercase">
                    © 2025 Crescent Moon.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {isQuickSearchOpen && (
        <QuickSearch
          open={isQuickSearchOpen}
          onOpenChange={setIsQuickSearchOpen}
        />
      )}
    </>
  );
};

export default Header;
