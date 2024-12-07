"use client";
import { useEffect } from "react";

const AdBlocker = () => {
  useEffect(() => {
    // Define filtering rules
    const blocklistPatterns = [
      /doubleclick\.net/i, // Google Ads
      /googlesyndication\.com/i, // Google AdSense
      /adservice\.google\.com/i, // Google Ad Services
      /outbrain\.com/i, // Outbrain Ads
      /taboola\.com/i, // Taboola Ads
      /stretchedbystander\.com/i, // Example malicious ad domain
      /ad[sx]?\d*/i, // Generic ads pattern
      /\.ads\./i, // Ads in subdomains
      /stretchedbystander\.com/i, // New filter added for matching strecthedbystander.com
    ];

    const elementBlocklist = [
     
    ];

    // Monitor and block network requests
    const blockNetworkRequests = () => {
      const originalFetch = window.fetch;
      const originalXHROpen = XMLHttpRequest.prototype.open;

      // Intercept Fetch API
      window.fetch = async (...args) => {
        if (blocklistPatterns.some((pattern) => pattern.test(args[0]))) {
          console.warn("Blocked network request:", args[0]);
          return new Response(null, { status: 403 }); // Block request
        }
        return originalFetch(...args);
      };

      // Intercept XMLHttpRequest
      XMLHttpRequest.prototype.open = function (...args) {
        if (blocklistPatterns.some((pattern) => pattern.test(args[1]))) {
          console.warn("Blocked XHR request:", args[1]);
          this.abort(); // Block request
        } else {
          originalXHROpen.apply(this, args);
        }
      };
    };

    // Block DOM elements based on filter rules
    const blockDomElements = () => {
      const allElements = document.querySelectorAll("*");
      allElements.forEach((el) => {
        const attributes = Array.from(el.attributes);
        const classAndId = [
          el.id.toLowerCase(),
          el.className ? el.className.toString().toLowerCase() : "", // Ensure className is a string
        ].join(" ");

        if (
          attributes.some((attr) =>
            elementBlocklist.some((keyword) =>
              attr.value.toLowerCase().includes(keyword)
            )
          ) ||
          elementBlocklist.some((keyword) => classAndId.includes(keyword))
        ) {
          el.style.display = "none"; // Block ad element by hiding it
          console.log("Blocked ad element:", el);
        }
      });
    };

    // Use MutationObserver for dynamic content
    const observer = new MutationObserver(() => blockDomElements());
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial execution
    blockNetworkRequests();
    blockDomElements();

    // Cleanup on unmount
    return () => observer.disconnect();
  }, []);

  return null; // Component does not render anything
};

export default AdBlocker;
