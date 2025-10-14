// Header.jsx
"use client";
import {
  Home,
  Film,
  Tv,
  Search,
  Heart,
  JapaneseYen,
  Menu,
  X,
  Download,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";
import QuickSearch from "../searchbar";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());
  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);

  // Debounce function to reset interaction timer
  const resetInteractionTimer = useCallback(() => {
    setLastInteractionTime(Date.now());
    setIsNavbarVisible(true);
  }, []);

  // Effect for scroll event
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      resetInteractionTimer();
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [resetInteractionTimer]);

  // Effect for mouse movement and keyboard interaction
  useEffect(() => {
    const handleMouseMove = () => resetInteractionTimer();
    const handleKeyPress = () => resetInteractionTimer();

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keypress", handleKeyPress);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keypress", handleKeyPress);
    };
  }, [resetInteractionTimer]);

  // Effect to hide navbar after 5 seconds of inactivity
  useEffect(() => {
    const timer = setInterval(() => {
      const currentTime = Date.now();
      if (currentTime - lastInteractionTime > 15000) {
        setIsNavbarVisible(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lastInteractionTime]);

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/movie", label: "Movies", icon: Film },
    { href: "/series", label: "TV", icon: Tv },
    {
      href: "https://omega-v1.vercel.app/",
      label: "Anime(α)",
      icon: JapaneseYen,
    },
  ];

  const mobileNavItems = [...navLinks];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    resetInteractionTimer();
  };

  const handleDownload = () => {
    window.location.href =
      "https://github.com/Ozsumit/Crescentmoon/releases/download/release-1/CrescentMoon.0.1.0.exe";
    console.log("Download button clicked");
    resetInteractionTimer();
  };

  return (
    <>
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: isNavbarVisible ? 0 : "-100%" }}
        transition={{ type: "tween", duration: 0.3 }}
        onHoverStart={resetInteractionTimer}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isMobileMenuOpen
            ? "bg-[#00010104] backdrop-blur-md shadow-2xl"
            : isScrolled
            ? "bg-[#1e1d1d64] backdrop-blur-xl shadow-2xl"
            : "bg-gradient-to-b from-[#1e1d1d64] to-transparent"
        }`}
        style={{
          WebkitBackdropFilter: "blur(12px)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className=" mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex-shrink-0 z-10">
              <Logo />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <motion.div
                  key={link.href}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    href={link.href}
                    className="group flex items-center space-x-2 text-white/80 hover:text-white transition-all duration-200"
                    onClick={resetInteractionTimer}
                  >
                    <link.icon
                      size={18}
                      className="group-hover:text-indigo-400 transition-colors duration-200"
                    />
                    <span className="font-medium text-sm group-hover:text-indigo-400 transition-colors duration-200">
                      {link.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Desktop Search Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="hidden lg:block"
              >
                <button
                  onClick={() => setIsQuickSearchOpen(true)}
                  aria-haspopup="dialog"
                  aria-label="Search (Ctrl+K)"
                  title="Search (Ctrl+K)"
                  className="flex items-center justify-between gap-3 px-3 py-2  hover:bg-slate-700/80 transition-all duration-200 rounded-lg border border-slate-400 hover:border-slate-500 text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <div className="flex items-center gap-2">
                    <Search size={16} />
                    <span className="text-sm font-medium"> Quick Search</span>
                  </div>
                  <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-slate-600 px-1.5 font-mono text-[10px] font-medium text-slate-400">
                    ⌘+K
                  </kbd>
                </button>
              </motion.div>

              {/* Mobile Search Icon */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsQuickSearchOpen(true)}
                className="lg:hidden p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                title="Search"
                aria-label="Search"
              >
                <Search size={20} />
              </motion.button>

              {/* Favourites button */}
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link
                  href="/favourites"
                  className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200 block"
                  onClick={resetInteractionTimer}
                  title="Favourites"
                  aria-label="Favourites"
                >
                  <Heart size={20} />
                </Link>
              </motion.div>

              {/* Download button - Desktop only */}
              {/* <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="hidden sm:block"
              >
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-3 py-2 bg-green-600/80 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                  title="Download App"
                >
                  <Download size={16} />
                  <span className="hidden md:inline">Download</span>
                </button>
              </motion.div> */}

              {/* Mobile Menu Toggle */}
              <motion.button
                onClick={toggleMobileMenu}
                className="lg:hidden p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                whileTap={{ scale: 0.9 }}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ type: "tween", duration: 0.2 }}
              className="lg:hidden border-t border-white/10 bg-gray-900/95 backdrop-blur-xl"
            >
              <div className="px-4 py-6 space-y-1">
                {mobileNavItems.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 8 }}
                    whileTap={{ scale: 0.95 }}
                    className="group"
                  >
                    <Link
                      href={item.href}
                      onClick={toggleMobileMenu}
                      className="flex items-center space-x-3 text-white/80 hover:text-white hover:bg-white/10 text-base font-medium py-3 px-3 rounded-lg transition-all duration-200"
                    >
                      <item.icon
                        size={20}
                        className="text-indigo-400 group-hover:text-indigo-300 transition-colors duration-200"
                      />
                      <span>{item.label}</span>
                    </Link>
                  </motion.div>
                ))}

                {/* Mobile Download Button */}
                {/* <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: mobileNavItems.length * 0.1 }}
                  whileHover={{ x: 8 }}
                  whileTap={{ scale: 0.95 }}
                  className="group pt-2 border-t border-white/10"
                >
                  <button
                    onClick={() => {
                      handleDownload();
                      toggleMobileMenu();
                    }}
                    className="flex items-center space-x-3 text-white/80 hover:text-white hover:bg-green-600/20 text-base font-medium py-3 px-3 rounded-lg transition-all duration-200 w-full"
                  >
                    <Download
                      size={20}
                      className="text-green-400 group-hover:text-green-300 transition-colors duration-200"
                    />
                    <span>Download App</span>
                  </button>
                </motion.div> */}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Render the QuickSearch component */}
      <QuickSearch
        open={isQuickSearchOpen}
        onOpenChange={setIsQuickSearchOpen}
      />
    </>
  );
};

export default Header;
