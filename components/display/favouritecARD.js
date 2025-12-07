"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Calendar, Tv, Film, ArrowUpRight } from "lucide-react";
import HorizontalfavCard from "./horfavcard";
import { motion } from "framer-motion";

// --- API PLACEHOLDER ---
const fetchMovieData = async (id, media_type) => {
  console.log(`Fetching data for ${media_type} with ID: ${id}`);
  return {};
};

const FavoriteCard = ({ favoriteItem, viewMode, toggleFavorite }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [movieData, setMovieData] = useState({
    ...favoriteItem,
    number_of_seasons: "N/A",
  });
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. DATA FETCHING LOGIC (Preserved) ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (favoriteItem.media_type === "tv" && !movieData.number_of_seasons) {
        const data = await fetchMovieData(
          favoriteItem.id,
          favoriteItem.media_type
        );
        if (data) {
          setMovieData((prev) => ({
            ...prev,
            ...data,
            media_type: favoriteItem.media_type,
          }));
        }
      } else {
        setMovieData({
          ...favoriteItem,
          media_type: favoriteItem.media_type,
          release_date: favoriteItem.release_date,
          first_air_date: favoriteItem.first_air_date,
        });
      }
      setIsLoading(false);
    };
    fetchData();
  }, [favoriteItem]);

  // --- 2. FAVORITE CHECK LOGIC (Preserved) ---
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setIsFavorite(favorites.some((item) => item.id === favoriteItem.id));
  }, [favoriteItem.id]);

  const handleFavoriteToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(favoriteItem);
    setIsFavorite(!isFavorite);
  };

  // --- 3. HELPER FUNCTIONS ---
  const getImagePath = () => {
    if (movieData.poster_path)
      return `https://image.tmdb.org/t/p/w500/${movieData.poster_path}`;
    if (movieData.still_path)
      return `https://image.tmdb.org/t/p/w500/${movieData.still_path}`;
    return "/placeholder.svg";
  };

  const isTV =
    movieData.media_type === "tv" ||
    (movieData.first_air_date && !movieData.release_date);

  const getLink = () => {
    if (isTV) return `/series/${movieData.id}`;
    if (movieData.release_date) return `/movie/${movieData.id}`;
    return "#";
  };

  const renderTitle = () =>
    isTV
      ? movieData.name || "Unknown Series"
      : movieData.title || "Unknown Movie";

  const getYear = () => {
    const date = movieData.release_date || movieData.first_air_date;
    return date ? new Date(date).getFullYear() : "N/A";
  };

  // --- 4. RENDER: GRID VIEW ---
  if (viewMode === "grid") {
    // Loading State
    if (isLoading && !movieData.title && !movieData.name) {
      return (
        <div className="bg-neutral-900/50 border border-white/5 rounded-2xl aspect-[2/3] flex flex-col items-center justify-center gap-4 animate-pulse">
          <div className="w-10 h-10 bg-white/5 rounded-full" />
          <div className="text-[10px] font-mono text-neutral-500 uppercase">
            Loading_Data...
          </div>
        </div>
      );
    }

    return (
      <motion.div
        layout
        className="group relative rounded-2xl overflow-hidden bg-neutral-900 border border-white/5 isolate"
      >
        <Link
          href={getLink()}
          title={renderTitle()}
          className="block relative aspect-[2/3] overflow-hidden"
        >
          {/* IMAGE LAYER */}
          <div className="absolute inset-0 z-0">
            <Image
              src={getImagePath() || "/placeholder.svg"}
              alt={renderTitle()}
              fill
              className={`object-cover transition-all duration-700 ease-out group-hover:scale-110 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoadingComplete={() => setImageLoaded(true)}
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg";
              }}
              unoptimized
            />

            {/* GRADIENT OVERLAYS */}
            {/* Base subtle gradient for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-60" />

            {/* Hover dramatic gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>

          {/* TOP BADGES (Swiss Mono) */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
            <div className="flex items-center gap-2">
              <div className="px-2 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded text-[10px] font-mono text-white uppercase tracking-wider flex items-center gap-1.5">
                {isTV ? (
                  <Tv size={10} className="text-rose-400" />
                ) : (
                  <Film size={10} className="text-indigo-400" />
                )}
                <span>{isTV ? "SERIES" : "MOVIE"}</span>
              </div>
              {movieData.vote_average > 0 && (
                <div className="px-2 py-1 bg-black/40 backdrop-blur-md border border-white/10 rounded text-[10px] font-mono text-yellow-500 font-bold flex items-center gap-1">
                  <Star size={8} fill="currentColor" />
                  {movieData.vote_average.toFixed(1)}
                </div>
              )}
            </div>

            {/* FAVORITE BUTTON */}
            <button
              onClick={handleFavoriteToggle}
              className="p-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-white/10 hover:scale-110 transition-all active:scale-95"
            >
              <Heart
                size={16}
                className={`transition-colors duration-300 ${
                  isFavorite ? "fill-red-500 text-red-500" : "text-white"
                }`}
              />
            </button>
          </div>

          {/* CONTENT LAYER (Material Motion) */}
          <div className="absolute inset-x-0 bottom-0 p-5 z-20 flex flex-col justify-end">
            {/* Year Label */}
            <div className="transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 delay-75">
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                Released: {getYear()}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-lg md:text-xl font-black text-white leading-tight tracking-tight mt-2 line-clamp-2 drop-shadow-lg group-hover:line-clamp-none transition-all">
              {renderTitle()}
            </h3>

            {/* Overview (Reveal on Hover) */}
            <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
              <div className="overflow-hidden">
                <p className="text-xs text-neutral-400 line-clamp-3 mt-3 leading-relaxed font-sans">
                  {movieData.overview ||
                    "No overview available for this title."}
                </p>

                {/* CTA Button */}
                <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider mt-4 group/btn">
                  <span>View Details</span>
                  <ArrowUpRight
                    size={12}
                    className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform"
                  />
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // --- 5. RENDER: LIST VIEW ---
  return <HorizontalfavCard favoriteItem={favoriteItem} />;
};

export default FavoriteCard;
