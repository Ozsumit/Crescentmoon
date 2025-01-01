"use client";
import React, { useState, useEffect } from "react";
import { Filter, X } from "lucide-react";
import HomePagination from "../pagination/HomePagination";
import HomeCards from "./HomeCard";
import useGenreStore from "@/components/zustand";
import ContinueWatching from "../continuewatching";
import RecommendedMovies from "../recommended";
import GenreSelector from "@/components/filter/Filter";

const HomeDisplay = ({ movies: initialMovies, pageid }) => {
  const { activeGenres, toggleGenre, clearGenres } = useGenreStore();
  const [movies, setMovies] = useState(initialMovies);
  const [page, setPage] = useState(pageid || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenreMenuOpen, setIsGenreMenuOpen] = useState(false);
  const [error, setError] = useState(null);

  // Fetch Movies
  const fetchMovies = async (currentPage = 1, genreIds = []) => {
    setIsLoading(true);
    setError(null);
    try {
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      const url =
        genreIds.length > 0
          ? `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&with_genres=${genreIds
              .map((g) => g.id)
              .join(
                ","
              )}&page=${currentPage}&language=en-US&sort_by=popularity.desc`
          : `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&page=${currentPage}&language=en-US`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      const data = await response.json();

      setMovies(data.results || []);
      setTotalPages(data.total_pages || 1);
      setPage(currentPage);
    } catch (error) {
      console.error("Error fetching movies:", error);
      setError("Unable to load movies. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies(1, activeGenres);
  }, [activeGenres]);

  useEffect(() => {
    fetchMovies(page, activeGenres);
  }, [page]);

  const toggleGenreContainer = () => {
    setIsGenreMenuOpen(!isGenreMenuOpen);
  };

  const handleClearFilters = () => {
    clearGenres();
    fetchMovies(1, []);
  };

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 mb-8 mt-12 lg:px-8 xl:px-12">
      <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
        <ContinueWatching />
        <div className="p-4 sm:p-6 md:p-8">
          {/* Title */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-600 truncate">
            {activeGenres.length > 0
              ? `${activeGenres.map((g) => g.name).join(", ")} Movies`
              : "Popular Movies"}
          </h2>

          {/* Filters Container */}
          <div className="flex flex-col items-center space-y-4 mb-6">
            <div className="flex flex-wrap justify-end items-right gap-2 sm:gap-4">
              {/* Filter Genres Button */}
              <button
                onClick={toggleGenreContainer}
                aria-label="Filter Movie Genres"
                aria-expanded={isGenreMenuOpen}
                className="flex items-center space-x-2 bg-indigo-600/80 text-white px-3 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm">Filter Genres</span>
                {activeGenres.length > 0 && (
                  <span
                    className="ml-2 bg-white text-indigo-600 rounded-full px-2 py-0.5 text-xs"
                    aria-label={`${activeGenres.length} genres selected`}
                  >
                    {activeGenres.length}
                  </span>
                )}
              </button>

              {activeGenres.length > 0 && (
                <button
                  onClick={handleClearFilters}
                  aria-label="Clear Genre Filters"
                  className="text-slate-400 hover:text-white flex items-center space-x-1 text-xs sm:text-sm"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>

            {/* Active Genres Tags */}
            {activeGenres.length > 0 && (
              <div className="flex flex-wrap justify-end gap-2 max-w-full">
                {activeGenres.map((genre) => (
                  <span
                    key={genre.id}
                    className="bg-indigo-600/20 text-indigo-300 px-2 py-1 rounded-full text-xs sm:text-sm flex items-center max-w-full"
                  >
                    <span className="truncate max-w-[150px]">{genre.name}</span>
                    <button
                      onClick={() => toggleGenre(genre)}
                      aria-label={`Remove ${genre.name} genre`}
                      className="ml-2 text-indigo-400 hover:text-white flex-shrink-0"
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Genre Selector Component */}

            {/* Loading and Error States */}
            {isLoading && (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                <span className="ml-3 text-indigo-500 text-sm">Loading...</span>
              </div>
            )}

            {error && (
              <div className="text-center py-8 text-red-500">{error}</div>
            )}

            {/* Continue Watching Section */}
            <GenreSelector
              isOpen={isGenreMenuOpen}
              activeGenres={activeGenres}
              onGenreToggle={toggleGenre}
              onClearGenres={clearGenres}
            />
          </div>
          {/* Movies Grid */}
          {!isLoading && !error && (
            <>
              <h2 className="text-2xl font-bold text-white mb-4">
                Trending Movies
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4">
                {movies.map((movie) => (
                  <HomeCards
                    key={movie.id}
                    MovieCard={movie}
                    className="h-[300px] sm:h-[360px] lg:h-[420px]"
                  />
                ))}
              </div>

              {/* Recommended Movies Section */}
              <RecommendedMovies />

              {/* Pagination */}
              <div className="mt-6 sm:mt-10">
                <HomePagination
                  page={page}
                  setPage={setPage}
                  totalPages={totalPages}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeDisplay;
