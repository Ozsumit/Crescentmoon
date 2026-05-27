"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackPageView } from "@/app/abmin/action";

export default function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/abmin") || pathname.startsWith("/login")) return;

    // Generate or get visitor ID from localStorage
    let visitorId = localStorage.getItem("cmoon_visitor_id");
    if (!visitorId) {
      visitorId = "vis_" + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("cmoon_visitor_id", visitorId);
    }

    // Track the page view
    trackPageView(pathname, visitorId);
  }, [pathname]);

  return null;
}
