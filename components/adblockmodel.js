"use client";
import React, { useState, useEffect } from "react";
import { ShieldAlert, Info, ExternalLink } from "lucide-react";

// Add common ad-related class names and identifiers
const adClassNames = [
  'adsbox', 
  'ad-container', 
  'advertisement', 
  'banner-ad', 
  'google-ad', 
  'sponsored-content'
];

const AdblockerModal = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Create elements that ad blockers typically target
    const createAdTrap = () => {
      const adElement = document.createElement('div');
      
      // Add multiple ad-related attributes and classes
      adClassNames.forEach(className => {
        adElement.classList.add(className);
      });
      
      adElement.id = 'ad-blocker-test';
      adElement.setAttribute('data-ad', 'true');
      adElement.innerHTML = '&nbsp;';
      
      // Make it look like an ad container
      Object.assign(adElement.style, {
        position: 'absolute',
        top: '-1px',
        left: '-1px',
        width: '1px',
        height: '1px',
        display: 'block',
        background: 'transparent',
        visibility: 'visible'
      });

      document.body.appendChild(adElement);
    };

    // Simulate ad content that triggers blockers
    createAdTrap();

    // Add global variables that ad blockers look for
    window.AdBlock = true;
    window.uBlock = true;
    window.__adblockEnabled = true;

    // Modify chrome runtime to look like an ad blocker extension
    if (window.chrome && window.chrome.runtime) {
      try {
        window.chrome.runtime.getManifest = () => ({
          name: 'uBlock Origin',
          version: '1.0.0'
        });
      } catch {}
    }

    // Check for ad blocker and manage visit count
    const hasAdBlocker = () => {
      const adBlockDetectionTests = [
        () => {
          if (window.chrome && window.chrome.runtime) {
            try {
              return Object.keys(
                window.chrome.runtime.getManifest
                  ? window.chrome.runtime.getManifest()
                  : {}
              ).some((key) =>
                /adblock|ublock|ghostery|privacy|adguard/i.test(key)
              );
            } catch (error) {
              return false;
            }
          }
          return false;
        },
        () => {
          const testAd = document.createElement("div");
          testAd.innerHTML = "&nbsp;";
          testAd.className = "adsbox";

          try {
            document.body.appendChild(testAd);
            const isHidden = window.getComputedStyle(testAd).display === "none";
            document.body.removeChild(testAd);
            return isHidden;
          } catch (error) {
            return false;
          }
        },
        () => {
          const globalAdBlockerChecks = [
            "AdBlock",
            "uBlock",
            "__adblockEnabled",
            "blockAdBlock",
          ];

          return globalAdBlockerChecks.some(
            (check) => window[check] || window[check] !== undefined
          );
        },
      ];

      return adBlockDetectionTests.some((test) => test());
    };

    // Only proceed if no ad blocker is detected
    if (!hasAdBlocker()) {
      const storedVisitCount = localStorage.getItem("websiteVisitCount") || 0;
      const parsedCount = parseInt(storedVisitCount, 10);
      const newCount = parsedCount + 1;

      localStorage.setItem("websiteVisitCount", newCount.toString());

      // Show modal every 5th visit
      if (newCount % 5 === 0) {
        setIsVisible(true);
        document.body.style.overflow = "hidden";
      }
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    document.body.style.overflow = "unset";
  };

  if (!isVisible) return null;

  return (
    <div className="ad-container adsbox banner-ad" data-ad="true">
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
        <div className="bg-gray-900 text-gray-200 rounded-2xl shadow-2xl w-full max-w-md mx-auto p-6 relative">
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>

          <div className="flex flex-col items-center text-center">
            <ShieldAlert className="text-orange-500 mb-4" size={48} />
            <h2 className="text-2xl font-bold text-white mb-4">
              Enhance Your Browsing Experience
            </h2>

            <div className="bg-gray-800 rounded-xl p-4 mb-4 text-left w-full">
              <div className="flex items-center mb-2">
                <Info className="text-blue-500 mr-2" size={20} />
                <h3 className="text-lg font-semibold text-indigo-400">
                  Ad-Free Recommendation
                </h3>
              </div>
              <p className="text-gray-300 text-sm">
                Our website is safe, but we recommend installing an adblocker to
                enhance your browsing experience and protect your privacy.
              </p>
            </div>

            <div className="flex flex-col space-y-3 w-full">
              <a
                href="https://chrome.google.com/webstore/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center"
              >
                <ExternalLink className="mr-2" size={20} />
                Install uBlock Origin (Chrome)
              </a>

              <a
                href="https://addons.mozilla.org/en-US/firefox/addon/ublock-origin/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center"
              >
                <ExternalLink className="mr-2" size={20} />
                Install uBlock Origin (Firefox)
              </a>

              <a
                href="https://www.opera.com/mobile"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center"
              >
                <ExternalLink className="mr-2" size={20} />
                Download Opera Mobile
              </a>
            </div>

            <button
              onClick={handleClose}
              className="mt-4 text-gray-400 hover:text-white underline"
            >
              Close and Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdblockerModal;