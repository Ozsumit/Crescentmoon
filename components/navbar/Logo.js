import Link from "next/link";
import React from "react";
import { Space_Grotesk } from "next/font/google"; // Swiss-style geometric sans
import { Moon } from "lucide-react";
import Image from "next/image";

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
      <div className="relative flex items-bottom justify-center w-10 h-10 md:w-12 md:h-12 rounded-full bg-transparent text-black transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">
        <Image src="/logo.svg" alt="alt" width={100} height={100} />
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
