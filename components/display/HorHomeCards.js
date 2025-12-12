"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Calendar, PlayCircle, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const HorizontalHomeCard = ({ MovieCard, className }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const isTV = MovieCard.media_type === "tv";
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

  // --- FAVORITE LOGIC ---
  useEffect(() => {
    // Check initial state from local storage
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setIsFavorite(favorites.some((item) => item.id === MovieCard.id));
  }, [MovieCard.id]);

  const handleFavoriteToggle = (e) => {
    // 1. PREVENT NAVIGATION (Crucial for UX)
    e.preventDefault();
    e.stopPropagation();

    // 2. Optimistic UI Update (Instant feedback)
    const newStatus = !isFavorite;
    setIsFavorite(newStatus);

    // 3. Update Storage
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (!newStatus) {
      // Remove
      const updated = favorites.filter((item) => item.id !== MovieCard.id);
      localStorage.setItem("favorites", JSON.stringify(updated));
    } else {
      // Add
      if (!favorites.some((item) => item.id === MovieCard.id)) {
        favorites.push(MovieCard);
        localStorage.setItem("favorites", JSON.stringify(favorites));
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10, scale: 0.98 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: true, margin: "50px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full transform-gpu relative group"
    >
      {/* 
        FAVORITE BUTTON 
        Positioned absolute so it sits on top. 
        High z-index to ensure clickability.
      */}
      <motion.button
        onClick={handleFavoriteToggle}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.8 }}
        className={`
          absolute top-3 right-3 z-20 
          w-9 h-9 flex items-center justify-center rounded-full 
          backdrop-blur-md shadow-lg border 
          transition-all duration-300 ease-out
          ${
            isFavorite
              ? "bg-rose-500/20 border-rose-500/50" // Active Glow
              : "bg-black/30 border-white/10 hover:bg-black/60" // Inactive Glass
          }
        `}
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
        className={`
          flex w-full h-40 
          bg-[#141414] rounded-[2rem] overflow-hidden 
          border border-white/5 shadow-md hover:shadow-2xl hover:border-white/10 hover:bg-[#1a1a1a]
          transition-all duration-300
          ${className}
        `}
      >
        {/* --- LEFT: IMAGE --- */}
        <div className="p-2 h-full w-[120px] flex-shrink-0">
          <div className="relative h-full w-full rounded-[1.5rem] overflow-hidden bg-neutral-900 shadow-inner">
            <Image
              src={getImagePath()}
              alt={title}
              fill
              className={`object-cover transition-all duration-700 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              } group-hover:scale-110`}
              onLoadingComplete={() => setImageLoaded(true)}
            />
            {/* Dark overlay on hover for better text contrast if needed */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </div>
        </div>

        {/* --- RIGHT: INFO --- */}
        <div className="flex-1 py-3 pr-4 pl-2 flex flex-col justify-center gap-1.5 relative">
          {/* Top Row */}
          <div className="flex items-center gap-2">
            <span
              className={`
                text-[10px] font-bold px-2.5 py-1 rounded-md transition-colors duration-300
                ${
                  isTV
                    ? "bg-[#e8def8] text-[#1d192b] group-hover:bg-[#d0bcff]"
                    : "bg-[#c4eed0] text-[#0a2010] group-hover:bg-[#bceeff]"
                }
              `}
            >
              {isTV ? "TV" : "FILM"}
            </span>

            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#25232a] text-[#ffdcc2] text-[10px] font-bold">
              <Star size={10} className="fill-[#ffdcc2]" />
              {MovieCard.vote_average?.toFixed(1)}
            </div>
          </div>

          {/* Title */}
          <div className="pr-8">
            {" "}
            {/* Padding right to avoid text overlapping the heart */}
            <h3 className="text-lg font-bold text-white leading-tight line-clamp-1 mb-0.5 group-hover:text-violet-200 transition-colors duration-300">
              {title}
            </h3>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
            <Calendar size={12} />
            <span>
              {formatDate(MovieCard.release_date || MovieCard.first_air_date)}
            </span>
          </div>

          <p className="text-[11px] text-neutral-500 line-clamp-1 leading-relaxed">
            {MovieCard.overview}
          </p>

          {/* CTA */}
          <div className="mt-auto flex justify-end">
            <motion.div
              whileTap={{ scale: 0.95 }}
              className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm hover:brightness-110 transition-all"
            >
              <PlayCircle size={14} className="fill-black text-white" />
              WATCH
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default HorizontalHomeCard;
