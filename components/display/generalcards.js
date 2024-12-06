import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Heart, Star, Calendar, Clock } from "lucide-react";

const HomeCards2 = ({ MovieCard }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  // Determine image and link based on item type
  const getImagePath = () => {
    if (MovieCard.poster_path)
      return `https://image.tmdb.org/t/p/w342/${MovieCard.poster_path}`;
    return "https://i.imgur.com/xDHFGVl.jpeg";
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
    <div className="bg-slate-700/50 rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl relative">
      <Link href={getLink()} title={renderTitle()} className="block">
        <Image
          src={getImagePath()}
          alt={renderTitle()}
          className="w-full h-48 object-cover"
          width={288}
          height={176}
          unoptimized
        />
        {/* Subtle Type Tag */}
        <div className="absolute top-2 left-2 bg-black/30 text-white/70 px-2 py-0.5 rounded text-xs">
          {additionalDetails.type}
        </div>
      </Link>
      <div className="p-4">
        <h3 className="text-center text-slate-200 font-semibold text-base mb-2 line-clamp-1">
          {renderTitle()}
        </h3>

        {/* Additional Details Section */}
        <div className="flex justify-between items-center text-xs text-slate-400">
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
        className="absolute top-2 right-2 z-20 bg-black/50 rounded-full p-1 hover:bg-black/70 transition-colors"
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
      >
        <Heart
          size={16}
          fill={isFavorite ? "red" : "none"}
          stroke={isFavorite ? "red" : "white"}
          className="transition-colors"
        />
      </button>
    </div>
  );
};

export default HomeCards2;
