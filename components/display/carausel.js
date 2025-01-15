"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Pause, Play, Volume2, VolumeX } from "lucide-react";

const SpotlightCarousel = () => {
  const [spotlights, setSpotlights] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [trailers, setTrailers] = useState({});
  const [isMounted, setIsMounted] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef(null);
  const autoplayRef = useRef(null);

  const SpotlightSkeleton = () => (
    <div className="w-full h-[100svh] bg-slate-900 relative overflow-hidden">
      {/* Gradient overlays for skeleton */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent z-10"></div>

      {/* Background skeleton pulse */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-slate-900 animate-pulse"></div>

      {/* Content skeleton */}
      <div className="relative z-20 flex flex-col justify-end h-full pb-24 md:pb-16 md:justify-center px-4 md:px-16">
        <div className="space-y-3 md:space-y-4 max-w-2xl">
          {/* Meta info skeleton */}
          <div className="flex items-center gap-3">
            <div className="w-20 h-6 bg-white/10 rounded animate-pulse"></div>
            <div className="w-24 h-5 bg-white/10 rounded animate-pulse"></div>
            <div className="w-16 h-5 bg-white/10 rounded animate-pulse"></div>
          </div>

          {/* Title skeleton */}
          <div className="space-y-3">
            <div className="w-3/4 h-12 md:h-14 bg-white/10 rounded animate-pulse"></div>
            <div className="w-1/2 h-12 md:h-14 bg-white/10 rounded animate-pulse"></div>
          </div>

          {/* Description skeleton */}
          <div className="space-y-2">
            <div className="w-full h-4 bg-white/10 rounded animate-pulse"></div>
            <div className="w-5/6 h-4 bg-white/10 rounded animate-pulse"></div>
            <div className="w-4/6 h-4 bg-white/10 rounded animate-pulse"></div>
          </div>

          {/* CTA button skeleton */}
          <div className="pt-2">
            <div className="w-32 h-10 md:h-12 bg-white/10 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Controls skeleton */}
      <div className="absolute bottom-4 md:bottom-8 left-0 right-0 flex flex-col items-center space-y-4 z-20 px-4">
        {/* Control buttons skeleton */}
        <div className="flex items-center justify-center space-x-4 backdrop-blur-sm bg-black/20 p-3 rounded-full">
          <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse"></div>
          <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse"></div>
          <div className="w-8 h-8 bg-white/10 rounded-full animate-pulse"></div>
        </div>

        {/* Progress indicators skeleton */}
        <div className="flex space-x-2">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-1 rounded-full bg-white/20 animate-pulse"
              style={{
                width: i === 0 ? "2rem" : "1rem",
                opacity: i === 0 ? 1 : 0.5,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
  // Check for mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    setIsMounted(true);
    checkMobile();

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchSpotlights = async () => {
      setIsLoading(true);
      const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      const URL = `https://api.themoviedb.org/3/trending/all/week?api_key=${API_KEY}`;

      try {
        const response = await fetch(URL);
        const data = await response.json();
        const results = data.results.slice(0, 6) || [];
        setSpotlights(results);

        await Promise.all(
          results.map((item) => fetchTrailer(item.id, item.media_type))
        );
      } catch (error) {
        console.error("Error fetching spotlight data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpotlights();
  }, []);

  const fetchTrailer = async (id, mediaType) => {
    const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    const URL = `https://api.themoviedb.org/3/${mediaType}/${id}/videos?api_key=${API_KEY}`;

    try {
      const response = await fetch(URL);
      const data = await response.json();
      const trailer = data.results.find(
        (video) => video.type === "Trailer" && video.site === "YouTube"
      );

      if (trailer) {
        setTrailers((prev) => ({
          ...prev,
          [id]: trailer.key,
        }));
      }
    } catch (error) {
      console.error("Error fetching trailer:", error);
    }
  };

  const startAutoplay = () => {
    stopAutoplay();
    if (!isPaused) {
      autoplayRef.current = setInterval(handleNextSlide, 15000);
    }
  };

  const stopAutoplay = () => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  };

  useEffect(() => {
    if (!isLoading && spotlights.length > 0) {
      startAutoplay();
    }
    return () => stopAutoplay();
  }, [isPaused, currentSlide, isLoading, spotlights.length]);

  const handleNextSlide = () => {
    setShowTrailer(false);
    setCurrentSlide((prev) => (prev + 1) % spotlights.length);

    if (!isMobile) {
      setTimeout(() => {
        setShowTrailer(true);
      }, 5000);
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    if (!isPaused) {
      stopAutoplay();
    } else {
      startAutoplay();
    }

    const iframe = document.querySelector("iframe");
    if (iframe) {
      const command = isPaused ? "playVideo" : "pauseVideo";
      iframe.contentWindow.postMessage(
        JSON.stringify({
          event: "command",
          func: command,
        }),
        "*"
      );
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    const iframe = document.querySelector("iframe");
    if (iframe) {
      const command = isMuted ? "unMute" : "mute";
      iframe.contentWindow.postMessage(
        JSON.stringify({
          event: "command",
          func: command,
        }),
        "*"
      );
    }
  };

  if (!isMounted || isLoading) {
    return <SpotlightSkeleton />;
  }
  // No data state
  if (!spotlights.length) {
    return (
      <div className="w-full h-[100svh] flex items-center justify-center bg-black text-white">
        No spotlights available
      </div>
    );
  }

  const currentItem = spotlights[currentSlide];
  if (!currentItem) return null;

  const title = currentItem.title || currentItem.name || "Untitled";
  const releaseDate =
    currentItem.release_date ||
    currentItem.first_air_date ||
    "Release date TBA";
  const description = currentItem.overview || "No description available.";
  const posterPath = currentItem.backdrop_path
    ? `https://image.tmdb.org/t/p/original/${currentItem.backdrop_path}`
    : "https://i.imgur.com/xDHFGVl.jpeg";
  const trailerKey = trailers[currentItem.id];
  const rating = currentItem.vote_average?.toFixed(1) || "N/A";

  const isTV = currentItem.media_type === "tv";
  const href = isTV ? "/series/[id]" : "/movie/[id]";
  const as = isTV ? `/series/${currentItem.id}` : `/movie/${currentItem.id}`;

  return (
    <div className="relative w-full h-[100svh] overflow-hidden bg-black">
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black z-10"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent z-10"></div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <Image
            src={posterPath}
            alt={title}
            layout="fill"
            objectFit="cover"
            priority
            className={`absolute inset-0 w-full h-full object-cover brightness-75 transition-opacity duration-1000 ${
              showTrailer ? "opacity-0" : "opacity-100"
            }`}
          />

          {trailerKey && !isMobile && (
            <div
              className={`relative w-full h-full transition-opacity duration-1000 ${
                showTrailer ? "opacity-100" : "opacity-0"
              }`}
            >
              <iframe
                ref={videoRef}
                className="absolute w-full h-full scale-150"
                src={`https://www.youtube.com/embed/${trailerKey}?enablejsapi=1&vq=hd1440&autoplay=1&mute=1&controls=0&modestbranding=1&loop=0&playlist=${trailerKey}`}
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-20 flex flex-col justify-end h-full pb-24 md:pb-16 md:justify-center px-4 md:px-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-white max-w-2xl space-y-3 md:space-y-4"
          >
            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <span className="bg-white/20 px-2 py-1 rounded text-xs backdrop-blur-sm">
                {isTV ? "TV SERIES" : "MOVIE"}
              </span>
              <span className="text-xs md:text-sm text-gray-300">
                {releaseDate}
              </span>
              {rating !== "N/A" && (
                <div className="flex items-center text-xs md:text-sm text-gray-300">
                  <span className="mr-1">⭐</span>
                  {rating}
                </div>
              )}
            </div>

            {/* Title */}
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight md:leading-tight">
              {title}
            </h2>

            {/* Description */}
            <p className="text-sm md:text-base text-gray-300 line-clamp-3 max-w-xl">
              {description}
            </p>

            {/* CTA Button */}
            <div className="pt-2">
              <Link
                href={href}
                as={as}
                className="inline-flex items-center bg-white text-black px-4 md:px-6 py-2 md:py-3 rounded-full hover:bg-gray-200 transition-all group"
              >
                <Play className="mr-2 w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
                <span className="text-sm md:text-base font-medium">
                  Watch Now
                </span>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="absolute bottom-4 md:bottom-8 left-0 right-0 flex flex-col items-center space-y-4 z-20 px-4">
        {/* Control buttons */}
        <div className="flex items-center justify-center space-x-2 md:space-x-4 backdrop-blur-sm bg-black/20 p-2 md:p-3 rounded-full">
          {trailerKey && !isMobile && (
            <button
              onClick={toggleMute}
              className="text-white p-1.5 md:p-2 rounded-full hover:bg-white/20 transition-all"
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          )}

          <button
            onClick={togglePause}
            className="text-white p-1.5 md:p-2 rounded-full hover:bg-white/20 transition-all"
            aria-label={isPaused ? "Play" : "Pause"}
          >
            {isPaused ? <Play size={18} /> : <Pause size={18} />}
          </button>

          <button
            onClick={handleNextSlide}
            className="text-white p-1.5 md:p-2 rounded-full hover:bg-white/20 transition-all"
            aria-label="Next"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Progress indicators */}
        <div className="flex space-x-1.5 md:space-x-2">
          {spotlights.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentSlide(index);
                setShowTrailer(false);
              }}
              className={`h-1 rounded-full transition-all ${
                index === currentSlide
                  ? "w-6 md:w-8 bg-white"
                  : "w-3 md:w-4 bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpotlightCarousel;
