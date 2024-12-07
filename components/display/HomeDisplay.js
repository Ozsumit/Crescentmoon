"use client";
import React, { useState, useEffect } from "react";
import { Filter, X } from "lucide-react";
import HomePagination from "../pagination/HomePagination";
import HomeCards from "./HomeCard";
import useGenreStore from "@/components/zustand";

const FULL_GENRE_LIST = [
  { id: 28, name: "Action" },
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentary" },
  { id: 18, name: "Drama" },
  { id: 10751, name: "Family" },
  { id: 14, name: "Fantasy" },
  { id: 36, name: "History" },
  { id: 27, name: "Horror" },
  { id: 10402, name: "Music" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science Fiction" },
  { id: 10770, name: "TV Movie" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
];

const HomeDisplay = ({ movies: initialMovies, pageid }) => {
  const { activeGenres, toggleGenre, clearGenres } = useGenreStore();
  const [movies, setMovies] = useState(initialMovies);
  const [page, setPage] = useState(pageid || 1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const fetchMovies = async (currentPage = 1, genreIds = []) => {
    setIsLoading(true);
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
      const data = await response.json();

      setMovies(data.results || []);
      setTotalPages(data.total_pages || 1);
      setPage(currentPage);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Reset to page 1 whenever genres change
    fetchMovies(1, activeGenres);
  }, [activeGenres]);

  useEffect(() => {
    // Fetch data for the current page
    fetchMovies(page, activeGenres);
  }, [page]);

  const toggleGenreContainer = () => {
    const genreContainer = document.getElementById("genre-container");
    if (genreContainer) {
      genreContainer.classList.toggle("hidden");
    }
  };

  const handleClearFilters = () => {
    clearGenres(); // Clear genres from the state
    fetchMovies(1, []); // Fetch all movies
  };

  return (
    <div className="bg-slate-900/70 backdrop-blur-xl p-6 my-8 rounded-2xl shadow-2xl max-w-7xl w-full">
      <h2 className="text-3xl lg:text-4xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-600">
        {activeGenres.length > 0
          ? `${activeGenres.map((g) => g.name).join(", ")} Movies`
          : "Popular Movies"}
      </h2>

      <div className="flex flex-col items-center space-y-4 mb-6">
        <div className="flex flex-wrap justify-center items-center gap-4">
          <button
            onClick={toggleGenreContainer}
            className="flex items-center space-x-2 bg-indigo-600/80 text-white px-4 py-2 rounded-full hover:bg-indigo-700 transition-colors"
          >
            <Filter className="w-5 h-5" />
            <span>Filter Genres</span>
            {activeGenres.length > 0 && (
              <span className="ml-2 bg-white text-indigo-600 rounded-full px-2 py-0.5 text-xs">
                {activeGenres.length}
              </span>
            )}
          </button>

          {activeGenres.length > 0 && (
            <button
              onClick={handleClearFilters}
              className="text-slate-400 hover:text-white flex items-center space-x-1"
            >
              <X className="w-4 h-4" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>

        {activeGenres.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {activeGenres.map((genre) => (
              <span
                key={genre.id}
                className="bg-indigo-600/20 text-indigo-300 px-3 py-1 rounded-full text-sm flex items-center"
              >
                {genre.name}
                <button
                  onClick={() => toggleGenre(genre)}
                  className="ml-2 text-indigo-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
          </div>
        )}

        <div
          id="genre-container"
          className="hidden w-full max-w-4xl bg-slate-800 rounded-2xl p-4 mt-4 transition-all duration-300 ease-in-out"
        >
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {FULL_GENRE_LIST.map((genre) => (
              <button
                key={genre.id}
                onClick={() => toggleGenre(genre)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  activeGenres.some((g) => g.id === genre.id)
                    ? "bg-indigo-600 text-white scale-105"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600 hover:scale-105"
                }`}
              >
                {genre.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
          <span className="ml-3 text-indigo-500">Loading...</span>
        </div>
      )}

      <div
        id="trending"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 w-full"
      >
        {movies.map((movie) => (
          <HomeCards key={movie.id} MovieCard={movie} className="h-[420px]" />
        ))}
      </div>

      <div className="mt-10">
        <HomePagination page={page} setPage={setPage} totalPages={totalPages} />
      </div>
    </div>
  );
};

export default HomeDisplay;
