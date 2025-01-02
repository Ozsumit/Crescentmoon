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
    <div className="bg-slate-800/80 rounded-xl overflow-hidden shadow-xl transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl relative group w-full">
      <div className="flex">
        {/* Image Section */}
        <div className="relative w-32 sm:w-48 flex-shrink-0">
          <Link href={href} as={as} title={renderTitle()}>
            <Image
              src={getImagePath()}
              alt={renderTitle()}
              className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110"
              width={192}
              height={288}
              unoptimized
            />
          </Link>
          <button
            onClick={handleFavoriteToggle}
            className="absolute top-2 right-2 z-20 bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
          >
            <Heart
              size={20}
              fill={isFavorite ? "red" : "none"}
              stroke={isFavorite ? "red" : "white"}
              className="transition-colors"
            />
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-slate-200 font-semibold text-lg line-clamp-1">
              {renderTitle()}
            </h3>
            <div className="flex items-center gap-2">
              {isTV ? (
                <div className="flex items-center gap-1">
                  <Tv size={16} className="text-blue-400" />
                  <span className="text-sm text-slate-400">Series</span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Film size={16} className="text-purple-400" />
                  <span className="text-sm text-slate-400">Movie</span>
                </div>
              )}
            </div>
          </div>

          <p className="text-slate-400 text-sm mb-4 line-clamp-2">
            {additionalDetails.overview}
          </p>

          <div className="mt-auto">
            <div className="flex flex-wrap gap-4 text-sm text-slate-400">
              <div className="flex items-center">
                <Star size={16} className="mr-1 text-yellow-500" />
                <span>{additionalDetails.rating}</span>
              </div>

              <div className="flex items-center">
                <Calendar size={16} className="mr-1" />
                <span>{additionalDetails.date}</span>
              </div>
            </div>

            <Link
              href={href}
              as={as}
              className="inline-flex items-center mt-4 text-blue-400 hover:text-blue-300 transition-colors text-sm"
            >
              <Info size={16} className="mr-2" />
              More Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HorizontalHomeCard;
