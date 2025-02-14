import React, { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  SortAsc,
  SortDesc,
  Filter,
  X,
  SlidersHorizontal,
  Eye,
  EyeOff,
  Search,
  Info,
} from "lucide-react";
import MovieCards from "./MovieCards";
import HorizontalHomeCard from "./HorHomeCards";
import { Tooltip } from "react-tooltip";
import HomeCards2 from "./generalcards";
import HomeCard from "./HomeCard";

const SearchDisplay = ({ media }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState("relevance");
  const [sortDirection, setSortDirection] = useState("asc"); // Changed to asc by default for relevance
  const [minRating, setMinRating] = useState(0);
  const [yearFilter, setYearFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [hideAdultContent, setHideAdultContent] = useState(true);
  const [showAllResults, setShowAllResults] = useState(false);
  const itemsPerPage = 12;

  // Function to preserve original order for relevance sorting
  const preserveOriginalOrder = () => {
    if (!media || !Array.isArray(media)) return [];

    // Add an index to each item to preserve original order
    return media.map((item, index) => ({
      ...item,
      originalIndex: index,
    }));
  };

  const indexedMedia = useMemo(preserveOriginalOrder, [media]);

  const processedMedia = useMemo(() => {
    if (!indexedMedia || !Array.isArray(indexedMedia)) return [];

    let filtered = indexedMedia;

    if (!showAllResults) {
      // Filter out items without posters
      filtered = filtered.filter((item) => item.poster_path !== null);

      // Filter out items without valid ratings
      filtered = filtered.filter((item) => {
        const rating = parseFloat(item.vote_average);
        return !isNaN(rating) && rating !== null && rating !== undefined;
      });

      // Filter based on minimum rating
      filtered = filtered.filter((item) => {
        const rating = parseFloat(item.vote_average);
        return !isNaN(rating) ? rating >= minRating : false;
      });
    }

    // Filter out adult content if enabled
    if (hideAdultContent) {
      filtered = filtered.filter((item) => !item.adult);
    }

    if (yearFilter !== "all" && !showAllResults) {
      filtered = filtered.filter((item) => {
        const releaseDate = item.release_date || item.first_air_date;
        if (!releaseDate) return false;
        const releaseYear = new Date(releaseDate).getFullYear();
        return releaseYear.toString() === yearFilter;
      });
    }

    if (typeFilter !== "all" && !showAllResults) {
      filtered = filtered.filter((item) => item.media_type === typeFilter);
    }

    return filtered.sort((a, b) => {
      if (sortField === "relevance") {
        // For relevance, we use the original index
        return sortDirection === "asc"
          ? a.originalIndex - b.originalIndex
          : b.originalIndex - a.originalIndex;
      } else if (sortField === "releaseDate") {
        const aDate = a.release_date || a.first_air_date || "0000-00-00";
        const bDate = b.release_date || b.first_air_date || "0000-00-00";
        const aValue = new Date(aDate);
        const bValue = new Date(bDate);
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      } else {
        const aValue = parseFloat(a.vote_average) || 0;
        const bValue = parseFloat(b.vote_average) || 0;
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
    });
  }, [
    indexedMedia,
    sortField,
    sortDirection,
    minRating,
    yearFilter,
    typeFilter,
    hideAdultContent,
    showAllResults,
  ]);

  const totalPages = Math.ceil(processedMedia.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedMedia = processedMedia.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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

  const normalizeItem = (item) => {
    return {
      ...item,
      title: item.title || item.name,
      releaseDate: item.release_date || item.first_air_date,
      ratings: item.vote_average,
    };
  };

  const activeFiltersCount = () => {
    let count = 0;
    if (minRating > 0) count++;
    if (yearFilter !== "all") count++;
    if (typeFilter !== "all") count++;
    if (hideAdultContent) count++;
    if (!showAllResults) count++; // Count default filtering as an active filter
    return count;
  };

  const resetFilters = () => {
    setMinRating(0);
    setYearFilter("all");
    setTypeFilter("all");
    setSortField("relevance");
    setSortDirection("asc"); // Reset to asc for relevance
    setHideAdultContent(true);
    setShowAllResults(false);
    setCurrentPage(1);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="hidden md:block mb-6 p-4 bg-slate-800 rounded-lg shadow-md">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-medium text-white">Filters</h3>
            <div className="ml-2 text-slate-400 text-sm">
              {processedMedia.length} results
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-slate-300 text-sm">Min Rating:</label>
              <input
                type="number"
                min="0"
                max="10"
                step=".5"
                value={minRating}
                onChange={(e) => {
                  setMinRating(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-20 bg-slate-700 text-white rounded px-3 py-2 text-sm border border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                disabled={showAllResults}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-slate-300 text-sm">Year:</label>
              <select
                className="bg-slate-700 text-white rounded px-3 py-2 text-sm border border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                value={yearFilter}
                onChange={(e) => {
                  setYearFilter(e.target.value);
                  setCurrentPage(1);
                }}
                disabled={showAllResults}
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
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                disabled={showAllResults}
              >
                <option value="all">All Types</option>
                <option value="movie">Movies</option>
                <option value="tv">TV Shows</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-slate-300 text-sm">Sort By:</label>
              <select
                className="bg-slate-700 text-white rounded px-3 py-2 text-sm border border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                value={sortField}
                onChange={(e) => {
                  setSortField(e.target.value);
                  // When changing sort field, reset to appropriate default direction
                  if (e.target.value === "relevance") {
                    setSortDirection("asc");
                  } else {
                    setSortDirection("desc");
                  }
                  setCurrentPage(1);
                }}
              >
                <option value="relevance">Relevance</option>
                <option value="releaseDate">Release Date</option>
                <option value="rating">Rating</option>
              </select>
              <button
                className="p-2 bg-slate-700 rounded hover:bg-slate-600 border border-slate-600 group relative"
                onClick={() =>
                  setSortDirection(sortDirection === "asc" ? "desc" : "asc")
                }
                aria-label={
                  sortDirection === "asc" ? "Sort Ascending" : "Sort Descending"
                }
                data-tooltip-id="sort-tooltip"
                data-tooltip-content={
                  sortDirection === "asc" ? "Sort Ascending" : "Sort Descending"
                }
              >
                {sortDirection === "asc" ? (
                  <SortAsc className="w-5 h-5 text-indigo-400" />
                ) : (
                  <SortDesc className="w-5 h-5 text-indigo-400" />
                )}
              </button>
              <Tooltip id="sort-tooltip" place="top" />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setHideAdultContent(!hideAdultContent)}
                className={`px-3 py-2 text-sm rounded border transition duration-200 flex items-center gap-1 ${
                  hideAdultContent
                    ? "bg-indigo-600 text-white border-indigo-700"
                    : "bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600 hover:text-white"
                }`}
                title={
                  hideAdultContent ? "Show Adult Content" : "Hide Adult Content"
                }
              >
                {hideAdultContent ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                {hideAdultContent ? "Hide 18+" : "Show 18+"}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowAllResults(!showAllResults);
                setCurrentPage(1);
              }}
              className={`px-3 py-2 text-sm rounded border transition duration-200 flex items-center gap-1 ${
                showAllResults
                  ? "bg-indigo-600 text-white border-indigo-700"
                  : "bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600 hover:text-white"
              }`}
              data-tooltip-id="all-results-tooltip"
              data-tooltip-content={
                showAllResults
                  ? "Show all results including those with missing data"
                  : "Show only results with complete data"
              }
            >
              {showAllResults ? "Filtered Results" : "Show All Results"}
              <Info className="w-3 h-3 text-slate-400 ml-1" />
            </button>
            <Tooltip id="all-results-tooltip" place="top" />
            <button
              onClick={resetFilters}
              className="px-3 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded border border-slate-600 transition duration-200 text-slate-300 hover:text-white flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      </div>
      <div className="md:hidden mb-4 flex justify-between items-center">
        <div className="text-slate-400 text-sm">
          {processedMedia.length} results
        </div>
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
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm flex items-center gap-1">
                  Show All Results
                  <button
                    data-tooltip-id="mobile-all-results-tooltip"
                    data-tooltip-content="Show all results including those with missing data"
                  >
                    <Info className="w-3 h-3 text-slate-400" />
                  </button>
                  <Tooltip id="mobile-all-results-tooltip" place="top" />
                </span>
                <button
                  onClick={() => {
                    setShowAllResults(!showAllResults);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-1 text-xs rounded-full transition duration-200 ${
                    showAllResults
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-700 text-slate-300"
                  }`}
                >
                  {showAllResults ? "On" : "Off"}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-sm">
                  Hide Adult Content
                </span>
                <button
                  onClick={() => setHideAdultContent(!hideAdultContent)}
                  className={`px-2 py-1 text-xs rounded-full transition duration-200 ${
                    hideAdultContent
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-700 text-slate-300"
                  }`}
                >
                  {hideAdultContent ? "On" : "Off"}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-slate-300 text-sm">Minimum Rating:</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={minRating}
                  onChange={(e) => {
                    setMinRating(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full accent-indigo-500"
                  disabled={showAllResults}
                />
                <span className="text-white bg-slate-700 px-2 py-1 rounded min-w-[40px] text-center">
                  {minRating}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-slate-300 text-sm">Year:</label>
              <select
                className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm border border-slate-600 focus:border-indigo-500 focus:outline-none"
                value={yearFilter}
                onChange={(e) => {
                  setYearFilter(e.target.value);
                  setCurrentPage(1);
                }}
                disabled={showAllResults}
              >
                <option value="all">All Years</option>
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-slate-300 text-sm">Content Type:</label>
              <select
                className="w-full bg-slate-700 text-white rounded px-3 py-2 text-sm border border-slate-600 focus:border-indigo-500 focus:outline-none"
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setCurrentPage(1);
                }}
                disabled={showAllResults}
              >
                <option value="all">All Types</option>
                <option value="movie">Movies Only</option>
                <option value="tv">TV Shows Only</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-slate-300 text-sm">Sort By:</label>
              <div className="flex gap-2">
                <select
                  className="flex-grow bg-slate-700 text-white rounded px-3 py-2 text-sm border border-slate-600 focus:border-indigo-500 focus:outline-none"
                  value={sortField}
                  onChange={(e) => {
                    setSortField(e.target.value);
                    // When changing sort field, reset to appropriate default direction
                    if (e.target.value === "relevance") {
                      setSortDirection("asc");
                    } else {
                      setSortDirection("desc");
                    }
                    setCurrentPage(1);
                  }}
                >
                  <option value="relevance">Relevance</option>
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
      {/* Results header with count */}
      <div className="text-center pt-4 pb-4 flex flex-col items-center">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-600 mb-2">
          Search Results
        </h2>
        {totalPages > 0 && (
          <p className="text-slate-400 text-sm">
            Showing {startIndex + 1}-
            {Math.min(startIndex + itemsPerPage, processedMedia.length)} of{" "}
            {processedMedia.length} results
          </p>
        )}
      </div>
      {paginatedMedia.length === 0 ? (
        <div className="bg-slate-800/50 rounded-xl p-8 max-w-md mx-auto">
          <div className="flex flex-col items-center">
            <Search className="w-12 h-12 text-slate-500 mb-4" />
            <p className="text-lg sm:text-xl text-gray-300 mb-2">
              No results found
            </p>
            <p className="text-sm text-gray-400 text-center">
              Try adjusting your filters or search for something else
            </p>
            {activeFiltersCount() > 0 && (
              <button
                onClick={resetFilters}
                className="mt-4 px-4 py-2 bg-indigo-600 rounded-md text-white text-sm hover:bg-indigo-700 transition"
              >
                Reset All Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="hidden md:block mb-8">
            <div
              id="search-results"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 w-full"
            >
              {paginatedMedia.map((item) => (
                <HomeCard
                  key={`${item.media_type}-${item.id}`}
                  MovieCard={normalizeItem(item)}
                  className="w-full"
                />
              ))}
            </div>
          </div>
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
          {totalPages > 1 && (
            <div className="flex justify-center mb-8">
              <input
                type="number"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value);
                  if (page >= 1 && page <= totalPages) {
                    setCurrentPage(page);
                  }
                }}
                className="w-16 bg-slate-700 text-white rounded px-3 py-2 text-sm border border-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none text-center"
              />
              <button
                onClick={() => {
                  const input = document.querySelector('input[type="number"]');
                  const page = parseInt(input.value);
                  if (page >= 1 && page <= totalPages) {
                    setCurrentPage(page);
                  }
                }}
                className="ml-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-white text-sm"
              >
                Go
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SearchDisplay;
