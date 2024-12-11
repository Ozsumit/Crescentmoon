"use client";
import React, { useState, useEffect } from "react";
import {
  Moon,
  Star,
  Info,
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
  ExternalLink,
  X,
} from "lucide-react";

const WelcomeModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const CURRENT_VERSION = "1.1.2";

  useEffect(() => {
    const storedVersion = localStorage.getItem("cresentMoonVersion");
    const isFirstVisit = !localStorage.getItem("hasVisitedCresentMoon");

    if (isFirstVisit || storedVersion !== CURRENT_VERSION) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("hasVisitedCresentMoon", "true");
    localStorage.setItem("cresentMoonVersion", CURRENT_VERSION);
    document.body.style.overflow = "unset";
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 p-4">
      <div className="bg-gray-900 text-gray-200 rounded-2xl shadow-2xl w-full max-w-6xl mx-auto relative flex flex-col lg:flex-row p-4 lg:p-8 gap-4 lg:gap-8 overflow-y-auto max-h-[90vh]">
        {/* Left Section - Adblocker Recommendation */}
        <div className="bg-gray-800 rounded-xl flex flex-col items-center justify-between text-center p-4 lg:p-6 w-full lg:w-1/3">
          <ShieldAlert className="text-orange-500 w-12 h-12 lg:w-16 lg:h-16" />
          <h2 className="text-lg lg:text-2xl font-semibold text-white mt-2">
            Ad-Free Recommendation
          </h2>
          <p className="text-gray-300 text-sm lg:text-base mt-2 lg:mt-4">
            Our website is safe, but we recommend installing an adblocker to
            enhance your browsing experience and protect your privacy.
          </p>

          <div className="flex flex-col space-y-3 mt-4 w-full">
            <a
              href="https://chrome.google.com/webstore/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center text-sm lg:text-base"
            >
              <ExternalLink className="mr-2 w-4 h-4 lg:w-5 lg:h-5" />
              Install uBlock Origin (Chrome)
            </a>

            <a
              href="https://addons.mozilla.org/en-US/firefox/addon/ublock-origin/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center text-sm lg:text-base"
            >
              <ExternalLink className="mr-2 w-4 h-4 lg:w-5 lg:h-5" />
              Install uBlock Origin (Firefox)
            </a>

            <a
              href="https://www.opera.com/mobile"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center text-sm lg:text-base"
            >
              <ExternalLink className="mr-2 w-4 h-4 lg:w-5 lg:h-5" />
              Download Opera Mobile
            </a>
          </div>
        </div>

        {/* Right Section - Content */}
        <div className="flex flex-col justify-between w-full lg:w-2/3">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors z-10"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Content Grid */}
          <div className="grid grid-cols-1 gap-2 lg:gap-4">
            {/* What's New Section */}
            <div className="bg-gray-800 rounded-xl p-3 lg:p-4">
              <div className="flex items-center mb-2">
                <Star className="text-yellow-500 mr-2 w-5 h-5 lg:w-6 lg:h-6" />
                <h3 className="text-sm lg:text-lg font-semibold text-indigo-400">
                  What's New?
                </h3>
              </div>
              <ul className="text-gray-300 text-xs lg:text-sm space-y-1 pl-4 list-disc">
                <li>Enhanced search & movie recommendations</li>
                <li>Improved user interface</li>
                <li>
                  Added Continue Watching function for movies.[web series not
                  yet implemented]
                </li>
                <li>Added filter</li>
              </ul>
            </div>

            {/* Key Features Section */}
            <div className="bg-gray-800 rounded-xl p-3 lg:p-4">
              <div className="flex items-center mb-2">
                <Info className="text-blue-500 mr-2 w-5 h-5 lg:w-6 lg:h-6" />
                <h3 className="text-sm lg:text-lg font-semibold text-indigo-400">
                  Key Features
                </h3>
              </div>
              <ul className="text-gray-300 text-xs lg:text-sm space-y-1 pl-4 list-disc">
                <li>Personalized movie recommendations</li>
                <li>Trending movies and TV series</li>
                <li>Save movies as favorites</li>
                <li>Daily movie picks</li>
              </ul>
            </div>

            {/* Limitations Section */}
            <div className="bg-gray-800 rounded-xl p-3 lg:p-4">
              <div className="flex items-center mb-2">
                <AlertTriangle className="text-orange-500 mr-2 w-5 h-5 lg:w-6 lg:h-6" />
                <h3 className="text-sm lg:text-lg font-semibold text-indigo-400">
                  Known Limitations
                </h3>
              </div>
              <ul className="text-gray-300 text-xs lg:text-sm space-y-1 pl-4 list-disc">
                <li>Ads during movie playback</li>
                <li>Limited to popular movie databases</li>
                <li>Recommendations based on trending content</li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 flex items-center justify-center">
            <button
              onClick={handleClose}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition w-full lg:w-auto text-sm lg:text-base"
            >
              Start Exploring
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
