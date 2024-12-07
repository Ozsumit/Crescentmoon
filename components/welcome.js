"use client";
import React, { useState, useEffect } from "react";
import { Moon, Star, Info, CheckCircle, AlertTriangle } from "lucide-react";

const WelcomeModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const CURRENT_VERSION = "1.1.0";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-gray-900 text-gray-200 rounded-2xl shadow-2xl w-full max-w-md md:max-w-5xl mx-auto relative flex flex-col lg:flex-row p-4 lg:p-8 gap-4 lg:gap-8">
        {/* Branding Section */}
        <div className="bg-gray-800 rounded-xl flex flex-col items-center justify-between text-center p-4 lg:p-6 lg:w-1/3">
          <Moon className="text-indigo-500" size={48} />
          <h2 className="text-xl lg:text-3xl font-bold text-white mt-2">
            Crescent Moon
          </h2>
          <div className="flex items-center justify-center space-x-2 mt-2 lg:mt-4">
            <CheckCircle className="text-green-500" size={20} />
            <span className="text-gray-400 text-sm lg:text-lg">
              v{CURRENT_VERSION}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex flex-col justify-between lg:w-2/3">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-800 transition-colors"
            aria-label="Close modal"
          >
            ✕
          </button>

          {/* Content Grid */}
          <div className="grid grid-cols-1 gap-2">
            {/* What's New Section */}
            <div className="bg-gray-800 rounded-xl p-3 lg:p-4">
              <div className="flex items-center mb-2">
                <Star className="text-yellow-500 mr-2" size={20} />
                <h3 className="text-sm lg:text-lg font-semibold text-indigo-400">
                  What's New?
                </h3>
              </div>
              <ul className="text-gray-300 text-xs lg:text-sm space-y-1 pl-4 list-disc">
                <li>Enhanced search & movie recommendations</li>
                <li>Improved user interface</li>
                <li>Working Web-series</li>
                <li>Added filter</li>
              </ul>
            </div>

            {/* Key Features Section */}
            <div className="bg-gray-800 rounded-xl p-3 lg:p-4">
              <div className="flex items-center mb-2">
                <Info className="text-blue-500 mr-2" size={20} />
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
                <AlertTriangle className="text-orange-500 mr-2" size={20} />
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
