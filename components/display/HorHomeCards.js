"use client";
import React, { useState, useEffect, useCallback, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Calendar, PlayCircle, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const HorizontalHomeCard = memo(({ MovieCard, className }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Safely determine if it's TV or Movie
  const isTV =
    MovieCard.media_type === "tv" || MovieCard.first_air_date !== undefined;
  const title = isTV ? MovieCard.name : MovieCard.title;
  const linkPath = isTV ? `/series/${MovieCard.id}` : `/movie/${MovieCard.id}`;

  const getImagePath = () => {
    if (MovieCard.poster_path)
      return `https://image.tmdb.org/t/p/w342/${MovieCard.poster_path}`;
    return "https://i.imgur.com/HIYYPtZ.png";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).getFullYear();
  };

  // --- FAVORITE LOGIC OPTIMIZED ---
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setIsFavorite(favorites.some((item) => item.id === MovieCard.id));
  }, [MovieCard.id]);

  // Wrapped in useCallback so it doesn't recreate on every render
  const handleFavoriteToggle = useCallback(
    (e) => {
      // 1. PREVENT NAVIGATION (Crucial for UX inside a Link container)
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      // 2. Optimistic UI Update
      const newStatus = !isFavorite;
      setIsFavorite(newStatus);

      // 3. Update Storage
      const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
      if (!newStatus) {
        const updated = favorites.filter((item) => item.id !== MovieCard.id);
        localStorage.setItem("favorites", JSON.stringify(updated));
      } else {
        if (!favorites.some((item) => item.id === MovieCard.id)) {
          favorites.push(MovieCard);
          localStorage.setItem("favorites", JSON.stringify(favorites));
        }
      }
    },
    [isFavorite, MovieCard],
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -10, scale: 0.98 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: true, margin: "50px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full transform-gpu relative group"
    >
      {/* FAVORITE BUTTON */}
      <motion.button
        onClick={handleFavoriteToggle}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.8 }}
        className={`absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center rounded-full backdrop-blur-md shadow-lg border transition-all duration-300 ease-out ${
          isFavorite
            ? "bg-destructive border-destructive text-destructive-foreground"
            : "bg-background/30 border-border text-foreground hover:bg-background/60"
        }`}
      >
        <AnimatePresence mode="wait">
          {isFavorite ? (
            <motion.div
              key="active"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 15 }}
            >
              <Heart size={16} className="fill-rose-500 text-rose-500" />
            </motion.div>
          ) : (
            <motion.div
              key="inactive"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Heart size={16} className="text-neutral-400" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* MAIN CARD LINK */}
      <Link
        href={linkPath}
        className={`flex w-full h-40 bg-card rounded-[2rem] overflow-hidden border border-border shadow-md hover:shadow-2xl hover:border-foreground/20 hover:bg-card/80 transition-all duration-300 ${className || ""}`}
      >
        {/* --- LEFT: IMAGE --- */}
        <div className="p-2 h-full w-[120px] flex-shrink-0">
          <div className="relative h-full w-full rounded-[1.5rem] overflow-hidden bg-neutral-900 shadow-inner">
            <Image
              src={getImagePath()}
              alt={title}
              fill
              loading="lazy"
              sizes="120px" // Optimized for exact container bounds
              className={`object-cover transition-all duration-700 ${
                imageLoaded ? "opacity-100 blur-0" : "opacity-0 blur-md"
              } group-hover:scale-110`}
              onLoad={() => setImageLoaded(true)} // Replaced deprecated onLoadingComplete
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </div>
        </div>

        {/* --- RIGHT: INFO --- */}
        <div className="flex-1 py-3 pr-4 pl-2 flex flex-col justify-center gap-1.5 relative">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-colors duration-300 ${
                isTV
                  ? "bg-primary text-primary-foreground group-hover:opacity-90"
                  : "bg-secondary text-secondary-foreground group-hover:opacity-90"
              }`}
            >
              {isTV ? "TV" : "FILM"}
            </span>

            {MovieCard.vote_average > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-foreground text-[10px] font-bold">
                <Star size={10} className="fill-foreground" />
                {MovieCard.vote_average?.toFixed(1)}
              </div>
            )}
          </div>

          <div className="pr-8">
            <h3 className="text-lg font-bold text-foreground leading-tight line-clamp-1 mb-0.5 group-hover:text-primary transition-colors duration-300">
              {title}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <Calendar size={12} />
            <span>
              {formatDate(MovieCard.release_date || MovieCard.first_air_date)}
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground line-clamp-1 leading-relaxed">
            {MovieCard.overview || "No description available."}
          </p>

          <div className="mt-auto flex justify-end">
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm hover:brightness-110 transition-all"
            >
              <PlayCircle size={14} className="fill-primary-foreground text-primary" />
              WATCH
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

HorizontalHomeCard.displayName = "HorizontalHomeCard";

export default HorizontalHomeCard;
