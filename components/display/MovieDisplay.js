import React from "react";
import HomeCard from "./HomeCard";
import HorizontalHomeCard from "./HorHomeCards";
import MoviePagination from "../pagination/MoviePagination";

const MovieDisplay = ({ movies, pageid }) => {
  return (
    <div className="min-h-screen w-full bg-background text-foreground selection:bg-primary/30">
      {/* --- Ambient Background Glow --- */}
      <div className="fixed top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-3xl pointer-events-none z-0" />

      <div className="relative z-10 mx-auto max-w-[1600px] px-6 md:px-10 lg:px-16 py-16">
        {/* --- Header Section --- */}
        <div className="mb-16 flex flex-col items-start gap-4">
          <h1 className="text-5xl font-bold tracking-tight md:text-7xl text-foreground">
            Movies
          </h1>

          <p className="max-w-xl text-lg text-muted-foreground">
            Explore the latest releases, top-rated classics, and hidden gems.
            Curated just for you.
          </p>
        </div>

        {/* --- Card Grid --- */}
        <div className="hidden md:grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 xl:gap-8">
          {movies.map((movie) => (
            <div key={movie.id} className="w-full h-full">
              <HomeCard MovieCard={movie} />
            </div>
          ))}
        </div>

        <div className="md:hidden grid grid-cols-1 gap-4">
          {movies.map((movie) => (
            <HorizontalHomeCard key={movie.id} MovieCard={movie} />
          ))}
        </div>

        {/* --- Pagination Section --- */}
        {/* Styled to look like a floating glass panel */}
        <div className="mt-24 flex justify-center">
          <div className="rounded-2xl border border-border bg-card/50 p-4 backdrop-blur-xl shadow-2xl">
            <MoviePagination pageid={pageid} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDisplay;
