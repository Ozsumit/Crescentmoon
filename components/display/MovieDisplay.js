import React from "react";
import MovieCards from "./MovieCards";
import MoviePagination from "../pagination/MoviePagination";

const MovieDisplay = (props) => {
  let { movies, pageid } = props;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 w-full py-10">
          {movies.map((movie) => (
            <MovieCards key={movie.id} MovieCard={movie} className="w-full" />
          ))}
        </div>

        <div className="mt-8">
          <MoviePagination pageid={pageid} />
        </div>
      </div>
    </div>
  );
};

export default MovieDisplay;
