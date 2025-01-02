import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Star,
  Calendar,
  Info,
  Tag,
  Clock,
  Trash2,
  Tv,
  Film,
} from "lucide-react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Genre color mapping object
const GENRE_COLORS = {
  // Action genres
  Action: "bg-red-600/20 text-red-400",
  Adventure: "bg-orange-600/20 text-orange-400",

  // Drama and emotional genres
  Drama: "bg-purple-600/20 text-purple-400",
  Romance: "bg-pink-600/20 text-pink-400",

  // Sci-Fi and Fantasy
  "Science Fiction": "bg-blue-600/20 text-blue-400",
  Fantasy: "bg-indigo-600/20 text-indigo-400",

  // Comedy and light genres
  Comedy: "bg-green-600/20 text-green-400",
  Animation: "bg-lime-600/20 text-lime-500",

  // Thriller and Dark genres
  Thriller: "bg-gray-600/20 text-gray-400",
  Horror: "bg-black/40 text-red-500",

  // Other genres
  Documentary: "bg-yellow-600/20 text-yellow-400",
  Mystery: "bg-teal-600/20 text-teal-400",
  War: "bg-stone-600/20 text-stone-400",
  Crime: "bg-zinc-600/20 text-zinc-400",
  Family: "bg-emerald-600/20 text-emerald-400",
  Music: "bg-rose-600/20 text-rose-400",
  History: "bg-amber-600/20 text-amber-400",
};

// Utility Functions
const getImagePath = (posterPath) => {
  if (posterPath) {
    if (posterPath.startsWith("/")) {
      return `https://image.tmdb.org/t/p/w500${posterPath}`;
    }
    return posterPath;
  }
  return "/api/placeholder/500/750";
};

const formatWatchTime = (seconds) => {
  if (!seconds) return "0m";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes}m`;
  }
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const fetchMediaDetails = async (mediaId, mediaType) => {
  try {
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    const response = await fetch(
      `https://api.themoviedb.org/3/${mediaType}/${mediaId}?api_key=${apiKey}&language=en-US`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch ${mediaType} details`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${mediaType} details:`, error);
    return null;
  }
};

const calculateProgress = (watched, duration) => {
  if (!watched || !duration) return 0;
  return Math.min((watched / duration) * 100, 100);
};

const formatRemainingTime = (watched, duration) => {
  if (!watched || !duration) return 0;
  const remaining = Math.max(0, duration - watched);
  return Math.round(remaining / 1000); // Convert to seconds
};

// Genre Chips Component
const GenreChips = ({ genres }) => {
  const displayGenres = genres?.slice(0, 3) || [];

  return (
    <div className="flex flex-wrap justify-center gap-2 mt-2">
      {displayGenres.map((genre, index) => {
        const colorClass =
          GENRE_COLORS[genre.name] || "bg-slate-600/20 text-slate-400";

        return (
          <span
            key={index}
            className={`
              ${colorClass}
              px-2 py-1 rounded-full
              text-[10px] font-medium
              flex items-center
              transition-all duration-300
              hover:scale-105
            `}
          >
            <Tag size={12} className="mr-1 opacity-70" />
            {genre.name}
          </span>
        );
      })}
    </div>
  );
};

// Function to get the media link
const getMediaLink = (media) => {
  if (media.type === "tv") {
    return `/series/${media.id}/season/${media.last_season_watched}/${media.last_episode_watched}`;
  }
  return `/${media.type}/${media.id}`;
};

// Media Card Component
const MediaCard = ({ media, isFavorite, handleFavoriteToggle, onRemove }) => {
  const [fullDetails, setFullDetails] = useState(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const loadMediaDetails = async () => {
      const details = await fetchMediaDetails(media.id, media.type);
      setFullDetails(details);
    };

    loadMediaDetails();
  }, [media.id, media.type]);

  const progress = calculateProgress(
    media.progress?.watched,
    media.progress?.duration
  );

  const remainingTime = formatRemainingTime(
    media.progress?.watched,
    media.progress?.duration
  );

  const additionalDetails = {
    rating: fullDetails?.vote_average
      ? `${fullDetails.vote_average.toFixed(1)}/10`
      : "N/A",
    date: fullDetails?.first_air_date || fullDetails?.release_date,
    genres: fullDetails?.genres || [],
    overview: fullDetails?.overview || "No overview available",
  };

  const mediaTypeInfo =
    media.type === "tv" ? (
      <div className="flex items-center gap-1">
        <Tv size={14} className="text-blue-400" />
        <span>
          S{media.last_season_watched} E{media.last_episode_watched}
        </span>
      </div>
    ) : (
      <div className="flex items-center gap-1">
        <Film size={14} className="text-purple-400" />
        <span>Movie</span>
      </div>
    );

  const mediaLink = getMediaLink(media);

  return (
    <div className="p-2 w-full max-w-sm mx-auto">
      <div
        className="bg-slate-800/80 rounded-xl overflow-hidden shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl relative group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link href={mediaLink} className="block relative">
          <Image
            src={getImagePath(media.poster_path)}
            alt={media.title}
            className="w-full h-48 object-cover rounded-t-xl transition-transform duration-300 ease-in-out group-hover:scale-110"
            width={288}
            height={176}
            unoptimized
          />
          <div className="absolute bottom-0 left-0 right-0">
            <div className="relative h-1 bg-gray-800">
              <div
                className="absolute left-0 h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="absolute top-2 left-2 bg-black/40 text-white/90 px-3 py-1 rounded-md text-xs font-semibold backdrop-blur-sm">
            {mediaTypeInfo}
          </div>

          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center items-center p-4 text-center text-white">
            <p className="text-sm mb-3 text-shadow-sm line-clamp-3">
              {additionalDetails.overview}
            </p>
            <Link
              href={mediaLink}
              className="flex items-center text-xs sm:text-sm hover:text-blue-400 transition-colors"
            >
              <Info size={16} className="mr-2" />
              More Details
            </Link>
          </div>

          <div className="p-4 flex flex-col justify-between">
            <h3 className="text-center text-slate-200 font-semibold text-base mb-2 line-clamp-1">
              {media.title}
            </h3>

            <div className="flex flex-col space-y-2 text-xs text-slate-400">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Star size={14} className="mr-1 text-yellow-500" />
                  <span>{additionalDetails.rating}</span>
                </div>

                <div className="flex items-center">
                  <Calendar size={14} className="mr-1" />
                  <span>{formatDate(additionalDetails.date)}</span>
                </div>
              </div>

              <GenreChips genres={additionalDetails.genres} />
            </div>
          </div>

          <div
            className={`absolute top-2 right-2 flex gap-2 transition-opacity duration-300 ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleFavoriteToggle(media);
              }}
              className="bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
              aria-label={
                isFavorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              <Heart
                size={20}
                fill={isFavorite ? "red" : "none"}
                stroke={isFavorite ? "red" : "white"}
              />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const confirmDelete = window.confirm(
                  "Are you sure you want to delete this item?"
                );
                if (confirmDelete) {
                  onRemove(media.id);
                }
              }}
              className="bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors"
              aria-label="Remove from continue watching"
            >
              <Trash2 size={20} className="text-white" />
            </button>
          </div>
        </Link>
      </div>
    </div>
  );
};

// Main Continue Watching Component
const ContinueWatching = () => {
  const [mediaItems, setMediaItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const sliderSettings = {
    dots: true,
    infinite: mediaItems.length > 3,
    speed: 500,
    slidesToShow: mediaItems.length === 1 ? 1 : Math.min(3, mediaItems.length),
    slidesToScroll: 1,
    className: "continue-watching-slider",
    dotsClass: "slick-dots custom-dots",
    centerMode: mediaItems.length === 1,
    centerPadding: mediaItems.length === 1 ? "0" : "60px",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: Math.min(2, mediaItems.length),
          centerMode: mediaItems.length === 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          centerMode: true,
          centerPadding: "0",
        },
      },
    ],
  };

  useEffect(() => {
    const loadStoredData = async () => {
      try {
        const progressData = JSON.parse(
          localStorage.getItem("vidLinkProgress") || "{}"
        );
        const storedFavorites = JSON.parse(
          localStorage.getItem("favorites") || "[]"
        );

        // Convert the object to an array and sort by last_updated
        const mediaArray = Object.values(progressData).sort(
          (a, b) => (b.last_updated || 0) - (a.last_updated || 0)
        );

        // Fetch additional details for each media item
        const updatedMediaArray = await Promise.all(
          mediaArray.map(async (media) => {
            const details = await fetchMediaDetails(media.id, media.type);
            return { ...media, ...details };
          })
        );

        setMediaItems(updatedMediaArray);
        setFavorites(storedFavorites);
      } catch (error) {
        console.error("Error loading stored data:", error);
        setMediaItems([]);
        setFavorites([]);
      }
      setIsLoading(false);
    };

    loadStoredData();
  }, []);

  const handleRemoveMedia = (mediaId) => {
    try {
      const progressData = JSON.parse(
        localStorage.getItem("vidLinkProgress") || "{}"
      );
      delete progressData[mediaId];
      localStorage.setItem("vidLinkProgress", JSON.stringify(progressData));
      setMediaItems(Object.values(progressData));
    } catch (error) {
      console.error("Error removing media:", error);
    }
  };

  const handleFavoriteToggle = (media) => {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (favorites.some((item) => item.id === media.id)) {
      const updatedFavorites = favorites.filter((item) => item.id !== media.id);
      localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
      setFavorites(updatedFavorites);
    } else {
      favorites.push(media);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      setFavorites(favorites);
    }
  };

  const clearAllMedia = () => {
    localStorage.setItem("vidLinkProgress", "{}");
    setMediaItems([]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white">Continue Watching</h2>
          <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
            {mediaItems.length} {mediaItems.length === 1 ? "title" : "titles"}
          </span>
        </div>
        {mediaItems.length > 0 && (
          <button
            onClick={clearAllMedia}
            className="text-sm text-slate-400 hover:text-red-400 transition-colors flex items-center gap-2"
          >
            <Trash2 size={16} />
            Clear All
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      ) : mediaItems.length > 0 ? (
        <div
          className={`${
            mediaItems.length === 1 ? "max-w-sm mx-auto" : "w-full"
          }`}
        >
          <Slider {...sliderSettings}>
            {mediaItems.map((media) => (
              <MediaCard
                key={media.id}
                media={media}
                isFavorite={favorites.some((item) => item.id === media.id)}
                handleFavoriteToggle={handleFavoriteToggle}
                onRemove={handleRemoveMedia}
              />
            ))}
          </Slider>
        </div>
      ) : (
        <div className="bg-slate-800/50 rounded-xl p-8 text-center">
          <p className="text-slate-400">
            No media to continue watching. Start watching something now!
          </p>
        </div>
      )}

      <style jsx global>{`
        .continue-watching-slider .slick-list {
          margin: 0 -10px;
          overflow: visible;
        }

        .continue-watching-slider .slick-slide > div {
          margin: 0 10px;
        }

        .continue-watching-slider .custom-dots {
          bottom: -25px;
        }

        .continue-watching-slider .custom-dots li {
          margin: 0 5px;
        }

        .continue-watching-slider .custom-dots li button:before {
          color: #718096;
          opacity: 0.5;
          font-size: 10px;
        }

        .continue-watching-slider .custom-dots li.slick-active button:before {
          color: #4299e1;
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default ContinueWatching;
