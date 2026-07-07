"use client";

import Link from "next/link";
import Image from "next/image";
import useSettingsStore from "@/components/settings-store";
import { SITE_THEMES } from "@/lib/themes";

const Logo = () => {
  const { siteTheme } = useSettingsStore();
  const currentTheme = SITE_THEMES[siteTheme] || SITE_THEMES.midnight;

  return (
    <Link
      href="/"
      className="group flex items-center gap-2 select-none"
      aria-label="Crescent Moon Home"
    >
      <div className="relative flex items-end justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-transparent text-foreground transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
        <Image
          src={currentTheme.type === "light" ? "/logo-dark.svg" : "/logo.svg"}
          alt="Crescent Moon Logo"
          width={100}
          height={100}
          priority
        />

        <div className="absolute inset-0 bg-primary blur-lg opacity-20 group-hover:opacity-30 transition-opacity" />
      </div>

      <div className="flex flex-col justify-center leading-none font-display">
        <span className="text-lg md:text-2xl font-bold tracking-tighter text-foreground uppercase group-hover:tracking-normal transition-all duration-500">
          Crescent
        </span>
        <span className="text-[10px] md:text-xs font-light tracking-[0.2em] text-muted-foreground uppercase group-hover:text-foreground transition-colors duration-300">
          Moon
        </span>
      </div>
    </Link>
  );
};

export default Logo;
