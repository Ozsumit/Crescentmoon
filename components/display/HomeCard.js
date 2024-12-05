"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Info, PlayCircle } from "lucide-react";

const HomeCards = ({ MovieCard }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const isTV = MovieCard.media_type === "tv";
  const title = isTV ? MovieCard.name : MovieCard.title;
  const href = isTV ? "/series/[id]" : "/movie/[id]";
  const as = isTV ? `/series/${MovieCard.id}` : `/movie/${MovieCard.id}`;

  const posterPath = MovieCard.poster_path
    ? `https://image.tmdb.org/t/p/w342/${MovieCard.poster_path}`
    : "https://i.imgur.com/wjVuAGb.png";

  const rating = MovieCard.vote_average?.toFixed(1) || "N/A";
  const releaseDate = isTV ? MovieCard.first_air_date : MovieCard.release_date;
  const formattedDate = releaseDate
    ? new Date(releaseDate).getFullYear()
    : "N/A";

  const handleFavoriteToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (isFavorite) {
      const updatedFavorites = favorites.filter(
        (item) => item.id !== MovieCard.id
      );
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    } else {
      if (!favorites.some((item) => item.id === MovieCard.id)) {
        favorites.push(MovieCard);
        localStorage.setItem("favorites", JSON.stringify(favorites));
      }
    }

    setIsFavorite(!isFavorite);
  };

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const isMovieFavorited = favorites.some((item) => item.id === MovieCard.id);
    setIsFavorite(isMovieFavorited);
  }, [MovieCard.id]);

  return (
    <div
      className="relative group w-64 h-96 sm:w-52 sm:h-72 bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-all hover:scale-105 hover:shadow-2xl m-3"
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

      {/* Movie/TV Show Poster */}
      <Link href={href} as={as} aria-label={title} className="block relative">
        <Image
          src={posterPath}
          alt={title || "Media Poster"}
          className={`w-full h-full object-cover transition-all 
            ${isHovered ? "brightness-50" : "brightness-100"}`}
          width={208}
          height={288}
          unoptimized
        />

        {/* Hover Details */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/60 flex flex-col justify-center items-start text-white p-4">
            <p className="text-sm mb-2 text-left line-clamp-3">
              {MovieCard.overview || "No overview available"}
            </p>
            <Link
              href={href}
              as={as}
              className="flex items-center text-sm hover:text-blue-400 transition-colors"
            >
              <Info size={16} className="mr-2" />
              More Details
            </Link>
          </div>
        )}
      </Link>

      {/* Card Footer */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/100 to-transparent p-4 text-white">
        <h3 className="text-lg font-semibold  truncate mb-1">{title}</h3>
        <div className="flex justify-between items-center">
          <span className="text-sm">{rating}</span>
          <span className="text-sm text-gray-300">{formattedDate}</span>
        </div>
      </div>

      {/* Quick Actions */}
      {isHovered && (
        <div className="absolute top-2 left-2 flex gap-2">
          <Link
            href={href}
            as={as}
            className="flex items-center text-sm hover:text-blue-400 transition-colors"
          >
            <PlayCircle size={20} className="text-white" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default HomeCards;
