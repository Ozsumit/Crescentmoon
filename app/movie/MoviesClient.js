"use client";

import MovieDisplay from "@/components/display/MovieDisplay";

const MoviesClient = ({ movies }) => {
  return (
    <div className="pt-16 h-auto">
      <MovieDisplay movies={movies} />
    </div>
  );
};

export default MoviesClient;
