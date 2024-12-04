"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Home,
  Film,
  Tv,
  Search,
  Menu,
  Bell,
  User,
  X,
  Clapperboard,
  ListFilter,
  Heart,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "./Logo";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleNavbar = () => {
    setIsOpen(!isOpen);
  };

  const navLinks = [
    {
      href: "/",
      label: "Home",
      icon: Home,
    },
    {
      href: "/movie",
      label: "Movies",
      icon: Film,
    },
    {
      href: "/series",
      label: "TV Series",
      icon: Tv,
    },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-black/80 backdrop-blur-xl shadow-2xl"
          : "bg-gradient-to-b from-black/80 to-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Logo />
            {/* <span className="text-white text-xl font-bold tracking-wider">CinemaFlow</span> */}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            {navLinks.map((link) => (
              <div
                key={link.href}
                className="relative group"
                onMouseEnter={() => setActiveDropdown(link.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={link.href}
                  className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors group"
                >
                  <link.icon size={20} />
                  <span className="font-medium">{link.label}</span>
                </Link>

                {/* Dropdown */}
              </div>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <Link
              href="/search"
              className="text-white hover:text-gray-300 transition-colors"
            >
              <Search size={24} />
            </Link>

            {/* Notifications */}
            {/* <button className="text-white hover:text-gray-300 transition-colors relative">
              <Bell size={24} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                3
              </span>
            </button> */}

            {/* Profile */}
            <Link
              href="/favourites"
              className="text-white hover:text-gray-300 transition-colors"
            >
              <Heart size={24} />
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleNavbar}
              className="lg:hidden text-white focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-20 left-0 right-0 bg-black/95 backdrop-blur-xl"
          >
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <div key={link.href} className="border-b border-white/10 pb-4">
                  <div className="flex items-center justify-between">
                    <Link
                      href={link.href}
                      onClick={toggleNavbar}
                      className="flex items-center space-x-3 text-white text-lg"
                    >
                      <link.icon size={24} />
                      <span>{link.label}</span>
                    </Link>
                    <ListFilter size={20} className="text-white/50" />
                  </div>

                  <div className="mt-3 space-y-2">
                    {link.dropdown.map((dropItem) => (
                      <Link
                        key={dropItem.href}
                        href={dropItem.href}
                        onClick={toggleNavbar}
                        className="block pl-10 py-2 text-white/80 hover:bg-white/10 rounded-md transition-colors"
                      >
                        {dropItem.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Header;
