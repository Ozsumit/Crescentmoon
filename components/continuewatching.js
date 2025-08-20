"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Star,
  Calendar,
  Clock,
  Trash2,
  Tv,
  Film,
  Play,
  Info,
  BarChart,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Custom arrow components for better control
import {
  CustomNextArrow,
  CustomPrevArrow,
} from "/components/ui/custom-slider-buttons";

// Genre color mapping object
const GENRE_COLORS = {
  Action: "bg-red-600/20 text-red-400 border-red-500/30",
  Adventure: "bg-orange-600/20 text-orange-400 border-orange-500/30",
  Drama: "bg-purple-600/20 text-purple-400 border-purple-500/30",
  Romance: "bg-pink-600/20 text-pink-400 border-pink-500/30",
  "Science Fiction": "bg-blue-600/20 text-blue-400 border-blue-500/30",
  Fantasy: "bg-indigo-600/20 text-indigo-400 border-indigo-500/30",
  Comedy: "bg-green-600/20 text-green-400 border-green-500/30",
  Animation: "bg-lime-600/20 text-lime-500 border-lime-500/30",
  Crime: "bg-red-600/20 text-red-400 border-red-500/30",
  Thriller: "bg-gray-600/20 text-gray-400 border-gray-500/30",
  Horror: "bg-black/40 text-red-500 border-red-500/30",
  Documentary: "bg-yellow-600/20 text-yellow-400 border-yellow-500/30",
  Mystery: "bg-teal-600/20 text-teal-400 border-teal-500/30",
  War: "bg-stone-600/20 text-stone-400 border-stone-500/30",
  Crime: "bg-zinc-600/20 text-zinc-400 border-zinc-500/30",
  Family: "bg-emerald-600/20 text-emerald-400 border-emerald-500/30",
  Music: "bg-rose-600/20 text-rose-400 border-rose-500/30",
  History: "bg-amber-600/20 text-amber-400 border-amber-500/30",
};

// Utility Functions
const getImagePath = (posterPath) => {
  if (posterPath) {
    if (posterPath.startsWith("/")) {
      return `https://image.tmdb.org/t/p/w500${posterPath}`;
    }
    return posterPath;
  }
  return "/placeholder.svg?height=750&width=500";
};

// Replace the formatWatchTime function with this improved version:
const formatWatchTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return "0m";

  // Ensure seconds is a positive number
  seconds = Math.max(0, seconds);

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) {
    return `${minutes}m`;
  }
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
};

// Replace the formatRemainingTime function with this improved version:
const formatRemainingTime = (watched, duration) => {
  if (!watched || !duration || isNaN(watched) || isNaN(duration)) return 0;

  // Convert milliseconds to seconds if needed
  const watchedSecs =
    watched > 1000000000 ? Math.floor(watched / 1000) : watched;
  const durationSecs =
    duration > 1000000000 ? Math.floor(duration / 1000) : duration;

  return Math.max(0, durationSecs - watchedSecs);
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

// Function to get the media link
const getMediaLink = (media) => {
  if (media.type === "tv") {
    return `/series/${media.id}/season/${media.last_season_watched}/${media.last_episode_watched}`;
  }
  return `/${media.type}/${media.id}`;
};

// Progress Circle Component
const ProgressCircle = ({ progress }) => {
  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative w-12 h-12 flex items-center justify-center">
      <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 40 40">
        {/* Background circle */}
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="3"
        />
        {/* Progress circle */}
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          stroke={
            progress > 75
              ? "#10B981" // green-500
              : progress > 25
              ? "#3B82F6" // blue-500
              : "#8B5CF6" // purple-500
          }
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">
        {Math.round(progress)}%
      </div>
    </div>
  );
};

// Genre Chips Component
const GenreChips = ({ genres }) => {
  const displayGenres = genres?.slice(0, 3) || [];

  return (
    <div className="flex flex-wrap gap-1.5">
      {displayGenres.map((genre, index) => {
        const colorClass =
          GENRE_COLORS[genre.name] ||
          "bg-slate-600/20 text-slate-400 border-slate-500/30";

        return (
          <motion.span
            key={index}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`
              ${colorClass}
              px-2 py-0.5 rounded-full
              text-[10px] font-medium
              flex items-center
              border
              transition-all duration-300
              hover:scale-105
            `}
          >
            {genre.name}
          </motion.span>
        );
      })}
    </div>
  );
};

// Media Card Component
const MediaCard = ({ media, isFavorite, handleFavoriteToggle, onRemove }) => {
  const [fullDetails, setFullDetails] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const cardRef = useRef(null);

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
    runtime: fullDetails?.runtime || fullDetails?.episode_run_time?.[0] || 0,
    language: fullDetails?.original_language?.toUpperCase() || "EN",
    popularity: fullDetails?.popularity?.toFixed(0) || "N/A",
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

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsRemoving(true);

    // Add a small delay before actually removing to allow animation to play
    setTimeout(() => {
      onRemove(media.id);
    }, 300);
  };

  const toggleDetails = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDetails(!showDetails);
  };

  return (
    <motion.div
      className="p-2 w-full max-w-sm mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={isRemoving ? { opacity: 0, y: -20, scale: 0.9 } : {}}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        ref={cardRef}
        className={`
          bg-gradient-to-br from-slate-800 to-slate-900
          rounded-xl overflow-hidden
          border border-slate-700/50
          shadow-lg
          relative
          h-[400px]
        `}
        whileHover={{
          scale: 1.02,
          boxShadow:
            "0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <AnimatePresence initial={false} mode="wait">
          {showDetails ? (
            // Details View
            <motion.div
              key="details"
              className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-800 p-4 overflow-y-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col h-full">
                {/* Header with back button */}
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={toggleDetails}
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    ← Back
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleFavoriteToggle(media.id);
                      }}
                      className="bg-slate-800 rounded-full p-2 hover:bg-slate-700 transition-colors"
                    >
                      <Heart
                        size={16}
                        className={
                          isFavorite
                            ? "fill-red-500 stroke-red-500"
                            : "stroke-white"
                        }
                      />
                    </button>
                  </div>
                </div>

                {/* Title and basic info */}
                <h3 className="text-white font-bold text-lg mb-2">
                  {media.title}
                </h3>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-md text-xs">
                    <Star size={14} />
                    <span>{additionalDetails.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-blue-500/20 text-blue-400 px-2 py-1 rounded-md text-xs">
                    <Calendar size={14} />
                    <span>{formatDate(additionalDetails.date)}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-purple-500/20 text-purple-400 px-2 py-1 rounded-md text-xs">
                    <Clock size={14} />
                    <span>
                      {formatWatchTime(additionalDetails.runtime * 60)}
                    </span>
                  </div>
                </div>

                {/* Genres */}
                <div className="mb-4">
                  <h4 className="text-slate-400 text-xs mb-2">Genres</h4>
                  <GenreChips genres={additionalDetails.genres} />
                </div>

                {/* Overview */}
                <div className="mb-4">
                  <h4 className="text-slate-400 text-xs mb-2">Overview</h4>
                  <p className="text-slate-300 text-sm">
                    {additionalDetails.overview}
                  </p>
                </div>

                {/* Additional stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <h4 className="text-slate-400 text-xs mb-1 flex items-center gap-1">
                      <Eye size={12} />
                      Watch Progress
                    </h4>
                    <div className="flex items-center gap-2">
                      <ProgressCircle progress={progress} />
                      <div className="text-xs text-slate-300">
                        <div>{formatWatchTime(remainingTime)} remaining</div>
                        <div className="text-slate-500 text-[10px]">
                          {media.type === "tv"
                            ? `Season ${media.last_season_watched}, Episode ${media.last_episode_watched}`
                            : "Movie"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-3">
                    <h4 className="text-slate-400 text-xs mb-1 flex items-center gap-1">
                      <BarChart size={12} />
                      Popularity
                    </h4>
                    <div className="flex items-center gap-2">
                      <div className="text-2xl font-bold text-white">
                        {additionalDetails.popularity}
                      </div>
                      <div className="text-xs text-slate-400">
                        <div>Popularity Score</div>
                        <div className="text-slate-500 text-[10px]">
                          TMDB Rating
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="mt-auto grid grid-cols-2 gap-3">
                  <Link
                    href={mediaLink}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 px-4 text-center text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Play size={16} fill="white" />
                    Continue
                  </Link>
                  <button
                    onClick={handleRemove}
                    className="bg-slate-700 hover:bg-red-900/50 text-white rounded-lg py-2 px-4 text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            // Main Card View
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full flex flex-col"
            >
              {/* Card Image Container */}
              <div className="relative overflow-hidden h-[220px]">
                {/* Loading Skeleton */}
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-slate-700 animate-pulse flex items-center justify-center">
                    <Film className="w-12 h-12 text-slate-600" />
                  </div>
                )}

                {/* Main Image */}
                <Image
                  src={getImagePath(media.poster_path) || "/placeholder.svg"}
                  alt={media.title}
                  className={`
                    w-full h-full object-cover transition-all duration-500
                    ${
                      isHovered
                        ? "scale-105 brightness-75"
                        : "scale-100 brightness-90"
                    }
                    ${imageLoaded ? "opacity-100" : "opacity-0"}
                  `}
                  width={288}
                  height={220}
                  onLoad={() => setImageLoaded(true)}
                  priority
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 z-10">
                  <div className="relative h-1.5 bg-gray-800/80">
                    <motion.div
                      className={`
                        absolute left-0 h-full
                        ${
                          progress > 75
                            ? "bg-green-500"
                            : progress > 25
                            ? "bg-blue-500"
                            : "bg-purple-500"
                        }
                      `}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>

                {/* Media Type Badge */}
                <div className="absolute top-3 left-3 bg-black/70 text-white/90 px-2 py-1 rounded-md text-xs font-medium backdrop-blur-sm border border-white/10">
                  {mediaTypeInfo}
                </div>

                {/* Remaining Time Badge */}
                <div
                  className={`
                    absolute bottom-3 right-3 bg-black/70 text-white/90
                    px-2 py-1 rounded-md text-xs font-medium backdrop-blur-sm
                    border border-white/10 flex items-center gap-1 transition-all duration-300
                    ${
                      isHovered
                        ? "opacity-100 translate-y-0"
                        : "opacity-80 translate-y-1"
                    }
                  `}
                >
                  <Clock size={12} className="text-blue-400" />
                  {formatWatchTime(remainingTime)} left
                </div>

                {/* Play Button Overlay */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link href={mediaLink}>
                    <motion.div
                      className="bg-blue-600 p-4 rounded-full shadow-lg"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Play size={24} className="text-white" fill="white" />
                    </motion.div>
                  </Link>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  className="absolute top-3 right-3 flex gap-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{
                    opacity: isHovered ? 1 : 0,
                    y: isHovered ? 0 : -10,
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleFavoriteToggle(media.id);
                    }}
                    className="bg-black/70 rounded-full p-2 backdrop-blur-sm border border-white/10"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Heart
                      size={16}
                      className={
                        isFavorite
                          ? "fill-red-500 stroke-red-500"
                          : "stroke-white"
                      }
                    />
                  </motion.button>
                  <motion.button
                    onClick={handleRemove}
                    className="bg-black/70 rounded-full p-2 backdrop-blur-sm border border-white/10"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Trash2 size={16} className="text-white" />
                  </motion.button>
                </motion.div>
              </div>

              {/* Card Content */}
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-white font-bold text-lg mb-2 line-clamp-1">
                  {media.title}
                </h3>

                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1 text-yellow-400 text-xs">
                    <Star size={14} className="fill-yellow-400" />
                    <span>{additionalDetails.rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400 text-xs">
                    <Calendar size={14} />
                    <span>
                      {formatDate(additionalDetails.date)?.split(", ")[0]}
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <GenreChips genres={additionalDetails.genres} />
                </div>

                <p className="text-slate-400 text-xs line-clamp-2 mb-3">
                  {additionalDetails.overview}
                </p>

                <div className="mt-auto flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className={`
                        w-2 h-2 rounded-full animate-pulse
                        ${
                          progress > 75
                            ? "bg-green-500"
                            : progress > 25
                            ? "bg-blue-500"
                            : "bg-purple-500"
                        }
                      `}
                    />
                    <span className="text-xs text-slate-400">
                      {progress.toFixed(0)}% completed
                    </span>
                  </div>

                  <motion.button
                    onClick={toggleDetails}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Info size={14} />
                    Details
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

// Main Continue Watching Component
const ContinueWatching = () => {
  const [mediaItems, setMediaItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const sliderRef = useRef(null);

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
    swipeToSlide: true,
    focusOnSelect: true,
    pauseOnHover: true,
    pauseOnFocus: true,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: Math.min(2, mediaItems.length),
          centerMode: mediaItems.length <= 2,
          centerPadding: "40px",
        },
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          centerMode: true,
          centerPadding: "30px",
          arrows: true,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          centerMode: true,
          centerPadding: "20px",
          arrows: true,
        },
      },
    ],
    nextArrow: <CustomNextArrow />,
    prevArrow: <CustomPrevArrow />,
  };

  useEffect(() => {
    const loadStoredData = () => {
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

        setMediaItems(mediaArray);
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

  const handleFavoriteToggle = (mediaId) => {
    const updatedFavorites = favorites.includes(mediaId)
      ? favorites.filter((id) => id !== mediaId)
      : [...favorites, mediaId];

    setFavorites(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  };

  const clearAllMedia = () => {
    const confirmClear = window.confirm(
      "Are you sure you want to clear all items?"
    );
    if (confirmClear) {
      localStorage.setItem("vidLinkProgress", "{}");
      setMediaItems([]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        className="flex justify-between items-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white relative group">
            Continue Watching
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
          </h2>
          <motion.span
            className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium border border-blue-500/20"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 15,
              delay: 0.2,
            }}
          >
            {mediaItems.length} {mediaItems.length === 1 ? "title" : "titles"}
          </motion.span>
        </div>
        {mediaItems.length > 0 && (
          <motion.button
            onClick={clearAllMedia}
            className="text-sm text-slate-400 hover:text-red-400 transition-colors flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Trash2 size={16} />
            Clear All
          </motion.button>
        )}
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-[400px] bg-slate-800 rounded-xl animate-pulse overflow-hidden"
            >
              <div className="h-[220px] bg-slate-700"></div>
              <div className="p-4 space-y-4">
                <div className="h-5 bg-slate-700 rounded w-3/4"></div>
                <div className="h-4 bg-slate-700 rounded w-1/2"></div>
                <div className="h-4 bg-slate-700 rounded w-full"></div>
                <div className="h-4 bg-slate-700 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : mediaItems.length > 0 ? (
        <div
          className={`${
            mediaItems.length === 1 ? "max-w-sm mx-auto" : "w-full"
          }`}
        >
          <Slider ref={sliderRef} {...sliderSettings}>
            {mediaItems.map((media, index) => (
              <MediaCard
                key={media.id}
                media={media}
                isFavorite={favorites.includes(media.id)}
                handleFavoriteToggle={handleFavoriteToggle}
                onRemove={handleRemoveMedia}
              />
            ))}
          </Slider>
        </div>
      ) : (
        <motion.div
          className="bg-slate-800/50 rounded-xl p-8 text-center border border-slate-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center gap-4">
            <motion.div
              className="p-4 bg-slate-700/30 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: 0.2,
              }}
            >
              <Tv size={40} className="text-slate-500" />
            </motion.div>
            <p className="text-slate-400">
              No media to continue watching. Start watching something now!
            </p>
            <Link
              href="/browse"
              className="mt-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-all duration-300 hover:scale-105"
            >
              Browse Content
            </Link>
          </div>
        </motion.div>
      )}

      <style jsx global>{`
        .continue-watching-slider .slick-list {
          margin: 0 -10px;
          overflow: visible;
          padding: 10px;
        }

        .continue-watching-slider .slick-slide > div {
          margin: 0 10px;
        }

        .continue-watching-slider .custom-dots {
          bottom: -30px;
        }

        .continue-watching-slider .custom-dots li {
          margin: 0 5px;
        }

        .continue-watching-slider .custom-dots li button:before {
          color: #718096;
          opacity: 0.5;
          font-size: 10px;
          transition: all 0.3s ease;
        }

        .continue-watching-slider .custom-dots li.slick-active button:before {
          color: #4299e1;
          opacity: 1;
          transform: scale(1.2);
        }

        /* Improved navigation buttons */
        .continue-watching-slider .slick-prev,
        .continue-watching-slider .slick-next {
          z-index: 20;
          width: 48px;
          height: 48px;
          background: rgba(15, 23, 42, 0.8);
          border-radius: 50%;
          backdrop-filter: blur(8px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0.9;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .continue-watching-slider .slick-prev:hover,
        .continue-watching-slider .slick-next:hover {
          background: rgba(37, 99, 235, 0.8);
          transform: scale(1.1);
          opacity: 1;
        }

        .continue-watching-slider .slick-prev:focus,
        .continue-watching-slider .slick-next:focus {
          background: rgba(37, 99, 235, 0.8);
        }

        .continue-watching-slider .slick-prev {
          left: -30px;
        }

        .continue-watching-slider .slick-next {
          right: -30px;
        }

        @media (max-width: 768px) {
          .continue-watching-slider .slick-prev {
            left: -15px;
          }

          .continue-watching-slider .slick-next {
            right: -15px;
          }

          .continue-watching-slider .slick-prev,
          .continue-watching-slider .slick-next {
            width: 40px;
            height: 40px;
          }
        }

        .continue-watching-slider .slick-prev:before,
        .continue-watching-slider .slick-next:before {
          font-size: 24px;
          opacity: 1;
          line-height: 1;
        }

        /* Fix for button visibility */
        .continue-watching-slider .slick-arrow.slick-hidden {
          display: block;
        }

        /* Add visible focus states for accessibility */
        .continue-watching-slider .slick-prev:focus,
        .continue-watching-slider .slick-next:focus {
          outline: 2px solid #3b82f6;
          outline-offset: 2px;
        }

        /* Style for the loading skeleton animation */
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.1;
          }
          50% {
            opacity: 1;
          }
        }

        .animate-pulse {
          animation: pulse 1s infinite;
        }
      `}</style>
    </div>
  );
};

export default ContinueWatching;
