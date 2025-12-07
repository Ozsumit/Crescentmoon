"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Tv, Play } from "lucide-react";
import { motion } from "framer-motion";

const TvCards = ({ TvCard }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // --- Logic Setup ---
  const title = TvCard.name || TvCard.original_name;
  const linkPath = `/series/${TvCard.id}`;

  const getImagePath = () => {
    if (TvCard.poster_path)
      return `https://image.tmdb.org/t/p/w500/${TvCard.poster_path}`;
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
  // (Identical to MovieCards for consistency)

  // 1. Container: Tilt and slight rotation
  const containerVariants = {
    rest: { scale: 1, y: 0, rotate: 0 },
    hover: {
      scale: 1.02,
      y: -5,
      rotate: 0.5,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
  };

  // 2. Info Sheet: Background opacity change
  const sheetVariants = {
    rest: { backgroundColor: "rgba(10, 10, 10, 0.6)" },
    hover: {
      backgroundColor: "rgba(10, 10, 10, 0.9)",
      transition: { duration: 0.3 },
    },
  };

  // 3. Content: Height reveal
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
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative w-full h-full transform-gpu"
    >
      <Link
        href={linkPath}
        className="block w-full aspect-[2/3] relative rounded-[2rem] overflow-hidden shadow-2xl bg-[#0a0a0a] ring-1 ring-white/5"
      >
        {/* --- 1. POSTER IMAGE --- */}
        <div className="absolute inset-0 z-0 bg-neutral-900">
          <Image
            src={getImagePath()}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`object-cover transition-transform duration-700 ease-out transform-gpu ${
              // Removed opacity toggle to prevent black screens
              "opacity-100"
            } ${isHovered ? "scale-110" : "scale-100"}`}
            onLoadingComplete={() => setImageLoaded(true)}
            unoptimized // Ensures image loads without server config issues
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60" />
        </div>

        {/* --- 2. FLOATING BADGES --- */}
        <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start pointer-events-none">
          {/* Year Badge */}
          <div className="bg-white/90 backdrop-blur-md text-black text-[11px] font-black px-3 py-1.5 rounded-full shadow-lg">
            {formatDate(TvCard.first_air_date)}
          </div>

          {/* Favorite Button */}
          <motion.button
            pointerEvents="auto"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleFavoriteToggle}
            className={`
              w-10 h-10 flex items-center justify-center rounded-full shadow-lg border border-white/20 backdrop-blur-md transition-colors duration-200
              ${
                isFavorite
                  ? "bg-[#ffb4ab] text-[#690005]"
                  : "bg-black/40 text-white hover:bg-white hover:text-black"
              }
            `}
          >
            <Heart size={18} className={isFavorite ? "fill-[#690005]" : ""} />
          </motion.button>
        </div>

        {/* --- 3. EXPANDING INFO SHEET --- */}
        <motion.div
          variants={sheetVariants}
          className="absolute bottom-2 left-2 right-2 backdrop-blur-xl border border-white/10 rounded-[1.8rem] overflow-hidden z-20 shadow-lg flex flex-col justify-end"
        >
          <div className="px-4 pt-4 pb-2">
            {/* Header Row (Type & Rating) */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 bg-[#d0bcff] text-[#381e72]">
                  <Tv size={10} />
                  <span>Series</span>
                </span>

                {TvCard.vote_average > 0 && (
                  <div className="flex items-center gap-1 text-xs font-bold text-[#ffdcc2]">
                    <Star size={12} className="fill-[#ffdcc2]" />
                    <span>{TvCard.vote_average.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold leading-tight line-clamp-1 text-white mb-1">
              {title}
            </h3>
          </div>

          {/* Hidden Content (Reveals on Hover) */}
          <motion.div variants={contentVariants}>
            <div className="px-4 pb-4">
              <p className="text-xs text-neutral-300 line-clamp-3 leading-relaxed mb-4">
                {TvCard.overview || "No description available."}
              </p>

              <button className="w-full py-3 rounded-xl bg-[#c3f0c2] text-[#07210b] font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-[0.98]">
                <Play size={16} className="fill-[#07210b]" />
                <span>Watch Now</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      </Link>
    </motion.div>
  );
};

export default TvCards;
