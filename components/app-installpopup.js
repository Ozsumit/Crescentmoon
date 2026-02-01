"use client";

import { useState, useEffect } from "react";
import { X, ArrowDown, Monitor } from "lucide-react";

const AppInstallPopup = () => {
  const [isRendered, setIsRendered] = useState(false); // Controls conditional rendering (DOM existence)
  const [isVisible, setIsVisible] = useState(false); // Controls CSS opacity (Visuals)

  useEffect(() => {
    const checkLogic = () => {
      // 1. Debugging: Check detected platform
      const userAgent = navigator.userAgent;
      const isMac = /Mac|Macintosh|Intel Mac|PPC Mac/.test(userAgent);

      console.log(`[AppPopup] Platform: ${isMac ? "Mac Detected" : "Not Mac"}`);

      if (!isMac) return;

      // 2. Session Logic
      const hasVisitedThisSession = sessionStorage.getItem(
        "hasVisitedCurrentSession",
      );

      if (!hasVisitedThisSession) {
        // Mark this tab as visited immediately so we don't count refreshes
        sessionStorage.setItem("hasVisitedCurrentSession", "true");

        // Increment persistent total visits
        const currentTotal = parseInt(
          localStorage.getItem("totalVisitCount") || "0",
          10,
        );
        const newTotal = currentTotal + 1;
        localStorage.setItem("totalVisitCount", newTotal.toString());

        console.log(`[AppPopup] Session Count: ${newTotal}`);

        // 3. Trigger on every 3rd session (3, 6, 9...)
        if (newTotal > 0 && newTotal % 3 === 0) {
          console.log("[AppPopup] Triggering Popup...");

          // Delay purely for UX (wait for page load)
          const timer = setTimeout(() => {
            setIsRendered(true);
            // Trigger animation slightly after render
            setTimeout(() => setIsVisible(true), 50);
          }, 2000);

          return () => clearTimeout(timer);
        }
      }
    };

    checkLogic();
  }, []);

  const handleClose = () => {
    // Fade out first
    setIsVisible(false);
    // Remove from DOM after transition finishes (500ms match duration)
    setTimeout(() => {
      setIsRendered(false);
    }, 500);
  };

  const handleDownload = () => {
    window.open(
      "https://apps.apple.com/us/app/your-app-name/idYOURAPPID",
      "_blank",
    );
    handleClose();
  };

  // If logical state is false, do not render anything to DOM
  if (!isRendered) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Dimmed Backdrop */}
      <div
        className={`absolute inset-0 bg-neutral-900/40 backdrop-blur-sm transition-opacity duration-500 ease-out ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Swiss Style Card */}
      <div
        className={`relative bg-white text-black w-full max-w-md p-8 rounded-[2rem] shadow-2xl transform transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${
          isVisible
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-12 opacity-0 scale-95"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-neutral-100 hover:bg-neutral-200 transition-colors"
        >
          <X className="w-5 h-5 text-neutral-900" strokeWidth={2.5} />
        </button>

        <div className="flex flex-col items-start space-y-6">
          {/* Iconography */}
          <div className="bg-black text-white p-4 rounded-full">
            <Monitor className="w-8 h-8" strokeWidth={1.5} />
          </div>

          {/* Typography */}
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight leading-tight">
              Mac Experience.
            </h2>
            <p className="text-neutral-500 font-medium text-lg leading-relaxed max-w-xs">
              Install the dedicated macOS application for a faster, ad-free
              workflow.
            </p>
          </div>

          {/* Actions */}
          <div className="w-full pt-2 flex flex-col gap-3">
            <button
              onClick={handleDownload}
              className="group w-full bg-black text-white text-lg font-semibold py-4 px-6 rounded-full flex items-center justify-between hover:bg-neutral-800 transition-all active:scale-[0.98]"
            >
              <span>Download</span>
              <span className="bg-white/20 p-1 rounded-full group-hover:bg-white/30 transition-colors">
                <ArrowDown className="w-5 h-5" />
              </span>
            </button>

            <button
              onClick={handleClose}
              className="w-full text-neutral-400 font-medium py-2 hover:text-neutral-600 transition-colors text-sm"
            >
              No, stick to browser
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppInstallPopup;
