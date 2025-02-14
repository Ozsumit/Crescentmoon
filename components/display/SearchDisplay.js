import React, { useState, useEffect } from "react";
import HomeCards from "./HomeCard";
import HomeCards2 from "./generalcards";

const SearchDisplay = ({ movies }) => {
  const [sortOption, setSortOption] = useState("title");
  const [filterOption, setFilterOption] = useState("all");
  const [countryOption, setCountryOption] = useState("all");

  useEffect(() => {
    console.log("Sort Option:", sortOption);
    console.log("Filter Option:", filterOption);
    console.log("Country Option:", countryOption);
  }, [sortOption, filterOption, countryOption]);

  // Filter movies with no rating or poster
  const filteredMovies =
    movies && Array.isArray(movies)
      ? movies.filter(
          (movie) => movie.rating !== undefined && movie.poster !== undefined
        )
      : [];

  console.log("Filtered Movies:", filteredMovies);

  // Sort movies based on the selected option
  const sortedMovies = [...filteredMovies].sort((a, b) => {
    if (sortOption === "title") {
      return a.title.localeCompare(b.title);
    } else if (sortOption === "rating") {
      return b.rating - a.rating;
    } else if (sortOption === "releaseDate") {
      return new Date(b.releaseDate) - new Date(a.releaseDate);
    }
    return 0;
  });

  console.log("Sorted Movies:", sortedMovies);

  // Filter movies based on the selected genre and country options
  const displayedMovies = sortedMovies.filter((movie) => {
    const genreMatch = filterOption === "all" || movie.genre === filterOption;
    const countryMatch = countryOption === "all" || movie.country === countryOption;
    return genreMatch && countryMatch;
  });

  console.log("Displayed Movies:", displayedMovies);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* Title Section */}
      <div className="flex flex-col items-center text-center py-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-600">
          Search Results
        </h2>

        {/* Sort and Filter Controls */}
        <div className="flex justify-center space-x-4 mb-6">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            <option value="title">Sort by Title</option>
            <option value="rating">Sort by Rating</option>
            <option value="releaseDate">Sort by Release Date</option>
          </select>
          <select
            value={filterOption}
            onChange={(e) => setFilterOption(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            <option value="all">All Genres</option>
            <option value="action">Action</option>
            <option value="comedy">Comedy</option>
            <option value="drama">Drama</option>
            {/* Add more genres as needed */}
          </select>
          <select
            value={countryOption}
            onChange={(e) => setCountryOption(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            <option value="all">All Countries</option>
            <option value="USA">USA</option>
            <option value="UK">UK</option>
            <option value="France">France</option>
            {/* Add more countries as needed */}
          </select>
        </div>

        {displayedMovies.length > 0 ? (
          <div
            id="search-results"
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 w-full"
          >
            {displayedMovies.map((movie) => (
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
        {displayedMovies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {displayedMovies.map((movie) => (
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
              
