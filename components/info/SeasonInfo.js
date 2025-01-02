"use client";
import React, { useState, useEffect } from "react";
import SeasonDetails from "./SeasonDetails";
import EpisodeDisplay from "../display/EpisodeDisplay";

const SeasonInfo = (props) => {
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  let { SeasonInfos, id } = props;
  let episodes = SeasonInfos.episodes;

  useEffect(() => {
    // Trigger page load animation
    setIsPageLoaded(true);
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white overflow-hidden">
      {/* Subtle Background Texture */}
      <div className="absolute inset-0 opacity-10 bg-gradient-to-br from-indigo-900 via-slate-800 to-slate-950 mix-blend-overlay" />

      <div
        className={`relative z-10 container mx-auto px-4 py-8 transition-all duration-700 ${
          isPageLoaded ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Season Info Header */}
        <div className="flex flex-row flex-wrap justify-center items-center mb-10 mt-5 gap-8">
          <div className="flex-1 min-w-[300px] transform transition-transform duration-300 hover:scale-[1.01]">
            <SeasonDetails SeasonInfos={SeasonInfos} />
          </div>
        </div>

        {/* Episodes Section */}
        <div className="bg-slate-900/50 rounded-2xl p-6 shadow-2xl border border-indigo-900/30 backdrop-blur-sm">
          <h2 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-pink-300 leading-tight tracking-tight">
            Episodes
          </h2>

          {/* Episodes Display Component */}
          <div className="animate-fade-in">
            <EpisodeDisplay EpisodeInfos={episodes} seriesId={seriesId} />
          </div>

          {/* Alternative Episode Styling (if needed) */}
          {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {episodes?.map((episode, index) => (
              <div
                key={index}
                className="bg-indigo-900/30 p-4 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] border border-indigo-800/30"
              >
                <h3 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-pink-300">
                  {episode.title}
                </h3>
                <p className="text-sm text-slate-400 mt-2 line-clamp-2">
                  {episode.description}
                </p>
                <button className="mt-4 w-full bg-gradient-to-r from-indigo-600/40 to-purple-600/40 text-indigo-200 px-4 py-2 rounded-lg hover:from-indigo-600/60 hover:to-purple-600/60 transition-all duration-300 transform hover:scale-[1.02]">
                  Watch Episode
                </button>
              </div>
            ))}
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default SeasonInfo;
