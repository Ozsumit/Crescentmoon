"use client";
import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import useSettingsStore from "@/components/settings-store";

export default function ThemeWrapper({ children }) {
  const { accentColor, customCursor: showCustomCursor } = useSettingsStore();
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

  return (
    <div
      className="relative min-h-screen bg-[#F9F9F9] text-neutral-900 overflow-hidden font-sans selection:bg-neutral-200 selection:text-black"
      style={{ "--accent-color": accentColor }}
    >
      <style jsx global>{`
        :root {
          --accent: ${accentColor};
        }
        .text-indigo-400 { color: ${accentColor} !important; }
        .text-indigo-600 { color: ${accentColor} !important; }
        .bg-indigo-400 { background-color: ${accentColor} !important; }
        .bg-indigo-500 { background-color: ${accentColor} !important; }
        .bg-indigo-600 { background-color: ${accentColor} !important; }
        .border-indigo-400 { border-color: ${accentColor} !important; }
        .border-indigo-500 { border-color: ${accentColor} !important; }
        .border-indigo-600 { border-color: ${accentColor} !important; }
        .ring-indigo-500 { --tw-ring-color: ${accentColor} !important; }
        .shadow-indigo-600\/20 { --tw-shadow-color: ${accentColor}33 !important; }
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

      {/* Page Content with Fade In */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="container mx-auto px-6 py-24 relative z-10"
      >
        {children}
      </motion.div>
    </div>
  );
}
