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
  const [logos, setLogos] = useState({});
  const [isMounted, setIsMounted] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const videoRef = useRef(null);
  const autoplayRef = useRef(null);

  // --- SKELETON LOADER ---
  const SpotlightSkeleton = () => (
    <div className="relative w-full h-[100svh] bg-black overflow-hidden flex flex-col justify-end p-6 md:p-12">
      <div className="w-full max-w-2xl space-y-4 mb-8">
        <div className="w-24 h-6 bg-white/10 rounded-md animate-pulse" />
        <div className="w-3/4 h-12 md:h-16 bg-white/10 rounded-2xl animate-pulse" />
        <div className="w-full h-12 bg-white/10 rounded-2xl animate-pulse" />
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

  const fetchMediaDetails = async (id, mediaType) => {
    const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    if (!API_KEY) return;

    const videoURL = `https://api.themoviedb.org/3/${mediaType}/${id}/videos?api_key=${API_KEY}`;
    const imagesURL = `https://api.themoviedb.org/3/${mediaType}/${id}/images?api_key=${API_KEY}`;

    try {
      const [videoRes, imagesRes] = await Promise.all([
        fetch(videoURL).then((res) => res.json()),
        fetch(imagesURL).then((res) => res.json()),
      ]);

      const trailer = videoRes.results?.find(
        (video) => video.type === "Trailer" && video.site === "YouTube",
      );
      if (trailer) {
        setTrailers((prev) => ({ ...prev, [id]: trailer.key }));
      }

      const logo =
        imagesRes.logos?.find((img) => img.iso_639_1 === "en") ||
        imagesRes.logos?.[0];
      if (logo) {
        setLogos((prev) => ({ ...prev, [id]: logo.file_path }));
      }
    } catch (error) {
      console.error("Error fetching media details:", error);
    }
  };

  const startAutoplay = () => {
    stopAutoplay();
    if (!isPaused) {
      autoplayRef.current = setInterval(handleNextSlide, 10000);
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
      if (!trailers[currentItem.id] || !logos[currentItem.id]) {
        fetchMediaDetails(currentItem.id, currentItem.media_type);
      }
      const nextSlide = (currentSlide + 1) % spotlights.length;
      const nextItem = spotlights[nextSlide];
      if (!trailers[nextItem.id] || !logos[nextItem.id]) {
        fetchMediaDetails(nextItem.id, nextItem.media_type);
      }
    }
  }, [currentSlide, spotlights]);

  const handleNextSlide = () => {
    setShowTrailer(false);
    setCurrentSlide((prev) => (prev + 1) % spotlights.length);
    if (!isMobile) {
      setTimeout(() => setShowTrailer(true), 4000);
    }
  };

  const handlePrevSlide = () => {
    setShowTrailer(false);
    setCurrentSlide((prev) => (prev === 0 ? spotlights.length - 1 : prev - 1));
  };

  const handleDragEnd = (_, info) => {
    if (info.offset.x < -40) handleNextSlide();
    else if (info.offset.x > 40) handlePrevSlide();
  };

  const togglePause = () => {
    setIsPaused((prev) => !prev);
  };

  const toggleMute = () => {
    setIsMuted((prev) => !prev);
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

  // Mobile uses TMDB poster art; Desktop uses backdrop art
  const posterImage = currentItem.poster_path
    ? `https://image.tmdb.org/t/p/w780${currentItem.poster_path}`
    : `https://image.tmdb.org/t/p/original/${currentItem.backdrop_path}`;

  const backdropImage = currentItem.backdrop_path
    ? `https://image.tmdb.org/t/p/original/${currentItem.backdrop_path}`
    : posterImage;

  const trailerKey = trailers[currentItem.id];
  const logoPath = logos[currentItem.id]
    ? `https://image.tmdb.org/t/p/w500${logos[currentItem.id]}`
    : null;
  const rating = currentItem.vote_average?.toFixed(1) || "N/A";
  const isTV = currentItem.media_type === "tv";
  const href = isTV ? `/series/${currentItem.id}` : `/movie/${currentItem.id}`;

  return (
    <div className="relative w-full h-[100svh] overflow-hidden bg-black text-white font-sans selection:bg-primary/30 select-none">
      {/* ========================================== */}
      {/* BACKGROUND LAYER (DESKTOP & MOBILE)        */}
      {/* ========================================== */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
          drag={isMobile ? "x" : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          className="absolute inset-0 z-0 touch-pan-y"
        >
          {/* Mobile Image (Poster Path) */}
          <div className="block md:hidden relative w-full h-full">
            <Image
              src={posterImage}
              alt={title}
              fill
              className="object-cover object-center"
              priority
            />
            {/* Smooth gradient from dark top to pure black bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black" />
          </div>

          {/* Desktop Image (Backdrop Path) */}
          <div className="hidden md:block relative w-full h-full">
            {backdropImage && (
              <Image
                src={backdropImage}
                alt={title}
                fill
                className={`object-cover transition-opacity duration-1000 ${
                  showTrailer ? "opacity-0" : "opacity-100"
                }`}
                priority
              />
            )}

            {/* Desktop Overlay Gradients */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
            <div className="absolute inset-x-0 bottom-0 h-3/4 z-10 pointer-events-none bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-y-0 left-0 w-full lg:w-2/3 z-10 pointer-events-none bg-gradient-to-r from-black via-black/30 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-32 z-10 pointer-events-none bg-gradient-to-b from-black/60 to-transparent" />

            {/* Cinematic Desktop Video Trailer */}
            {trailerKey && (
              <div
                className={`absolute inset-0 z-0 transition-opacity duration-1000 ${
                  showTrailer ? "opacity-100" : "opacity-0"
                }`}
              >
                <iframe
                  className="absolute w-full h-[140%] -top-[20%] pointer-events-none scale-110"
                  src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${
                    isMuted ? 1 : 0
                  }&controls=0&modestbranding=1&loop=1&playlist=${trailerKey}&vq=hd1080&rel=0&playsinline=1`}
                  allow="autoplay; encrypted-media"
                  title="Trailer"
                />
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* ========================================== */}
      {/* 1. MOBILE LAYOUT (Clean, Native Mobile UI) */}
      {/* ========================================== */}
      <div className="flex md:hidden relative z-30 h-full flex-col justify-end pb-8 px-5 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-auto space-y-4 text-center flex flex-col items-center"
          >
            {/* Title Logo or Typography */}
            <div className="min-h-[50px] flex items-center justify-center">
              {logoPath ? (
                <div className="relative w-52 h-14">
                  <Image
                    src={logoPath}
                    alt={title}
                    fill
                    priority
                    className="object-contain object-center filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]"
                  />
                </div>
              ) : (
                <h1 className="text-3xl font-black tracking-tight leading-tight text-white drop-shadow-md">
                  {title}
                </h1>
              )}
            </div>

            {/* Clean Metadata Line (Dot separated) */}
            <div className="flex items-center justify-center gap-2 text-xs font-semibold text-white/80">
              <span className="text-primary font-bold">
                {isTV ? "Series" : "Movie"}
              </span>
              <span>•</span>
              <span>{releaseYear}</span>
              {rating !== "N/A" && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-yellow-400">
                    <Star size={12} className="fill-yellow-400 stroke-none" />
                    {rating}
                  </span>
                </>
              )}
            </div>

            {/* Mobile Action Row */}
            <div className="flex items-center gap-3 w-full max-w-xs pt-1">
              <Link href={href} className="flex-1">
                <button className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground py-3.5 rounded-xl font-bold text-sm transition-transform active:scale-95 shadow-lg shadow-primary/20">
                  <Play size={18} className="fill-current" />
                  <span>Play</span>
                </button>
              </Link>

              {/* <Link href={href}>
                <button className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/20 border border-white/20 text-white px-4 py-3.5 rounded-xl font-semibold text-sm backdrop-blur-md transition-transform active:scale-95">
                  <Info size={18} />
                  <span>Info</span>
                </button>
              </Link> */}
            </div>

            {/* Dot Indicators */}
            <div className="flex items-center justify-center gap-1.5 pt-2">
              {spotlights.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentSlide
                      ? "w-6 bg-primary"
                      : "w-1.5 bg-white/30"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ========================================== */}
      {/* 2. DESKTOP LAYOUT (Rich Dashboard UI)     */}
      {/* ========================================== */}
      <div className="hidden md:flex relative z-30 h-full flex-col justify-end pb-12 px-12 lg:px-16 max-w-[2400px] mx-auto pointer-events-none">
        <div className="grid grid-cols-12 gap-8 items-end w-full">
          {/* Left Metadata & Info */}
          <div className="col-span-8 lg:col-span-7 space-y-6 mb-6 pointer-events-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="space-y-6"
              >
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-3">
                  <div
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border flex items-center gap-2 backdrop-blur-md ${
                      isTV
                        ? "bg-primary/20 text-primary border-primary/30"
                        : "bg-white/10 text-white border-white/20"
                    }`}
                  >
                    {isTV ? <Tv size={14} /> : <Film size={14} />}
                    {isTV ? "Series" : "Movie"}
                  </div>

                  <div className="px-3 py-1.5 rounded-lg text-xs font-medium uppercase tracking-wider bg-black/40 border border-white/10 text-white backdrop-blur-md flex items-center gap-2">
                    <Calendar size={14} />
                    {releaseYear}
                  </div>

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

                {/* Logo / Title */}
                <div className="min-h-[100px] flex items-end">
                  {logoPath ? (
                    <div className="relative w-full max-w-[420px] h-[120px]">
                      <Image
                        src={logoPath}
                        alt={title}
                        fill
                        priority
                        className="object-contain object-left filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                      />
                    </div>
                  ) : (
                    <h1 className="text-6xl lg:text-7xl font-black tracking-tight leading-none text-white drop-shadow-sm">
                      {title}
                    </h1>
                  )}
                </div>

                {/* Paragraph */}
                <p className="text-white/80 text-base lg:text-lg max-w-2xl leading-relaxed line-clamp-3 font-normal">
                  {description}
                </p>

                {/* Desktop Buttons */}
                <div className="flex items-center gap-4 pt-2">
                  <Link href={href}>
                    <button className="group flex items-center gap-3 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-bold tracking-tight hover:scale-105 hover:bg-primary/90 transition-all duration-300 shadow-xl shadow-primary/25">
                      <Play
                        size={20}
                        className="fill-primary-foreground group-hover:scale-110 transition-transform"
                      />
                      <span>Play Now</span>
                    </button>
                  </Link>

                  <Link href={href}>
                    <button className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-xl transition-all font-medium flex items-center gap-2 shadow-lg shadow-black/5">
                      <Info size={20} />
                      <span>More Info</span>
                    </button>
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Control Dashboard */}
          <div className="col-span-4 lg:col-span-5 flex flex-col items-end justify-end space-y-4 pointer-events-auto">
            <div className="flex items-center gap-3">
              {/* Slide Counter Box */}
              <div className="bg-black/40 border border-white/10 backdrop-blur-xl rounded-2xl px-5 h-14 flex flex-col justify-center min-w-[100px] relative overflow-hidden group shadow-lg">
                <span className="font-mono text-sm font-medium tracking-widest text-white/50 relative z-10">
                  <span className="text-white text-lg">
                    {String(currentSlide + 1).padStart(2, "0")}
                  </span>
                  <span className="opacity-50 mx-1">/</span>
                  {String(spotlights.length).padStart(2, "0")}
                </span>

                <div className="absolute bottom-0 left-0 h-[3px] bg-white/10 w-full">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{
                      duration: 10,
                      ease: "linear",
                      repeat: isPaused ? Infinity : 0,
                    }}
                    key={currentSlide}
                  />
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="h-14 bg-black/40 border border-white/10 backdrop-blur-xl rounded-2xl flex items-center p-1 gap-1 shadow-lg">
                <button
                  onClick={handlePrevSlide}
                  className="w-12 h-full flex items-center justify-center rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-all"
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
                  className="w-12 h-full flex items-center justify-center rounded-xl hover:bg-white/10 text-white/60 hover:text-white transition-all"
                >
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>

            {/* Mute Button */}
            {trailerKey && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={toggleMute}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 border border-white/10 text-white hover:bg-black/60 backdrop-blur-xl transition-all shadow-lg"
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
