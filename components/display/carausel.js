"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
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

// --- POLISHED SKELETON (Seamless Transition) ---
const SpotlightSkeleton = () => (
  <div className="relative w-full h-[100svh] overflow-hidden bg-[#050505]">
    <div className="absolute inset-0 bg-neutral-900/50 animate-pulse" />
    <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent z-10" />
    <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/90 via-[#050505]/30 to-transparent z-10" />
    <div className="relative z-30 h-full flex flex-col justify-end pb-12 px-6 md:px-12 lg:px-16 max-w-[2400px] mx-auto pointer-events-none">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
        <div className="md:col-span-8 lg:col-span-7 space-y-6 md:space-y-8 mb-6">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-20 h-7 bg-white/10 rounded-md animate-pulse" />
              <div className="w-16 h-7 bg-white/10 rounded-md animate-pulse" />
              <div className="w-14 h-7 bg-white/10 rounded-md animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="w-4/5 h-12 md:h-16 lg:h-20 bg-white/10 rounded-2xl animate-pulse" />
              <div className="w-2/5 h-12 md:h-16 lg:h-20 bg-white/10 rounded-2xl animate-pulse" />
            </div>
            <div className="space-y-2.5 pt-2">
              <div className="w-full max-w-2xl h-4 bg-white/5 rounded-full animate-pulse" />
              <div className="w-11/12 max-w-2xl h-4 bg-white/5 rounded-full animate-pulse" />
            </div>
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <div className="w-40 h-12 md:h-[52px] bg-white/20 rounded-xl animate-pulse" />
              <div className="w-36 h-12 md:h-[52px] bg-white/10 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
        <div className="hidden md:flex md:col-span-4 lg:col-span-5 flex-col items-end justify-end space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-[100px] h-14 bg-white/5 border border-white/5 rounded-2xl animate-pulse" />
            <div className="w-[160px] h-14 bg-white/5 border border-white/5 rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SpotlightCarousel = () => {
  const [spotlights, setSpotlights] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [trailers, setTrailers] = useState({});
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // YouTube Staggering States
  const [mountTrailer, setMountTrailer] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);

  const autoplayRef = useRef(null);
  const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

  // 1. Initial Setup
  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 2. Sequential Data Fetching
  useEffect(() => {
    const fetchSpotlights = async () => {
      if (!API_KEY) return;
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/trending/all/week?api_key=${API_KEY}`,
        );
        const data = await response.json();
        const results = data.results?.slice(0, 10) || [];

        setSpotlights(results);
        setIsLoading(false); // UI Unlocks immediately

        // STAGGERED TRAILER FETCHING (Queueing)
        // Fetch 1 trailer every 2 seconds to keep the network pipe clean
        results.reduce(async (promise, item, index) => {
          await promise;
          return new Promise((resolve) => {
            setTimeout(
              async () => {
                await fetchTrailer(item.id, item.media_type);
                resolve();
              },
              index === 0 ? 0 : 2000,
            );
          });
        }, Promise.resolve());
      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    };
    fetchSpotlights();
  }, [API_KEY]);

  const fetchTrailer = async (id, mediaType) => {
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/${mediaType}/${id}/videos?api_key=${API_KEY}`,
      );
      const data = await res.json();
      const trailer = data.results?.find(
        (v) => v.type === "Trailer" && v.site === "YouTube",
      );
      if (trailer) setTrailers((prev) => ({ ...prev, [id]: trailer.key }));
    } catch (e) {}
  };

  // 3. YouTube Lazy Mounting Logic (Main-Thread Optimization)
  useEffect(() => {
    setMountTrailer(false);
    setShowTrailer(false);
    if (!isMobile && !isPaused) {
      // Delay mounting iframe by 2s so Framer Motion transitions finish first
      const mountTimer = setTimeout(() => setMountTrailer(true), 2000);
      // Fade in the video after 5s total
      const showTimer = setTimeout(() => setShowTrailer(true), 5000);
      return () => {
        clearTimeout(mountTimer);
        clearTimeout(showTimer);
      };
    }
  }, [currentSlide, isMobile, isPaused]);

  // 4. Autoplay Logic
  const handleNextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % spotlights.length);
  }, [spotlights.length]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? spotlights.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (!isLoading && spotlights.length > 0 && !isPaused) {
      autoplayRef.current = setInterval(handleNextSlide, 15000);
    }
    return () => clearInterval(autoplayRef.current);
  }, [isLoading, spotlights.length, isPaused, handleNextSlide]);

  if (!isMounted || isLoading) return <SpotlightSkeleton />;
  if (!spotlights.length) return null;

  const currentItem = spotlights[currentSlide];
  const nextItem = spotlights[(currentSlide + 1) % spotlights.length];
  const title = currentItem.title || currentItem.name || "Untitled";
  const releaseYear = (
    currentItem.release_date ||
    currentItem.first_air_date ||
    ""
  ).substring(0, 4);
  const trailerKey = trailers[currentItem.id];
  const rating = currentItem.vote_average?.toFixed(1) || "N/A";
  const isTV = currentItem.media_type === "tv";
  const href = isTV ? `/series/${currentItem.id}` : `/movie/${currentItem.id}`;

  return (
    <div className="relative w-full h-[100svh] overflow-hidden bg-[#050505] text-white selection:bg-white/30">
      {/* --- PREFETCH LAYER (Hidden) --- */}
      <div className="hidden" aria-hidden="true">
        {nextItem && (
          <Image
            key={`prefetch-${nextItem.id}`}
            src={`https://image.tmdb.org/t/p/w1280${nextItem.backdrop_path}`}
            alt="prefetch"
            width={1280}
            height={720}
            loading="lazy"
          />
        )}
      </div>

      {/* --- BACKGROUND LAYER --- */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 z-0 bg-[#050505]"
        >
          <Image
            src={`https://image.tmdb.org/t/p/w1280${currentItem.backdrop_path}`}
            alt={title}
            fill
            sizes="100vw"
            quality={75}
            priority={currentSlide === 0} // Only the first slide is high priority
            className={`object-cover transition-opacity duration-1000 ${showTrailer ? "opacity-0" : "opacity-60"}`}
          />

          {/* Overlays */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/90 via-[#050505]/20 to-transparent z-10" />

          {/* YouTube Iframe (Lazy-Mounted) */}
          {trailerKey && mountTrailer && !isMobile && (
            <div
              className={`absolute inset-0 transition-opacity duration-1000 ${showTrailer ? "opacity-100" : "opacity-0"}`}
            >
              <iframe
                className="absolute w-full h-[140%] -top-[20%] pointer-events-none scale-110"
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&modestbranding=1&loop=1&playlist=${trailerKey}&vq=hd1080&rel=0&playsinline=1`}
                allow="autoplay; encrypted-media"
                title="Trailer"
                loading="lazy"
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* --- CONTENT LAYER --- */}
      <div className="relative z-30 h-full flex flex-col justify-end pb-12 px-6 md:px-12 lg:px-16 max-w-[2400px] mx-auto pointer-events-none">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end pointer-events-auto">
          <div className="md:col-span-8 lg:col-span-7 space-y-6 md:space-y-8 mb-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <div
                    className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border flex items-center gap-2 ${isTV ? "bg-violet-500/10 text-violet-300 border-violet-500/20" : "bg-teal-500/10 text-teal-300 border-teal-500/20"}`}
                  >
                    {isTV ? <Tv size={14} /> : <Film size={14} />}
                    {isTV ? "Series" : "Movie"}
                  </div>
                  <div className="px-3 py-1.5 rounded-md text-xs font-medium uppercase tracking-wider bg-white/5 border border-white/10 text-neutral-300 flex items-center gap-2">
                    <Calendar size={14} />
                    {releaseYear}
                  </div>
                  {rating !== "N/A" && (
                    <div className="px-3 py-1.5 rounded-md text-xs font-bold bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 flex items-center gap-1.5">
                      <Star size={14} className="fill-yellow-400" />
                      <span>{rating}</span>
                    </div>
                  )}
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[0.95] text-white drop-shadow-2xl">
                  {title}
                </h1>
                <p className="text-neutral-300 text-sm md:text-base lg:text-lg max-w-2xl leading-relaxed line-clamp-3">
                  {currentItem.overview}
                </p>

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

          <div className="md:col-span-4 lg:col-span-5 flex flex-col items-end justify-end space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl px-5 h-14 flex flex-col justify-center min-w-[100px] relative overflow-hidden group">
                <span className="font-mono text-sm font-medium tracking-widest text-neutral-400 relative z-10">
                  <span className="text-white text-lg">
                    {String(currentSlide + 1).padStart(2, "0")}
                  </span>
                  <span className="opacity-50 mx-1">/</span>
                  {String(spotlights.length).padStart(2, "0")}
                </span>
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
                    key={currentSlide}
                  />
                </div>
              </div>

              <div className="h-14 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center p-1 gap-1">
                <button
                  onClick={handlePrevSlide}
                  className="w-12 h-full flex items-center justify-center rounded-xl hover:bg-white/10 transition-all text-white/70 hover:text-white"
                >
                  <ArrowRight size={20} className="rotate-180" />
                </button>
                <div className="w-[1px] h-6 bg-white/10" />
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="w-12 h-full flex items-center justify-center rounded-xl hover:bg-white/10 transition-all text-white"
                >
                  {isPaused ? <Play size={20} /> : <Pause size={20} />}
                </button>
                <div className="w-[1px] h-6 bg-white/10" />
                <button
                  onClick={handleNextSlide}
                  className="w-12 h-full flex items-center justify-center rounded-xl hover:bg-white/10 transition-all text-white/70 hover:text-white"
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>

            {trailerKey && !isMobile && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setIsMuted(!isMuted)}
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
