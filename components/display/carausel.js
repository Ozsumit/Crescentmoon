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
  const videoRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const fetchSpotlights = async () => {
      const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
      const URL = `https://api.themoviedb.org/3/trending/all/week?api_key=${API_KEY}`;

      try {
        const response = await fetch(URL);
        const data = await response.json();
        const results = data.results.slice(0, 6) || [];
        setSpotlights(results);

        results.forEach((item) => {
          fetchTrailer(item.id, item.media_type);
        });
      } catch (error) {
        console.error("Error fetching spotlight data:", error);
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

  const handleNextSlide = () => {
    setShowTrailer(false);
    setCurrentSlide((prev) => (prev + 1) % spotlights.length);

    // Show trailer after 10 seconds for the new slide
    setTimeout(() => {
      setShowTrailer(true);
    }, 10000);
  };

  useEffect(() => {
    // Show trailer after 10 seconds for initial slide
    const timer = setTimeout(() => {
      setShowTrailer(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Listen for video end
    const handleMessage = (event) => {
      if (event.data && typeof event.data === "string") {
        try {
          const data = JSON.parse(event.data);
          if (data.event === "onStateChange" && data.info === 0 && !isPaused) {
            handleNextSlide();
          }
        } catch (e) {
          // Handle parsing error
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isPaused]);

  const togglePause = () => {
    setIsPaused(!isPaused);
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

  if (!isMounted || spotlights.length === 0) return null;

  const currentItem = spotlights[currentSlide];
  const title = currentItem.title || currentItem.name;
  const releaseDate = currentItem.release_date || currentItem.first_air_date;
  const description = currentItem.overview || "No description available.";
  const posterPath = currentItem.backdrop_path
    ? `https://image.tmdb.org/t/p/original/${currentItem.backdrop_path}`
    : "https://i.imgur.com/xDHFGVl.jpeg";
  const trailerKey = trailers[currentItem.id];

  const isTV = currentItem.media_type === "tv";
  const href = isTV ? "/series/[id]" : "/movie/[id]";
  const as = isTV ? `/series/${currentItem.id}` : `/movie/${currentItem.id}`;

  return (
    <div className="relative w-full h-screen overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10 pointer-events-none"></div>

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
            className={`absolute inset-0 w-full h-full object-cover brightness-[0.6] transition-opacity duration-1000 ${
              showTrailer ? "opacity-0" : "opacity-100"
            }`}
          />

          {trailerKey && (
            <div
              className={`relative w-full h-full transition-opacity duration-1000 ${
                showTrailer ? "opacity-100" : "opacity-0"
              }`}
            >
              <iframe
                ref={videoRef}
                className="absolute w-full h-full scale-150"
                src={`https://www.youtube.com/embed/${trailerKey}?enablejsapi=1&vq=hd1440&autoplay=1&mute=1&controls=0`}
                // src={`https://www.youtube.com/embed/${trailerKey}?enablejsapi=1&autoplay=1&mute=1&controls=0&modestbranding=1&loop=0&playlist=${trailerKey}&hd=1&playsinline=1?vq=hd720`}
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

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

        {trailerKey && (
          <button
            onClick={toggleMute}
            className="bg-white/20 text-white p-2 rounded-full hover:bg-white/30 transition-all"
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        )}

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
