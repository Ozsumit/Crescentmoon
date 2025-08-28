import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Calendar, Info, Tv, Film } from "lucide-react";
import HorizontalfavCard from "./horfavcard"; // Assuming this component exists

// Placeholder for fetchMovieData if it's an external utility
// This function would typically make an API call to get more details for a movie/series
// based on its ID and media_type.
const fetchMovieData = async (id, media_type) => {
  // Example placeholder for fetching data
  // In a real application, you would replace this with actual API calls
  console.log(`Fetching data for ${media_type} with ID: ${id}`);
  return {
    // Return additional data like number_of_seasons if needed for TV, etc.
  };
};

const FavoriteCard = ({ favoriteItem, viewMode, toggleFavorite }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [movieData, setMovieData] = useState({
    ...favoriteItem,
    number_of_seasons: "N/A", // Default for TV series
  });
  const [isLoading, setIsLoading] = useState(true);

  // Fetch additional data for TV series or if specific details are missing
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      // Only fetch if media_type is TV and we need more data
      if (favoriteItem.media_type === "tv" && !movieData.number_of_seasons) {
        const data = await fetchMovieData(
          favoriteItem.id,
          favoriteItem.media_type
        );
        if (data) {
          setMovieData((prevData) => ({
            ...prevData,
            ...data,
            media_type: favoriteItem.media_type, // Ensure media_type is preserved
          }));
        }
      } else {
        // For movies or if TV data is already sufficient from favoriteItem
        setMovieData({
          ...favoriteItem,
          media_type: favoriteItem.media_type,
          // Ensure first_air_date/release_date are directly from favoriteItem initially
          // and that relevant fields are available for rendering
          release_date: favoriteItem.release_date,
          first_air_date: favoriteItem.first_air_date,
        });
      }
      setIsLoading(false);
    };

    fetchData();
  }, [favoriteItem]); // Re-run if favoriteItem changes

  // Check if the item is in favorites by checking local storage
  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setIsFavorite(favorites.some((item) => item.id === favoriteItem.id));
  }, [favoriteItem.id]); // Dependency on favoriteItem.id

  // Handle the favorite toggle directly using the prop
  const handleFavoriteToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(favoriteItem); // Use the prop to toggle favorite status
    setIsFavorite(!isFavorite); // Optimistically update local state
  };

  // Get the image path for the card
  const getImagePath = () => {
    // Prioritize poster_path from movieData
    if (movieData.poster_path)
      return `https://image.tmdb.org/t/p/w500/${movieData.poster_path}`;
    // Fallback to still_path (often for episodes/seasons)
    if (movieData.still_path)
      return `https://image.tmdb.org/t/p/w500/${movieData.still_path}`;
    return "/placeholder.svg"; // Use a good placeholder image
  };

  // Determine if it's a TV series based on media_type or available dates
  const isTV =
    movieData.media_type === "tv" ||
    (movieData.first_air_date && !movieData.release_date);

  // Get the link for the card
  const getLink = () => {
    if (isTV) {
      return `/series/${movieData.id}`;
    }
    if (movieData.release_date) {
      return `/movie/${movieData.id}`;
    }
    return "#";
  };

  // Render the title based on the type of item
  const renderTitle = () => {
    if (isTV) {
      return movieData.name || "Unknown Series";
    }
    return movieData.title || "Unknown Movie";
  };

  // Format the date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  // Render the card in grid view
  if (viewMode === "grid") {
    // Only render if not loading or if there's enough data to display
    if (isLoading && !movieData.title && !movieData.name) {
      return (
        <div className="bg-slate-800/80 rounded-xl h-[300px] flex items-center justify-center text-slate-400">
          Loading...
        </div>
      );
    }

    return (
      <div className="relative group rounded-xl overflow-hidden shadow-xl transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
        <Link href={getLink()} title={renderTitle()} className="block">
          {/* Main Card Container with aspect ratio */}
          <div className="relative aspect-[2/3] overflow-hidden">
            {/* Image */}
            <div
              className={`h-full w-full transition-opacity duration-700 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              style={{ willChange: "opacity" }}
            >
              <Image
                src={getImagePath() || "/placeholder.svg"}
                alt={renderTitle()}
                className="h-full w-full transform object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] will-change-transform group-hover:scale-105"
                width={288} // Approximate width for 2/3 aspect ratio
                height={432} // Approximate height for 2/3 aspect ratio
                unoptimized
                onLoadingComplete={() => setImageLoaded(true)}
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg"; // Fallback on error
                }}
              />
              {/* Image Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900" />
            </div>

            {/* Media Type Badge */}
            <div
              className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-semibold text-white shadow-lg backdrop-blur-sm transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-translate-y-1"
              style={{ willChange: "transform" }}
            >
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
              className="absolute right-3 top-3 z-10 rounded-full bg-black/50 p-2.5 shadow-lg backdrop-blur-sm transition-all duration-300 ease-out hover:bg-black/70"
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

          {/* Content Container - Improved animation */}
          <div
            className="absolute bottom-0 w-full bg-gradient-to-t from-slate-900 via-slate-900/95 to-transparent p-4 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:pb-6"
            style={{
              transform: "translateZ(0)",
              backfaceVisibility: "hidden",
              willChange: "transform",
            }}
          >
            {/* Rating and Date */}
            <div className="mb-2 flex items-center gap-4 text-sm font-medium text-white/90">
              <div className="flex items-center gap-1.5">
                <Star size={14} className="text-yellow-400" />
                <span className="font-semibold">
                  {movieData.vote_average
                    ? `${movieData.vote_average.toFixed(1)}`
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-white/70">
                <Calendar size={14} />
                <span>
                  {formatDate(
                    movieData.release_date || movieData.first_air_date
                  )}
                </span>
              </div>
            </div>

            {/* Title */}
            <h3 className="mb-2 line-clamp-1 text-lg font-semibold tracking-tight text-white">
              {renderTitle()}
            </h3>

            {/* Description - Improved animation */}
            <div
              className="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] max-h-0 group-hover:max-h-[200px]"
              style={{ willChange: "max-height" }}
            >
              <div
                className="transform translate-y-8 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-y-0 group-hover:opacity-100"
                style={{ willChange: "transform, opacity" }}
              >
                <p className="text-sm text-white/80 line-clamp-4">
                  {movieData.overview || "No overview available"}
                </p>

                <div className="mt-3 inline-flex items-center text-xs font-medium text-white/70 transition-colors duration-300 hover:text-white">
                  View details
                  <svg
                    className="ml-1 h-3 w-3 transform transition-transform duration-300 ease-out group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    );
  } else {
    // Render the card in horizontal view
    return <HorizontalfavCard favoriteItem={favoriteItem} />;
  }
};

export default FavoriteCard;
