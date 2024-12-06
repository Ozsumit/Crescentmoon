import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Heart, Star, Calendar, Clock } from "lucide-react";

const FavoriteCard = ({ favoriteItem }) => {
  // Handle removing from favorites
  const handleRemoveFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    const updatedFavorites = favorites.filter(
      (item) => item.id !== favoriteItem.id
    );
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));

    // Dispatch storage event to update other tabs
    window.dispatchEvent(new Event("storage"));
  };

  // Determine image and link based on item type
  const getImagePath = () => {
    if (favoriteItem.poster_path)
      return `https://image.tmdb.org/t/p/w342/${favoriteItem.poster_path}`;
    if (favoriteItem.still_path)
      return `https://image.tmdb.org/t/p/w342/${favoriteItem.still_path}`;
    return "https://i.imgur.com/HIYYPtZ.png";
  };

  const getLink = () => {
    // Series link
    if (favoriteItem.first_air_date) {
      return `/series/${favoriteItem.id}`;
    }
    // Season link
    if (favoriteItem.season_number) {
      return `/series/${favoriteItem.series_id}/season/${favoriteItem.season_number}`;
    }
    // Episode link
    if (favoriteItem.episode_number) {
      return `/series/${favoriteItem.series_id}/season/${favoriteItem.season_number}/${favoriteItem.episode_number}`;
    }
    // Movie link
    if (favoriteItem.release_date) {
      return `/movie/${favoriteItem.id}`;
    }
    return "#";
  };

  const renderTitle = () => {
    // Series
    if (favoriteItem.first_air_date) {
      return favoriteItem.name || "Unknown Series";
    }
    // Season
    if (favoriteItem.season_number) {
      return `Season ${favoriteItem.season_number}: ${
        favoriteItem.name || "Unknown Season"
      }`;
    }
    // Episode
    if (favoriteItem.episode_number) {
      return `S${favoriteItem.season_number} E${favoriteItem.episode_number}: ${
        favoriteItem.name || "Unknown Episode"
      }`;
    }
    // Movie
    if (favoriteItem.release_date) {
      return favoriteItem.title || "Unknown Movie";
    }
    return "Favorite Item";
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Get additional details
  const getAdditionalDetails = () => {
    // Series details
    if (favoriteItem.first_air_date) {
      return {
        rating: favoriteItem.vote_average
          ? `${favoriteItem.vote_average.toFixed(1)}/10`
          : "N/A",
        date: formatDate(favoriteItem.first_air_date),
        type: "Series",
      };
    }

    // Season details
    if (favoriteItem.season_number) {
      return {
        episodeCount: favoriteItem.episode_count
          ? `${favoriteItem.episode_count} Episodes`
          : "N/A",
        date: formatDate(favoriteItem.air_date),
        type: "Season",
      };
    }

    // Episode details
    if (favoriteItem.episode_number) {
      return {
        runtime: favoriteItem.runtime ? `${favoriteItem.runtime} min` : "N/A",
        date: formatDate(favoriteItem.air_date),
        type: "Episode",
      };
    }

    // Movie details
    if (favoriteItem.release_date) {
      return {
        rating: favoriteItem.vote_average
          ? `${favoriteItem.vote_average.toFixed(1)}/10`
          : "N/A",
        date: formatDate(favoriteItem.release_date),
        type: "Movie",
      };
    }

    return { type: "Unknown" };
  };

  const additionalDetails = getAdditionalDetails();

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
          {additionalDetails.rating && (
            <div className="flex items-center">
              <Star size={14} className="mr-1 text-yellow-500" />
              <span>{additionalDetails.rating}</span>
            </div>
          )}

          {additionalDetails.episodeCount && (
            <div className="flex items-center">
              <Clock size={14} className="mr-1" />
              <span>{additionalDetails.episodeCount}</span>
            </div>
          )}

          {additionalDetails.runtime && (
            <div className="flex items-center">
              <Clock size={14} className="mr-1" />
              <span>{additionalDetails.runtime}</span>
            </div>
          )}

          <div className="flex items-center">
            <Calendar size={14} className="mr-1" />
            <span>{additionalDetails.date}</span>
          </div>
        </div>
      </div>

      {/* Remove Favorite Button */}
      <button
        onClick={handleRemoveFavorite}
        className="absolute top-2 right-2 z-20 bg-black/50 rounded-full p-1 hover:bg-black/70 transition-colors"
        aria-label="Remove from favorites"
      >
        <Heart
          size={16}
          fill="red"
          stroke="red"
          className="transition-colors"
        />
      </button>
    </div>
  );
};

export default FavoriteCard;
