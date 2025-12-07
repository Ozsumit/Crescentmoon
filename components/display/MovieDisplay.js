import React from "react";
import MovieCards from "./MovieCards";
import MoviePagination from "../pagination/MoviePagination";
import { Sparkles } from "lucide-react"; // Optional icon for flair

const MovieDisplay = ({ movies, pageid }) => {
  return (
    <div className="min-h-screen w-full bg-[#050505] text-white selection:bg-purple-500/30">
      {/* --- Ambient Background Glow --- */}
      <div className="fixed top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-purple-900/20 via-blue-900/10 to-transparent blur-3xl pointer-events-none z-0" />

      <div className="relative z-10 mx-auto max-w-[1600px] px-6 md:px-10 lg:px-16 py-16">
        {/* --- Header Section --- */}
        <div className="mb-16 flex flex-col items-start gap-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-purple-300 backdrop-blur-md">
            <Sparkles size={12} />
            <span>Discover</span>
          </div>

          <h1 className="text-5xl font-bold tracking-tight md:text-7xl bg-gradient-to-br from-white via-white/90 to-white/50 bg-clip-text text-transparent">
            Movies
          </h1>

          <p className="max-w-xl text-lg text-neutral-400">
            Explore the latest releases, top-rated classics, and hidden gems.
            Curated just for you.
          </p>
        </div>

        {/* --- Card Grid --- */}
        {/* 
           Note: We removed 'hover:scale-105' from here because 
           MovieCards handles its own Framer Motion animation internally.
        */}
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 xl:gap-8">
          {movies.map((movie) => (
            <div key={movie.id} className="w-full h-full">
              <MovieCards MovieCard={movie} />
            </div>
          ))}
        </div>

        {/* --- Pagination Section --- */}
        {/* Styled to look like a floating glass panel */}
        <div className="mt-24 flex justify-center">
          <div className="rounded-2xl border border-white/10 bg-neutral-900/50 p-4 backdrop-blur-xl shadow-2xl">
            <MoviePagination pageid={pageid} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDisplay;
