import Link from "next/link";
import React from "react";

const Logo = () => {
  return (
    <Link
      href="/"
      className="inline-flex items-center text-xl sm:text-2xl md:text-[2rem] font-bold tracking-tight transition-colors duration-200 hover:opacity-80"
      aria-label="Cineworld Home"
    >
      <span className="flex items-baseline">
        <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-transparent bg-clip-text text-3xl sm:text-4xl mr-0">
          C
        </span>
        <span className="text-gray-200 dark:text-gray-200">rescent</span>
      </span>
      <span className="ml-2 flex items-baseline">
        <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-transparent bg-clip-text text-3xl sm:text-4xl mr-0">
          M
        </span>
        <span className="text-gray-200 dark:text-gray-200">oon</span>
      </span>
    </Link>
  );
};

export default Logo;
