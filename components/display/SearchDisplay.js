import React from "react";
import HomeCards2 from "./generalcards";

const SearchDisplay = ({ movies }) => {
  return (
    <div className="bg-slate-800/70 p-6 rounded-xl shadow-2xl min-h-screen">
      {/* Title Section */}
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

      {/* Movies Grid */}
      {movies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {movies.map((movie) => (
            <HomeCards2 key={movie.id} MovieCard={movie} />
          ))}
        </div>
      ) : (
        <div className="text-center text-slate-400 py-12">
          No results found. Try searching for something else!
        </div>
      )}
    </div>
  );
};

export default SearchDisplay;
