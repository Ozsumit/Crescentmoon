import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, SortAsc, SortDesc, Filter } from "lucide-react";
import HomeCards from "./HomeCard";
import HomeCards2 from "./generalcards";

const SearchDisplay = ({ movies }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("releaseDate");
  const [sortDirection, setSortDirection] = useState("desc");
  const [minRating, setMinRating] = useState(0);
  const [yearFilter, setYearFilter] = useState("all");
  const itemsPerPage = 12;

  // Process and filter movies
  const processedMovies = useMemo(() => {
    if (!movies || !Array.isArray(movies)) return [];

    let filtered = movies.filter(
      (movie) =>
        movie &&
      (movie.releaseDate || movie.release_date!== undefined) 

    
    );

    // Apply rating filter
    filtered = filtered.filter(
      (movie) => (movie.ratings || movie.vote_average || 0) >= minRating
    );

    // Apply year filter
    if (yearFilter !== "all") {
      filtered = filtered.filter((movie) => {
        const releaseYear = new Date(
          movie.releaseDate || movie.release_date
        ).getFullYear();
        return releaseYear.toString() === yearFilter;
      });
    }

    // Sort movies
    return filtered.sort((a, b) => {
      const aValue =
        sortField === "releaseDate"
          ? new Date(a.releaseDate || a.release_date)
          : a.ratings || a.vote_average || 0;
      const bValue =
        sortField === "releaseDate"
          ? new Date(b.releaseDate || b.release_date)
          : b.ratings || b.vote_average || 0;

      return sortDirection === "asc"
        ? aValue - bValue
        : bValue - aValue;
    });
  }, [movies, sortField, sortDirection, minRating, yearFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(processedMovies.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMovies = processedMovies.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Get unique years for filter
  const years = useMemo(() => {
    const uniqueYears = new Set(
      movies
        ?.map((movie) =>
          new Date(movie.releaseDate || movie.release_date).getFullYear()
        )
        .sort((a, b) => b - a)
    );
    return Array.from(uniqueYears);
  }, [movies]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* Controls Section */}
      <div className="mb-6 p-4 bg-slate-800 rounded-lg">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <select
              className="bg-slate-700 text-white rounded px-3 py-2"
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
            >
              <option value="releaseDate">Release Date</option>
              <option value="rating">Rating</option>
            </select>
            <button
              className="p-2 bg-slate-700 rounded hover:bg-slate-600"
              onClick={() =>
                setSortDirection(sortDirection === "asc" ? "desc" : "asc")
              }
            >
              {sortDirection === "asc" ? (
                <SortAsc className="w-5 h-5" />
              ) : (
                <SortDesc className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-white">Min Rating:</label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.5"
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-20 bg-slate-700 text-white rounded px-3 py-2"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-white">Year:</label>
              <select
                className="bg-slate-700 text-white rounded px-3 py-2"
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
              >
                <option value="all">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="flex flex-col items-center text-center py-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-600">
          Search Results
        </h2>
        
        {paginatedMovies.length > 0 ? (
          <>
            <div
              id="search-results"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 w-full"
            >
              {paginatedMovies.map((movie) => (
                <HomeCards key={movie.id} MovieCard={movie} className="w-full" />
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-4 mt-8">
              <button
                className="p-2 bg-slate-700 rounded hover:bg-slate-600 disabled:opacity-50"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-white">
                Page {currentPage} of {totalPages}
              </span>
              <button
                className="p-2 bg-slate-700 rounded hover:bg-slate-600 disabled:opacity-50"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </>
        ) : (
          <p className="text-lg sm:text-xl text-gray-300 mt-6">
            No results found. Please try different search criteria.
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
        
        <div className="w-full flex justify-center mt-4 mb-8">
          <span className="w-4/5 bg-slate-600 h-0.5"></span>
        </div>
        
        {paginatedMovies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {paginatedMovies.map((movie) => (
              <HomeCards2 key={movie.id} MovieCard={movie} />
            ))}
          </div>
        ) : (
          <div className="text-center text-slate-400 py-12">
            No results found. Try adjusting your filters!
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchDisplay;