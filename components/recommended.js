"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Play, Sparkles, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import HomeCards from "./display/HomeCard";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

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
        localStorage.getItem("continueWatching") || "[]",
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
          `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}`,
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
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground leading-none">
            {sourceMovie ? "Because you watched..." : "Trending for you"}
          </h2>

          {sourceMovie && (
            <p className="text-muted-foreground text-lg font-medium truncate max-w-md">
              &quot;{sourceMovie}&quot;
            </p>
          )}
        </div>

        <button
          onClick={() => fetchRecommendations(true)}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-muted/80 border border-border text-xs font-bold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-all active:scale-95 disabled:opacity-50"
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
              <HomeCards key={movie.id} MovieCard={movie} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* --- EMPTY STATE --- */}
      {!isLoading && movies.length === 0 && (
        <div className="text-center py-20 px-6 border border-dashed border-border rounded-[2rem] mx-4 bg-card">
          <p className="text-muted-foreground mb-4">
            No recommendations found.
          </p>
          <button
            onClick={() => fetchRecommendations(true)}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold text-sm"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default RecommendedMovies;
