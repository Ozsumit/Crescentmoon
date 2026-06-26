"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function LiteModeBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const [liteUrl, setLiteUrl] = useState("https://cmoonlite.sumit.info.np");

  useEffect(() => {
    // Dynamically capture the pathname and query parameters on the client
    const currentPath = window.location.pathname + window.location.search;
    setLiteUrl(`https://cmoonlite.sumit.info.np${currentPath}`);
  }, [pathname]);

  useEffect(() => {
    // Check if the user has previously dismissed the banner
    const isDismissed = localStorage.getItem("lite-banner-dismissed");
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("lite-banner-dismissed", "true");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="bg-amber-500/10  border-amber-500/20  sticky top-0 left-0 right-0 z-[101] border-b transition-all duration-300   text-amber-200/90 text-xs md:text-sm py-2 px-4 flex justify-between items-center gap-2">
      <div className="w-full text-center">
        <span>Page lagging too much? </span>
        <a
          href={liteUrl}
          className="underline font-semibold hover:text-amber-100 transition-colors ml-1"
        >
          Switch to Lite Mode
        </a>
      </div>
      <button
        onClick={handleDismiss}
        className="text-amber-400 hover:text-amber-200 focus:outline-none px-1"
        aria-label="Dismiss banner"
      >
        ✕
      </button>
    </div>
  );
}
