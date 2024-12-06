"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Info, PlayCircle, Star } from "lucide-react";

const TvCards = ({ TvCard }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const posterPath = TvCard.poster_path
    ? `https://image.tmdb.org/t/p/w342/${TvCard.poster_path}`
    : "https://i.imgur.com/wjVuAGb.png";

  const rating = TvCard.vote_average?.toFixed(1) || "N/A";
  const releaseDate = TvCard.first_air_date;
  const formattedDate = releaseDate
    ? new Date(releaseDate).getFullYear()
    : "N/A";

  const handleFavoriteToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (isFavorite) {
      const updatedFavorites = favorites.filter(
        (item) => item.id !== TvCard.id
      );
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    } else {
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

  return (
    <div
      className="relative group w-full aspect-[2/3] bg-gray-900 rounded-lg overflow-hidden shadow-lg transition-all hover:scale-105 hover:shadow-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Favorite Button */}
      <button
        onClick={handleFavoriteToggle}
        className="absolute top-2 right-2 z-20 bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart
          size={20}
          fill={isFavorite ? "red" : "none"}
          stroke={isFavorite ? "red" : "white"}
        />
      </button>

      {/* TV Show Poster */}
      <Link href={`/series/${TvCard.id}`} className="block relative h-full">
        <Image
          src={posterPath}
          alt={TvCard.name || "TV Show Poster"}
          className={`w-full h-full object-cover transition-all ${
            isHovered ? "brightness-50" : "brightness-100"
          }`}
          fill
          unoptimized
        />

        {/* Hover Details */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/60 flex flex-col justify-center items-start text-white p-4">
            <p className="text-xs sm:text-sm mb-2 text-left line-clamp-3">
              {TvCard.overview || "No overview available."}
            </p>
            <Link
              href={`/series/${TvCard.id}`}
              className="flex items-center text-xs sm:text-sm hover:text-blue-400 transition-colors"
            >
              <Info size={16} className="mr-2" />
              More Details
            </Link>
          </div>
        )}
      </Link>

      {/* Card Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/100 to-transparent p-2 sm:p-4 text-white">
        <h3 className="text-sm sm:text-lg font-semibold truncate mb-1">
          {TvCard.name}
        </h3>
        <div className="flex justify-between items-center text-xs sm:text-sm">
          <div className="flex items-center">
            <Star size={16} className="text-yellow-400 mr-1" />
            <span>{rating}</span>
          </div>
          <span className="text-gray-300">{formattedDate}</span>
        </div>
      </div>

      {/* Quick Actions */}
      {isHovered && (
        <div className="absolute top-2 left-2 flex gap-2">
          <Link
            href={`/series/${TvCard.id}`}
            className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
            aria-label="Watch Trailer"
          >
            <PlayCircle size={20} className="text-white" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default TvCards;
