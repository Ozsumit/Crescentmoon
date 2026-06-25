"use client";
import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import useSettingsStore from "@/components/settings-store";
import { SITE_THEMES } from "@/lib/themes";

export default function ThemeWrapper({ children }) {
  const { accentColor, customCursor: showCustomCursor, siteTheme } = useSettingsStore();
  const cursorRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);
  const springConfig = { damping: 25, stiffness: 120 };
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);

    const handleMouseOver = (e) => {
      if (e.target.closest("a, button, .interactive-card")) setIsHovering(true);
      else setIsHovering(false);
    };
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, [cursorX, cursorY]);

  const currentTheme = SITE_THEMES[siteTheme] || SITE_THEMES.midnight;

  return (
    <div
      className={`relative min-h-screen transition-colors duration-700 ${currentTheme.type === 'dark' ? 'dark' : ''}`}
      style={{
        "--accent-color": accentColor,
        background: `hsl(${currentTheme.colors.background})`,
        color: `hsl(${currentTheme.colors.foreground})`
      }}
    >
      <style jsx global>{`
        :root {
          --background: ${currentTheme.colors.background};
          --foreground: ${currentTheme.colors.foreground};
          --card: ${currentTheme.colors.card};
          --card-foreground: ${currentTheme.colors.cardForeground};
          --popover: ${currentTheme.colors.popover};
          --popover-foreground: ${currentTheme.colors.popoverForeground};
          --primary: ${currentTheme.colors.primary};
          --primary-foreground: ${currentTheme.colors.primaryForeground};
          --secondary: ${currentTheme.colors.secondary};
          --secondary-foreground: ${currentTheme.colors.secondaryForeground};
          --muted: ${currentTheme.colors.muted};
          --muted-foreground: ${currentTheme.colors.mutedForeground};
          --accent: ${currentTheme.colors.accent};
          --accent-foreground: ${currentTheme.colors.accentForeground};
          --destructive: ${currentTheme.colors.destructive};
          --destructive-foreground: ${currentTheme.colors.destructiveForeground};
          --border: ${currentTheme.colors.border};
          --input: ${currentTheme.colors.input};
          --ring: ${currentTheme.colors.ring};
          --accent-custom: ${accentColor};
        }

        body {
          background-color: hsl(${currentTheme.colors.background}) !important;
          color: hsl(${currentTheme.colors.foreground}) !important;
        }

        .text-indigo-400 { color: var(--accent-custom) !important; }
        .text-indigo-500 { color: var(--accent-custom) !important; }
        .text-indigo-600 { color: var(--accent-custom) !important; }
        .bg-indigo-400 { background-color: var(--accent-custom) !important; }
        .bg-indigo-500 { background-color: var(--accent-custom) !important; }
        .bg-indigo-600 { background-color: var(--accent-custom) !important; }
        .border-indigo-400 { border-color: var(--accent-custom) !important; }
        .border-indigo-500 { border-color: var(--accent-custom) !important; }
        .border-indigo-600 { border-color: var(--accent-custom) !important; }
        .ring-indigo-500 { --tw-ring-color: var(--accent-custom) !important; }
        .shadow-indigo-600\/20 { --tw-shadow-color: color-mix(in srgb, var(--accent-custom), transparent 80%) !important; }

        /* Smooth transition for theme variables */
        * {
          transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
        }
      `}</style>
      {/* Custom Cursor */}
      <AnimatePresence>
        {showCustomCursor && (
          <motion.div
        ref={cursorRef}
        className="hidden md:flex fixed top-0 left-0 z-50 pointer-events-none items-center justify-center"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <motion.div
          animate={{
            scale: isHovering ? 1 : 0.5,
            width: isHovering ? "3rem" : "1rem",
            height: isHovering ? "3rem" : "1rem",
            border: isHovering
              ? "1px solid rgba(0,0,0,0.2)"
              : "0px solid transparent",
            backgroundColor: isHovering ? "transparent" : "black",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="rounded-full flex items-center justify-center"
        >
            <motion.div
              animate={{ opacity: isHovering ? 1 : 0 }}
              className="w-1 h-1 bg-black rounded-full"
            />
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>

      {children}
    </div>
  );
}

export function PageContainer({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="container mx-auto px-6 py-24 relative z-10"
    >
      {children}
    </motion.div>
  );
}
