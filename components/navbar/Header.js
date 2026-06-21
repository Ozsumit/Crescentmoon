"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
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
  AlertCircle, // Imported for the notice layout
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
        className={`fixed top-0 left-0 right-0 z-[100] border-b transition-all duration-300 ${
          isScrolled
            ? "bg-neutral-950/80 backdrop-blur-md border-white/10"
            : "bg-black/98 backdrop-blur-md border-transparent"
        }`}
      >
        {/* --- ALTERNATE DOMAIN NOTICE TOP BANNER --- */}
        <AnimatePresence>
          {showDomainNotice && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-neutral-900 border-b border-white/5 overflow-hidden"
            >
              <div className="w-full max-w-[1400px] mx-auto px-6 h-9 flex items-center justify-between text-[11px] tracking-wider font-mono text-neutral-400">
                <div className="flex items-center gap-2 mx-auto sm:mx-0">
                  <AlertCircle
                    size={12}
                    className="text-neutral-500 animate-pulse"
                  />
                  <span>
                    NOTICE:{" "}
                    <span className="text-neutral-200">
                      Bookmark our alternate domains
                    </span>{" "}
                    if main site gets down temporarily.
                  </span>
                </div>
                {/* Optional Actionable Links & Close Button */}
                <div className="hidden sm:flex items-center gap-4">
                  <Link
                    href="/legal/domains"
                    className="text-white hover:underline flex items-center gap-1 font-bold text-[10px] uppercase"
                  >
                    View Mirrors <ExternalLink size={10} />
                  </Link>
                  <button
                    onClick={() => setShowDomainNotice(false)}
                    className="text-neutral-500 hover:text-white transition-colors ml-2"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* SWISS GRID LAYOUT */}
        <div className="w-full h-16 md:h-20 flex items-stretch">
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

        {/* --- MOBILE MENU --- */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "circOut" }}
              className="fixed inset-0 top-[64px] z-40 bg-neutral-950/95 backdrop-blur-xl border-t border-white/10"
            >
              <div className="flex flex-col h-full p-8">
                <span className="text-[10px] font-mono text-neutral-600 mb-8 block border-b border-white/5 pb-4">
                  DIRECTORY_01
                </span>

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
