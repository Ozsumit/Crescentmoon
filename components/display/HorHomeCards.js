import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Calendar, Info, Tv, Film } from "lucide-react";

const HorizontalHomeCard = ({ MovieCard }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [movieData, setMovieData] = useState({
    ...MovieCard,
    number_of_seasons: "N/A",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const data = await fetchMovieData(MovieCard.id, MovieCard.media_type);
      if (data) {
        setMovieData((prevData) => ({
          ...prevData,
          ...data,
          media_type: MovieCard.media_type,
        }));
      }
      setIsLoading(false);
    };

    if (MovieCard.media_type === "tv") {
      fetchData();
    } else {
      setIsLoading(false);
    }
  }, [MovieCard.id, MovieCard.media_type]);

  const isTV = movieData.media_type === "tv";
  const title = isTV ? movieData.name : movieData.title;
  const href = isTV ? "/series/[id]" : "/movie/[id]";
  const as = isTV ? `/series/${movieData.id}` : `/movie/${movieData.id}`;

  const getImagePath = () => {
    if (movieData.poster_path)
      return `https://image.tmdb.org/t/p/w342/${movieData.poster_path}`;
    return "https://i.imgur.com/HIYYPtZ.png";
  };

  const renderTitle = () => {
    return movieData.title || movieData.name || "Untitled";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  const additionalDetails = {
    rating: movieData.vote_average
      ? `${movieData.vote_average.toFixed(1)}`
      : "N/A",
    date: formatDate(movieData.release_date || movieData.first_air_date),
    type: movieData.media_type === "tv" ? "Series" : "Movie",
    overview: movieData.overview || "No overview available",
  };

  const handleFavoriteToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (isFavorite) {
      const updatedFavorites = favorites.filter(
        (item) => item.id !== movieData.id
      );
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
    } else {
      favorites.push(movieData);
      localStorage.setItem("favorites", JSON.stringify(favorites));
    }

    setIsFavorite(!isFavorite);
  };

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setIsFavorite(favorites.some((item) => item.id === movieData.id));
  }, [movieData.id]);

  return (
    <div className="group relative bg-slate-900/60 backdrop-blur-sm rounded-xl overflow-hidden border border-slate-800 shadow-lg transition-all duration-300 hover:shadow-2xl hover:bg-slate-800/60">
      <div className="flex flex-row h-40 sm:h-48">
        {/* Image Section */}
        <div className="relative w-28 sm:w-32 flex-shrink-0">
          <Link href={href} as={as} title={renderTitle()}>
            <div className="relative h-full w-full overflow-hidden">
              <Image
                src={getImagePath()}
                alt={renderTitle()}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                fill
                sizes="(max-width: 640px) 112px, 128px"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-slate-900/20" />
            </div>
          </Link>
          <button
            onClick={handleFavoriteToggle}
            className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-black/40 backdrop-blur-md transition-all duration-300 hover:bg-black/60 active:scale-95"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              size={16}
              fill={isFavorite ? "rgb(239 68 68)" : "none"}
              stroke={isFavorite ? "rgb(239 68 68)" : "white"}
              className="transition-colors duration-300"
            />
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 min-w-0 p-3 sm:p-4 flex flex-col">
          <div className="mb-1 flex items-start justify-between gap-2">
            <h3 className="text-base sm:text-lg font-semibold text-slate-100 truncate pr-2">
              {renderTitle()}
            </h3>
            <div className="flex-shrink-0 flex items-center px-2 py-1 rounded-full bg-slate-800/80 border border-slate-700/50">
              {isTV ? (
                <Tv size={13} className="text-sky-400" />
              ) : (
                <Film size={13} className="text-fuchsia-400" />
              )}
              <span className="ml-1 text-xs font-medium text-slate-300">
                {additionalDetails.type}
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-300 line-clamp-2 mb-2 leading-relaxed">
            {additionalDetails.overview}
          </p>

          <div className="mt-auto space-y-2">
            <div className="flex items-center gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-1">
                <Star size={14} className="text-amber-400" />
                <span className="font-semibold text-slate-200">{additionalDetails.rating}</span>
              </div>

              <div className="flex items-center gap-1">
                <Calendar size={14} className="text-slate-400" />
                <span className="text-slate-300">{additionalDetails.date}</span>
              </div>
            </div>

            <Link
              href={href}
              as={as}
              className="inline-flex items-center text-xs sm:text-sm font-medium text-sky-400 hover:text-sky-300 transition-colors active:text-sky-500"
            >
              <Info size={14} className="mr-1" />
              More Info
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HorizontalHomeCard;