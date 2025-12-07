"use client";
import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Pause,
  Play,
  Star,
  Volume2,
  VolumeX,
  Tv,
  Film,
  Calendar,
  Info,
} from "lucide-react";

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

  // --- SKELETON LOADER ---
  const SpotlightSkeleton = () => (
    <div className="relative w-full h-[100svh] bg-neutral-900 overflow-hidden">
      <div className="absolute inset-0 bg-neutral-800 animate-pulse" />
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 z-20">
        <div className="flex flex-col md:flex-row items-end gap-8 mb-8 md:mb-0">
          <div className="flex-1 space-y-6 w-full max-w-4xl">
            <div className="space-y-4">
              <div className="w-3/4 h-16 md:h-24 bg-white/10 rounded-3xl animate-pulse" />
              <div className="w-1/2 h-16 md:h-24 bg-white/10 rounded-3xl animate-pulse" />
            </div>
            <div className="flex gap-4">
              <div className="w-24 h-10 bg-white/10 rounded-full animate-pulse" />
              <div className="w-24 h-10 bg-white/10 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    setIsMounted(true);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchSpotlights = async () => {
      setIsLoading(true);
      const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      if (!API_KEY) return;

      const URL = `https://api.themoviedb.org/3/trending/all/week?api_key=${API_KEY}`;

      try {
        const response = await fetch(URL);
        const data = await response.json();
        const results = data.results?.slice(0, 10) || [];
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
        setTrailers((prev) => ({ ...prev, [id]: trailer.key }));
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
    if (!isLoading && spotlights.length > 0) startAutoplay();
    return () => stopAutoplay();
  }, [isPaused, currentSlide, isLoading, spotlights.length]);

  const handleNextSlide = () => {
    setShowTrailer(false);
    setCurrentSlide((prev) => (prev + 1) % spotlights.length);
    if (!isMobile) {
      setTimeout(() => setShowTrailer(true), 5000);
    }
  };

  const handlePrevSlide = () => {
    setShowTrailer(false);
    setCurrentSlide((prev) => (prev === 0 ? spotlights.length - 1 : prev - 1));
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
    if (!isPaused) stopAutoplay();
    else startAutoplay();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  if (!isMounted || isLoading) return <SpotlightSkeleton />;
  if (!spotlights.length)
    return <div className="bg-black text-white p-10">No content available</div>;

  const currentItem = spotlights[currentSlide];
  const title = currentItem.title || currentItem.name || "Untitled";
  const releaseYear = (
    currentItem.release_date ||
    currentItem.first_air_date ||
    ""
  ).split("-")[0];
  const description = currentItem.overview || "No description available.";
  const posterPath = currentItem.backdrop_path
    ? `https://image.tmdb.org/t/p/original/${currentItem.backdrop_path}`
    : null;
  const trailerKey = trailers[currentItem.id];
  const rating = currentItem.vote_average?.toFixed(1) || "N/A";
  const isTV = currentItem.media_type === "tv";
  const href = isTV ? `/series/${currentItem.id}` : `/movie/${currentItem.id}`;

  return (
    <div className="relative w-full h-[100svh] overflow-hidden bg-[#050505] text-white font-sans selection:bg-white/30">
      {/* --- BACKGROUND LAYER --- */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
          className="absolute inset-0 z-0"
        >
          {posterPath && (
            <Image
              src={posterPath}
              alt={title}
              fill
              className={`object-cover transition-opacity duration-1000 ${
                showTrailer ? "opacity-0" : "opacity-60"
              }`}
              priority
            />
          )}

          {/* Vignette & Gradients */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/90 via-[#050505]/20 to-transparent z-10" />

          {trailerKey && !isMobile && (
            <div
              className={`absolute inset-0 transition-opacity duration-1000 ${
                showTrailer ? "opacity-100" : "opacity-0"
              }`}
            >
              <iframe
                ref={videoRef}
                className="absolute w-full h-[140%] -top-[20%] pointer-events-none scale-110"
                src={`https://www.youtube.com/embed/${trailerKey}?enablejsapi=1&autoplay=1&mute=${
                  isMuted ? 1 : 0
                }&controls=0&modestbranding=1&loop=1&playlist=${trailerKey}`}
                allow="autoplay; encrypted-media"
                title="Trailer"
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* --- CONTENT LAYER --- */}
      <div className="relative z-30 h-full flex flex-col justify-end pb-12 px-6 md:px-12 lg:px-16 max-w-[2400px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
          {/* --- LEFT: METADATA & TITLE --- */}
          <div className="md:col-span-8 lg:col-span-7 space-y-6 md:space-y-8 mb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="space-y-6"
              >
                {/* METADATA CHIPS (Rating Moved Here) */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Type Chip */}
                  <div
                    className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border flex items-center gap-2
                    ${
                      isTV
                        ? "bg-violet-500/10 text-violet-300 border-violet-500/20"
                        : "bg-teal-500/10 text-teal-300 border-teal-500/20"
                    }`}
                  >
                    {isTV ? <Tv size={14} /> : <Film size={14} />}
                    {isTV ? "Series" : "Movie"}
                  </div>

                  {/* Year Chip */}
                  <div className="px-3 py-1.5 rounded-md text-xs font-medium uppercase tracking-wider bg-white/5 border border-white/10 text-neutral-300 flex items-center gap-2">
                    <Calendar size={14} />
                    {releaseYear}
                  </div>

                  {/* RATING CHIP (New Location) */}
                  {rating !== "N/A" && (
                    <div className="px-3 py-1.5 rounded-md text-xs font-bold bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center gap-1.5">
                      <Star size={14} className="fill-yellow-400" />
                      <span>{rating}</span>
                    </div>
                  )}
                </div>

                {/* TITLE */}
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] text-white drop-shadow-2xl">
                  {title}
                </h1>

                {/* DESCRIPTION */}
                <p className="text-neutral-300 text-sm md:text-base lg:text-lg max-w-2xl leading-relaxed line-clamp-3">
                  {description}
                </p>

                {/* BUTTONS */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link href={href}>
                    <button className="flex items-center gap-3 bg-white text-black px-8 py-3.5 rounded-xl font-bold tracking-tight hover:scale-105 hover:bg-neutral-200 transition-all duration-300">
                      <Play size={20} className="fill-black" />
                      <span>Play Now</span>
                    </button>
                  </Link>

                  <button className="px-6 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md transition-colors font-medium flex items-center gap-2">
                    <Info size={20} />
                    <span>More Info</span>
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* --- RIGHT: CONTROL DASHBOARD (Progress & Counter Moved Here) --- */}
          <div className="md:col-span-4 lg:col-span-5 flex flex-col items-end justify-end space-y-4">
            <div className="flex items-center gap-3">
              {/* SLIDE COUNTER & PROGRESS */}
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl px-5 h-14 flex flex-col justify-center min-w-[100px] relative overflow-hidden group">
                <span className="font-mono text-sm font-medium tracking-widest text-neutral-400 relative z-10">
                  <span className="text-white text-lg">
                    {String(currentSlide + 1).padStart(2, "0")}
                  </span>
                  <span className="opacity-50 mx-1">/</span>
                  {String(spotlights.length).padStart(2, "0")}
                </span>

                {/* Progress Line (Bottom) */}
                <div className="absolute bottom-0 left-0 h-[3px] bg-white/10 w-full">
                  <motion.div
                    className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{
                      duration: 15,
                      ease: "linear",
                      repeat: isPaused ? 0 : Infinity,
                    }}
                    key={currentSlide} // Reset on slide change
                  />
                </div>
              </div>

              {/* NAVIGATION CONTROLS */}
              <div className="h-14 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center p-1 gap-1">
                <button
                  onClick={handlePrevSlide}
                  className="w-12 h-full flex items-center justify-center rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-all"
                >
                  <ArrowRight size={20} className="rotate-180" />
                </button>

                <div className="w-[1px] h-6 bg-white/10" />

                <button
                  onClick={togglePause}
                  className="w-12 h-full flex items-center justify-center rounded-xl hover:bg-white/10 text-white transition-all"
                >
                  {isPaused ? <Play size={20} /> : <Pause size={20} />}
                </button>

                <div className="w-[1px] h-6 bg-white/10" />

                <button
                  onClick={handleNextSlide}
                  className="w-12 h-full flex items-center justify-center rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-all"
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>

            {/* MUTE TOGGLE (Separate Floating Bubble) */}
            {trailerKey && !isMobile && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={toggleMute}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/60 backdrop-blur-md border border-white/5 text-neutral-400 hover:text-white transition-all"
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotlightCarousel;
