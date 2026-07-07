"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Tv, Film, Play } from "lucide-react";

const MovieCard = ({ MovieCard }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isTV = MovieCard.media_type === "tv";
  const title = isTV ? MovieCard.name : MovieCard.title;
  const linkPath = isTV ? `/series/${MovieCard.id}` : `/movie/${MovieCard.id}`;

  const getImagePath = () => {
    if (MovieCard.poster_path)
      return `https://image.tmdb.org/t/p/w342/${MovieCard.poster_path}`;
    return "https://i.imgur.com/HIYYPtZ.png";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).getFullYear();
  };

  const handleFavoriteToggle = (e) => {
    // 1. Stop propagation so we don't click the card underneath
    e.preventDefault();
    e.stopPropagation();

    // 2. Handle Local Storage
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (isFavorite) {
      const updated = favorites.filter((item) => item.id !== MovieCard.id);
      localStorage.setItem("favorites", JSON.stringify(updated));
    } else {
      if (!favorites.some((item) => item.id === MovieCard.id)) {
        favorites.push(MovieCard);
        localStorage.setItem("favorites", JSON.stringify(favorites));
      }
    }
    setIsFavorite(!isFavorite);
  };

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setIsFavorite(favorites.some((item) => item.id === MovieCard.id));
  }, [MovieCard.id]);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative w-full h-full transform-gpu transition-transform duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] hover:scale-[1.02] hover:-translate-y-1"
    >
      {/* 
         1. THE MAIN LINK WRAPPER 
         Contains Image + Bottom Sheet
      */}
      <Link
        href={linkPath}
        className="block w-full aspect-[2/3] relative rounded-[2rem] overflow-hidden shadow-2xl bg-card ring-1 ring-border"
      >
        {/* IMAGE */}
        <div className="absolute inset-0 z-0 bg-muted">
          <Image
            src={getImagePath()}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`
                object-cover transition-transform duration-700 ease-out transform-gpu 
                ${imageLoaded ? "opacity-100" : "opacity-0"} 
                ${isHovered ? "scale-110" : "scale-100"}
            `}
            onLoad={() => setImageLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent opacity-60" />
        </div>

        {/* EXPANDING INFO SHEET (Bottom) */}
        <div className="absolute bottom-2 left-2 right-2 border backdrop-blur-md border-border rounded-[1.8rem] overflow-hidden z-20 shadow-md flex flex-col justify-end bg-card/60 transition-colors duration-300 group-hover:bg-card/60">
          <div className="px-4 pt-4 pb-2">
            {/* Header Row */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span
                  className={`
                    px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1
                    ${
                      isTV
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground"
                    }
                  `}
                >
                  {isTV ? <Tv size={10} /> : <Film size={10} />}
                  {isTV ? "Series" : "Movie"}
                </span>

                {MovieCard.vote_average > 0 && (
                  <div className="flex items-center gap-1 text-xs font-bold text-accent-foreground">
                    <Star size={12} className="fill-current" />
                    <span>{MovieCard.vote_average.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>

            <h3 className="text-lg font-bold leading-tight line-clamp-1 text-foreground mb-1">
              {title}
            </h3>
          </div>

          {/* Description & Watch Button (Expandable) */}
          <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-in-out">
            <div className="overflow-hidden">
              <div className="px-4 pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100 flex flex-col gap-3">
                <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed mb-1">
                  {MovieCard.overview || "No description available."}
                </p>

                <div className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-[0.98]">
                  <Play size={16} className="fill-current" />
                  <span>Watch Now</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* 
         2. FLOATING UI (Top)
         We moved this OUTSIDE the Link so the button actually clicks
      */}
      <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-start pointer-events-none">
        <div className="bg-background/95 text-foreground text-[11px] font-black px-3 py-1.5 rounded-full shadow-md border border-border">
          {formatDate(MovieCard.release_date || MovieCard.first_air_date)}
        </div>

        <button
          onClick={handleFavoriteToggle}
          className={`
            pointer-events-auto w-10 h-10 flex items-center justify-center rounded-full shadow-md border border-border transition-transform duration-300 cursor-pointer hover:scale-110 active:scale-90
            ${
              isFavorite
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background/40 border-border text-foreground hover:bg-foreground hover:text-background hover:border-foreground"
            }
          `}
        >
          <div
            className={`transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${isFavorite ? "scale-100" : "scale-100"}`}
          >
            {isFavorite ? (
              <Heart
                size={18}
                className="fill-[#690005] animate-in zoom-in duration-300 text-[#690005]"
              />
            ) : (
              <Heart size={18} className="animate-in zoom-in duration-300" />
            )}
          </div>
        </button>
      </div>
    </div>
  );
};

export default MovieCard;
