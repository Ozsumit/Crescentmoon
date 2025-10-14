"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  Eye,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Rows,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// --- GENRE COLORS & UTILITY FUNCTIONS ---
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
  Family: "bg-emerald-600/20 text-emerald-400 border-emerald-500/30",
  Music: "bg-rose-600/20 text-rose-400 border-rose-500/30",
  History: "bg-amber-600/20 text-amber-400 border-amber-500/30",
};
const getImagePath = (p) =>
  p
    ? p.startsWith("/")
      ? `https://image.tmdb.org/t/p/w500${p}`
      : p
    : "/placeholder.svg?height=750&width=500";
const formatWatchTime = (s) => {
  if (!s || isNaN(s)) return "0m";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h === 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};
const formatRemainingTime = (w, d) => {
  if (!w || !d) return 0;
  return Math.max(0, d - w);
};
const formatDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "N/A";
const calculateProgress = (w, d) => (w && d ? Math.min((w / d) * 100, 100) : 0);
const getMediaLink = (m) =>
  m.type === "tv" && m.last_season_watched && m.last_episode_watched
    ? `/series/${m.id}/season/${m.last_season_watched}/${m.last_episode_watched}`
    : `/${m.type}/${m.id}`;

// --- CHILD COMPONENTS ---
const ProgressCircle = ({ progress }) => {
  const circumference = 113.097;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  return (
    <div className="relative w-12 h-12 flex-shrink-0">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 40 40">
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="3"
        />
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          stroke={
            progress > 75 ? "#10B981" : progress > 25 ? "#3B82F6" : "#8B5CF6"
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

const GenreChips = ({ genres }) => (
  <div className="flex flex-wrap gap-1.5">
    {(genres?.slice(0, 3) || []).map((g) => (
      <span
        key={g.id || g.name}
        className={`${
          GENRE_COLORS[g.name] ||
          "bg-slate-600/20 text-slate-400 border-slate-500/30"
        } px-2 py-0.5 rounded-full text-[10px] font-medium border`}
      >
        {g.name}
      </span>
    ))}
  </div>
);

const MediaCard = ({
  media,
  isFavorite,
  handleFavoriteToggle,
  onRemove,
  fetchDetails,
}) => {
  const [details, setDetails] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const loadDetails = async () =>
      setDetails(await fetchDetails(media.id, media.type));
    loadDetails();
  }, [media.id, media.type, fetchDetails]);

  const progress = calculateProgress(
    media.progress?.watched,
    media.progress?.duration
  );
  const remainingTime = formatRemainingTime(
    media.progress?.watched,
    media.progress?.duration
  );
  const rating = details?.vote_average
    ? `${details.vote_average.toFixed(1)}/10`
    : "N/A";
  const date = details?.first_air_date || details?.release_date;
  const overview = details?.overview || "No overview available";
  const runtime = details?.runtime || details?.episode_run_time?.[0] || 0;

  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onRemove(media.id);
  };
  const toggleDetails = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDetails(!showDetails);
  };

  return (
    <motion.div layout className="p-1 w-full max-w-sm mx-auto h-full">
      <motion.div
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden border border-slate-700/50 shadow-lg relative h-[420px] flex flex-col"
      >
        <AnimatePresence initial={false} mode="wait">
          {showDetails ? (
            <motion.div
              key="details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-800 p-4 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={toggleDetails}
                  className="text-slate-400 hover:text-white"
                >
                  ← Back
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFavoriteToggle(media.id);
                  }}
                  className="bg-slate-800 rounded-full p-2 hover:bg-slate-700"
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
              <h3 className="text-white font-bold text-lg mb-2">
                {media.title}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
                <div className="flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-md">
                  <Star size={14} />
                  <span>{rating}</span>
                </div>
                <div className="flex items-center gap-1 bg-blue-500/20 text-blue-400 px-2 py-1 rounded-md">
                  <Calendar size={14} />
                  <span>{formatDate(date)}</span>
                </div>
                <div className="flex items-center gap-1 bg-purple-500/20 text-purple-400 px-2 py-1 rounded-md">
                  <Clock size={14} />
                  <span>{formatWatchTime(runtime * 60)}</span>
                </div>
              </div>
              <div className="mb-4">
                <h4 className="text-slate-400 text-xs mb-2">Genres</h4>
                <GenreChips genres={details?.genres} />
              </div>
              <p className="text-slate-300 text-sm max-h-24 overflow-y-auto mb-4">
                {overview}
              </p>
              <div className="bg-slate-800/50 rounded-lg p-3 mb-4">
                <h4 className="text-slate-400 text-xs mb-1 flex items-center gap-1">
                  <Eye size={12} />
                  Watch Progress
                </h4>
                <div className="flex items-center gap-2">
                  <ProgressCircle progress={progress} />
                  <div className="text-xs text-slate-300">
                    <div>{formatWatchTime(remainingTime)} left</div>
                    <div className="text-slate-500 text-[10px]">
                      {media.type === "tv"
                        ? media.last_season_watched &&
                          media.last_episode_watched
                          ? `Season ${media.last_season_watched}, Episode ${media.last_episode_watched}`
                          : "TV Series"
                        : "Movie"}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-auto grid grid-cols-2 gap-3">
                <Link
                  href={getMediaLink(media)}
                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2 text-center text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Play size={16} fill="white" />
                  Continue
                </Link>
                <button
                  onClick={handleRemove}
                  className="bg-slate-700 hover:bg-red-900/50 text-white rounded-lg py-2 text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Remove
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col"
            >
              <div className="relative overflow-hidden h-[240px] flex-shrink-0">
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-slate-700 animate-pulse flex items-center justify-center">
                    <Film className="w-12 h-12 text-slate-600" />
                  </div>
                )}
                <Image
                  src={getImagePath(media.poster_path)}
                  alt={media.title}
                  className={`w-full h-full object-cover transition-all duration-500 ${
                    isHovered ? "scale-105" : "scale-100"
                  } ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                  width={384}
                  height={240}
                  onLoad={() => setImageLoaded(true)}
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-800/80">
                  <motion.div
                    className={`h-full ${
                      progress > 75
                        ? "bg-green-500"
                        : progress > 25
                        ? "bg-blue-500"
                        : "bg-purple-500"
                    }`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>

                {/* --- ADDED REMOVE BUTTON START --- */}
                <motion.button
                  onClick={handleRemove}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 1 : 0 }}
                  className="absolute top-3 right-3 z-20 bg-black/70 p-2 rounded-full text-white/90 hover:bg-red-600/80 transition-all backdrop-blur-sm border border-white/10"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Remove from watch list"
                >
                  <Trash2 size={16} />
                </motion.button>
                {/* --- ADDED REMOVE BUTTON END --- */}

                {/* --- MODIFICATION START: Badge for TV shows now shows S/E number --- */}
                <div className="absolute top-3 left-3 bg-black/70 text-white/90 px-2 py-1 rounded-md text-xs font-medium backdrop-blur-sm border border-white/10">
                  {media.type === "tv" ? (
                    <div className="flex items-center gap-1">
                      <Tv size={14} className="text-blue-400" />
                      <span>
                        {media.last_season_watched && media.last_episode_watched
                          ? `S${media.last_season_watched} E${media.last_episode_watched}`
                          : "TV Series"}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Film size={14} className="text-purple-400" />
                      <span>Movie</span>
                    </div>
                  )}
                </div>
                {/* --- MODIFICATION END --- */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 1 : 0 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Link href={getMediaLink(media)}>
                    <motion.div
                      className="bg-blue-600 p-4 rounded-full shadow-lg"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Play size={24} className="text-white" fill="white" />
                    </motion.div>
                  </Link>
                </motion.div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-white font-bold text-lg mb-2 line-clamp-1">
                  {media.title}
                </h3>
                <div className="flex items-center gap-3 mb-3 text-xs">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Star size={14} className="fill-yellow-400" />
                    <span>{rating}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Calendar size={14} />
                    <span>{formatDate(date)?.split(", ")[1]}</span>
                  </div>
                </div>
                <div className="mb-3">
                  <GenreChips genres={details?.genres} />
                </div>
                <p className="text-slate-400 text-xs line-clamp-2 flex-grow">
                  {overview}
                </p>
                <div className="mt-auto flex justify-between items-center pt-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full animate-pulse ${
                        progress > 75
                          ? "bg-green-500"
                          : progress > 25
                          ? "bg-blue-500"
                          : "bg-purple-500"
                      }`}
                    />
                    <span className="text-xs text-slate-400">
                      {progress.toFixed(0)}% watched
                    </span>
                  </div>
                  <motion.button
                    onClick={toggleDetails}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                    whileHover={{ scale: 1.05 }}
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

// --- MAIN ContinueWatching COMPONENT ---
const ContinueWatching = () => {
  const [mediaItems, setMediaItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewAll, setViewAll] = useState(false);
  const detailCache = useRef({});

  const fetchDetails = useCallback(async (mediaId, mediaType) => {
    const cacheKey = `${mediaType}-${mediaId}`;
    if (detailCache.current[cacheKey]) return detailCache.current[cacheKey];
    try {
      const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      const response = await fetch(
        `https://api.themoviedb.org/3/${mediaType}/${mediaId}?api_key=${apiKey}&language=en-US`
      );
      if (!response.ok) throw new Error("Failed to fetch details");
      const data = await response.json();
      detailCache.current[cacheKey] = data;
      return data;
    } catch (error) {
      console.error("Error fetching details:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    const loadStoredData = () => {
      try {
        const progressData = JSON.parse(
          localStorage.getItem("mediaProgress") || "{}"
        );
        const storedFavorites = JSON.parse(
          localStorage.getItem("favorites") || "[]"
        );
        const mediaArray = Object.values(progressData).sort(
          (a, b) => (b.last_updated || 0) - (a.last_updated || 0)
        );
        setMediaItems(mediaArray);
        setFavorites(storedFavorites.map((fav) => fav.id));
      } catch (error) {
        console.error("Error loading stored data:", error);
      }
      setIsLoading(false);
    };
    loadStoredData();
    window.addEventListener("storage", loadStoredData);
    return () => window.removeEventListener("storage", loadStoredData);
  }, []);

  const handleRemoveMedia = useCallback((mediaId) => {
    setMediaItems((prev) => prev.filter((item) => item.id !== mediaId));
    try {
      const progressData = JSON.parse(
        localStorage.getItem("mediaProgress") || "{}"
      );
      delete progressData[mediaId];
      localStorage.setItem("mediaProgress", JSON.stringify(progressData));
    } catch (error) {
      console.error("Error removing media:", error);
    }
  }, []);

  const handleFavoriteToggle = useCallback((mediaId) => {
    setFavorites((prev) =>
      prev.includes(mediaId)
        ? prev.filter((id) => id !== mediaId)
        : [...prev, mediaId]
    );
  }, []);

  const clearAllMedia = useCallback(() => {
    if (window.confirm("Are you sure you want to clear your watch history?")) {
      localStorage.setItem("mediaProgress", "{}");
      setMediaItems([]);
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        className="flex justify-between items-center mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-white relative group">
            Continue Watching
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
          </h2>
          <motion.span
            key={mediaItems.length}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium border border-blue-500/20"
          >
            {mediaItems.length} {mediaItems.length === 1 ? "title" : "titles"}
          </motion.span>
        </div>
        <div className="flex items-center gap-2">
          {mediaItems.length > 0 && (
            <motion.button
              onClick={() => setViewAll(!viewAll)}
              whileHover={{ scale: 1.05 }}
              className="text-sm text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20"
            >
              {viewAll ? (
                <>
                  <Rows size={16} />
                  View Less
                </>
              ) : (
                <>
                  <LayoutGrid size={16} />
                  View All
                </>
              )}
            </motion.button>
          )}
          {mediaItems.length > 0 && (
            <motion.button
              onClick={clearAllMedia}
              whileHover={{ scale: 1.05 }}
              className="text-sm text-slate-400 hover:text-red-400 transition-colors flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
            >
              <Trash2 size={16} />
              Clear All
            </motion.button>
          )}
        </div>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-[420px] bg-slate-800 rounded-xl animate-pulse p-4 space-y-4"
            >
              <div className="h-[240px] bg-slate-700 rounded-lg"></div>
              <div className="h-5 bg-slate-700 rounded w-3/4"></div>
              <div className="h-4 bg-slate-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : mediaItems.length > 0 ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={viewAll ? "grid" : "swiper"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {viewAll ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {mediaItems.map((media) => (
                  <MediaCard
                    key={media.id}
                    media={media}
                    isFavorite={favorites.includes(media.id)}
                    handleFavoriteToggle={handleFavoriteToggle}
                    onRemove={handleRemoveMedia}
                    fetchDetails={fetchDetails}
                  />
                ))}
              </div>
            ) : (
              <div className="relative px-8 md:px-12">
                <Swiper
                  modules={[Navigation, Pagination, A11y]}
                  spaceBetween={20}
                  slidesPerView={1}
                  loop={mediaItems.length > 4}
                  pagination={{
                    clickable: true,
                    el: ".swiper-pagination-custom",
                  }}
                  navigation={{
                    prevEl: ".custom-prev-arrow",
                    nextEl: ".custom-next-arrow",
                  }}
                  breakpoints={{
                    640: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                    1280: { slidesPerView: 4 },
                  }}
                >
                  {mediaItems.map((media) => (
                    <SwiperSlide key={media.id} className="self-stretch h-auto">
                      <MediaCard
                        media={media}
                        isFavorite={favorites.includes(media.id)}
                        handleFavoriteToggle={handleFavoriteToggle}
                        onRemove={handleRemoveMedia}
                        fetchDetails={fetchDetails}
                      />
                    </SwiperSlide>
                  ))}
                  <div className="custom-prev-arrow absolute top-1/2 -translate-y-1/2 z-20 -left-2 md:-left-5 cursor-pointer flex items-center justify-center">
                    <ChevronLeft size={30} />
                  </div>
                  <div className="custom-next-arrow absolute top-1/2 -translate-y-1/2 z-20 -right-2 md:-right-5 cursor-pointer flex items-center justify-center">
                    <ChevronRight size={30} />
                  </div>
                </Swiper>
                <div className="swiper-pagination-custom text-center mt-8"></div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      ) : (
        <motion.div
          className="bg-slate-800/50 rounded-xl p-8 text-center border border-slate-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="p-4 bg-slate-700/30 rounded-full"
            >
              <Tv size={40} className="text-slate-500" />
            </motion.div>
            <p className="text-slate-400">
              Your watch history is empty. Go find something to watch!
            </p>
            <Link
              href="/browse"
              className="mt-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-all hover:scale-105"
            >
              Browse Content
            </Link>
          </div>
        </motion.div>
      )}

      <style jsx global>{`
        .swiper-slide {
          height: auto !important;
        }
        .swiper-pagination-custom .swiper-pagination-bullet {
          background-color: #718096;
          opacity: 0.6;
          transition: all 0.3s ease;
          margin: 0 4px !important;
        }
        .swiper-pagination-custom .swiper-pagination-bullet-active {
          background-color: #3b82f6;
          opacity: 1;
          width: 20px;
          border-radius: 5px;
        }
        .custom-prev-arrow,
        .custom-next-arrow {
          width: 48px;
          z-index: 100;
          height: 48px;
          background: rgba(15, 23, 42, 0.7);
          border-radius: 50%;
          display: none;
          align-items: center;
          justify-content: center;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        @media (min-width: 768px) {
          .custom-prev-arrow,
          .custom-next-arrow {
            display: flex;
          }
        }
        .custom-prev-arrow:hover,
        .custom-next-arrow:hover {
          background: #3b82f6;
        }
        .swiper-button-disabled {
          opacity: 0.3;
          cursor: not-allowed;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default ContinueWatching;
