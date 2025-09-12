"use client";

import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";

const AppInstallPopup = () => {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const checkAndShowPopup = () => {
      // 1. Check if the user is on a Mac
      const userAgent = navigator.userAgent;
      const isMac =
        userAgent.includes("Mac") || userAgent.includes("Macintosh");

      if (!isMac) {
        // If not a Mac, do not show the popup and exit early.
        console.log("Not a Mac device. AppInstallPopup will not be shown."); // Optional: for debugging
        return;
      }

      // 2. Proceed with existing logic if it is a Mac
      const lastShown = localStorage.getItem("appInstallPopupLastShown");
      const today = new Date().toDateString();

      // Show popup if it hasn't been shown today
      if (lastShown !== today) {
        // Add a small delay to avoid immediate popup on page load
        const timer = setTimeout(() => {
          setShowPopup(true);
        }, 3000); // Show after 3 seconds

        return () => clearTimeout(timer);
      }
    };

    checkAndShowPopup();
  }, []); // Empty dependency array ensures this runs once on mount

  const handleClose = () => {
    setShowPopup(false);
    // Mark as shown today
    localStorage.setItem("appInstallPopupLastShown", new Date().toDateString());
  };

  const handleDownload = () => {
    // IMPORTANT: Since this popup is now only for Macs, you should
    // ideally change this URL to point to your iOS App Store link or
    // a direct download for a macOS app if applicable.
    // The current link is for Google Play.
    window.open(
      "https://apps.apple.com/us/app/your-app-name/idYOURAPPID", // Example for iOS App Store
      // Or if it's a desktop Mac app: "https://yourwebsite.com/downloads/your-app.dmg"
      "_blank"
    );
    handleClose();
  };

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 p-4">
      <div className="bg-[#f1f1f128]  backdrop-blur-md rounded-lg shadow-xl max-w-sm w-full transform transition-transform duration-300 ease-out animate-slide-up">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <Smartphone className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#ffd22e]">
                  Get Our Mac App
                </h3>
                <p className="text-sm text-gray-500">Ad-free experience</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-white text-sm leading-relaxed">
              Enjoy Crescent Moon without ads and get faster loading times with
              our dedicated Mac app.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleDownload}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download for Mac</span>
            </button>
            <button
              onClick={handleClose}
              className="px-4 py-3 text-white hover:text-[#ffd22e] font-medium transition-colors"
            >
              Later
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AppInstallPopup;
