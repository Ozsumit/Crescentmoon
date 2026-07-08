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
          <div className="rounded-3xl border border-border bg-card/95 backdrop-blur-2xl shadow-2xl overflow-hidden p-6 ring-1 ring-border">
            {/* Header / Search Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2 text-foreground/80">
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
                  className="w-full pl-9 pr-4 py-2 bg-background/50 border border-border rounded-lg text-sm text-foreground placeholder-foreground/30 focus:outline-none focus:bg-background/80 focus:border-primary/50 transition-all"
                />
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30 group-focus-within:text-primary transition-colors"
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
                              ? "border-transparent bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                              : "border-border bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:border-foreground/20 hover:scale-[1.02]"
                          }
                        `}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="activeDot"
                            className="absolute right-2 top-2 w-1.5 h-1.5 rounded-full bg-primary-foreground shadow-sm"
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
                <div className="py-8 text-center text-muted-foreground text-sm">
                  No genres found.
                </div>
              )}
            </div>

            {/* Footer */}
            {activeGenres.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-5 pt-4 border-t border-border flex justify-end"
              >
                <button
                  onClick={onClearGenres}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
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
