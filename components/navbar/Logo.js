import Link from "next/link";
import React from "react";
import { Space_Grotesk } from "next/font/google"; // Swiss-style geometric sans
import { Moon } from "lucide-react";

const spaceGrotesk = Space_Grotesk({
  weight: ["300", "700"], // Mixing weights is very Swiss
  subsets: ["latin"],
  preload: true,
});

const Logo = () => {
  return (
    <Link
      href="/"
      className="group flex items-center gap-2 select-none"
      aria-label="Crescent Moon Home"
    >
      {/* Icon Container - Material Surface Style */}
      <div className="relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full bg-white text-black transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
        <Moon
          size={20}
          fill="currentColor"
          className="md:w-6 md:h-6"
          strokeWidth={0}
        />
        {/* Decorative blur for glow effect */}
        <div className="absolute inset-0 bg-white blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
      </div>

      {/* Typography - Swiss Style (Tight tracking, mixed weights, uppercase) */}
      <div
        className={`${spaceGrotesk.className} flex flex-col justify-center leading-none`}
      >
        <span className="text-lg md:text-2xl font-bold tracking-tighter text-white uppercase group-hover:tracking-widest transition-all duration-500">
          Crescent
        </span>
        <span className="text-[10px] md:text-xs font-light tracking-[0.2em] text-neutral-400 uppercase group-hover:text-white transition-colors duration-300">
          Moon
        </span>
      </div>
    </Link>
  );
};

export default Logo;
