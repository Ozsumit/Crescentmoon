"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import LiteModeBanner from "@/components/litemodebanner";
import SettingsModal from "@/components/settingsmodal";

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
  // const [isSettingsOpen, setIsSettingsOpen] = useState(false); // <--- POPUP STATE
  const [showDomainNotice, setShowDomainNotice] = useState(true);

  const pathname = usePathname();
  const lastScrollY = useRef(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // --- HIGH PERFORMANCE SCROLL LISTENER ---
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const latest = window.scrollY;
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
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobileMenuOpen]);

  // Lock scroll when mobile menu or settings popup is active
  useEffect(() => {
    document.body.style.overflow =
      isMobileMenuOpen || isSettingsOpen ? "hidden" : "unset";
  }, [isMobileMenuOpen, isSettingsOpen]);

  // Key Listeners (⌘K for Search, Escape for Settings)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsQuickSearchOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsSettingsOpen(false);
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
      <header
        className={`fixed top-0 left-0 right-0 z-[100] border-b transition-all duration-300 ease-out flex flex-col ${
          isHidden ? "-translate-y-full" : "translate-y-0"
        } ${
          isScrolled || isMobileMenuOpen
            ? "bg-background/80 backdrop-blur-md border-border"
            : "bg-background/95 backdrop-blur-md border-transparent"
        }`}
      >
        {/* --- LITE MODE BANNER --- */}
        <LiteModeBanner />

        {/* SWISS GRID LAYOUT (Main Nav) */}
        <div className="w-full h-16 md:h-20 flex items-stretch relative z-20">
          {/* 1. BRANDING (Left) */}
          <div className="flex items-center px-6 md:px-10 border-r border-border bg-gradient-to-r from-foreground/5 to-transparent">
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
                            ? "text-foreground"
                            : "text-muted-foreground group-hover:text-foreground"
                        }`}
                      >
                        {link.label}
                      </span>
                    </div>

                    {/* Active Line Indicator */}
                    <span
                      className={`absolute bottom-0 left-0 h-[2px] bg-primary transition-all duration-300 ease-out ${
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
              className="hidden md:flex items-center h-full px-6 border-l border-border hover:bg-accent transition-colors cursor-pointer"
              onClick={() => setIsQuickSearchOpen(true)}
            >
              <button className="flex items-center gap-3 text-muted-foreground group-hover:text-foreground transition-colors">
                <Search size={18} />
                <span className="text-xs font-bold uppercase tracking-wider hidden lg:block">
                  Search
                </span>
                <span className="text-[10px] font-mono border border-border px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground">
                  ⌘K
                </span>
              </button>
            </div>

            {/* Mobile Search Icon */}
            <button
              onClick={() => setIsQuickSearchOpen(true)}
              className="md:hidden flex items-center justify-center h-full w-14 border-l border-border text-foreground hover:bg-accent"
            >
              <Search size={20} />
            </button>

            {/* Favorites */}
            <div className="flex items-center justify-center h-full w-14 md:w-16 border-l border-border hover:bg-accent transition-colors">
              <Link href="/favourites" className="text-foreground">
                <Heart
                  size={18}
                  className={`transition-transform duration-300 ${
                    pathname === "/favourites"
                      ? "fill-foreground"
                      : "hover:scale-110"
                  }`}
                />
              </Link>
            </div>

            {/* Settings (CONVERTED TO MODAL TRIGGER) */}
            <div className="flex items-center justify-center h-full w-14 md:w-16 border-l border-border hover:bg-accent transition-colors">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="text-foreground focus:outline-none"
                aria-label="Open Settings"
              >
                <Settings
                  size={18}
                  className={`transition-all duration-300 ${
                    isSettingsOpen
                      ? "rotate-90 text-primary"
                      : "hover:rotate-45"
                  }`}
                />
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="xl:hidden flex items-center justify-center h-full w-16 border-l border-border">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-foreground hover:rotate-90 transition-transform duration-300"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* --- MOBILE MENU --- */}
        {isMobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 h-[100dvh] bg-background/95 backdrop-blur-xl border-t border-border transition-opacity duration-300">
            <div className="flex flex-col h-full overflow-y-auto p-8 pb-[25vh]">
              <nav className="flex flex-col space-y-6">
                {navLinks.map((item, i) => (
                  <div
                    key={item.label}
                    className="animate-in fade-in slide-in-from-left-4 duration-300"
                    style={{
                      animationFillMode: "both",
                      animationDelay: `${i * 50}ms`,
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="group flex items-center justify-between"
                    >
                      <span
                        className={`text-4xl font-black uppercase tracking-tighter transition-colors ${
                          pathname === item.href
                            ? "text-foreground"
                            : "text-transparent bg-clip-text bg-gradient-to-br from-muted-foreground to-foreground/50 group-hover:text-foreground"
                        }`}
                      >
                        {item.label}
                      </span>
                      <ArrowRight
                        size={24}
                        className="text-foreground opacity-0 group-hover:opacity-100 -rotate-45 group-hover:rotate-0 transition-all"
                      />
                    </Link>
                  </div>
                ))}
              </nav>

              <div className="mt-auto border-t border-border pt-6">
                <p className="text-[10px] text-muted-foreground font-mono uppercase">
                  © 2025 Crescent Moon.
                </p>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* --- QUICK SEARCH MODAL --- */}
      {isQuickSearchOpen && (
        <QuickSearch
          open={isQuickSearchOpen}
          onOpenChange={setIsQuickSearchOpen}
        />
      )}

      {/* --- SETTINGS POPUP MODAL --- */}
      {isSettingsOpen && (
        <div
          className="fixed inset-0 z-[150] flex items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setIsSettingsOpen(false)}
        >
          <div
            className="relative w-full max-w-lg mx-4 bg-background border border-border rounded-lg shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
              <div className="flex items-center gap-2">
                <Settings className="text-primary" size={20} />
                <h2 className="text-lg font-bold uppercase tracking-wider text-foreground">
                  Settings
                </h2>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close Settings"
              >
                <X size={20} />
              </button>
              <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
              />
            </div>

            {/* Modal Body / Settings Content */}

            {/* Modal Footer */}
            <div className="mt-8 pt-4 border-t border-border flex justify-end">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
