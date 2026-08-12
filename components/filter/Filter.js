"use client";

import React, { useMemo, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X, Search, Sparkles, Check, RotateCcw, SlidersHorizontal } from "lucide-react";
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
  activeGenres = [],
  onGenreToggle,
  onClearGenres,
  onClose,
}) => {
  const [genreFilter, setGenreFilter] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = useCallback(
    (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (typeof onClose === "function") {
        onClose();
      }
    },
    [onClose]
  );

  // Keyboard shortcut: ESC to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  // Lock body scroll on mobile only
  useEffect(() => {
    if (isOpen && window.innerWidth < 640) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const filteredGenres = useMemo(
    () =>
      FULL_GENRE_LIST.filter((genre) =>
        genre.name.toLowerCase().includes(genreFilter.toLowerCase())
      ),
    [genreFilter]
  );

  if (!mounted) return null;

  const content = (
    <AnimatePresence>
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-6 pointer-events-auto"
        >
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md cursor-pointer"
          />

          {/* Modal / Popover Box */}
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.96 }}
            transition={{ type: "spring", damping: 25, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
            className="
              relative z-20 w-full sm:max-w-[620px] bg-card border border-border
              rounded-t-3xl sm:rounded-3xl shadow-2xl sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]
              flex flex-col overflow-hidden text-card-foreground
              h-[85dvh] sm:h-auto sm:max-h-[80vh] ring-1 ring-white/10
            "
          >
            {/* --- HEADER --- */}
            <div className="p-4 sm:p-6 border-b border-border/80 bg-card/80 backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <SlidersHorizontal size={18} />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black tracking-tight">
                      Filter by Genre
                    </h2>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      Select one or multiple genres to refine your recommendations
                    </p>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={handleClose}
                  className="p-2.5 rounded-full bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-90 cursor-pointer"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search genres..."
                  value={genreFilter}
                  onChange={(e) => setGenreFilter(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 bg-muted/40 border border-border/80 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 focus:bg-background transition-all"
                />
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                {genreFilter && (
                  <button
                    type="button"
                    onClick={() => setGenreFilter("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* ACTIVE TAGS QUICK-REMOVE BAR */}
              {activeGenres.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none"
                >
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground shrink-0 mr-1">
                    Selected ({activeGenres.length}):
                  </span>
                  {activeGenres.map((genre) => (
                    <button
                      type="button"
                      key={`tag-${genre.id}`}
                      onClick={() => onGenreToggle?.(genre)}
                      className="group flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/15 text-primary border border-primary/30 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors shrink-0"
                    >
                      <span>{genre.name}</span>
                      <X size={12} className="opacity-70 group-hover:opacity-100" />
                    </button>
                  ))}
                </motion.div>
              )}
            </div>

            {/* --- GENRE GRID LIST --- */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-card">
              {filteredGenres.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                  {filteredGenres.map((genre) => {
                    const isActive = activeGenres.some(
                      (g) => g.id === genre.id
                    );

                    return (
                      <button
                        type="button"
                        key={genre.id}
                        onClick={() => onGenreToggle?.(genre)}
                        className={`
                          group relative px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all duration-200
                          flex items-center justify-between border text-left active:scale-[0.97] cursor-pointer
                          ${
                            isActive
                              ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                              : "bg-muted/30 hover:bg-muted text-foreground border-border/60 hover:border-foreground/20"
                          }
                        `}
                      >
                        <span className="truncate pr-1">{genre.name}</span>

                        {isActive ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 25 }}
                            className="shrink-0 w-5 h-5 rounded-full bg-primary-foreground text-primary flex items-center justify-center shadow-sm"
                          >
                            <Check size={12} className="stroke-[3]" />
                          </motion.div>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-muted-foreground/30 group-hover:bg-foreground/50 transition-colors" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-12 text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    No genres match &quot;{genreFilter}&quot;
                  </p>
                  <button
                    type="button"
                    onClick={() => setGenreFilter("")}
                    className="text-xs text-primary font-bold hover:underline"
                  >
                    Clear search filter
                  </button>
                </div>
              )}
            </div>

            {/* --- ACTION FOOTER --- */}
            <div className="p-4 sm:p-5 border-t border-border/80 bg-card/90 backdrop-blur-md flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => onClearGenres?.()}
                disabled={activeGenres.length === 0}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted/60 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              >
                <RotateCcw size={14} />
                <span>Reset All</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                >
                  <span>Apply Filters</span>
                  <span className="hidden sm:inline-block text-[10px] opacity-70 px-1.5 py-0.5 rounded bg-primary-foreground/20 font-mono">
                    ESC
                  </span>
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};

export default GenreSelector;