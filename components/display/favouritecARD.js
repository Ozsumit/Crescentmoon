import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Calendar, Info, Tv, Film } from "lucide-react";
import HorizontalfavCard from "./horfavcard";

const FavoriteCard = ({ favoriteItem, viewMode }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [movieData, setMovieData] = useState({
    ...favoriteItem,
    number_of_seasons: "N/A",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const data = await fetchMovieData(
        favoriteItem.id,
        favoriteItem.media_type
      );
      if (data) {
        setMovieData((prevData) => ({
          ...prevData,
          ...data,
          media_type: favoriteItem.media_type,
        }));
      }
      setIsLoading(false);
    };

    if (favoriteItem.media_type === "tv") {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [favoriteItem.id, favoriteItem.media_type]);

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

  const getImagePath = () => {
    if (movieData.poster_path)
      return `https://image.tmdb.org/t/p/w342/${movieData.poster_path}`;
    if (movieData.still_path)
      return `https://image.tmdb.org/t/p/w342/${movieData.still_path}`;
    return "/placeholder.jpg"; // Use a placeholder image
  };

  const getLink = () => {
    // Series link
    if (movieData.first_air_date) {
      return `/series/${movieData.id}`;
    }
    // Season link
    if (movieData.season_number) {
      return `/series/${movieData.series_id}/season/${movieData.season_number}`;
    }
    // Episode link
    if (movieData.episode_number) {
      return `/series/${movieData.series_id}/season/${movieData.season_number}/${movieData.episode_number}`;
    }
    // Movie link
    if (movieData.release_date) {
      return `/movie/${movieData.id}`;
    }
    return "#";
  };

  const renderTitle = () => {
    // Series
    if (movieData.first_air_date) {
      return movieData.name || "Unknown Series";
    }
    // Season
    if (movieData.season_number) {
      return `Season ${movieData.season_number}: ${
        movieData.name || "Unknown Season"
      }`;
    }
    // Episode
    if (movieData.episode_number) {
      return `S${movieData.season_number} E${movieData.episode_number}: ${
        movieData.name || "Unknown Episode"
      }`;
    }
    // Movie
    if (movieData.release_date) {
      return movieData.title || "Unknown Movie";
    }
    return "Favorite Item";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const additionalDetails = {
    rating: movieData.vote_average
      ? `${movieData.vote_average.toFixed(1)}/10`
      : "N/A",
    date: formatDate(movieData.release_date || movieData.first_air_date),
    type: movieData.media_type === "tv" ? "Series" : "Movie",
    overview: movieData.overview || "No overview available",
  };

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setIsFavorite(favorites.some((item) => item.id === movieData.id));
  }, [movieData.id]);

  if (viewMode === "grid") {
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
            {additionalDetails.type === "Series" ? (
              <div className="flex items-center gap-1">
                <Tv size={14} className="text-blue-400" />
                <span>Series</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Film size={14} className="text-purple-400" />
                <span>Movie</span>
              </div>
            )}
          </div>
        </Link>

        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity ease-in-out duration-300 flex flex-col justify-center items-center p-4 text-center text-white">
          <p className="text-sm mb-3 text-shadow-sm line-clamp-3">
            {additionalDetails.overview}
          </p>
          <Link
            href={getLink()}
            title={renderTitle()}
            className="flex items-center text-xs sm:text-sm hover:text-blue-400 transition-colors"
          >
            <Info size={16} className="mr-2" />
            More Details
          </Link>
        </div>

        <div className="p-4">
          <h3 className="text-center text-slate-200 font-semibold text-base mb-2 line-clamp-1">
            {renderTitle()}
          </h3>

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

        <button
          onClick={handleRemoveFavorite}
          className="absolute top-2 right-2 z-20 bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
          aria-label="Remove from favorites"
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
  } else {
    return <HorizontalfavCard favoriteItem={favoriteItem} />;
  }
};

export default FavoriteCard;
