import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  SortAsc,
  SortDesc,
  Filter,
  X,
  SlidersHorizontal,
} from "lucide-react";
import HomeCards from "./HomeCard";
import HomeCards2 from "./generalcards";
import HorizontalHomeCard from "./HorHomeCards";

const SearchDisplay = ({ media }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("releaseDate");
  const [sortDirection, setSortDirection] = useState("desc");
  const [minRating, setMinRating] = useState(0);
  const [yearFilter, setYearFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const itemsPerPage = 12;

  // Process and filter media items
  const processedMedia = useMemo(() => {
    if (!media || !Array.isArray(media)) return [];

    let filtered = media.filter((item) => item.poster_path !== null);

    // Apply rating filter
    filtered = filtered.filter((item) => (item.vote_average || 0) >= minRating);

    // Apply year filter
    if (yearFilter !== "all") {
      filtered = filtered.filter((item) => {
        const releaseDate = item.release_date || item.first_air_date;
        if (!releaseDate) return false;
        const releaseYear = new Date(releaseDate).getFullYear();
        return releaseYear.toString() === yearFilter;
      });
    }

    // Apply media type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((item) => item.media_type === typeFilter);
    }

    // Sort media
    return filtered.sort((a, b) => {
      if (sortField === "releaseDate") {
        const aDate = a.release_date || a.first_air_date || "0000-00-00";
        const bDate = b.release_date || b.first_air_date || "0000-00-00";
        const aValue = new Date(aDate);
        const bValue = new Date(bDate);
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      } else {
        const aValue = a.vote_average || 0;
        const bValue = b.vote_average || 0;
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
    });
  }, [media, sortField, sortDirection, minRating, yearFilter, typeFilter]);

  // Calculate pagination
  const totalPages = Math.ceil(processedMedia.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMedia = processedMedia.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Get unique years for filter
  const years = useMemo(() => {
    if (!media || !Array.isArray(media)) return [];

    const uniqueYears = new Set();
    media.forEach((item) => {
      const date = item.release_date || item.first_air_date;
      if (date) {
        const year = new Date(date).getFullYear();
        if (!isNaN(year)) {
          uniqueYears.add(year);
        }
      }
    });
    return Array.from(uniqueYears).sort((a, b) => b - a);
  }, [media]);

  // Normalize item for HomeCards components
  const normalizeItem = (item) => {
    return {
      ...item,
      title: item.title || item.name,
      releaseDate: item.release_date || item.first_air_date,
      ratings: item.vote_average,
    };
  };

  // Active filters count for mobile badge
  const activeFiltersCount = () => {
    let count = 0;
    if (minRating > 0) count++;
    if (yearFilter !== "all") count++;
    if (typeFilter !== "all") count++;
    return count;
  };

  // Reset all filters
  const resetFilters = () => {
    setMinRating(0);
    setYearFilter("all");
    setTypeFilter("all");
    setSortField("releaseDate");
    setSortDirection("desc");
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* Desktop Filters Section */}
      <div className="hidden md:block mb-6 p-4 bg-slate-800 rounded-lg shadow-md">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          {/* Filter Title */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-medium text-white">Filters</h3>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-slate-300 text-sm">Min Rating:</label>
              <input
                type="number"
                min="0"
                max="10"
                step=".5"
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-20 bg-slate-700 text-white rounded px-3 py-2 text-sm border border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-slate-300 text-sm">Year:</label>
              <select
                className="bg-slate-700 text-white rounded px-3 py-2 text-sm border border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
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
            <div className="flex items-center gap-2">
              <label className="text-slate-300 text-sm">Type:</label>
              <select
                className="bg-slate-700 text-white rounded px-3 py-2 text-sm border border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="movie">Movies</option>
                <option value="tv">TV Shows</option>
              </select>
            </div>
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2">
            <label className="text-slate-300 text-sm">Sort By:</label>
            <select
              className="bg-slate-700 text-white rounded px-3 py-2 text-sm border border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
            >
              <option value="releaseDate">Release Date</option>
              <option value="rating">Rating</option>
            </select>
            <button
              className="p-2 bg-slate-700 rounded hover:bg-slate-600 border border-slate-600"
              onClick={() =>
                setSortDirection(sortDirection === "asc" ? "desc" : "asc")
              }
              title={
                sortDirection === "asc" ? "Sort Ascending" : "Sort Descending"
              }
            >
              {sortDirection === "asc" ? (
                <SortAsc className="w-5 h-5 text-indigo-400" />
              ) : (
                <SortDesc className="w-5 h-5 text-indigo-400" />
              )}
            </button>
          </div>

          {/* Reset Button */}
          <button
            onClick={resetFilters}
            className="px-3 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded border border-slate-600 transition duration-200 text-slate-300 hover:text-white flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      {/* Mobile Filter Button */}
      <div className="md:hidden mb-4 flex justify-between items-center">
        <h3 className="text-lg font-medium text-white"></h3>
        <button
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="p-2 bg-slate-800 rounded-lg shadow-md flex items-center gap-1 text-sm border border-slate-700"
        >
          <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
          <span className="text-white">Filters</span>
          {activeFiltersCount() > 0 && (
            <span className="bg-indigo-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeFiltersCount()}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Filters (Collapsible) */}
      {showMobileFilters && (
        <div className="md:hidden mb-6 p-4 bg-slate-800 rounded-lg shadow-md animate-slideDown">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-white">Filters</h3>
            <button
              onClick={() => setShowMobileFilters(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Rating Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-slate-300 text-sm">Minimum Rating:</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
                <span className="text-white bg-slate-700 px-2 py-1 rounded min-w-[40px] text-center">
                  {minRating}
                </span>
              </div>
            </div>

            {/* Year Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-slate-300 text-sm">Year:</label>
              <select
                className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm border border-slate-600 focus:border-indigo-500 focus:outline-none"
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

            {/* Type Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-slate-300 text-sm">Content Type:</label>
              <select
                className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm border border-slate-600 focus:border-indigo-500 focus:outline-none"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="movie">Movies Only</option>
                <option value="tv">TV Shows Only</option>
              </select>
            </div>

            {/* Sort Controls */}
            <div className="flex flex-col gap-1">
              <label className="text-slate-300 text-sm">Sort By:</label>
              <div className="flex gap-2">
                <select
                  className="flex-grow bg-slate-700 text-white rounded px-3 py-2 text-sm border border-slate-600 focus:border-indigo-500 focus:outline-none"
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                >
                  <option value="releaseDate">Release Date</option>
                  <option value="rating">Rating</option>
                </select>
                <button
                  className="p-2 bg-slate-700 rounded hover:bg-slate-600 border border-slate-600"
                  onClick={() =>
                    setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                  }
                >
                  {sortDirection === "asc" ? (
                    <SortAsc className="w-5 h-5 text-indigo-400" />
                  ) : (
                    <SortDesc className="w-5 h-5 text-indigo-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between pt-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded border border-slate-600 text-slate-300 hover:text-white text-sm"
              >
                Reset All
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white text-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Title Section */}
      <div className="text-center pt-8 pb-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-600">
          Search Results
        </h2>
      </div>

      {paginatedMedia.length === 0 ? (
        <div className="bg-slate-800/50 rounded-xl p-8 max-w-md mx-auto">
          <p className="text-lg sm:text-xl text-gray-300 mb-2">
            No results found
          </p>
          <p className="text-sm text-gray-400">
            Try adjusting your filters or search for something else
          </p>
        </div>
      ) : (
        <>
          {/* Primary Grid View - Desktop Only */}
          <div className="hidden md:block mb-8">
            <div
              id="search-results"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 w-full"
            >
              {paginatedMedia.map((item) => (
                <HomeCards
                  key={`${item.media_type}-${item.id}`}
                  MovieCard={normalizeItem(item)}
                  className="w-full"
                />
              ))}
            </div>
          </div>

          {/* Alternative View - Mobile Only */}
          <div className="md:hidden mb-4">
            <div className="grid grid-cols-1 gap-4">
              {paginatedMedia.map((item) => (
                <HorizontalHomeCard
                  key={`${item.media_type}-${item.id}`}
                  MovieCard={normalizeItem(item)}
                />
              ))}
            </div>
          </div>

          {/* Pagination Controls - Updated Design */}
          <div className="flex items-center justify-center gap-2 mt-4 mb-8 bg-slate-800 rounded-full px-2 py-1 shadow-md w-fit mx-auto">
            <button
              className="p-2 rounded-full hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-transparent transition duration-200"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-5 h-5 text-indigo-400" />
            </button>
            <span className="text-white px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="p-2 rounded-full hover:bg-slate-700 disabled:opacity-50 disabled:hover:bg-transparent transition duration-200"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-5 h-5 text-indigo-400" />
            </button>
          </div>
        </>
      )}

      {/* Alternative View - Completely removed from desktop */}
    </div>
  );
};

// Add required CSS for animations
const styleTag = document.createElement("style");
styleTag.textContent = `
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-slideDown {
    animation: slideDown 0.2s ease-out forwards;
  }
`;
document.head.appendChild(styleTag);

export default SearchDisplay;
