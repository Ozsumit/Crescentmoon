import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Info, PlayCircle, Star } from "lucide-react";

const SeasonCard = ({ SeasonDetails, SeriesId }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Determine the fallback poster image
  const posterPath = SeasonDetails.poster_path
    ? `https://image.tmdb.org/t/p/w342/${SeasonDetails.poster_path}`
    : "https://i.imgur.com/xDHFGVl.jpeg";

  // Rating and release date
  const rating = SeasonDetails.vote_average?.toFixed(1) || "N/A";
  const releaseDate = SeasonDetails.air_date;
  const formattedDate = releaseDate
    ? new Date(releaseDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";

  // Handle favorite toggle
  const handleFavoriteToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (isFavorite) {
      const updatedFavorites = favorites.filter(
        (item) => item.id !== SeasonDetails.id
      );
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    } else {
      if (!favorites.some((item) => item.id === SeasonDetails.id)) {
        favorites.push(SeasonDetails);
        localStorage.setItem("favorites", JSON.stringify(favorites));
      }
    }
    setIsFavorite(!isFavorite);
  };

  // Check if the season is in favorites
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setIsFavorite(favorites.some((item) => item.id === SeasonDetails.id));
  }, [SeasonDetails.id]);

  return (
    <div
      className="relative bg-slate-700/50 rounded-xl overflow-hidden shadow-lg transition-all hover:scale-105 hover:shadow-2xl"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Favorite Button */}

      {/* Season Poster */}
      <Link
        href={`/series/${SeriesId}/season/${SeasonDetails.season_number}`}
        title={SeasonDetails.name}
        className="block"
      >
        <Image
          src={posterPath}
          alt={SeasonDetails.name || "Season Poster"}
          className="w-full h-48 object-cover transition-all"
          width={288}
          height={432}
          unoptimized
        />

        {/* Hover Overlay */}
        {isHovered && (
          <div className="absolute inset-0 bg-black/70 flex flex-col justify-center items-center text-white p-4 text-center">
            <p className="text-sm mb-2 line-clamp-3">
              {SeasonDetails.overview || "No overview available"}
            </p>
            <Link
              href={`/series/${SeriesId}/season/${SeasonDetails.season_number}`}
              className="flex items-center text-sm hover:text-blue-400 transition-colors"
            >
              <Info size={16} className="mr-2" />
              More Details
            </Link>
          </div>
        )}
      </Link>

      {/* Card Footer */}
      <div className="p-4">
        <h3 className="text-center z-[100] text-slate-200 font-semibold text-base mb-2 line-clamp-1">
          {SeasonDetails.name || "Unknown Season"}
        </h3>
        <div className="flex justify-between items-center text-xs text-slate-400">
          <div className="flex items-center">
            <Star size={14} className="mr-1 text-yellow-500" />
            <span>{rating}</span>
          </div>
          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  );
};

export default SeasonCard;
