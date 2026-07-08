"use client";
import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Heart, Star, Play, Plus, X, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

const getImageUrl = (path, size = "w1280") => {
  if (!path) return "https://i.imgur.com/HIYYPtZ.png";
  return `https://image.tmdb.org/t/p/${size}/${path}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).getFullYear();
};

// --- MORE LIKE THIS CARD ---
const MoreLikeThisCard = memo(
  ({ item, index, isActive, onHover, ...props }) => {
    const [trailerKey, setTrailerKey] = useState(null);
    const [isMuted, setIsMuted] = useState(true);
    const [playVideo, setPlayVideo] = useState(false);
    const [progress, setProgress] = useState(0); // Lightweight CSS progress state

    const hasFetchedTrailer = useRef(false);
    const type = item.media_type || (item.first_air_date ? "tv" : "movie");
    const posterUrl = getImageUrl(
      item.backdrop_path || item.poster_path,
      "w342",
    );

    useEffect(() => {
      if (!isActive || !API_KEY || hasFetchedTrailer.current) return;
      hasFetchedTrailer.current = true;
      const controller = new AbortController();

      const fetchTrailer = async () => {
        try {
          const res = await fetch(
            `https://api.themoviedb.org/3/${type}/${item.id}/videos?api_key=${API_KEY}`,
            { signal: controller.signal },
          );
          const data = await res.json();
          const trailer = data.results?.find(
            (vid) =>
              vid.site === "YouTube" &&
              (vid.type === "Trailer" || vid.type === "Teaser"),
          );
          if (trailer) setTrailerKey(trailer.key);
        } catch (err) {
          if (err.name !== "AbortError")
            console.error("Error fetching trailer", err);
        }
      };
      fetchTrailer();

      return () => controller.abort();
    }, [isActive, item.id, type]);

    useEffect(() => {
      let delayTimer;
      let progressTimer;
      if (isActive) {
        // Small delay to ensure CSS transition catches the width change
        progressTimer = setTimeout(() => setProgress(100), 50);
        delayTimer = setTimeout(() => setPlayVideo(true), 3000);
      } else {
        setPlayVideo(false);
        setProgress(0);
      }
      return () => {
        clearTimeout(delayTimer);
        clearTimeout(progressTimer);
      };
    }, [isActive]);

    return (
      <div
        {...props}
        onMouseEnter={() => onHover(index)}
        onClick={() => setIsMuted(!isMuted)}
        className={`group relative aspect-[16/9] sm:aspect-[2/3] rounded-[1.5rem] overflow-hidden bg-card cursor-pointer transition-all duration-300 ease-out border will-change-transform ${
          isActive
            ? "border-primary/50 scale-105 z-10 shadow-[0_20px_40px_rgba(0,0,0,0.5)]"
            : "scale-100 z-0 border-border"
        }`}
      >
        {playVideo && trailerKey ? (
          <div className="absolute inset-0 w-full h-full bg-background transition-opacity duration-500 opacity-100">
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${
                isMuted ? 1 : 0
              }&controls=0&modestbranding=1&loop=1&playlist=${trailerKey}&playsinline=1`}
              className="w-[150%] h-[150%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-screen opacity-80"
              allow="autoplay; encrypted-media"
              title="Trailer"
            />
            <div className="absolute top-3 right-3 bg-background/40 p-2 rounded-full backdrop-blur-md z-20 border border-border">
              {isMuted ? (
                <VolumeX size={14} className="text-foreground" />
              ) : (
                <Volume2 size={14} className="text-foreground" />
              )}
            </div>
          </div>
        ) : (
          <Image
            src={posterUrl}
            alt={item.title || item.name}
            fill
            loading="lazy"
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 opacity-80 group-hover:opacity-100 group-hover:scale-105"
          />
        )}

        <div
          className={`absolute inset-0 bg-gradient-to-t from-card/90 via-card/20 to-transparent transition-opacity duration-300 ${
            isActive ? "opacity-100" : "opacity-0 sm:opacity-100"
          }`}
        >
          <div className="absolute bottom-0 p-4 w-full">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                  type === "tv"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {type === "tv" ? "Series" : "Movie"}
              </span>
              {item.vote_average > 0 && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-[#ffdcc2]">
                  <Star size={10} className="fill-[#ffdcc2]" />
                  <span>{item.vote_average?.toFixed(1)}</span>
                </div>
              )}
            </div>
            <p className="text-foreground text-sm font-bold line-clamp-1 tracking-tight leading-tight mb-0.5">
              {item.title || item.name}
            </p>
            <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">
              {formatDate(item.release_date || item.first_air_date)}
            </p>
          </div>
        </div>

        {/* High-performance CSS Progress Bar */}
        {isActive && !playVideo && trailerKey && (
          <div className="absolute bottom-0 left-0 h-[3px] bg-foreground/10 w-full z-20 overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{
                width: `${progress}%`,
                transition: progress > 0 ? "width 2.95s linear" : "none",
              }}
            />
          </div>
        )}
      </div>
    );
  },
);
MoreLikeThisCard.displayName = "MoreLikeThisCard";

// --- MORE LIKE THIS GRID ---
const MoreLikeThisGrid = memo(({ items }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const handleHover = useCallback((idx) => setActiveIndex(idx), []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (items.length === 0) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev === null ? 0 : (prev + 1) % items.length,
        );
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev === null ? 0 : (prev - 1 + items.length) % items.length,
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [items.length]);

  if (items.length === 0)
    return (
      <div className="text-white/50 font-medium">No similar titles found.</div>
    );

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6"
      onMouseLeave={() => setActiveIndex(null)}
    >
      {items.map((item, index) => (
        <MoreLikeThisCard
          key={`${item.id}-${index}`}
          item={item}
          index={index}
          isActive={activeIndex === index}
          onHover={handleHover}
        />
      ))}
    </div>
  );
});
MoreLikeThisGrid.displayName = "MoreLikeThisGrid";

// --- HOME CARD COMPONENT ---
const HomeCard = memo(({ MovieCard }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const isTV =
    MovieCard.media_type === "tv" || MovieCard.first_air_date !== undefined;
  const title = isTV ? MovieCard.name : MovieCard.title;
  const linkPath = isTV ? `/series/${MovieCard.id}` : `/movie/${MovieCard.id}`;

  const getImagePath = () => {
    if (MovieCard.poster_path)
      return `https://image.tmdb.org/t/p/w342/${MovieCard.poster_path}`;
    return "https://i.imgur.com/HIYYPtZ.png";
  };

  const handleFavoriteToggle = useCallback(
    (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
      if (isFavorite) {
        localStorage.setItem(
          "favorites",
          JSON.stringify(favorites.filter((item) => item.id !== MovieCard.id)),
        );
      } else {
        localStorage.setItem(
          "favorites",
          JSON.stringify([...favorites, MovieCard]),
        );
      }
      setIsFavorite(!isFavorite);
    },
    [isFavorite, MovieCard],
  );

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setIsFavorite(favorites.some((item) => item.id === MovieCard.id));
  }, [MovieCard.id]);

  return (
    <>
      {/* Optimized wrapper using group and pure CSS transformations */}
      <div className="group relative w-full aspect-[2/3] rounded-[2rem] shadow-2xl bg-card ring-1 ring-border transform-gpu transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1">
        <Link
          href={linkPath}
          className="absolute inset-0 z-0 rounded-[2rem] overflow-hidden block"
        >
          <div className="absolute inset-0 bg-muted">
            <Image
              src={getImagePath()}
              alt={title}
              fill
              loading="lazy"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              // Optimized blur (blur-sm is cheaper for the GPU)
              className={`object-cover transition-all duration-700 ease-out transform-gpu group-hover:scale-110 ${
                imageLoaded ? "opacity-100 blur-0" : "opacity-0 blur-sm"
              }`}
              onLoad={() => setImageLoaded(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-2 z-10">
            <div className="border border-border rounded-[1.5rem] overflow-hidden shadow-md bg-card/50 dark:bg-card/80 backdrop-blur-sm transition-transform duration-300 transform-gpu translate-y-0 group-hover:-translate-y-1">
              <div className="px-4 pt-4 pb-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ${
                        isTV
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      {isTV ? "Series" : "Movie"}
                    </span>
                    {MovieCard.vote_average > 0 && (
                      <div className="flex items-center gap-1 text-xs font-bold text-primary">
                        <Star size={12} className="fill-primary" />
                        <span>{MovieCard.vote_average.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <h3 className="text-lg font-black leading-tight line-clamp-1 text-foreground mb-1 group-hover:text-primary transition-colors drop-shadow-sm">
                  {title}
                </h3>
              </div>

              {/* Magic CSS Grid height transition (0 to Auto equivalent) */}
              <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-in-out">
                <div className="overflow-hidden">
                  {/* Inner content fades in slightly after the height expands */}
                  <div className="px-4 pb-4 flex flex-col gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed font-medium">
                      {MovieCard.overview || "No description available."}
                    </p>
                    <div className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform">
                      <Play size={16} className="fill-primary-foreground" />
                      <span>Watch Now</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>

        <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-start pointer-events-none">
          <div className="bg-background/95 text-foreground text-[11px] font-black px-3 py-1.5 rounded-full shadow-md border border-border">
            {formatDate(MovieCard.release_date || MovieCard.first_air_date)}
          </div>

          <button
            onClick={handleFavoriteToggle}
            className={`pointer-events-auto cursor-pointer w-10 h-10 flex items-center justify-center rounded-full shadow-md border transition-transform duration-300 hover:scale-110 active:scale-90 ${
              isFavorite
                ? "bg-destructive border-destructive text-destructive-foreground"
                : "bg-background/30 border-border text-foreground hover:bg-foreground hover:text-background hover:border-foreground"
            }`}
          >
            {/* Replaced Framer Motion with CSS for better performance */}
            <div
              className={`transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${isFavorite ? "scale-100" : "scale-100"}`}
            >
              {isFavorite ? (
                <Heart
                  size={18}
                  className="fill-[#690005] animate-in zoom-in duration-300"
                />
              ) : (
                <Heart size={18} className="animate-in zoom-in duration-300" />
              )}
            </div>
          </button>
        </div>
      </div>
    </>
  );
});
HomeCard.displayName = "HomeCard";

export default HomeCard;
