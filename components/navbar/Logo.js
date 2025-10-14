import Link from "next/link";
import React from "react";
import { Metal_Mania } from "next/font/google";

const metalMania = Metal_Mania({
  weight: "400",
  subsets: ["latin"],
  preload: true,
});

const Logo = () => {
  return (
    <Link
      href="/"
      className="inline-flex items-center text-2xl sm:text-4xl md:text-[3rem] font-bold tracking-tight transition-colors duration-200 hover:opacity-80"
      aria-label="Crescent Moon Home"
    >
      <span className="flex items-baseline">
        <span
          className={`${metalMania.className} text-gray-200 dark:text-gray-200`}
        >
          Crescent Moon
        </span>
      </span>
    </Link>
  );
};

export default Logo;
