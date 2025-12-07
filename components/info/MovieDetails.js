import React, { useState } from "react";
import {
  Play,
  Pause,
  X,
  ArrowRight,
  Maximize2,
  Volume2,
  Film,
} from "lucide-react";

const MovieDetails = ({ MovieDetail, genreArr, videoId }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const formatRuntime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return hours > 0 ? `${hours}H ${remainingMinutes}M` : `${minutes}M`;
  };

  // Dynamic styles based on playback state (Swiss "Lights Off" mode)
  const theme = isPlaying
    ? "bg-[#0a0a0a] text-[#f4f4f4] border-[#333]"
    : "bg-[#f4f4f4] text-[#111] border-[#111]";

  const accentColor = isPlaying ? "text-[#ff3333]" : "text-[#E62020]";
  const borderColor = isPlaying ? "border-[#333]" : "border-[#111]";

  return (
    <div
      className={`min-h-screen transition-colors duration-700 ease-in-out font-sans ${theme}`}
    >
      {/* GRID SYSTEM CONTAINER */}
      <div className="container mx-auto px-4 sm:px-8 py-8 min-h-screen flex flex-col">
        {/* TOP BAR: Functional Meta Data */}
        <div
          className={`flex justify-between items-end border-b-4 ${borderColor} pb-4 mb-8`}
        >
          <div>
            <h1 className="text-4xl md:text-7xl font-black uppercase tracking-tighter leading-[0.85]">
              {MovieDetail.title}
            </h1>
          </div>
          <div className="hidden md:flex flex-col items-end text-right font-mono text-xs uppercase tracking-widest gap-1">
            <span>
              FIG. 01 — {new Date(MovieDetail.release_date).getFullYear()}
            </span>
            <span className={accentColor}>Dir. Unknown</span>{" "}
            {/* Add director if available */}
          </div>
        </div>

        {/* MAIN LAYOUT: Video Player is the Hero */}
        <main className="flex-grow flex flex-col gap-8">
          {/* THE PLAYER FRAMEWORK */}
          <div className="relative w-full">
            {/* Player Status Bar */}
            <div
              className={`flex justify-between items-center px-4 py-2 border-x-2 border-t-2 ${borderColor} bg-transparent`}
            >
              <div className="flex items-center gap-4 font-mono text-xs uppercase tracking-widest">
                <div
                  className={`w-2 h-2 ${
                    isPlaying ? "bg-red-600 animate-pulse" : "bg-gray-400"
                  }`}
                ></div>
                {isPlaying ? "Status: Playing" : "Status: Standby"}
              </div>
              <div className="flex items-center gap-4">
                <Volume2 className="w-4 h-4 opacity-50" />
                <Maximize2 className="w-4 h-4 opacity-50" />
              </div>
            </div>

            {/* The Screen Area */}
            <div
              className={`relative w-full aspect-video border-2 ${borderColor} bg-black overflow-hidden group`}
            >
              {!isPlaying ? (
                /* POSTER STATE */
                <div className="absolute inset-0 w-full h-full">
                  <img
                    src={`https://image.tmdb.org/t/p/original${
                      MovieDetail.backdrop_path || MovieDetail.poster_path
                    }`}
                    alt="Backdrop"
                    className="w-full h-full object-cover opacity-60 grayscale hover:grayscale-0 transition-all duration-700"
                  />

                  {/* Brutalist Play Trigger */}
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="absolute inset-0 flex items-center justify-center group hover:bg-red-600/10 transition-colors duration-300"
                  >
                    <div className="bg-[#E62020] text-white p-8 md:p-12 flex items-center gap-4 transform group-hover:scale-105 transition-transform duration-300 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                      <Play className="w-12 h-12 md:w-16 md:h-16 fill-current" />
                      <div className="flex flex-col items-start">
                        <span className="font-black uppercase text-2xl md:text-4xl tracking-tighter leading-none">
                          Play
                        </span>
                        <span className="font-mono text-xs uppercase tracking-widest">
                          Trailer
                        </span>
                      </div>
                    </div>
                  </button>
                </div>
              ) : (
                /* VIDEO STATE */
                <div className="relative w-full h-full">
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&showinfo=0`}
                    title="Trailer"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>

                  {/* Close / Stop Button Overlay */}
                  <button
                    onClick={() => setIsPlaying(false)}
                    className="absolute top-0 right-0 m-6 bg-white text-black p-3 hover:bg-[#E62020] hover:text-white transition-colors z-50 border-2 border-black"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              )}
            </div>

            {/* Footer under player */}
            <div
              className={`border-x-2 border-b-2 ${borderColor} p-4 flex justify-between items-center`}
            >
              <div className="font-mono text-xs uppercase tracking-widest opacity-60">
                Source: YouTube / API
              </div>
              <div className="font-mono text-xs uppercase tracking-widest opacity-60">
                {formatRuntime(MovieDetail.runtime)}
              </div>
            </div>
          </div>

          {/* DETAILS GRID (Pushed down but strictly aligned) */}
          <div
            className={`grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 pt-8 border-t ${
              isPlaying ? "border-[#333]" : "border-gray-300"
            }`}
          >
            {/* Left Column: Statistics */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              <div className="flex flex-col">
                <span className="font-mono text-[10px] uppercase tracking-widest mb-2 opacity-50">
                  Rating Index
                </span>
                <span
                  className={`text-5xl font-black tracking-tighter ${accentColor}`}
                >
                  {MovieDetail.vote_average.toFixed(1)}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="font-mono text-[10px] uppercase tracking-widest mb-2 opacity-50">
                  Classification
                </span>
                <div className="flex flex-wrap gap-2">
                  {genreArr?.map((genre) => (
                    <span
                      key={genre.id}
                      className={`border ${borderColor} px-2 py-1 text-xs font-bold uppercase`}
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Narrative */}
            <div className="lg:col-span-9">
              <h2 className="text-xl font-bold uppercase tracking-tight mb-4 flex items-center gap-2">
                <Film className="w-5 h-5" />
                Narrative Synopsis
              </h2>
              <p className="text-lg md:text-xl leading-relaxed font-medium opacity-90 max-w-4xl">
                {MovieDetail.overview}
              </p>

              {/* Action Bar */}
              <div className="mt-10 flex flex-wrap gap-4">
                <button
                  className={`h-12 px-8 border-2 ${borderColor} flex items-center gap-3 hover:bg-[#E62020] hover:border-[#E62020] hover:text-white transition-colors group`}
                >
                  <span className="font-bold uppercase tracking-widest text-sm">
                    Add to Watchlist
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  className={`h-12 px-8 border-2 ${borderColor} bg-transparent opacity-50 hover:opacity-100 transition-opacity`}
                >
                  <span className="font-bold uppercase tracking-widest text-sm">
                    Share
                  </span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MovieDetails;
