"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Star,
  Info,
  AlertTriangle,
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
} from "lucide-react";

// Exportable Welcome Modal Trigger Button
export const WelcomeModalTrigger = ({ children, onClick, className = "" }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = (e) => {
    setIsModalOpen(true);
    onClick?.(e);
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition ${className}`}
      >
        {children || "Open Welcome Modal"}
      </button>
      {isModalOpen && <WelcomeModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
};

const WelcomeModal = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [characterPose, setCharacterPose] = useState("wave");
  const [isNextButtonDisabled, setIsNextButtonDisabled] = useState(false);
  const [idleAnimationInterval, setIdleAnimationInterval] = useState(null);
  const CURRENT_VERSION = "1.2.3"; // Incremented version

  // Character images mapping
  const characterImages = {
    wave: "https://github.com/Ozsumit/fiiles.images/blob/main/gene_20241216_195549.png?raw=true",
    point:
      "https://github.com/Ozsumit/fiiles.images/blob/main/gene_20241216_173825.png?raw=true",
    think:
      "https://github.com/Ozsumit/fiiles.images/blob/main/gene_20241216_200354.png?raw=true",
    celebrate:
      "https://github.com/Ozsumit/fiiles.images/blob/main/gene_20241216_201017.png?raw=true",
    idle1:
      "https://github.com/Ozsumit/fiiles.images/blob/main/gene_20241216_195549.png?raw=true",
    idle2:
      "https://github.com/Ozsumit/fiiles.images/blob/main/gene_20241216_173825.png?raw=true",
  };

  const sections = [
    {
      icon: <Star className="text-yellow-500 mr-2 w-6 h-6" />,
      title: "Welcome to CresentMoon!",
      items: [
        "Your ultimate movie and series companion",
        "Personalized recommendations just for you",
        "Discover trending content easily",
      ],
      characterDialog:
        "Hi there! I'm your guide to CresentMoon! Let me show you around~!",
      characterPose: "wave",
    },
    {
      icon: <Info className="text-blue-500 mr-2 w-6 h-6" />,
      title: "Key Features",
      items: [
        "Personalized movie recommendations",
        "Trending movies and TV series",
        "Save movies as favorites",
        "Daily movie picks",
      ],
      characterDialog:
        "Check out all these amazing features I've prepared for you!",
      characterPose: "point",
    },
    {
      icon: <AlertTriangle className="text-orange-500 mr-2 w-6 h-6" />,
      title: "Before You Start",
      items: [
        "Ads during movie playback",
        "Limited to popular movie databases",
        "Recommendations based on trending content",
      ],
      characterDialog:
        "Just a heads up about some current limitations. We're always improving!",
      characterPose: "think",
    },
    {
      icon: <ShieldCheck className="text-green-500 mr-2 w-6 h-6" />,
      title: "Block Ads & Enhance Privacy",
      items: [
        {
          text: "uBlock Origin Extension",
          url: "https://chromewebstore.google.com/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm",
        },
        {
          text: "Brave Browser (Desktop & Mobile)",
          url: "https://brave.com/download/",
        },
        {
          text: "Opera Browser with VPN",
          url: "https://www.opera.com/download",
        },
        "Reduce interruptions during movie streaming",
      ],
      characterDialog:
        "Pro tip: Let's make your browsing smoother and ad-free!",
      characterPose: "celebrate",
    },
  ];

  const startIdleAnimations = useCallback(() => {
    const idleInterval = setInterval(() => {
      const idlePoses = ["idle1", "idle2"];
      const randomPose =
        idlePoses[Math.floor(Math.random() * idlePoses.length)];
      setCharacterPose(randomPose);
    }, 1000); // Change pose every 3 seconds

    setIdleAnimationInterval(idleInterval);
  }, []);

  const stopIdleAnimations = useCallback(() => {
    if (idleAnimationInterval) {
      clearInterval(idleAnimationInterval);
      setIdleAnimationInterval(null);
    }
  }, [idleAnimationInterval]);

  useEffect(() => {
    const storedVersion = localStorage.getItem("cresentMoonVersion");
    const isFirstVisit = !localStorage.getItem("hasVisitedCresentMoon");

    if (isFirstVisit || storedVersion !== CURRENT_VERSION) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
      startIdleAnimations();
    }

    return () => {
      document.body.style.overflow = "unset";
      stopIdleAnimations();
    };
  }, [startIdleAnimations, stopIdleAnimations]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("hasVisitedCresentMoon", "true");
    localStorage.setItem("cresentMoonVersion", CURRENT_VERSION);
    document.body.style.overflow = "unset";
    stopIdleAnimations();
    onClose?.();
  };

  const handleNext = () => {
    // Prevent multiple clicks
    if (isNextButtonDisabled) return;

    // Disable button and start cooldown
    setIsNextButtonDisabled(true);
    setTimeout(() => setIsNextButtonDisabled(false), 1000);

    // Stop idle animations when user interacts
    stopIdleAnimations();

    if (currentSection < sections.length - 1) {
      const nextSection = currentSection + 1;
      setCurrentSection(nextSection);
      setCharacterPose(sections[nextSection].characterPose);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    // Stop idle animations when user interacts
    stopIdleAnimations();

    if (currentSection > 0) {
      const prevSection = currentSection - 1;
      setCurrentSection(prevSection);
      setCharacterPose(sections[prevSection].characterPose);
    }
  };

  const renderListItem = (item) => {
    if (typeof item === "object" && item.url) {
      return (
        <li key={item.text} className="flex items-center">
          {item.text}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 text-blue-400 hover:text-blue-300 transition"
          >
            <ExternalLink className="w-4 h-4 inline-block" />
          </a>
        </li>
      );
    }
    return <li key={item}>{item}</li>;
  };

  if (!isVisible) return null;

  const currentSectionData = sections[currentSection];

  return (
    <div className="fixed inset-0 z-50 flex items-center  justify-center bg-black bg-opacity-80 p-4 overflow-hidden">
      <div className="  bg-gray-900/80 backdrop-blur-lg z-20 text-gray-200 rounded-2xl shadow-2xl w-full max-w-md mx-auto relative overflow-hidden">
        <div className="p-6 pt-4 z-40 relative">
          <div className="flex  items-center  mb-4">
            {currentSectionData.icon}
            <h3 className="text-lg text-left font-semibold text-indigo-400">
              {currentSectionData.title}
            </h3>
          </div>

          <ul className="text-gray-300 text-left text-sm space-y-2 z-40 pl-4 list-disc mb-6">
            {currentSectionData.items.map(renderListItem)}
          </ul>

          {/* Navigation Dots */}
          <div className="flex z-40 justify-center space-x-2 mb-4">
            {sections.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentSection ? "bg-indigo-500" : "bg-gray-600"
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex z-40 space-x-2">
            {currentSection > 0 && (
              <button
                onClick={handlePrevious}
                className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition w-1/2 flex items-center justify-center"
              >
                <ChevronLeft className="mr-2 w-5 h-5" />
                Previous
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={isNextButtonDisabled}
              className={`
                ${
                  isNextButtonDisabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-indigo-700"
                }
                bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg transition flex-1 flex items-center justify-center
              `}
            >
              {currentSection < sections.length - 1
                ? "Next"
                : "Start Exploring"}
              <ChevronRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Animated Character */}
      </div>
      <div className="absolute bottom-[-50%] sm:bottom-0 left-0 z-30 w-[35rem] h-[35rem] transform transition-all duration-300 ease-in-out">
        <img
          src={characterImages[characterPose]}
          width={2000}
          height={2000}
          alt={`Anime Girl ${characterPose} Pose`}
          className="object-contain -z-10 sm:-bottom-32 bottom-[-50%]"
        />
        <div className="fixed bottom-[22rem] sm:bottom-4 top-50  left-1 sm:left-14 right-4 z-10">
          <div className="bg-gray-800 bg-opacity-90 rounded-xl p-3 max-w-[50vw] relative">
            <div
              className="absolute -right-2 top-[50%] bottom-[50%] rotate-90 sm:-top-2 sm:left-[50%]   sm:right-[50%] sm:rotate-0 w-0 h-0 
                border-l-8 border-l-transparent
                border-r-8 border-r-transparent
                border-b-8 border-gray-800 border-opacity-90"
            ></div>
            <p className="text-sm text-white">
              {currentSectionData.characterDialog}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeModal;
