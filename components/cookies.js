"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    const localConsent = localStorage.getItem("cookieConsent");
    if (!localConsent) {
      setShowConsent(true);
    }
  }, []);

  const acceptCookies = () => {
    setShowConsent(false);
    localStorage.setItem("cookieConsent", "true");
    console.log("Cookies accepted");
  };

  const declineCookies = () => {
    setShowConsent(false);
    localStorage.setItem("cookieConsent", "false");
    console.log("Cookies declined");
  };

  if (!showConsent) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-auto md:max-w-md z-[100] animate-slide-up">
      {/* 
        Dark Stylized Container: 
        Near-black background, pure white thick borders, and a solid white offset shadow.
      */}
      <div className="bg-card border-2 border-border rounded-[2.5rem] shadow-2xl backdrop-blur-xl p-8 flex flex-col gap-6">
        {/* Swiss Style Header: Bold, uppercase, tight tracking */}
        <div className="flex items-start justify-between">
          <h2 className="text-4xl font-black uppercase tracking-tighter leading-none text-foreground">
            Cookie
            <br />
            Policy.
          </h2>
          {/* Decorative Swiss Cross / Plus - Inverted for dark mode */}
          <div className="hidden sm:flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full font-black text-xl select-none">
            +
          </div>
        </div>

        {/* Text Section: High contrast gray-to-white */}
        <p className="text-muted-foreground font-medium leading-relaxed text-sm sm:text-base">
          We use cookies to ensure you get the best experience on our website.
          Analytics, functionality, and performance.{" "}
          <Link
            href="/privacy-policy"
            className="inline-block text-foreground font-black underline decoration-2 underline-offset-4 hover:text-primary transition-colors px-1 -ml-1"
          >
            Read the rules
          </Link>
          .
        </p>

        {/* Action Buttons: Pill shaped, bold uppercase text */}
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          {/* Primary Action - White button, black text */}
          <button
            onClick={acceptCookies}
            className="flex-1 bg-primary text-primary-foreground border-2 border-primary rounded-full px-6 py-3.5 text-sm font-black uppercase tracking-widest hover:opacity-90 transition-all active:translate-y-1 active:shadow-none"
          >
            Accept
          </button>

          {/* Secondary Action - Black button, white text */}
          <button
            onClick={declineCookies}
            className="flex-1 bg-transparent text-foreground border-2 border-border rounded-full px-6 py-3.5 text-sm font-black uppercase tracking-widest hover:bg-muted transition-all active:translate-y-1 active:shadow-none"
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
