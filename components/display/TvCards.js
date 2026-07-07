"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Tv, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TvCards = ({ TvCard }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // --- Logic Setup ---
  const title = TvCard.name || TvCard.original_name;
  const linkPath = `/series/${TvCard.id}`;

  const getImagePath = () => {
    if (TvCard.poster_path)
      return `https://image.tmdb.org/t/p/w342/${TvCard.poster_path}`;
    return "https://i.imgur.com/HIYYPtZ.png"; // Fallback
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).getFullYear();
  };

  // --- Favorites Logic ---
  const handleFavoriteToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if (isFavorite) {
      const updated = favorites.filter((item) => item.id !== TvCard.id);
      localStorage.setItem("favorites", JSON.stringify(updated));
    } else {
      // Avoid duplicates
      if (!favorites.some((item) => item.id === TvCard.id)) {
        favorites.push(TvCard);
        localStorage.setItem("favorites", JSON.stringify(favorites));
      }
    }
    setIsFavorite(!isFavorite);
  };

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setIsFavorite(favorites.some((item) => item.id === TvCard.id));
  }, [TvCard.id]);

  // --- ANIMATION CONFIGURATION ---
  const containerVariants = {
    rest: { scale: 1, y: 0, rotate: 0 },
    hover: {
      scale: 1.02,
      y: -5,
      rotate: 0.5,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
  };

  const sheetVariants = {
    rest: { backgroundColor: "hsl(var(--card) / 0.6)" },
    hover: {
      backgroundColor: "hsl(var(--card) / 0.9)",
      transition: { duration: 0.3 },
    },
  };

  const contentVariants = {
    rest: {
      height: 0,
      opacity: 0,
      transition: { duration: 0.2, ease: "circOut" },
    },
    hover: {
      height: "auto",
      opacity: 1,
      transition: { duration: 0.3, ease: "circOut" },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="rest"
      whileHover="hover"
      whileTap={{ scale: 0.98 }}
      layout="position"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative w-full h-full transform-gpu"
      style={{ willChange: "transform" }}
    >
      {/* 
         1. MAIN LINK AREA 
         Contains Image + Bottom Info Sheet
      */}
      <Link
        href={linkPath}
        className="block w-full aspect-[2/3] relative rounded-[2rem] overflow-hidden shadow-2xl bg-card ring-1 ring-border"
      >
        {/* IMAGE */}
        <div className="absolute inset-0 z-0 bg-muted">
          <Image
            src={getImagePath()}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`
                object-cover transition-transform duration-700 ease-out transform-gpu 
                ${imageLoaded ? "opacity-100" : "opacity-0"} 
                ${isHovered ? "scale-110" : "scale-100"}
            `}
            onLoad={() => setImageLoaded(true)}
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-60" />
        </div>

        {/* EXPANDING INFO SHEET */}
        <motion.div
          variants={sheetVariants}
          className="absolute bottom-2 left-2 right-2 backdrop-blur-xl border border-border rounded-[1.8rem] overflow-hidden z-20 shadow-lg flex flex-col justify-end"
        >
          <div className="px-4 pt-4 pb-2">
            {/* Header Row (Type & Rating) */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 bg-primary text-primary-foreground">
                  <Tv size={10} />
                  <span>Series</span>
                </span>

                {TvCard.vote_average > 0 && (
                  <div className="flex items-center gap-1 text-xs font-bold text-accent-foreground">
                    <Star size={12} className="fill-current" />
                    <span>{TvCard.vote_average.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold leading-tight line-clamp-1 text-foreground mb-1">
              {title}
            </h3>
          </div>

          {/* Hidden Content */}
          <motion.div variants={contentVariants}>
            <div className="px-4 pb-4">
              <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-4">
                {TvCard.overview || "No description available."}
              </p>

              <div className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-[0.98]">
                <Play size={16} className="fill-current" />
                <span>Watch Now</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </Link>

      {/* 
         2. FLOATING BADGES (Outside Link)
         This ensures the heart button is clickable without triggering navigation.
      */}
      <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-start pointer-events-none">
        {/* Year Badge */}
        <div className="bg-background/90 backdrop-blur-md text-foreground text-[11px] font-black px-3 py-1.5 rounded-full shadow-lg border border-border">
          {formatDate(TvCard.first_air_date)}
        </div>

        {/* Favorite Button */}
        <motion.button
          // Remove "pointerEvents='auto'" from here
          onClick={handleFavoriteToggle}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`
            pointer-events-auto  /* <--- ADD THIS HERE */
            w-10 h-10 flex items-center justify-center rounded-full shadow-lg border border-border backdrop-blur-md transition-colors duration-200 cursor-pointer
            ${
              isFavorite
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background/40 border-border text-foreground hover:bg-foreground hover:text-background hover:border-foreground"
            }
          `}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isFavorite ? (
              <motion.div
                key="fav"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <Heart size={18} className="fill-[#690005]" />
              </motion.div>
            ) : (
              <motion.div
                key="not-fav"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <Heart size={18} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default TvCards;
