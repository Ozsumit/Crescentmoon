"use client";

import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Volume2, VolumeX } from "lucide-react";

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

const getImageUrl = (path, size = "w500") => {
  if (!path)
    return "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?q=80&w=500&auto=format&fit=crop";
  return `https://image.tmdb.org/t/p/${size}/${path}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  return new Date(dateString).getFullYear();
};

// ==========================================
// 1. PURE SWISS MINIMALIST HOME CARD
// ==========================================
const HomeCard = memo(({ MovieCard }) => {
  const [isFavorite, setIsFavorite] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
      return favorites.some((item) => item.id === MovieCard.id);
    } catch {
      return false;
    }
  });

  const isTV =
    MovieCard.media_type === "tv" || MovieCard.first_air_date !== undefined;
  const title = isTV ? MovieCard.name : MovieCard.title;
  const linkPath = isTV ? `/series/${MovieCard.id}` : `/movie/${MovieCard.id}`;
  const year = formatDate(MovieCard.release_date || MovieCard.first_air_date);
  const rating = MovieCard.vote_average
    ? MovieCard.vote_average.toFixed(1)
    : null;

  const handleFavoriteToggle = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      try {
        const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
        const updated = isFavorite
          ? favorites.filter((item) => item.id !== MovieCard.id)
          : [...favorites, MovieCard];
        localStorage.setItem("favorites", JSON.stringify(updated));
        setIsFavorite(!isFavorite);
      } catch (err) {
        console.error(err);
      }
    },
    [isFavorite, MovieCard],
  );

  return (
    <div className="group relative w-full aspect-[2/3] rounded-2xl overflow-hidden bg-card transform-gpu transition-transform duration-300 ease-out hover:-translate-y-1 [content-visibility:auto] [contain-intrinsic-size:200px_300px]">
      {/* Poster Image & Primary Link */}
      <Link href={linkPath} className="absolute inset-0 block">
        <Image
          src={getImageUrl(MovieCard.poster_path)}
          alt={title || "Poster"}
          fill
          loading="lazy"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Minimal Dark Gradient for Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-background/10 to-transparent opacity-40 group-hover:opacity-95 transition-opacity" />
      </Link>

      {/* Top Right: Unobtrusive Favorite Heart */}
      <button
        onClick={handleFavoriteToggle}
        aria-label="Favorite"
        className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-all duration-200 active:scale-90 ${
          isFavorite
            ? "bg-destructive text-destructive-foreground opacity-100 shadow-md"
            : "bg-black/40 text-white opacity-0 group-hover:opacity-100 hover:bg-black/70"
        }`}
      >
        <Heart size={14} className={isFavorite ? "fill-current" : ""} />
      </button>

      {/* Bottom: Unadorned Swiss Typography (Directly on Image) */}
      <div className="absolute dark:text-black text-white bottom-0 inset-x-0 p-4 z-10 pointer-events-none flex flex-col gap-1">
        {/* Bold Swiss Uppercase Title */}
        <h3 className="font-sans font-black text-xl  dark:text-foreground  tracking-tight line-clamp-2 group-hover:text-primary-foreground transition-colors">
          {title}
        </h3>

        {/* Monospace Alignment Line */}
        <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground font-semibold">
          <span>
            {year ? `${year} • ` : ""}
            {isTV ? "SERIES" : "FILM"}
          </span>

          {rating && (
            <span className="flex items-center gap-1 text-foreground font-bold">
              <Star size={10} className="fill-primary text-primary" />
              {rating}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});
HomeCard.displayName = "HomeCard";

// ==========================================
// 2. PURE MINIMALIST MORE LIKE THIS CARD
// ==========================================
export const MoreLikeThisCard = memo(
  ({ item, index, isActive, onHover, ...props }) => {
    const [trailerKey, setTrailerKey] = useState(null);
    const [isMuted, setIsMuted] = useState(true);
    const [playVideo, setPlayVideo] = useState(false);

    const hasFetchedTrailer = useRef(false);
    const type = item.media_type || (item.first_air_date ? "tv" : "movie");

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
          if (err.name !== "AbortError") console.error(err);
        }
      };
      fetchTrailer();

      return () => controller.abort();
    }, [isActive, item.id, type]);

    useEffect(() => {
      let delayTimer;
      if (isActive) {
        delayTimer = setTimeout(() => setPlayVideo(true), 1500);
      } else {
        setPlayVideo(false);
      }
      return () => clearTimeout(delayTimer);
    }, [isActive]);

    return (
      <div
        {...props}
        onMouseEnter={() => onHover(index)}
        onClick={() => setIsMuted(!isMuted)}
        className={`group relative aspect-[16/9] sm:aspect-[2/3] rounded-xl overflow-hidden bg-card cursor-pointer transition-transform duration-300 ease-out transform-gpu [content-visibility:auto] ${
          isActive ? "scale-105 z-10" : "scale-100"
        }`}
      >
        {playVideo && trailerKey ? (
          <div className="absolute inset-0 w-full h-full bg-background">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&mute=${
                isMuted ? 1 : 0
              }&controls=0&modestbranding=1&loop=1&playlist=${trailerKey}&playsinline=1`}
              className="w-[150%] h-[150%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-90"
              allow="autoplay; encrypted-media"
              title="Trailer"
            />
            <button className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full z-20 text-white">
              {isMuted ? <VolumeX size={12} /> : <Volume2 size={12} />}
            </button>
          </div>
        ) : (
          <Image
            src={getImageUrl(item.backdrop_path || item.poster_path)}
            alt={item.title || item.name || "Media"}
            fill
            loading="lazy"
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent opacity-80" />

        <div className="absolute bottom-0 p-3 w-full z-10 font-mono">
          <p className="text-foreground text-xs font-bold uppercase line-clamp-1">
            {item.title || item.name}
          </p>
        </div>
      </div>
    );
  },
);
MoreLikeThisCard.displayName = "MoreLikeThisCard";

// ==========================================
// 3. MORE LIKE THIS GRID
// ==========================================
export const MoreLikeThisGrid = memo(({ items }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const handleHover = useCallback((idx) => setActiveIndex(idx), []);

  if (!items || items.length === 0) {
    return (
      <div className="font-mono text-muted-foreground text-xs p-3">
        NO SIMILAR MEDIA.
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
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

export default HomeCard;
