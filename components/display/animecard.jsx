import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Calendar, Info, Tv } from "lucide-react";

const AnimeCard = ({ anime }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const getImagePath = () => {
    if (anime.images?.jpg?.large_image_url) {
      return anime.images.jpg.large_image_url;
    }
    return "https://i.imgur.com/HIYYPtZ.png";
  };

  const getLink = () => {
    return `/anime/${anime.mal_id}`;
  };

  const renderTitle = () => {
    return anime.title || "Untitled";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleFavoriteToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const favorites = JSON.parse(localStorage.getItem("anime-favorites")) || [];
    if (isFavorite) {
      const updatedFavorites = favorites.filter(
        (item) => item.mal_id !== anime.mal_id
      );
      localStorage.setItem("anime-favorites", JSON.stringify(updatedFavorites));
    } else {
      favorites.push(anime);
      localStorage.setItem("anime-favorites", JSON.stringify(favorites));
    }

    setIsFavorite(!isFavorite);
  };

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("anime-favorites")) || [];
    setIsFavorite(favorites.some((item) => item.mal_id === anime.mal_id));
  }, [anime.mal_id]);

  return (
    <div className="bg-slate-800/80 rounded-xl h-[14rem] sm:h-auto overflow-hidden shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl relative group">
      <Link href={getLink()} title={renderTitle()} className="block relative">
        <div
          className={`relative ${
            !imageLoaded ? "opacity-0" : "opacity-100"
          } transition-opacity duration-300`}
        >
          <Image
            src={getImagePath()}
            alt={renderTitle()}
            className="w-full h-32 sm:h-48 object-cover rounded-xl transition-transform duration-300 ease-in-out group-hover:scale-110"
            width={288}
            height={176}
            unoptimized
            onLoadingComplete={() => setImageLoaded(true)}
          />
        </div>
        <div className="absolute top-2 left-2 bg-black/40 text-white/90 px-3 py-1 rounded-md text-xs font-semibold backdrop-blur-sm">
          <div className="flex items-center gap-1">
            <Tv size={14} className="text-blue-400" />
            <span>{anime.type || "TV"}</span>
          </div>
        </div>
      </Link>

      <Link href={getLink()}>
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity ease-in-out duration-300 flex flex-col justify-center items-center p-4 text-center text-white">
          <p className="text-sm mb-3 text-shadow-sm line-clamp-3">
            {anime.synopsis || "No synopsis available"}
          </p>
          <Link
            href={getLink()}
            className="flex items-center text-xs sm:text-sm hover:text-blue-400 transition-colors"
          >
            <Info size={16} className="mr-2" />
            More Details
          </Link>
        </div>
      </Link>

      <div className="p-4">
        <h3 className="text-center text-slate-200 font-semibold text-base mb-2 line-clamp-1">
          {renderTitle()}
        </h3>

        <div className="flex flex-col lg:flex-row justify-between items-center text-xs text-slate-400">
          <div className="flex items-center">
            <Star size={14} className="mr-1 text-yellow-500" />
            <span>
              {anime.score ? `${anime.score.toFixed(1)}/10` : "N/A"}
            </span>
          </div>

          <div className="flex items-center">
            <Calendar size={14} className="mr-1" />
            <span>{formatDate(anime.aired?.from)}</span>
          </div>
        </div>
      </div>

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

export default AnimeCard;