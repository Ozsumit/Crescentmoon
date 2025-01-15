import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Calendar, Info, Tv, Film } from "lucide-react";

const HomeCard = ({ MovieCard }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const isTV = MovieCard.media_type === "tv";
  const title = isTV ? MovieCard.name : MovieCard.title;
  const href = isTV ? "/series/[id]" : "/movie/[id]";
  const as = isTV ? `/series/${MovieCard.id}` : `/movie/${MovieCard.id}`;

  const getImagePath = () => {
    if (MovieCard.poster_path)
      return `https://image.tmdb.org/t/p/w342/${MovieCard.poster_path}`;
    return "https://i.imgur.com/HIYYPtZ.png";
  };

  const getLink = () => {
    if (MovieCard.media_type === "tv") return `/series/${MovieCard.id}`;
    return `/movie/${MovieCard.id}`;
  };

  const renderTitle = () => MovieCard.title || MovieCard.name || "Untitled";

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

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
    <div className="group relative overflow-hidden rounded-2xl bg-slate-900/90 transition-all duration-500 ease-out hover:shadow-lg hover:shadow-slate-700/20">
      <Link href={getLink()} title={renderTitle()}>
        <div className="relative aspect-[2/3] overflow-hidden">
          <div
            className={`h-full w-full transition-opacity duration-700 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={getImagePath()}
              alt={renderTitle()}
              className="h-full w-full transform object-cover transition-transform duration-700 ease-out will-change-transform group-hover:scale-105"
              width={288}
              height={432}
              unoptimized
              onLoadingComplete={() => setImageLoaded(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900" />
          </div>

          {/* Media Type Badge */}
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-sm transition-transform duration-500 ease-out group-hover:-translate-y-1">
            {isTV ? (
              <>
                <Tv size={12} className="text-blue-400" />
                <span>Series</span>
              </>
            ) : (
              <>
                <Film size={12} className="text-purple-400" />
                <span>Movie</span>
              </>
            )}
          </div>

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteToggle}
            className="absolute right-3 top-3 z-10 rounded-full bg-black/50 p-2.5 shadow-lg backdrop-blur-sm transition-all duration-500 ease-out hover:bg-black/70"
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
        <div className="absolute bottom-0 w-full bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent p-4 text-white">
          {/* Rating and Date */}
          <div className="mb-2 flex items-center gap-4 text-sm font-medium text-white/90">
            <div className="flex items-center gap-1.5">
              <Star size={14} className="text-yellow-400" />
              <span className="font-semibold">
                {MovieCard.vote_average
                  ? `${MovieCard.vote_average.toFixed(1)}`
                  : "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-white/70">
              <Calendar size={14} />
              <span>
                {formatDate(MovieCard.release_date || MovieCard.first_air_date)}
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className="mb-1 line-clamp-1 text-lg font-semibold tracking-tight text-white">
            {renderTitle()}
          </h3>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/95 p-6 opacity-0 backdrop-blur-sm transition-all duration-500 ease-out group-hover:opacity-100">
          <div className="flex flex-col items-center gap-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
            {/* Synopsis - Limited to 2 lines */}
            <p className="text-sm text-white/80 line-clamp-2 text-center">
              {MovieCard.overview || "No overview available"}
            </p>

            {/* Details Button */}
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors duration-300 hover:bg-white/20">
              <Info size={14} />
              View Details
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default HomeCard;
