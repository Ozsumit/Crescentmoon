"use client";
import React, { useMemo } from "react";
import { X, Search } from "lucide-react";

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
  { id: 878, name: "Sci-Fi" },
  { id: 10770, name: "TV Movie" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "War" },
  { id: 37, name: "Western" },
];

const GenreSelector = ({
  isOpen,
  activeGenres,
  onGenreToggle,
  onClearGenres,
}) => {
  const [genreFilter, setGenreFilter] = React.useState("");

  const filteredGenres = useMemo(
    () =>
      FULL_GENRE_LIST.filter((genre) =>
        genre.name.toLowerCase().includes(genreFilter.toLowerCase())
      ),
    [genreFilter]
  );

  if (!isOpen) return null;

  return (
    <div className="w-full max-w-4xl bg-slate-800 rounded-2xl p-3 sm:p-4 mt-4">
      {/* Genre Search Input */}
      <div className="mb-3 relative">
        <input
          type="text"
          placeholder="Search genres..."
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
          className="w-full px-3 py-2 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Search movie genres"
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
      </div>

      {/* Genre Grid with Scrollable Container */}
      <div className="max-h-64 overflow-y-auto">
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
          {filteredGenres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => onGenreToggle(genre)}
              aria-pressed={activeGenres.some((g) => g.id === genre.id)}
              className={`px-2 py-1 sm:px-3 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 truncate ${
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
  );
};

export default GenreSelector;
