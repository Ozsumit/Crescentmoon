"use client";
import { useEffect } from "react";

const AdBlocker = () => {
  useEffect(() => {
    const blocklistPatterns = [
      /doubleclick\.net/i,
      /googlesyndication\.com/i,
      /adservice\.google\.com/i,
      /outbrain\.com/i,
      /taboola\.com/i,
      /stretchedbystander\.com/i,
      /ad[sx]?\d*/i,
      /\.ads\./i,
      /luckyforbet\.com/i
    ];

    // Block network requests
    const blockNetworkRequests = () => {
      const originalFetch = window.fetch;
      const originalXHROpen = XMLHttpRequest.prototype.open;

      // Intercept Fetch API
      window.fetch = async (...args) => {
        if (blocklistPatterns.some((pattern) => pattern.test(args[0]))) {
          console.warn("Blocked network request:", args[0]);
          return new Response(null, { status: 403 });
        }
        return originalFetch(...args);
      };

      // Intercept XMLHttpRequest
      XMLHttpRequest.prototype.open = function (...args) {
        if (blocklistPatterns.some((pattern) => pattern.test(args[1]))) {
          console.warn("Blocked XHR request:", args[1]);
          this.abort();
        } else {
          originalXHROpen.apply(this, args);
        }
      };
    };

    // Block iframe behaviors
    const blockIframeActions = () => {
      const iframes = document.querySelectorAll("iframe");

      iframes.forEach((iframe) => {
        try {
          // Prevent new tab or popup openings inside the iframe by overriding window.open
          const iframeWindow = iframe.contentWindow;
          if (iframeWindow) {
            const originalOpen = iframeWindow.open;
            iframeWindow.open = function () {
              console.warn("Blocked iframe popup attempt");
              return null; // Block the popup
            };
          }
        } catch (error) {
          console.warn(
            "Cannot access iframe content due to cross-origin restrictions."
          );
        }
      });
    };

    // Block any window.open globally to prevent popups
    const blockWindowOpenGlobally = () => {
      const originalWindowOpen = window.open;
      window.open = function () {
        console.warn("Blocked window popup attempt");
        return null; // Block the popup
      };
    };

    // Observe and block dynamically added iframes
    const observer = new MutationObserver(() => {
      blockIframeActions();  // Reapply iframe blocking on any DOM change
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Block network requests
    blockNetworkRequests();

    // Block window open globally
    blockWindowOpenGlobally();

    // Initial iframe action block
    blockIframeActions();

    // Cleanup on unmount
    return () => observer.disconnect();
  }, []);

  return null;
};

export default AdBlocker;
