import React from "react";
import HomeCards from "./HomeCard";
import HomeCards2 from "./generalcards";

const SearchDisplay = ({ movies }) => {
  // More lenient filtering that checks for the existence of movies and basic properties
  const filteredMovies =
    movies && Array.isArray(movies)
      ? movies.filter(
          (movie) =>
            movie &&
            (movie.releaseDate ||
              movie.poster_path ||
              movie.release_date !== undefined)
        )
      : [];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title Section */}
      <div className="flex flex-col items-center text-center py-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-600">
          Search Results
        </h2>

        {filteredMovies.length > 0 ? (
          <div
            id="search-results"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 w-full"
          >
            {filteredMovies.map((movie) => (
              <HomeCards key={movie.id} MovieCard={movie} className="w-full" />
            ))}
          </div>
        ) : (
          <p className="text-lg sm:text-xl text-gray-300 mt-6">
            No results found. Please try a different search.
          </p>
        )}
      </div>

      {/* Secondary Section */}
      <div className="bg-slate-800/70 p-6 rounded-xl shadow-2xl min-h-screen">
        <div className="flex place-content-center mt-5 mb-8 mx-5">
          <h1 className="w-full md:w-1/2 lg:w-1/3 text-white text-xl sm:text-2xl md:text-3xl text-center font-semibold">
            Search
            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-transparent bg-clip-text">
              {" "}
              Results
            </span>
          </h1>
        </div>

        {/* Metadata Divider */}
        <div className="w-full flex justify-center mt-4 mb-8">
          <span className="w-4/5 bg-slate-600 h-0.5"></span>
        </div>

        {/* Filtered Movies Grid */}
        {filteredMovies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredMovies.map((movie) => (
              <HomeCards2 key={movie.id} MovieCard={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-400 py-12">
            No results found. Try searching for something else!
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchDisplay;
