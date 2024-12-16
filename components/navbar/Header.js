"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Home, Film, Tv, Search, Heart, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [lastInteractionTime, setLastInteractionTime] = useState(Date.now());

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
      if (currentTime - lastInteractionTime > 5000) {
        setIsNavbarVisible(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lastInteractionTime]);

  const navLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/movie", label: "Movies", icon: Film },
    { href: "/series", label: "TV", icon: Tv },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    resetInteractionTimer();
  };

  return (
    <motion.nav
      initial={{ y: 0 }}
      animate={{ y: isNavbarVisible ? 0 : "-100%" }}
      transition={{ type: "tween", duration: 0.3 }}
      onHoverStart={resetInteractionTimer}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isMobileMenuOpen
          ? "bg-gray-800/90 backdrop-blur-md shadow-lg border-gray-700"
          : `rounded-b-xl ${
              isScrolled
                ? "bg-gray-800/70 backdrop-blur-xl shadow-2xl"
                : "bg-gradient-to-b from-gray-800/50 to-transparent"
            }`
      }`}
      style={{
        WebkitBackdropFilter: "blur(10px)",
        backdropFilter: "blur(10px)",
      }}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <motion.div
                key={link.href}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={link.href}
                  className="group flex items-center space-x-2 text-white/80 hover:text-white transition-colors"
                  onClick={resetInteractionTimer}
                >
                  <link.icon
                    size={20}
                    className="group-hover:text-indigo-400 transition-colors"
                  />
                  <span className="font-medium group-hover:text-indigo-400">
                    {link.label}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Link
                href="/search"
                className="text-white/80 hover:text-white transition-colors"
                onClick={resetInteractionTimer}
              >
                <Search size={22} />
              </Link>
            </motion.div>

            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Link
                href="/favourites"
                className="text-white/80 hover:text-white transition-colors"
                onClick={resetInteractionTimer}
              >
                <Heart size={22} />
              </Link>
            </motion.div>

            {/* Mobile Menu Toggle */}
            <motion.button
              onClick={toggleMobileMenu}
              className="lg:hidden text-white/80 hover:text-white"
              whileTap={{ scale: 0.9 }}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ type: "tween" }}
            className="lg:hidden absolute top-16 sm:top-20 left-0 right-0 bg-gray-800/95 backdrop-blur-2xl shadow-2xl rounded-b-xl border-gray-700"
          >
            <div className="px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
              {navLinks.map((link) => (
                <motion.div
                  key={link.href}
                  whileHover={{ x: 10 }}
                  whileTap={{ scale: 0.95 }}
                  className="group"
                >
                  <Link
                    href={link.href}
                    onClick={toggleMobileMenu}
                    className="flex items-center space-x-4 text-white/80 hover:text-white text-base sm:text-lg border-b border-white/10 pb-3 sm:pb-4 last:border-b-0 transition-colors"
                  >
                    <link.icon
                      size={20}
                      className="text-indigo-400 group-hover:text-indigo-400"
                    />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Header;
