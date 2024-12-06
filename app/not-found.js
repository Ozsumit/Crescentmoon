"use client";
import Link from "next/link";
import React, { useState } from "react";

const PageNotFound = () => {
  const [easterEggMessage, setEasterEggMessage] = useState("");

  const randomMessages = [
    "Are you lost, traveler?",
    "404... Or is it?",
    "Don't tell anyone you found this.",
    "A wild missing page appeared!",
    "Oops! The Matrix glitched again.",
    "Error? Or secret portal?",
    "You broke the internet. Congrats!",
  ];

  const handleMagicClick = () => {
    const randomIndex = Math.floor(Math.random() * randomMessages.length);
    setEasterEggMessage(randomMessages[randomIndex]);
  };

  return (
    <div className="relative flex items-center pt-16 justify-center min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 overflow-hidden">
      {/* Wandering Text */}
      <div className="absolute -top-16 left-1/3 animate-bounce text-9xl font-bold text-indigo-500/20">
        404
      </div>
      <div className="absolute bottom-10 -right-32 animate-spin-slow text-9xl font-bold text-pink-500/20">
        404
      </div>

      {/* Content */}
      <div className="relative max-w-lg px-8 py-12 text-center bg-slate-800/50 rounded-2xl shadow-lg border border-indigo-900/40">
        <h1 className="text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400 mb-4">
          404
        </h1>
        <p className="text-slate-300 text-xl mb-6">
          Oops! The page you're looking for does not exist.
        </p>

        {/* Easter Egg */}
        {easterEggMessage && (
          <p className="text-sm text-indigo-400 font-medium mt-4">
            {easterEggMessage}
          </p>
        )}

        {/* Buttons */}
        <div className="flex justify-center space-x-4 mt-6">
          <Link
            href="/"
            className="bg-gradient-to-r from-indigo-600 to-pink-500 hover:from-indigo-500 hover:to-pink-400 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
          >
            Go Home
          </Link>
          <button
            onClick={handleMagicClick}
            className="bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-300 font-semibold py-3 px-6 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105"
          >
            Magic Button
          </button>
        </div>
      </div>

      {/* Background Wandering Stars */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-5 h-5 bg-pink-500 rounded-full animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-5 h-5 bg-indigo-500 rounded-full animate-bounce" />
        <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-yellow-400 rounded-full animate-spin-slow" />
      </div>
    </div>
  );
};

export default PageNotFound;
