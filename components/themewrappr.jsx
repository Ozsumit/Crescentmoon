"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import useSettingsStore from "@/components/settings-store";
import { SITE_THEMES } from "@/lib/themes";

export default function ThemeWrapper({ children }) {
  const {
    accentColor,
    customCursor: showCustomCursor,
    siteTheme,
    customTheme,
  } = useSettingsStore();
  const [isHovering, setIsHovering] = useState(false);

  const isCustom = siteTheme === "custom";
  const currentTheme = isCustom
    ? {
        name: "Custom",
        type: "dark", // Always treat custom as dark for simplicity in logic, or detect luminance
        colors: {
          ...SITE_THEMES.midnight.colors,
          ...customTheme,
        },
      }
    : SITE_THEMES[siteTheme] || SITE_THEMES.midnight;

  // Track hover states for interactive targets
  useEffect(() => {
    if (!showCustomCursor) return;

    const handleMouseOver = (e) => {
      const target = e.target;
      if (
        target.closest(
          "a, button, .interactive-card, select, input, textarea, [role='button'], [type='submit']",
        )
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mouseover", handleMouseOver);
    return () => window.removeEventListener("mouseover", handleMouseOver);
  }, [showCustomCursor]);

  // Clean fallback mapping for colors inside raw SVG strings
  const primaryColor = `hsl(${currentTheme.colors.primary})`;
  const accentColorValue = accentColor || `hsl(${currentTheme.colors.accent})`;

  // 1. Raw SVG structures
  const rawNormalSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="10" stroke="${accentColorValue}" stroke-dasharray="3 2" stroke-opacity="0.6" stroke-width="1.5"/>
      <circle cx="16" cy="16" r="14" stroke="${accentColorValue}" stroke-opacity="0.15" stroke-width="1"/>
      <circle cx="16" cy="16" r="3" fill="${accentColorValue}"/>
    </svg>
  `.trim();

  const rawHoverSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="5" stroke="${primaryColor}" stroke-dasharray="1 1" stroke-width="1.5"/>
      <circle cx="16" cy="16" r="15" stroke="${primaryColor}" stroke-opacity="0.5" stroke-width="1"/>
      <circle cx="16" cy="16" r="4.5" fill="${primaryColor}"/>
    </svg>
  `.trim();

  // 2. Strict URL Encoding to prevent browser parsing rejections
  const normalCursorDataUri = `data:image/svg+xml,${encodeURIComponent(rawNormalSvg)}`;
  const hoverCursorDataUri = `data:image/svg+xml,${encodeURIComponent(rawHoverSvg)}`;

  return (
    <div
      className={`relative min-h-screen transition-colors duration-700 ${currentTheme.type === "dark" ? "dark" : ""}`}
      style={{
        "--accent-color": accentColor,
        background: `hsl(${currentTheme.colors.background})`,
        color: `hsl(${currentTheme.colors.foreground})`,
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
          --destructive-foreground: ${currentTheme.colors
            .destructiveForeground};
          --border: ${currentTheme.colors.border};
          --input: ${currentTheme.colors.input};
          --ring: ${currentTheme.colors.ring};
          --accent-custom: ${accentColor};
          --radius: 1.5rem;
        }

        /* 3. HARDWARE-LEVEL CURSOR REPLACEMENT OVERRIDES */
        ${showCustomCursor
          ? `
          @media (min-width: 768px) {
            /* Force replacement on the root document level down to all children */
            html, body, #__next, main, div, p, span, section, h1, h2, h3, h4, h5, h6 {
              cursor: url("${normalCursorDataUri}") 16 16, auto !important;
            }
            
            /* Handle Interactive states comprehensively */
            a, button, select, input, textarea, [role='button'], .interactive-card,
            a *, button *, select *, input *, textarea *, [role='button'] *, .interactive-card * {
              cursor: url("${hoverCursorDataUri}") 16 16, pointer !important;
            }
          }
        `
          : ""}

        body {
          background-color: hsl(${currentTheme.colors.background}) !important;
          color: hsl(${currentTheme.colors.foreground}) !important;
          transition:
            background-color 0.5s ease,
            color 0.5s ease;
        }

        .text-indigo-400,
        .text-indigo-500,
        .text-indigo-600 {
          color: var(--accent-custom) !important;
        }
        .bg-indigo-400,
        .bg-indigo-500,
        .bg-indigo-600 {
          background-color: var(--accent-custom) !important;
        }
        .border-indigo-400,
        .border-indigo-500,
        .border-indigo-600 {
          border-color: var(--accent-custom) !important;
        }
        .ring-indigo-500 {
          --tw-ring-color: var(--accent-custom) !important;
        }

        .shadow-indigo-600\/20 {
          --tw-shadow-color: color-mix(
            in srgb,
            var(--accent-custom),
            transparent 80%
          ) !important;
        }

        .bg-card {
          background-color: hsl(var(--card)) !important;
        }
        .text-card-foreground {
          color: hsl(var(--card-foreground)) !important;
        }
        .border-theme {
          border-color: hsl(var(--border)) !important;
        }

        body,
        .bg-card,
        .text-card-foreground,
        .border-theme,
        .text-foreground,
        .bg-background {
          transition:
            background-color 0.3s ease,
            border-color 0.3s ease,
            color 0.3s ease,
            box-shadow 0.3s ease;
        }
      `}</style>

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
