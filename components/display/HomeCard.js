"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const HomeCard = ({ MovieCard }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isTV = MovieCard.media_type === "tv";
  const title = isTV ? MovieCard.name : MovieCard.title;
  const linkPath = isTV ? `/series/${MovieCard.id}` : `/movie/${MovieCard.id}`;

  const getImagePath = () => {
    if (MovieCard.poster_path)
      return `https://image.tmdb.org/t/p/w500/${MovieCard.poster_path}`;
    return "https://i.imgur.com/HIYYPtZ.png";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).getFullYear();
  };

  const handleFavoriteToggle = (e) => {
    // Crucial: Stop the click from bubbling up to the Link or parent containers
    e.preventDefault();
    e.stopPropagation();

    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (isFavorite) {
      const updated = favorites.filter((item) => item.id !== MovieCard.id);
      localStorage.setItem("favorites", JSON.stringify(updated));
    } else {
      favorites.push(MovieCard);
      localStorage.setItem("favorites", JSON.stringify(favorites));
    }
    setIsFavorite(!isFavorite);
  };

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setIsFavorite(favorites.some((item) => item.id === MovieCard.id));
  }, [MovieCard.id]);

  // --- ANIMATION VARIANTS ---
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
      className="relative w-full aspect-[2/3] rounded-[2rem] shadow-2xl bg-[#0a0a0a] ring-1 ring-white/5 isolate transform-gpu"
    >
      {/* 
        1. THE MAIN LINK
        Absolute positioned at z-0. 
        It covers the card but sits BELOW the favorite button.
      */}
      <Link
        href={linkPath}
        className="absolute inset-0 z-0 rounded-[2rem] overflow-hidden block"
        tabIndex={0} // Ensure keyboard navigability
      >
        <div className="absolute inset-0 bg-neutral-900">
          <Image
            src={getImagePath()}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={`
              object-cover transition-all duration-700 ease-out 
              ${imageLoaded ? "opacity-100 blur-0" : "opacity-0 blur-xl"} 
              ${isHovered ? "scale-110" : "scale-100"}
            `}
            onLoadingComplete={() => setImageLoaded(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />
        </div>

        {/* Info Sheet (Visual Only, part of the link) */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 p-2 z-10"
          initial={{ backgroundColor: "rgba(10, 10, 10, 0)" }}
          animate={{
            backgroundColor: isHovered
              ? "rgba(10, 10, 10, 0)"
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
                  {MovieCard.vote_average > 0 && (
                    <div className="flex items-center gap-1 text-xs font-bold text-[#ffdcc2]">
                      <Star size={12} className="fill-[#ffdcc2]" />
                      <span>{MovieCard.vote_average.toFixed(1)}</span>
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
                  {MovieCard.overview || "No description available."}
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

      {/* 
        2. FLOATING UI LAYER
        z-index 50 ensures it is physically above the link.
        pointer-events-none ensures the empty space in this div doesn't block clicks to the card.
      */}
      <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-start pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md text-black text-[11px] font-black px-3 py-1.5 rounded-full shadow-lg">
          {formatDate(MovieCard.release_date || MovieCard.first_air_date)}
        </div>

        {/* 
            THE FIX: 
            1. 'pointer-events-auto' re-enables clicking for this specific button.
            2. 'cursor-pointer' ensures the hand icon appears.
            3. 'z-50' is inherited but good to keep in mind.
        */}
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

export default HomeCard;
