"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Play, Sparkles, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

// --- 1. THE REC CARD (Exact Clone of HomeCard Design) ---
const RecCard = ({ movie, index }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Data Normalization
  const isTV = movie.media_type === "tv";
  const title = isTV ? movie.name : movie.title;
  const linkPath = isTV ? `/series/${movie.id}` : `/movie/${movie.id}`;
  const releaseDate = movie.release_date || movie.first_air_date;

  const getImagePath = () => {
    if (movie.poster_path)
      return `https://image.tmdb.org/t/p/w500/${movie.poster_path}`;
    return "https://i.imgur.com/HIYYPtZ.png";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).getFullYear();
  };

  const handleFavoriteToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (isFavorite) {
      const updated = favorites.filter((item) => item.id !== movie.id);
      localStorage.setItem("favorites", JSON.stringify(updated));
    } else {
      favorites.push(movie);
      localStorage.setItem("favorites", JSON.stringify(favorites));
    }
    setIsFavorite(!isFavorite);
  };

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setIsFavorite(favorites.some((item) => item.id === movie.id));
  }, [movie.id]);

  // --- ANIMATION VARIANTS (Identical to HomeCard) ---
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    rest: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.5, delay: index * 0.05 }, // Staggered entrance
    },
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
      initial="hidden"
      animate="rest" // Triggers entrance
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative w-full aspect-[2/3] rounded-[2rem] shadow-2xl bg-[#0a0a0a] ring-1 ring-white/5 isolate transform-gpu"
    >
      {/* 1. THE MAIN LINK */}
      <Link
        href={linkPath}
        className="absolute inset-0 z-0 rounded-[2rem] overflow-hidden block"
        tabIndex={0}
      >
        <div className="absolute inset-0 bg-neutral-900">
          <Image
            src={getImagePath()}
            alt={title}
            fill
            sizes="(max-width: 768px) 50vw, 20vw"
            className={`
              object-cover transition-all duration-700 ease-out 
              ${imageLoaded ? "opacity-100 blur-0" : "opacity-0 blur-xl"} 
              ${isHovered ? "scale-110" : "scale-100"}
            `}
            onLoadingComplete={() => setImageLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />
        </div>

        {/* Info Sheet */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 p-2 z-10"
          initial={{ backgroundColor: "rgba(10, 10, 10, 0)" }}
          animate={{
            backgroundColor: isHovered
              ? "rgba(10, 10, 10, 0)" // Kept transparent as per your code
              : "rgba(10, 10, 10, 0)",
          }}
        >
          <div className="backdrop-blur-xl border border-white/10 rounded-[1.5rem] overflow-hidden shadow-lg bg-black/20">
            <div className="px-4 pt-4 pb-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`
                      px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm
                      ${
                        isTV
                          ? "bg-[#d0bcff] text-[#381e72]"
                          : "bg-[#bceeff] text-[#001f2a]"
                      }
                    `}
                  >
                    {isTV ? "Series" : "Movie"}
                  </span>
                  {movie.vote_average > 0 && (
                    <div className="flex items-center gap-1 text-xs font-bold text-[#ffdcc2]">
                      <Star size={12} className="fill-[#ffdcc2]" />
                      <span>{movie.vote_average.toFixed(1)}</span>
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
                  className="text-xs text-neutral-300 line-clamp-3 leading-relaxed"
                >
                  {movie.overview || "No description available."}
                </motion.p>
                <div className="w-full py-3 rounded-xl bg-[#c3f0c2] text-[#07210b] font-bold text-sm flex items-center justify-center gap-2">
                  <Play size={16} className="fill-[#07210b]" />
                  <span>Watch Now</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </Link>

      {/* 2. FLOATING UI LAYER */}
      <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-start pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md text-black text-[11px] font-black px-3 py-1.5 rounded-full shadow-lg">
          {formatDate(releaseDate)}
        </div>

        <motion.button
          onClick={handleFavoriteToggle}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.85 }}
          className={`
            pointer-events-auto cursor-pointer
            w-10 h-10 flex items-center justify-center rounded-full shadow-lg border backdrop-blur-md transition-all duration-300
            ${
              isFavorite
                ? "bg-[#ffb4ab] border-[#ffb4ab] text-[#690005]"
                : "bg-black/30 border-white/20 text-white hover:bg-white hover:text-black hover:border-white"
            }
          `}
        >
          <AnimatePresence mode="wait">
            {isFavorite ? (
              <motion.div
                key="liked"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
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

// --- 2. SKELETON LOADER ---
const RecSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        className="aspect-[2/3] rounded-[2rem] bg-neutral-900/50 border border-white/5 animate-pulse"
      />
    ))}
  </div>
);

// --- 3. MAIN COMPONENT ---
const RecommendedMovies = () => {
  const [movies, setMovies] = useState([]);
  const [sourceMovie, setSourceMovie] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRecommendations = async (isRetry = false) => {
    try {
      if (isRetry) setIsRefreshing(true);
      else setIsLoading(true);

      const stored = JSON.parse(
        localStorage.getItem("continueWatching") || "[]"
      );

      let url = "";

      if (stored.length > 0) {
        const lastWatched = stored[0];
        setSourceMovie(lastWatched.title || lastWatched.name);
        url = `https://api.themoviedb.org/3/movie/${lastWatched.id}/recommendations?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
      } else {
        setSourceMovie(null);
        url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (!data.results || data.results.length === 0) {
        setSourceMovie(null);
        const fallbackRes = await fetch(
          `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}`
        );
        const fallbackData = await fallbackRes.json();
        setMovies(fallbackData.results.slice(0, 10));
      } else {
        setMovies(data.results.slice(0, 10));
      }
    } catch (error) {
      console.error("Recs Error:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  return (
    <div className="w-full relative z-10 py-12">
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 px-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[#c3f0c2] text-xs font-mono font-bold tracking-widest uppercase">
            <Sparkles size={14} />
            <span>AI Curation</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-none">
            {sourceMovie ? "Because you watched..." : "Trending for you"}
          </h2>

          {sourceMovie && (
            <p className="text-neutral-500 text-lg font-medium truncate max-w-md">
              &quot;{sourceMovie}&quot;
            </p>
          )}
        </div>

        <button
          onClick={() => fetchRecommendations(true)}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-bold uppercase tracking-wide text-neutral-400 hover:text-white transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {/* --- GRID --- */}
      {isLoading ? (
        <div className="px-4">
          <RecSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-4">
          <AnimatePresence mode="popLayout">
            {movies.map((movie, index) => (
              <RecCard key={movie.id} movie={movie} index={index} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* --- EMPTY STATE --- */}
      {!isLoading && movies.length === 0 && (
        <div className="text-center py-20 px-6 border border-dashed border-white/10 rounded-[2rem] mx-4 bg-[#0a0a0a]">
          <p className="text-neutral-500 mb-4">No recommendations found.</p>
          <button
            onClick={() => fetchRecommendations(true)}
            className="px-6 py-2 bg-white text-black rounded-full font-bold text-sm"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default RecommendedMovies;
