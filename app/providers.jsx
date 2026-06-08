// app/providers.js
"use client";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";
import PostHogPageView from "./PostHogPageview";

export function PostHogProvider({ children }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN, {
      api_host: "/ingest",
      ui_host: "https://us.posthog.com",
      capture_pageview: false, // Disable automatic pageview capture, as we capture manually
      capture_exceptions: true,
      defaults: "2026-01-30",
    });
  }, []);

  return (
    <PHProvider client={posthog}>
      <PostHogPageView />
      {children}
    </PHProvider>
  );
}
