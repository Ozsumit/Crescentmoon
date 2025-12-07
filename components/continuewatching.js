"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Star,
  Trash2,
  Tv,
  Film,
  Play,
  Info,
  X,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Rows,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// --- UTILITY & COLORS ---
const GENRE_COLORS = {
  Action: "bg-[#ffb4ab] text-[#690005]",
  Adventure: "bg-[#ffdbcd] text-[#360f00]",
  Drama: "bg-[#e8def8] text-[#1d192b]",
  Comedy: "bg-[#c4eed0] text-[#07210b]",
  "Science Fiction": "bg-[#d0bcff] text-[#381e72]",
  Horror: "bg-[#3c2f2f] text-[#ffdad6]",
  Animation: "bg-[#e0e3aa] text-[#1c1d00]",
  Crime: "bg-[#ffdad6] text-[#410002]",
  Default: "bg-[#e7e0ec] text-[#1d1b20]",
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

const formatDate = (d) => (d ? new Date(d).getFullYear() : "N/A");

const getMediaLink = (m) =>
  m.type === "tv" && m.last_season_watched && m.last_episode_watched
    ? `/series/${m.id}/season/${m.last_season_watched}/${m.last_episode_watched}`
    : `/${m.type}/${m.id}`;

// --- GENRE CHIPS ---
const GenreChips = ({ genres }) => (
  <div className="flex flex-wrap gap-1.5">
    {(genres?.slice(0, 3) || []).map((g) => (
      <span
        key={g.id || g.name}
        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
          GENRE_COLORS[g.name] || GENRE_COLORS.Default
        }`}
      >
        {g.name}
      </span>
    ))}
  </div>
);

// --- MEDIA CARD COMPONENT ---
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

  // Calculate Progress
  const currentWatched = media.progress?.watched || 0;
  const totalDuration = media.progress?.duration || 1; // prevent divide by zero
  const progressPercent = Math.min((currentWatched / totalDuration) * 100, 100);
  const remainingSeconds = Math.max(0, totalDuration - currentWatched);

  const rating = details?.vote_average
    ? details.vote_average.toFixed(1)
    : "N/A";

  const cardVariants = {
    rest: { scale: 1, y: 0 },
    hover: {
      scale: 1.02,
      y: -4,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="rest"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative w-full aspect-[2/3] rounded-[2rem] overflow-hidden bg-[#0a0a0a] border border-white/5 shadow-2xl group select-none"
    >
      {/* 1. IMAGE LAYER */}
      <div className="absolute inset-0 z-0">
        <Image
          src={getImagePath(media.poster_path)}
          alt={media.title}
          fill
          className={`object-cover transition-all duration-700 ease-out ${
            imageLoaded ? "opacity-100" : "opacity-0"
          } ${
            isHovered && !showDetails
              ? "scale-110 blur-[2px]"
              : "scale-100 blur-0"
          }`}
          onLoadingComplete={() => setImageLoaded(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
      </div>

      {/* 2. PROGRESS BAR (Visible & Thick) */}
      {/* Container prevents radius clipping issues by adding padding if needed, but here we span full width absolute bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-800/50 z-20 backdrop-blur-sm">
        <motion.div
          className="h-full bg-[#c3f0c2] shadow-[0_0_15px_rgba(195,240,194,0.6)]" // Bright Mint Green
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 1, ease: "circOut" }}
        />
      </div>

      {/* 3. TOP BADGES */}
      <div className="absolute top-4 left-4 right-4 z-30 flex justify-between items-start pointer-events-none">
        <div
          className={`
          px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg flex items-center gap-1.5 border border-white/10
          ${
            media.type === "tv"
              ? "bg-[#d0bcff]/90 text-[#381e72]"
              : "bg-[#c4eed0]/90 text-[#07210b]"
          }
        `}
        >
          {media.type === "tv" ? <Tv size={12} /> : <Film size={12} />}
          <span className="text-[10px] font-black uppercase tracking-wider">
            {media.type === "tv" && media.last_season_watched
              ? `S${media.last_season_watched} E${media.last_episode_watched}`
              : media.type === "tv"
              ? "Series"
              : "Movie"}
          </span>
        </div>

        <div className="flex gap-2 pointer-events-auto">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(media.id);
            }}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white/70 hover:bg-red-500 hover:text-white transition-all backdrop-blur-md border border-white/10"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFavoriteToggle(media.id);
            }}
            className={`w-8 h-8 flex items-center justify-center rounded-full backdrop-blur-md border border-white/10 transition-all ${
              isFavorite
                ? "bg-[#ffb4ab] text-[#690005]"
                : "bg-black/40 text-white hover:bg-white hover:text-black"
            }`}
          >
            <Heart size={14} className={isFavorite ? "fill-current" : ""} />
          </button>
        </div>
      </div>

      {/* 4. MAIN OVERLAY (Title & Play) */}
      <AnimatePresence>
        {!showDetails && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col justify-end p-5 z-20 pb-8" // Added pb-8 to clear progress bar
          >
            <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <h3 className="text-xl font-bold text-white leading-tight line-clamp-2 drop-shadow-md mb-2">
                {media.title}
              </h3>

              {/* Progress Text Indicator on Hover */}
              <div className="flex items-center gap-2 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Clock size={12} className="text-[#c3f0c2]" />
                <span className="text-xs font-mono font-bold text-[#c3f0c2]">
                  {Math.round(progressPercent)}% Complete
                </span>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                <Link href={getMediaLink(media)} className="flex-1">
                  <button className="w-full bg-white text-black py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all">
                    <Play size={14} className="fill-black" />
                    RESUME
                  </button>
                </Link>
                <button
                  onClick={() => setShowDetails(true)}
                  className="bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-xl backdrop-blur-md border border-white/10 transition-colors"
                >
                  <Info size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. GLASS DETAILS SHEET */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="absolute inset-0 z-40 bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-white/10 p-5 flex flex-col"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-white line-clamp-1">
                  {media.title}
                </h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-neutral-400 font-mono">
                    {formatDate(
                      details?.release_date || details?.first_air_date
                    )}
                  </span>
                  <div className="flex items-center gap-1 text-[#ffdcc2] text-xs font-bold">
                    <Star size={10} className="fill-[#ffdcc2]" />
                    {rating}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(false)}
                className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mb-4">
              <GenreChips genres={details?.genres} />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <p className="text-xs leading-relaxed text-neutral-300">
                {details?.overview || "No description available."}
              </p>
            </div>

            {/* Detailed Progress Stats */}
            <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
              <div className="flex justify-between items-center text-xs text-neutral-400 font-mono bg-white/5 p-2 rounded-lg">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-[#c3f0c2] rounded-full animate-pulse" />
                  {formatWatchTime(remainingSeconds)} left
                </span>
                <span>{Math.round(progressPercent)}%</span>
              </div>

              <Link href={getMediaLink(media)} className="block w-full">
                <button className="w-full bg-[#c3f0c2] text-[#07210b] py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-[0.98] transition-all">
                  <Play size={16} className="fill-[#07210b]" />
                  CONTINUE WATCHING
                </button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --- MAIN CONTAINER COMPONENT ---
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
    <div className="w-full max-w-[2400px] mx-auto px-4 md:px-8 py-12">
      <motion.div
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-mono text-blue-400 uppercase tracking-widest">
              Library
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">
            Continue Watching
          </h2>
        </div>

        <div className="flex items-center gap-2 bg-[#1a1a1a] p-1.5 rounded-full border border-white/10">
          {mediaItems.length > 0 && (
            <button
              onClick={() => setViewAll(!viewAll)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-xs font-bold text-neutral-300 hover:text-white transition-colors"
            >
              {viewAll ? <Rows size={14} /> : <LayoutGrid size={14} />}
              {viewAll ? "Collapse" : "Grid View"}
            </button>
          )}
          {mediaItems.length > 0 && (
            <button
              onClick={clearAllMedia}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] bg-[#111] rounded-[2rem] border border-white/5 animate-pulse"
            />
          ))}
        </div>
      ) : mediaItems.length > 0 ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={viewAll ? "grid" : "swiper"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {viewAll ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
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
              <div className="relative">
                <Swiper
                  modules={[Navigation, Pagination, A11y]}
                  spaceBetween={16}
                  slidesPerView={1.2}
                  loop={mediaItems.length > 4}
                  navigation={{
                    prevEl: ".cw-prev",
                    nextEl: ".cw-next",
                  }}
                  breakpoints={{
                    640: { slidesPerView: 2.2 },
                    1024: { slidesPerView: 3.2 },
                    1400: { slidesPerView: 4.2 },
                    1600: { slidesPerView: 5.2 },
                  }}
                  className="!pb-12 !pl-1"
                >
                  {mediaItems.map((media) => (
                    <SwiperSlide key={media.id}>
                      <MediaCard
                        media={media}
                        isFavorite={favorites.includes(media.id)}
                        handleFavoriteToggle={handleFavoriteToggle}
                        onRemove={handleRemoveMedia}
                        fetchDetails={fetchDetails}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
                <div className="cw-prev absolute left-0 top-1/2 -translate-y-1/2 z-20 -ml-4 w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-xl cursor-pointer hover:scale-110 transition-transform hidden md:flex">
                  <ChevronLeft size={24} />
                </div>
                <div className="cw-next absolute right-0 top-1/2 -translate-y-1/2 z-20 -mr-4 w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-xl cursor-pointer hover:scale-110 transition-transform hidden md:flex">
                  <ChevronRight size={24} />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-dashed border-white/10 rounded-[2rem] p-12 text-center bg-[#0a0a0a]"
        >
          <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-4">
            <Tv size={32} className="text-neutral-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            It's quiet here...
          </h3>
          <p className="text-neutral-500 mb-6">
            Start watching movies or series to track your progress.
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold text-sm hover:scale-105 transition-transform"
          >
            Explore Library
          </Link>
        </motion.div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        .swiper-button-disabled {
          opacity: 0 !important;
          cursor: default;
        }
      `}</style>
    </div>
  );
};

export default ContinueWatching;
