import React from "react";
import HomeCards from "./HomeCard";

const SearchDisplay = (props) => {
  const { movies } = props;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center text-center py-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-600">
          Search Results
        </h2>

        {movies.length > 0 ? (
          <div
            id="search-results"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 w-full"
          >
            {movies.map((movie) => (
              <HomeCards key={movie.id} MovieCard={movie} className="w-full" />
            ))}
          </div>
        ) : (
          <p className="text-lg sm:text-xl text-gray-300 mt-6">
            No results found. Please try a different search.
          </p>
        )}
      </div>
    </div>
  );
};

export default SearchDisplay;
