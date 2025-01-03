import React, { useState } from "react";
import {
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  ArrowLeft,
  ArrowRight,
  Settings,
} from "lucide-react";

const MediaControls = ({
  onPrevEpisode,
  onNextEpisode,
  currentEpisode,
  totalEpisodes,
  isPrevDisabled,
  isNextDisabled,
  seriesName,
  seasonNumber,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4">
      <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-800/50 shadow-xl">
        {/* Progress bar */}
        {/* <div className="px-4 pt-4">
          <div className="relative h-1.5 bg-slate-800 rounded-full overflow-hidden group cursor-pointer">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-pink-500 w-1/2 group-hover:opacity-100 transition-opacity" />
            <div
              className="absolute h-3 w-3 bg-white rounded-full top-1/2 -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              style={{ left: "50%" }}
            />
          </div>
        </div> */}

        <div className="p-4 flex flex-row items-center justify-between gap-4">
          {/* Episode Info */}
          <div className="hidden sm:block flex-shrink-0">
            <p className="text-sm font-medium text-white">{seriesName}</p>
            <p className="text-xs text-slate-400">
              S{seasonNumber} E{currentEpisode}
            </p>
            {/* <span className="text-slate-400">
            Episode {currentEpisode} of {totalEpisodes}
          </span> */}
          </div>

          {/* Main Controls */}
        </div>

        {/* Episode Navigation */}
        <div className="px-4 pb-4 flex items-center justify-between text-sm">
          <button
            onClick={onPrevEpisode}
            disabled={isPrevDisabled}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
              isPrevDisabled
                ? "bg-slate-800/50 text-slate-500 cursor-not-allowed"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Episode</span>
          </button>

          <span className="text-slate-400">
            Episode {currentEpisode} of {totalEpisodes}
          </span>

          <button
            onClick={onNextEpisode}
            disabled={isNextDisabled}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
              isNextDisabled
                ? "bg-slate-800/50 text-slate-500 cursor-not-allowed"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
            }`}
          >
            <span>Next Episode</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaControls;
