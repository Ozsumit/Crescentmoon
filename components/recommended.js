"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Calendar, Sparkles, RefreshCw, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

// --- 1. THE EXPRESSIVE CARD (Mini Version) ---
const RecCard = ({ movie, index }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : "N/A";
  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "N/A";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "50px" }}
      transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative w-full aspect-[2/3] rounded-[1.5rem] bg-[#0a0a0a] border border-white/5 overflow-hidden shadow-lg cursor-pointer transform-gpu"
    >
      <Link href={`/movie/${movie.id}`} className="block w-full h-full">
        {/* IMAGE */}
        <div className="absolute inset-0 z-0">
          <Image
            src={
              movie.poster_path
                ? `https://image.tmdb.org/t/p/w342/${movie.poster_path}`
                : "https://i.imgur.com/HIYYPtZ.png"
            }
            alt={movie.title}
            fill
            className={`object-cover transition-transform duration-700 ease-[cubic-bezier(0.33,1,0.68,1)] ${
              isHovered ? "scale-110 blur-[2px]" : "scale-100"
            } ${imageLoaded ? "opacity-100" : "opacity-0"}`}
            onLoadingComplete={() => setImageLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
        </div>

        {/* TOP BADGES */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
          <span className="bg-white/90 backdrop-blur-md text-black text-[10px] font-black px-2 py-1 rounded-md shadow-sm">
            {year}
          </span>
          {rating !== "N/A" && (
            <span className="bg-[#ffdcc2] text-[#2c1500] text-[10px] font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
              <Star size={8} className="fill-[#2c1500]" />
              {rating}
            </span>
          )}
        </div>

        {/* BOTTOM GLASS PANEL */}
        <motion.div
          animate={{ y: isHovered ? 0 : 10 }}
          className="absolute bottom-2 left-2 right-2 bg-neutral-900/80 backdrop-blur-xl border border-white/10 rounded-xl p-3 z-20 flex flex-col gap-2"
        >
          <h3 className="text-sm font-bold text-white leading-tight line-clamp-1 group-hover:line-clamp-none transition-all">
            {movie.title}
          </h3>

          {/* Hidden description reveals on hover */}
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{
              height: isHovered ? "auto" : 0,
              opacity: isHovered ? 1 : 0,
            }}
            className="overflow-hidden"
          >
            <p className="text-[10px] text-neutral-300 line-clamp-3 leading-relaxed mb-2">
              {movie.overview || "No details available."}
            </p>
            <div className="w-full py-1.5 bg-white text-black rounded-lg text-[10px] font-bold flex items-center justify-center gap-1">
              <Play size={10} className="fill-black" /> WATCH
            </div>
          </motion.div>
        </motion.div>
      </Link>
    </motion.div>
  );
};

// --- 2. SKELETON LOADER ---
const RecSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
    {Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        className="aspect-[2/3] rounded-[1.5rem] bg-neutral-900/50 border border-white/5 animate-pulse"
      />
    ))}
  </div>
);

// --- 3. MAIN COMPONENT ---
const RecommendedMovies = () => {
  const [movies, setMovies] = useState([]);
  const [sourceMovie, setSourceMovie] = useState(null); // The movie driving the recommendations
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Logic: Get the MOST RECENT watched movie, find recommendations for IT.
  // Fallback: If no history, show Trending.
  const fetchRecommendations = async (isRetry = false) => {
    try {
      if (isRetry) setIsRefreshing(true);
      else setIsLoading(true);

      const stored = JSON.parse(
        localStorage.getItem("continueWatching") || "[]"
      );

      let url = "";

      if (stored.length > 0) {
        // IMPROVED LOGIC: Use the most recent movie specifically
        const lastWatched = stored[0];
        setSourceMovie(lastWatched.title || lastWatched.name);
        url = `https://api.themoviedb.org/3/movie/${lastWatched.id}/recommendations?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
      } else {
        // Fallback to trending
        setSourceMovie(null);
        url = `https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      // If recommendations are empty (rare, but happens), fallback to popular
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
