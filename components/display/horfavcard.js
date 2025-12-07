"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Calendar, Tv, Film, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";

// --- API PLACEHOLDER ---
const fetchMovieData = async (id, media_type) => {
  // In a real app, fetch data here.
  return {};
};

const HorizontalfavCard = ({ favoriteItem, toggleFavorite }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [movieData, setMovieData] = useState({
    ...favoriteItem,
    number_of_seasons: "N/A",
  });
  const [isLoading, setIsLoading] = useState(true);

  // --- DATA FETCHING (Preserved) ---
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

  // --- FAVORITE SYNC (Preserved) ---
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setIsFavorite(favorites.some((item) => item.id === favoriteItem.id));
  }, [favoriteItem.id]);

  // --- HELPERS ---
  const isTV =
    movieData.media_type === "tv" ||
    (movieData.first_air_date && !movieData.release_date);

  const getImagePath = () => {
    if (movieData.poster_path)
      return `https://image.tmdb.org/t/p/w500/${movieData.poster_path}`;
    if (movieData.still_path)
      return `https://image.tmdb.org/t/p/w500/${movieData.still_path}`;
    return "/placeholder.svg";
  };

  const getLink = () => {
    if (isTV) return `/series/${movieData.id}`;
    if (movieData.release_date) return `/movie/${movieData.id}`;
    return "#";
  };

  const renderTitle = () => {
    return isTV
      ? movieData.name || "Unknown Series"
      : movieData.title || "Unknown Movie";
  };

  const getYear = () => {
    const date = movieData.release_date || movieData.first_air_date;
    return date ? new Date(date).getFullYear() : "N/A";
  };

  const handleFavoriteToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(favoriteItem);
    setIsFavorite(!isFavorite);
  };

  // --- LOADING STATE ---
  if (isLoading && !movieData.title && !movieData.name) {
    return (
      <div className="w-full h-48 bg-neutral-900/50 border border-white/5 rounded-2xl flex items-center justify-center animate-pulse">
        <span className="text-[10px] font-mono text-neutral-600 uppercase">
          Loading_Asset...
        </span>
      </div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative w-full bg-neutral-900/60 backdrop-blur-sm border border-white/5 hover:border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:bg-neutral-900/80 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50"
    >
      <Link href={getLink()} className="flex flex-col sm:flex-row h-full">
        {/* --- LEFT: IMAGE SPINE --- */}
        <div className="relative w-full sm:w-40 md:w-48 aspect-[2/3] sm:aspect-auto sm:h-auto flex-shrink-0 overflow-hidden">
          {/* Image */}
          <Image
            src={getImagePath() || "/placeholder.svg"}
            alt={renderTitle()}
            fill
            className={`object-cover transition-all duration-700 ease-in-out group-hover:scale-105 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoadingComplete={() => setImageLoaded(true)}
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
            unoptimized
          />

          {/* Shine Effect on Hover */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out z-10" />

          {/* Type Badge (Absolute on Mobile, Hidden on Desktop as it moves to text area) */}
          <div className="absolute top-3 left-3 sm:hidden">
            <div className="px-2 py-1 bg-black/60 backdrop-blur-md rounded border border-white/10 text-[10px] font-bold text-white uppercase">
              {isTV ? "TV" : "MOV"}
            </div>
          </div>
        </div>

        {/* --- RIGHT: CONTENT GRID --- */}
        <div className="flex-1 p-5 md:p-6 flex flex-col relative z-20">
          {/* Header Row */}
          <div className="flex justify-between items-start gap-4">
            <div>
              {/* Meta Row (Swiss Style) */}
              <div className="flex flex-wrap items-center gap-3 mb-2 text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
                <span
                  className={`flex items-center gap-1.5 ${
                    isTV ? "text-rose-400" : "text-indigo-400"
                  }`}
                >
                  {isTV ? <Tv size={12} /> : <Film size={12} />}
                  {isTV ? "Series" : "Movie"}
                </span>
                <span className="w-px h-3 bg-white/10" />
                <span className="flex items-center gap-1.5">
                  <Calendar size={12} />
                  {getYear()}
                </span>
                {movieData.vote_average > 0 && (
                  <>
                    <span className="w-px h-3 bg-white/10" />
                    <span className="flex items-center gap-1.5 text-yellow-500">
                      <Star size={12} fill="currentColor" />
                      {movieData.vote_average.toFixed(1)}
                    </span>
                  </>
                )}
              </div>

              {/* Title */}
              <h3 className="text-xl md:text-2xl font-black text-white leading-tight group-hover:text-indigo-100 transition-colors">
                {renderTitle()}
              </h3>
            </div>

            {/* Favorite Action */}
            <button
              onClick={handleFavoriteToggle}
              className="flex-shrink-0 p-2.5 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 text-neutral-400 hover:text-red-500 transition-all active:scale-95 group/heart"
            >
              <Heart
                size={18}
                className={`transition-colors duration-300 ${
                  isFavorite ? "fill-red-500 text-red-500" : ""
                }`}
              />
            </button>
          </div>

          {/* Overview */}
          <div className="mt-4 mb-6 flex-1">
            <p className="text-sm text-neutral-400 line-clamp-2 md:line-clamp-3 leading-relaxed">
              {movieData.overview || "No overview available for this title."}
            </p>
          </div>

          {/* Footer / CTA */}
          <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-neutral-600 uppercase">
              ID: {movieData.id}
            </div>

            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider group/link">
              <span>View Details</span>
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover/link:bg-white/20 transition-colors">
                <ArrowUpRight
                  size={12}
                  className="group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform"
                />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default HorizontalfavCard;
