"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Calendar, Film } from "lucide-react";

const MovieCards = (props) => {
  const { MovieCard } = props;
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Fallback for the poster image
  const poster_path = MovieCard.poster_path
    ? `https://image.tmdb.org/t/p/w342/${MovieCard.poster_path}`
    : "https://i.imgur.com/HIYYPtZ.png"; // A more generic placeholder

  // Rating and release year
  const rating = MovieCard.vote_average?.toFixed(1) || "N/A";
  const releaseYear = MovieCard.release_date
    ? new Date(MovieCard.release_date).getFullYear()
    : "N/A";

  // Handle favorite button toggle
  const handleFavoriteToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    if (isFavorite) {
      // Remove from favorites
      const updatedFavorites = favorites.filter(
        (item) => item.id !== MovieCard.id
      );
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    } else {
      // Add to favorites if not already present
      if (!favorites.some((item) => item.id === MovieCard.id)) {
        favorites.push(MovieCard);
        localStorage.setItem("favorites", JSON.stringify(favorites));
      }
    }

    setIsFavorite(!isFavorite);
  };

  // Check if the movie is favorited when component mounts
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const isMovieFavorited = favorites.some((item) => item.id === MovieCard.id);
    setIsFavorite(isMovieFavorited);
  }, [MovieCard.id]);

  return (
    <div className="group relative overflow-hidden rounded-2xl transition-all duration-300 ease-out will-change-transform hover:shadow-lg hover:shadow-slate-700/20">
      <Link href={`/movie/${MovieCard.id}`} title={MovieCard.title}>
        <div className="relative aspect-[2/3] overflow-hidden">
          {/* Image Container */}
          <div
            className={`h-full w-full transition-opacity duration-700 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            style={{ willChange: "opacity" }}
          >
            <Image
              src={poster_path}
              alt={MovieCard.title}
              className="h-full w-full transform object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] will-change-transform group-hover:scale-105"
              fill
              unoptimized
              onLoadingComplete={() => setImageLoaded(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900" />
          </div>

          {/* Media Type Badge */}
          <div
            className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-1"
            style={{ willChange: "transform" }}
          >
            <Film size={12} className="text-purple-400" />
            <span>Movie</span>
          </div>

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteToggle}
            className="absolute right-3 top-3 z-10 rounded-full bg-black/50 p-2.5 shadow-lg backdrop-blur-sm transition-all duration-300 ease-out hover:bg-black/70"
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
          >
            <Heart
              size={16}
              fill={isFavorite ? "red" : "none"}
              stroke={isFavorite ? "red" : "white"}
              className="transition-colors duration-300"
            />
          </button>
        </div>

        {/* Content Container */}
        <div
          className="absolute bottom-0 w-full bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent p-4 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:pb-6"
          style={{ willChange: "transform", backfaceVisibility: "hidden" }}
        >
          {/* Rating and Date */}
          <div className="mb-2 flex items-center gap-4 text-sm font-medium text-white/90">
            <div className="flex items-center gap-1.5">
              <Star size={14} className="text-yellow-400" />
              <span className="font-semibold">{rating}</span>
            </div>
            <div className="flex items-center gap-1.5 text-white/70">
              <Calendar size={14} />
              <span>{releaseYear}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="mb-2 line-clamp-1 text-lg font-semibold tracking-tight text-white">
            {MovieCard.title}
          </h3>

          {/* Hover-reveal Description */}
          <div
            className="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] max-h-0 group-hover:max-h-[200px]"
            style={{ willChange: "max-height" }}
          >
            <div
              className="transform translate-y-8 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-y-0 group-hover:opacity-100"
              style={{ willChange: "transform, opacity" }}
            >
              <p className="text-sm text-white/80 line-clamp-4">
                {MovieCard.overview || "No overview available."}
              </p>

              <div className="mt-3 inline-flex items-center text-xs font-medium text-white/70 transition-colors duration-300 hover:text-white">
                View details
                <svg
                  className="ml-1 h-3 w-3 transform transition-transform duration-300 ease-out group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default MovieCards;
