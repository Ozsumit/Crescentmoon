import Link from "next/link";
import React from "react";

const Logo = () => {
  return (
    <Link
      href="/"
      className="inline-flex items-center text-[2rem] font-bold tracking-tight transition-colors duration-200 hover:opacity-80"
      aria-label="Cineworld Home"
    >
      <span className="bg-gradient-to-r mr-2 from-indigo-500 to-purple-600 text-transparent bg-clip-text">
        Crescent{" "}
      </span>
      <span className="text-gray-800 font-mono dark:text-gray-200"> Moon</span>
    </Link>
  );
};

export default Logo;
