"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Calendar, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";

const HorizontalHomeCard = ({ MovieCard, className }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

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

  return (
    <motion.div
      initial={{ opacity: 0, x: -10, scale: 0.98 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: true, margin: "50px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full transform-gpu"
    >
      <Link
        href={linkPath}
        className={`
        group relative flex w-full h-40 
        bg-[#141414] rounded-[2rem] overflow-hidden 
        border border-white/5 shadow-md hover:shadow-xl hover:bg-[#1a1a1a]
        transition-colors duration-300
        ${className}
      `}
      >
        {/* --- LEFT: IMAGE --- */}
        <div className="p-2 h-full w-[120px] flex-shrink-0">
          <div className="relative h-full w-full rounded-[1.5rem] overflow-hidden bg-neutral-900 shadow-inner">
            <Image
              src={getImagePath()}
              alt={title}
              fill
              className={`object-cover transition-opacity duration-500 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoadingComplete={() => setImageLoaded(true)}
            />
            {/* Scale effect on separate div to prevent layout shifts */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </div>
        </div>

        {/* --- RIGHT: INFO --- */}
        <div className="flex-1 py-3 pr-4 pl-2 flex flex-col justify-center gap-1.5">
          {/* Top Row */}
          <div className="flex items-center gap-2">
            <span
              className={`
                    text-[10px] font-bold px-2.5 py-1 rounded-md transition-colors duration-300
                    ${
                      isTV
                        ? "bg-[#e8def8] text-[#1d192b] group-hover:bg-[#d0bcff]"
                        : "bg-[#c4eed0] text-[#0a2010] group-hover:bg-[#bceeff]"
                    }
                `}
            >
              {isTV ? "TV" : "FILM"}
            </span>

            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#25232a] text-[#ffdcc2] text-[10px] font-bold">
              <Star size={10} className="fill-[#ffdcc2]" />
              {MovieCard.vote_average?.toFixed(1)}
            </div>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-white leading-tight line-clamp-1 mb-0.5 group-hover:text-violet-200 transition-colors duration-300">
            {title}
          </h3>

          {/* Meta */}
          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
            <Calendar size={12} />
            <span>
              {formatDate(MovieCard.release_date || MovieCard.first_air_date)}
            </span>
          </div>

          <p className="text-[11px] text-neutral-500 line-clamp-1 leading-relaxed">
            {MovieCard.overview}
          </p>

          {/* CTA */}
          <div className="mt-auto flex justify-end">
            <div className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm transform transition-transform duration-200 group-active:scale-95">
              <PlayCircle size={14} className="fill-black text-white" />
              WATCH
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default HorizontalHomeCard;
