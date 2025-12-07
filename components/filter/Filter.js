"use client";
import React, { useMemo } from "react";
import { X, Search, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  const containerVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95, pointerEvents: "none" },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      pointerEvents: "auto",
      transition: { type: "spring", stiffness: 300, damping: 25 },
    },
    exit: { opacity: 0, y: -10, scale: 0.95, pointerEvents: "none" },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          // FIX: Changed 'w-full' to specific responsive widths & added 'right-0'
          className="absolute right-0 top-full mt-3 z-[100] w-[90vw] sm:w-[500px] md:w-[600px] px-1"
        >
          {/* Glass Container */}
          <div className="rounded-3xl border border-white/10 bg-[#0a0a0a]/95 backdrop-blur-2xl shadow-2xl overflow-hidden p-6 ring-1 ring-white/5">
            {/* Header / Search Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2 text-white/80">
                <Sparkles size={16} className="text-purple-400" />
                <h3 className="text-sm font-bold uppercase tracking-widest">
                  Filter by Genre
                </h3>
              </div>

              <div className="relative w-full sm:w-56 group">
                <input
                  type="text"
                  placeholder="Search..."
                  value={genreFilter}
                  onChange={(e) => setGenreFilter(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/30 focus:outline-none focus:bg-white/10 focus:border-purple-500/50 transition-all"
                />
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-purple-400 transition-colors"
                />
              </div>
            </div>

            {/* Genre Grid */}
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
              {filteredGenres.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {filteredGenres.map((genre) => {
                    const isActive = activeGenres.some(
                      (g) => g.id === genre.id
                    );

                    return (
                      <button
                        key={genre.id}
                        onClick={() => onGenreToggle(genre)}
                        className={`
                          relative px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 border text-left
                          ${
                            isActive
                              ? "border-transparent bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-900/20 scale-[1.02]"
                              : "border-white/5 bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white hover:border-white/20 hover:scale-[1.02]"
                          }
                        `}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="activeDot"
                            className="absolute right-2 top-2 w-1.5 h-1.5 rounded-full bg-white shadow-sm"
                          />
                        )}
                        <span className="relative z-10 truncate block pr-2">
                          {genre.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center text-neutral-500 text-sm">
                  No genres found.
                </div>
              )}
            </div>

            {/* Footer */}
            {activeGenres.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-5 pt-4 border-t border-white/5 flex justify-end"
              >
                <button
                  onClick={onClearGenres}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                >
                  <X size={14} />
                  Clear Filters
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GenreSelector;
