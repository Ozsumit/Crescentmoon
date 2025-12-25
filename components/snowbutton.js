"use client";

import { useState, useEffect } from "react";
import Snowfall from "react-snowfall";

export default function SnowButton() {
  const [isSnowing, setIsSnowing] = useState(false);
  // Initialize with 0 to prevent SSR mismatch, will populate on mount
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Function to capture the exact screen size
    const handleResize = () => {
      // We use window.innerHeight initially, but we can also use window.screen.height
      // to ensure we cover the full area even if the bar collapses.
      // However, innerHeight is safer for desktop compatibility.
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // 1. Set initial size
    handleResize();

    // 2. Create a smart listener that IGNORES vertical scrolls
    let lastWidth = window.innerWidth;

    const handleSmartResize = () => {
      const currentWidth = window.innerWidth;
      // CRITICAL FIX: Only update if width changes (e.g. rotating phone).
      // If only height changes, it's just the address bar moving—IGNORE IT.
      if (currentWidth !== lastWidth) {
        lastWidth = currentWidth;
        handleResize();
      }
    };

    window.addEventListener("resize", handleSmartResize);
    return () => window.removeEventListener("resize", handleSmartResize);
  }, []);

  return (
    <>
      {isSnowing && windowSize.width > 0 && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none",
            zIndex: 9999,
          }}
        >
          {/* 
            By passing explicit width/height props here, we prevent 
            the library from calculating its own size and resetting 
            during a scroll event.
          */}
          <Snowfall
            snowflakeCount={150}
            width={windowSize.width}
            height={windowSize.height}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
            }}
          />
        </div>
      )}

      {/* Swiss Style Toggle Button */}
      <button
        onClick={() => setIsSnowing(!isSnowing)}
        className={`
          fixed bottom-10 right-10 z-50 
          flex items-center gap-3 px-6 py-3.5
          rounded-full 
          font-sans font-bold tracking-tight text-sm
          transition-all duration-300 ease-out
          group
          ${
            isSnowing
              ? "bg-neutral-900 text-white shadow-xl hover:bg-neutral-800"
              : "bg-white text-neutral-900 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)]"
          }
          hover:scale-[1.02] active:scale-95
        `}
        aria-label="Toggle Snow"
      >
        <span
          className={`
            w-2 h-2 rounded-full transition-colors duration-300
            ${
              isSnowing
                ? "bg-red-500 animate-pulse"
                : "bg-neutral-300 group-hover:bg-neutral-900"
            }
          `}
        />
        <span>{isSnowing ? "Stop Snow" : "Let it Snow"}</span>
        <span className="text-base leading-none">{isSnowing ? "×" : "❄"}</span>
      </button>
    </>
  );
}
