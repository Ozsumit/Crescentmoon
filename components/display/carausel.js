"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Pause, Play } from "lucide-react";

const SpotlightCarousel = () => {
  const [spotlights, setSpotlights] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchSpotlights = async () => {
      const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      const URL = `https://api.themoviedb.org/3/trending/all/week?api_key=${API_KEY}`;

      try {
        const response = await fetch(URL);
        const data = await response.json();
        setSpotlights(data.results.slice(0, 6) || []);
      } catch (error) {
        console.error("Error fetching spotlight data:", error);
      }
    };

    fetchSpotlights();
  }, []);

  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % spotlights.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [spotlights.length, isPaused]);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % spotlights.length);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  if (spotlights.length === 0) return null;

  const currentItem = spotlights[currentSlide];
  const title = currentItem.title || currentItem.name;
  const releaseDate = currentItem.release_date || currentItem.first_air_date;
  const description = currentItem.overview || "No description available.";
  const posterPath = currentItem.backdrop_path
    ? `https://image.tmdb.org/t/p/original/${currentItem.backdrop_path}`
    : "https://i.imgur.com/xDHFGVl.jpeg";

  // Determine media type and generate link
  const isTV = currentItem.media_type === "tv";
  const href = isTV ? "/series/[id]" : "/movie/[id]";
  const as = isTV ? `/series/${currentItem.id}` : `/movie/${currentItem.id}`;

  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden group">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10 pointer-events-none"></div>

      {/* Background Image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <Image
            src={posterPath}
            alt={title}
            layout="fill"
            objectFit="cover"
            className="absolute inset-0 w-full h-full object-cover brightness-[0.6]"
          />
        </motion.div>
      </AnimatePresence>

      {/* Content Overlay */}
      <div className="relative z-20 flex items-center h-full px-4 md:px-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="text-white max-w-2xl space-y-4"
          >
            <div className="flex items-center space-x-3 mb-2">
              <span className="bg-white/20 px-2 py-1 rounded text-xs">
                {currentItem.media_type === "tv" ? "TV SERIES" : "MOVIE"}
              </span>
              <span className="text-sm opacity-80">{releaseDate}</span>
              <div className="flex items-center text-sm">
                <span className="mr-1">⭐</span>
                {currentItem.vote_average?.toFixed(1) || "N/A"}
              </div>
            </div>

            <h2 className="text-3xl md:text-5xl font-bold mb-2 line-clamp-2">
              {title}
            </h2>

            <p className="text-sm md:text-base text-gray-300 line-clamp-3 mb-4">
              {description}
            </p>

            <div className="flex items-center space-x-4">
              <Link
                href={href}
                as={as}
                className="flex items-center bg-white text-black px-6 py-3 rounded-full hover:bg-gray-200 transition-all group"
              >
                <Play
                  className="mr-2 group-hover:scale-110 transition-transform"
                  size={20}
                />
                Watch Now
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 z-20">
        <div className="flex space-x-2">
          {spotlights.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? "bg-white w-4" : "bg-white/50"
              }`}
            />
          ))}
        </div>

        <button
          onClick={togglePause}
          className="bg-white/20 text-white p-2 rounded-full hover:bg-white/30 transition-all"
        >
          {isPaused ? <Play size={16} /> : <Pause size={16} />}
        </button>

        <button
          onClick={handleNextSlide}
          className="bg-white/20 text-white p-2 rounded-full hover:bg-white/30 transition-all"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default SpotlightCarousel;
