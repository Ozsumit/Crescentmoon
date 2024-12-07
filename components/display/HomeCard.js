"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Heart, Star, Calendar, Info } from "lucide-react";

const HomeCards = ({ MovieCard }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const isTV = MovieCard.media_type === "tv";
  const title = isTV ? MovieCard.name : MovieCard.title;
  const href = isTV ? "/series/[id]" : "/movie/[id]";
  const as = isTV ? `/series/${MovieCard.id}` : `/movie/${MovieCard.id}`;

  // Determine image and link based on item type
  const getImagePath = () => {
    if (MovieCard.poster_path)
      return `https://image.tmdb.org/t/p/w342/${MovieCard.poster_path}`;
    return "https://i.imgur.com/HIYYPtZ.png";
  };

  const getLink = () => {
    if (MovieCard.media_type === "tv") {
      return `/series/${MovieCard.id}`;
    }
    return `/movie/${MovieCard.id}`;
  };

  const renderTitle = () => {
    return MovieCard.title || MovieCard.name || "Untitled";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get additional details
  const additionalDetails = {
    rating: MovieCard.vote_average
      ? `${MovieCard.vote_average.toFixed(1)}/10`
      : "N/A",
    date: formatDate(MovieCard.release_date || MovieCard.first_air_date),
    type: MovieCard.media_type === "tv" ? "Series" : "Movie",
    overview: MovieCard.overview || "No overview available",
  };

  // Handle adding/removing favorites
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
      favorites.push(MovieCard);
      localStorage.setItem("favorites", JSON.stringify(favorites));
    }

    setIsFavorite(!isFavorite);
  };

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setIsFavorite(favorites.some((item) => item.id === MovieCard.id));
  }, [MovieCard.id]);

  return (
    <div className="bg-slate-800/80 rounded-xl h-[14rem] sm:h-auto  overflow-hidden shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl relative group">
      <Link href={getLink()} title={renderTitle()} className="block relative">
        <Image
          src={getImagePath()}
          alt={renderTitle()}
          className="w-full h-32 sm:h-48  object-cover rounded-xl transition-transform duration-300 ease-in-out group-hover:scale-110"
          width={288}
          height={176}
          unoptimized
        />
        {/* Subtle Type Tag */}
        <div className="absolute top-2 left-2 bg-black/40 text-white/90 px-3 py-1 rounded-md text-xs font-semibold backdrop-blur-sm">
          {additionalDetails.type}
        </div>
      </Link>
      {/* Hover Overlay with Information */}
      <Link href={href} as={as}>
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity ease-in-out duration-300 flex flex-col justify-center items-center p-4 text-center text-white">
          {/* <h3 className="font-semibold text-lg mb-2 text-shadow-md">
            {renderTitle()}
          </h3> */}
          <p className="text-sm mb-3 text-shadow-sm line-clamp-3">
            {additionalDetails.overview}
          </p>
          <Link
            href={href}
            as={as}
            className="flex items-center text-xs sm:text-sm hover:text-blue-400 transition-colors"
          >
            <Info size={16} className="mr-2" />
            More Details
          </Link>
        </div>{" "}
      </Link>
      <div className="p-4">
        <h3 className="text-center text-slate-200 font-semibold text-base mb-2 line-clamp-1">
          {renderTitle()}
        </h3>

        {/* Additional Details Section */}
        <div className="flex flex-col lg:flex-row justify-between items-center text-xs text-slate-400">
          <div className="flex items-center">
            <Star size={14} className="mr-1 text-yellow-500" />
            <span>{additionalDetails.rating}</span>
          </div>

          <div className="flex items-center">
            <Calendar size={14} className="mr-1" />
            <span>{additionalDetails.date}</span>
          </div>
        </div>
      </div>
      {/* Favorite Toggle Button */}
      <button
        onClick={handleFavoriteToggle}
        className="absolute top-2 right-2 z-20 bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart
          size={20}
          fill={isFavorite ? "red" : "none"}
          stroke={isFavorite ? "red" : "white"}
          className="transition-colors"
        />
      </button>
    </div>
  );
};

export default HomeCards;
