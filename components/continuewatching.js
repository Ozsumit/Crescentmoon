"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Heart,
  Star,
  Trash2,
  Tv,
  Film,
  Play,
  X,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Rows,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";
import useSettingsStore from "@/components/settings-store";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// --- UTILITIES ---
const getImagePath = (path) => {
  if (!path) return "https://i.imgur.com/HIYYPtZ.png";
  return `https://image.tmdb.org/t/p/w500${path}`;
};

const getMediaLink = (m) =>
  m.type === "tv" && m.last_season_watched && m.last_episode_watched
    ? `/series/${m.id}/season/${m.last_season_watched}/${m.last_episode_watched}`
    : `/${m.type}/${m.id}`;

const formatWatchTime = (s) => {
  if (!s || isNaN(s) || s < 0) return "0m";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h === 0) return `${m}m`;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

// --- SWISS GLASSMORPHISM MEDIA CARD ---
const GlassMediaCard = ({
  media,
  isFavorite,
  handleFavoriteToggle,
  onRemoveClick,
  shouldConfirmRemove,
  confirmRemove,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isTV = media.type === "tv";
  const title = media.title || media.name;

  // Calculate Progress Safely
  const currentWatched = Number(media.progress?.watched) || 0;
  const totalDuration = Number(media.progress?.duration) || 1;
  const progressPercent = Math.min((currentWatched / totalDuration) * 100, 100);
  const remainingSeconds = Math.max(0, totalDuration - currentWatched);

  const containerVariants = {
    rest: { scale: 1, y: 0 },
    hover: {
      scale: 1.02,
      y: -5,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
  };

  const contentStagger = {
    rest: {
      height: 0,
      opacity: 0,
      transition: { duration: 0.2, when: "afterChildren" },
    },
    hover: {
      height: "auto",
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
        when: "beforeChildren",
      },
    },
  };

  const itemFade = {
    rest: { opacity: 0, y: 10 },
    hover: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="rest"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative w-full aspect-[2/3] rounded-[2rem] shadow-2xl bg-[#0a0a0a] ring-1 ring-white/5 isolate transform-gpu select-none group"
    >
      <div className="absolute inset-0 z-0 rounded-[2rem] overflow-hidden">
        <div className="absolute inset-0 bg-neutral-900">
          <Image
            src={getImagePath(media.poster_path)}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`object-cover transition-all duration-700 ease-out ${
              imageLoaded ? "opacity-100 blur-0" : "opacity-0 blur-xl"
            } ${isHovered ? "scale-110" : "scale-100"}`}
            onLoad={() => setImageLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />
        </div>

        {/* PROGRESS BAR */}
        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-white/10 z-20">
          <motion.div
            className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>

        {/* GLASS BOTTOM INFO BOX */}
        <motion.div
          className="absolute bottom-1.5 left-0 right-0 p-2 z-10"
          animate={{ backgroundColor: "rgba(10, 10, 10, 0)" }}
        >
          <div className="backdrop-blur-xl border border-white/10 rounded-[1.5rem] overflow-hidden shadow-lg bg-black/40">
            <div className="px-4 pt-4 pb-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ${
                      isTV
                        ? "bg-[#d0bcff] text-[#381e72]"
                        : "bg-[#bceeff] text-[#001f2a]"
                    }`}
                  >
                    {isTV && media.last_season_watched
                      ? `S${media.last_season_watched} E${media.last_episode_watched}`
                      : isTV
                        ? "Series"
                        : "Movie"}
                  </span>
                  {media.vote_average > 0 && (
                    <div className="flex items-center gap-1 text-xs font-bold text-[#ffdcc2]">
                      <Star size={12} className="fill-[#ffdcc2]" />
                      <span>{media.vote_average.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
              <h3 className="text-lg font-bold leading-tight line-clamp-1 text-white mb-1">
                {title}
              </h3>
            </div>

            <motion.div variants={contentStagger}>
              <div className="px-4 pb-4 flex flex-col gap-3">
                <motion.p
                  variants={itemFade}
                  className="text-xs text-neutral-300 line-clamp-2 leading-relaxed"
                >
                  {media.overview ||
                    "Saved in your continue watching list. Click to resume playback."}
                </motion.p>

                {/* PROGRESS TRACKER TEXT (ONLY SHOWS ON HOVER) */}
                <motion.div
                  variants={itemFade}
                  className="flex justify-between items-center bg-black/40 rounded-lg p-2.5 border border-white/5 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-2 text-emerald-400">
                    <Clock size={12} />
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase">
                      {progressPercent > 0
                        ? `${formatWatchTime(remainingSeconds)} left`
                        : "Not started"}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-white tracking-wider">
                    {Math.round(progressPercent)}%
                  </span>
                </motion.div>

                <motion.div variants={itemFade}>
                  <Link href={getMediaLink(media)}>
                    <div className="w-full py-3 rounded-xl bg-emerald-400 text-[#07210b] font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:bg-emerald-300 transition-colors">
                      <Play size={16} className="fill-[#07210b]" />
                      <span>
                        {progressPercent > 95 ? "Watch Again" : "Resume"}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* TOP FLOATING ACTIONS */}
      <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-start pointer-events-none">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (shouldConfirmRemove) {
              onRemoveClick(media);
            } else {
              confirmRemove(media);
            }
          }}
          className="pointer-events-auto bg-black/40 backdrop-blur-md text-white/70 w-10 h-10 rounded-full flex items-center justify-center border border-white/20 shadow-lg hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300"
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            handleFavoriteToggle(media.id);
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.85 }}
          className={`pointer-events-auto cursor-pointer w-10 h-10 flex items-center justify-center rounded-full shadow-lg border backdrop-blur-md transition-all duration-300 ${
            isFavorite
              ? "bg-[#ffb4ab] border-[#ffb4ab] text-[#690005]"
              : "bg-black/40 border-white/20 text-white hover:bg-white hover:text-black hover:border-white"
          }`}
        >
          <AnimatePresence mode="wait">
            {isFavorite ? (
              <motion.div
                key="liked"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Heart size={18} className="fill-[#690005]" />
              </motion.div>
            ) : (
              <motion.div
                key="unliked"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Heart size={18} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
};

// --- MAIN CONTINUE WATCHING CONTAINER ---
const ContinueWatching = () => {
  const [mediaItems, setMediaItems] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewAll, setViewAll] = useState(false);
  const [mediaToRemove, setMediaToRemove] = useState(null);
  const { confirmRemove: shouldConfirmRemove } = useSettingsStore();

  useEffect(() => {
    const loadStoredData = () => {
      try {
        const progressData = JSON.parse(
          localStorage.getItem("mediaProgress") || "{}",
        );
        const storedFavorites = JSON.parse(
          localStorage.getItem("favorites") || "[]",
        );

        const mediaArray = Object.values(progressData).sort(
          (a, b) => (b.last_updated || 0) - (a.last_updated || 0),
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

  const confirmRemove = (mediaItemOverride) => {
    const itemToRemove = mediaItemOverride || mediaToRemove;
    if (!itemToRemove) return;
    setMediaItems((prev) =>
      prev.filter((item) => item.id !== itemToRemove.id),
    );
    try {
      const progressData = JSON.parse(
        localStorage.getItem("mediaProgress") || "{}",
      );
      delete progressData[itemToRemove.id];
      localStorage.setItem("mediaProgress", JSON.stringify(progressData));
    } catch (error) {
      console.error("Error removing media:", error);
    }
    setMediaToRemove(null);
  };

  const handleFavoriteToggle = useCallback(
    (mediaId) => {
      setFavorites((prev) => {
        const isFav = prev.includes(mediaId);
        const newFavs = isFav
          ? prev.filter((id) => id !== mediaId)
          : [...prev, mediaId];
        try {
          const fullFavObjs = JSON.parse(
            localStorage.getItem("favorites") || "[]",
          );
          if (isFav) {
            localStorage.setItem(
              "favorites",
              JSON.stringify(fullFavObjs.filter((f) => f.id !== mediaId)),
            );
          } else {
            const itemToAdd = mediaItems.find((m) => m.id === mediaId);
            if (itemToAdd)
              localStorage.setItem(
                "favorites",
                JSON.stringify([...fullFavObjs, itemToAdd]),
              );
          }
        } catch (e) {
          console.error(e);
        }
        return newFavs;
      });
    },
    [mediaItems],
  );

  return (
    <div className="w-full max-w-[2400px] mx-auto px-4 md:px-8 py-12 relative">
      <motion.div
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">
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
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6">
                {mediaItems.map((media) => (
                  <GlassMediaCard
                    key={media.id}
                    media={media}
                    isFavorite={favorites.includes(media.id)}
                    handleFavoriteToggle={handleFavoriteToggle}
                    onRemoveClick={setMediaToRemove}
                    shouldConfirmRemove={shouldConfirmRemove}
                    confirmRemove={confirmRemove}
                  />
                ))}
              </div>
            ) : (
              <div className="relative group/swiper">
                <Swiper
                  modules={[Navigation, Pagination, A11y]}
                  spaceBetween={24}
                  slidesPerView={1.2}
                  navigation={{ prevEl: ".cw-prev", nextEl: ".cw-next" }}
                  breakpoints={{
                    640: { slidesPerView: 2.2 },
                    1024: { slidesPerView: 3.2 },
                    1400: { slidesPerView: 4.2 },
                    1600: { slidesPerView: 5.2 },
                  }}
                  className="!pb-12 !px-2"
                >
                  {mediaItems.map((media) => (
                    <SwiperSlide key={media.id}>
                      <GlassMediaCard
                        media={media}
                        isFavorite={favorites.includes(media.id)}
                        handleFavoriteToggle={handleFavoriteToggle}
                        onRemoveClick={setMediaToRemove}
                        shouldConfirmRemove={shouldConfirmRemove}
                        confirmRemove={confirmRemove}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
                <div className="cw-prev absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 text-white backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 hover:bg-white hover:text-black transition-all opacity-0 group-hover/swiper:opacity-100 hidden md:flex">
                  <ChevronLeft size={24} strokeWidth={3} />
                </div>
                <div className="cw-next absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/10 text-white backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center shadow-2xl cursor-pointer hover:scale-110 hover:bg-white hover:text-black transition-all opacity-0 group-hover/swiper:opacity-100 hidden md:flex">
                  <ChevronRight size={24} strokeWidth={3} />
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
          <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
            <Tv size={32} className="text-neutral-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            Nothing in progress...
          </h3>
          <p className="text-neutral-500 mb-6 font-medium">
            Start watching movies or series, and we'll track your progress here.
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 bg-emerald-400 text-black px-6 py-3 rounded-full font-bold text-sm hover:scale-105 active:scale-95 transition-transform"
          >
            Explore Library
          </Link>
        </motion.div>
      )}

      {/* --- CONFIRMATION DIALOG MODAL (THEMED) --- */}
      <AnimatePresence>
        {mediaToRemove && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setMediaToRemove(null)}
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-[#0a0a0a]/95 backdrop-blur-3xl border border-white/10 p-6 sm:p-8 rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.8)] max-w-sm w-full relative overflow-hidden z-10"
            >
              {/* Subtle Red Ambient Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-red-500/20 blur-[50px] pointer-events-none" />

              {/* Close X Button */}
              <button
                onClick={() => setMediaToRemove(null)}
                className="absolute top-6 right-6 p-2 bg-white/5 border border-white/10 backdrop-blur-xl rounded-full text-white/50 hover:text-white hover:bg-white/10 hover:scale-110 active:scale-95 transition-all"
              >
                <X size={16} strokeWidth={2.5} />
              </button>

              <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-6 border border-red-500/20 backdrop-blur-md relative z-10">
                <Trash2 size={24} strokeWidth={2.5} />
              </div>

              <h3 className="text-2xl font-bold text-white mb-2 tracking-tight relative z-10">
                Remove Title?
              </h3>

              <p className="text-sm text-neutral-400 mb-8 leading-relaxed relative z-10">
                Are you sure you want to remove{" "}
                <span className="text-white font-bold">
                  "{mediaToRemove.title || mediaToRemove.name}"
                </span>{" "}
                from your watch list? You will lose your tracked progress.
              </p>

              <div className="flex gap-3 relative z-10">
                <button
                  onClick={() => setMediaToRemove(null)}
                  className="flex-1 px-4 py-3.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold transition-all border border-white/10 backdrop-blur-md active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRemove}
                  className="flex-1 px-4 py-3.5 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/50 font-bold transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Trash2 size={18} />
                  Remove
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .swiper-button-disabled {
          opacity: 0 !important;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
};

export default ContinueWatching;
