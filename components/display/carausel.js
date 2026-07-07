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
    <div className="relative w-full h-[100svh] bg-background overflow-hidden">
      <div className="absolute inset-0 bg-muted/50 animate-pulse" />
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12 z-20">
        <div className="flex flex-col md:flex-row items-end gap-8 mb-8 md:mb-0">
          <div className="flex-1 space-y-6 w-full max-w-4xl">
            <div className="space-y-4">
              <div className="w-3/4 h-12 md:h-20 bg-foreground/10 rounded-2xl animate-pulse" />
              <div className="w-1/2 h-12 md:h-20 bg-foreground/10 rounded-2xl animate-pulse" />
            </div>
            <div className="flex gap-4">
              <div className="w-32 h-12 bg-foreground/10 rounded-xl animate-pulse" />
              <div className="w-32 h-12 bg-foreground/10 rounded-xl animate-pulse" />
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
        (video) => video.type === "Trailer" && video.site === "YouTube",
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

  useEffect(() => {
    if (spotlights.length > 0) {
      const currentItem = spotlights[currentSlide];
      if (!trailers[currentItem.id]) {
        fetchTrailer(currentItem.id, currentItem.media_type);
      }
      const nextSlide = (currentSlide + 1) % spotlights.length;
      const nextItem = spotlights[nextSlide];
      if (!trailers[nextItem.id]) {
        fetchTrailer(nextItem.id, nextItem.media_type);
      }
    }
  }, [currentSlide, spotlights, trailers]);

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
    return (
      <div className="bg-background text-foreground p-10 flex h-[100svh] items-center justify-center">
        No content available
      </div>
    );

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
    <div className="relative w-full h-[100svh] overflow-hidden bg-background text-foreground font-sans selection:bg-primary/30">
      {/* --- BACKGROUND LAYER --- */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
          className="absolute inset-0 z-0 bg-background"
        >
          {posterPath && (
            <Image
              src={posterPath}
              alt={title}
              fill
              className={`object-cover transition-opacity duration-1000 ${
                showTrailer ? "opacity-0" : "opacity-100 dark:opacity-80"
              }`}
              priority
            />
          )}

          {/* Subtle noise texture */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

          {/* DYNAMIC LIGHT & DARK GRADIENT OVERLAYS
            Using explicit semi-transparent black in light mode to force high-contrast white text legibility 
            on colorful/bright backdrops, and native theme color transitions for dark mode.
          */}

          {/* Mobile Overlay */}
          <div
            className="
              absolute inset-0 z-10 pointer-events-none
              bg-gradient-to-t
              from-black/80 via-black/40 to-transparent
              dark:from-background dark:via-background/70 dark:to-transparent
              md:hidden
            "
          />

          {/* Desktop Bottom Overlay */}
          <div
            className="
              hidden md:block
              absolute inset-x-0 bottom-0 h-3/4
              z-10 pointer-events-none
              bg-gradient-to-t
              from-black/85 via-black/30 to-transparent
              dark:from-background dark:via-background/80 dark:to-transparent
            "
          />

          {/* Desktop Left Overlay */}
          <div
            className="
              hidden md:block
              absolute inset-y-0 left-0 w-full lg:w-2/3
              z-10 pointer-events-none
              bg-gradient-to-r
              from-black/70 via-black/20 to-transparent
              dark:from-background dark:via-background/70 dark:to-transparent
            "
          />

          {/* Top Overlay */}
          <div
            className="
              absolute inset-x-0 top-0 h-32
              z-10 pointer-events-none
              bg-gradient-to-b
              from-black/40 to-transparent
              dark:from-background/60 dark:to-transparent
            "
          />

          {/* Cinematic Vignette */}
          <div
            className="
              absolute inset-0
              pointer-events-none
              z-10
              bg-[radial-gradient(circle_at_18%_70%,transparent_0%,transparent_40%,rgba(0,0,0,.4)_100%)]
              dark:bg-[radial-gradient(circle_at_18%_70%,transparent_0%,transparent_30%,rgba(0,0,0,.6)_100%)]
            "
          />

          {trailerKey && !isMobile && (
            <div
              className={`absolute inset-0 z-0 transition-opacity duration-1000 ${
                showTrailer ? "opacity-100" : "opacity-0"
              }`}
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
      {/* Text color targets uniform high contrast white-spectrum on light mode (due to dark scrim) 
        and theme standard adaptive tokens on native dark mode configurations.
      */}
      <div className="relative z-30 h-full flex flex-col justify-end pb-12 px-6 md:px-12 lg:px-16 max-w-[2400px] mx-auto pointer-events-none">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end w-full">
          {/* --- LEFT: METADATA & TITLE --- */}
          <div className="md:col-span-8 lg:col-span-7 space-y-6 md:space-y-8 mb-6 pointer-events-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="space-y-6"
              >
                <div className="flex flex-wrap items-center gap-3">
                  {/* Media Type Badge */}
                  <div
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border flex items-center gap-2 backdrop-blur-md
                    ${
                      isTV
                        ? "bg-primary/20 text-primary border-primary/30 dark:bg-primary/10 dark:text-primary dark:border-primary/20"
                        : "bg-white/10 text-white border-white/20 dark:bg-secondary/20 dark:text-secondary-foreground dark:border-secondary/30"
                    }`}
                  >
                    {isTV ? <Tv size={14} /> : <Film size={14} />}
                    {isTV ? "Series" : "Movie"}
                  </div>

                  {/* Calendar Badge */}
                  <div className="px-3 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider bg-black/30 border border-white/10 text-white dark:bg-foreground/5 dark:border-border dark:text-foreground backdrop-blur-md flex items-center gap-2">
                    <Calendar size={14} />
                    {releaseYear}
                  </div>

                  {/* Rating Badge */}
                  {rating !== "N/A" && (
                    <div className="px-3 py-1.5 rounded-lg text-xs font-bold bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 backdrop-blur-md flex items-center gap-1.5">
                      <Star
                        size={14}
                        className="fill-yellow-400 stroke-yellow-400"
                      />
                      <span>{rating}</span>
                    </div>
                  )}
                </div>

                {/* Title: Ensured crystal clear readability */}
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] md:leading-[0.95] text-white dark:text-foreground drop-shadow-sm">
                  {title}
                </h1>

                {/* Description: High readability opacity adjustments */}
                <p className="text-white/85 dark:text-muted-foreground text-sm md:text-base lg:text-lg max-w-2xl leading-relaxed line-clamp-3 font-medium dark:font-normal">
                  {description}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-4">
                  <Link href={href}>
                    <button className="group flex items-center gap-3 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-bold tracking-tight hover:scale-105 hover:bg-primary/90 transition-all duration-300 shadow-xl shadow-primary/25">
                      <Play
                        size={20}
                        className="fill-primary-foreground group-hover:scale-110 transition-transform"
                      />
                      <span>Play Now</span>
                    </button>
                  </Link>

                  <button className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 dark:bg-card/40 dark:hover:bg-card/60 dark:border-border dark:text-foreground backdrop-blur-xl transition-all font-medium flex items-center gap-2 shadow-lg shadow-black/5">
                    <Info size={20} />
                    <span>More Info</span>
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* --- RIGHT: CONTROL DASHBOARD --- */}
          <div className="md:col-span-4 lg:col-span-5 flex flex-col items-end justify-end space-y-4 pointer-events-auto">
            <div className="flex items-center gap-3">
              {/* Pagination Card */}
              <div className="bg-black/40 border border-white/10 dark:bg-card/40 dark:border-border backdrop-blur-xl rounded-2xl px-5 h-14 flex flex-col justify-center min-w-[100px] relative overflow-hidden group shadow-lg shadow-black/5">
                <span className="font-mono text-sm font-medium tracking-widest text-white/50 dark:text-muted-foreground relative z-10">
                  <span className="text-white dark:text-foreground text-lg">
                    {String(currentSlide + 1).padStart(2, "0")}
                  </span>
                  <span className="opacity-50 mx-1">/</span>
                  {String(spotlights.length).padStart(2, "0")}
                </span>

                <div className="absolute bottom-0 left-0 h-[3px] bg-white/10 dark:bg-foreground/10 w-full">
                  <motion.div
                    className="h-full bg-primary"
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

              {/* Slider Action Buttons */}
              <div className="h-14 bg-black/40 border border-white/10 dark:bg-card/40 dark:border-border backdrop-blur-xl rounded-2xl flex items-center p-1 gap-1 shadow-lg shadow-black/5">
                <button
                  onClick={handlePrevSlide}
                  className="w-12 h-full flex items-center justify-center rounded-xl hover:bg-white/10 text-white/60 hover:text-white dark:hover:bg-foreground/10 dark:text-muted-foreground dark:hover:text-foreground transition-all"
                >
                  <ArrowRight size={20} className="rotate-180" />
                </button>

                <div className="w-[1px] h-6 bg-white/10 dark:bg-border" />

                <button
                  onClick={togglePause}
                  className="w-12 h-full flex items-center justify-center rounded-xl hover:bg-white/10 text-white dark:hover:bg-foreground/10 dark:text-foreground transition-all"
                >
                  {isPaused ? <Play size={20} /> : <Pause size={20} />}
                </button>

                <div className="w-[1px] h-6 bg-white/10 dark:bg-border" />

                <button
                  onClick={handleNextSlide}
                  className="w-12 h-full flex items-center justify-center rounded-xl hover:bg-white/10 text-white/60 hover:text-white dark:hover:bg-foreground/10 dark:text-muted-foreground dark:hover:text-foreground transition-all"
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>

            {/* Mute/Unmute Layer */}
            {trailerKey && !isMobile && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={toggleMute}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 border border-white/10 dark:bg-card/40 dark:border-border text-white dark:text-foreground hover:bg-black/60 dark:hover:bg-card/60 backdrop-blur-xl transition-all shadow-lg shadow-black/5"
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
