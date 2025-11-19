import Link from "next/link";
import React from "react";
import {
  Metal_Mania,
  Mountains_of_Christmas,
  Festive,
  Henny_Penny,
} from "next/font/google";

const metalMania = Metal_Mania({
  weight: "400",
  subsets: ["latin"],
  preload: true,
});
const henny_penny = Henny_Penny({
  weight: "400",
  subsets: ["latin"],
  preload: true,
});

const mountainsOfChristmas = Mountains_of_Christmas({
  weight: "700",
  subsets: ["latin"],
  preload: true,
});

const festive = Festive({
  weight: "400",
  subsets: ["latin"],
  preload: true,
});

const Logo = () => {
  return (
    <Link
      href="/"
      className="inline-flex items-center text-2xl sm:text-4xl md:text-[3rem] font-bold tracking-tight transition-colors duration-200 hover:opacity-80"
      aria-label="Jingle Bells Home"
    >
      <span className="flex items-baseline">
        <span
          className={`${henny_penny.className} text-red-600 dark:text-red-500`}
        >
          Crescent
        </span>
        <span
          className={`${festive.className} text-green-600 dark:text-green-500 ml-2`}
        >
          Moon
        </span>
      </span>
    </Link>
  );
};

export default Logo;
