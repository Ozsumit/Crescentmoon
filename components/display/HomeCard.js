"use client";
import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Heart, Star, Play, Plus, X, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

const getImageUrl = (path, size = "w1280") => {
  if (!path) return "https://i.imgur.com/HIYYPtZ.png";
  return `https://image.tmdb.org/t/p/${size}/${path}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).getFullYear();
};

// --- DYNAMIC IMPORTS ---
// Lazy load the modal so it doesn't block the initial page render
const MovieModal = dynamic(() => Promise.resolve(MovieModalComponent), {
  ssr: false,
});

// --- MORE LIKE THIS CARD ---
const MoreLikeThisCard = memo(({ item, index, isActive, onHover }) => {
  const [trailerKey, setTrailerKey] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [playVideo, setPlayVideo] = useState(false);

  // Track fetching to prevent loops
  const hasFetchedTrailer = useRef(false);

  const type = item.media_type || (item.first_air_date ? "tv" : "movie");
  const posterUrl = getImageUrl(item.backdrop_path || item.poster_path, "w500");

  // OPTIMIZED FETCH: Only run once per card when hovered. Added AbortController.
  useEffect(() => {
    if (!isActive || !API_KEY || hasFetchedTrailer.current) return;
    hasFetchedTrailer.current = true;
    const controller = new AbortController();

    const fetchTrailer = async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/${type}/${item.id}/videos?api_key=${API_KEY}`,
          { signal: controller.signal },
        );
        const data = await res.json();
        const trailer = data.results?.find(
          (vid) =>
            vid.site === "YouTube" &&
            (vid.type === "Trailer" || vid.type === "Teaser"),
        );
        if (trailer) setTrailerKey(trailer.key);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error fetching trailer", err);
        }
      }
    };
    fetchTrailer();

    return () => controller.abort();
  }, [isActive, item.id, type]);

  // OPTIMIZED TIMER: Handled via setTimeout, progress visual handled by Framer Motion
  useEffect(() => {
    let delayTimer;
    if (isActive) {
      delayTimer = setTimeout(() => {
        setPlayVideo(true);
      }, 3000);
    } else {
      setPlayVideo(false);
    }
    return () => clearTimeout(delayTimer);
  }, [isActive]);

  return (
    <div
      onMouseEnter={() => onHover(index)}
      onClick={() => setIsMuted(!isMuted)}
      className={`relative aspect-[16/9] sm:aspect-[2/3] rounded-[1.5rem] overflow-hidden bg-[#0a0a0a] cursor-pointer transition-all duration-500 ease-out transform-gpu border ${
        isActive
          ? "border-white/30 scale-105 z-10 shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
          : "scale-100 z-0 border-white/5"
      }`}
    >
      {playVideo && trailerKey ? (
        <div className="absolute inset-0 w-full h-full bg-black">
          <motion.iframe
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ duration: 0.8 }}
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${
              isMuted ? 1 : 0
            }&controls=0&modestbranding=1&loop=1&playlist=${trailerKey}&playsinline=1`}
            className="w-[150%] h-[150%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-screen"
            allow="autoplay; encrypted-media"
            title="Trailer"
          />
          <div className="absolute top-3 right-3 bg-black/40 p-2 rounded-full backdrop-blur-md z-20 border border-white/10">
            {isMuted ? (
              <VolumeX size={14} className="text-white" />
            ) : (
              <Volume2 size={14} className="text-white" />
            )}
          </div>
        </div>
      ) : (
        <Image
          src={posterUrl}
          alt={item.title || item.name}
          fill
          loading="lazy"
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 opacity-80 group-hover:opacity-100"
        />
      )}

      {/* Glassmorphic overlay for text */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300 ${
          isActive ? "opacity-100" : "opacity-0 sm:opacity-100"
        }`}
      >
        <div className="absolute bottom-0 p-4 w-full">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                type === "tv"
                  ? "bg-[#d0bcff] text-[#381e72]"
                  : "bg-[#bceeff] text-[#001f2a]"
              }`}
            >
              {type === "tv" ? "Series" : "Movie"}
            </span>
            {item.vote_average > 0 && (
              <div className="flex items-center gap-1 text-[10px] font-bold text-[#ffdcc2]">
                <Star size={10} className="fill-[#ffdcc2]" />
                <span>{item.vote_average?.toFixed(1)}</span>
              </div>
            )}
          </div>
          <p className="text-white text-sm font-bold line-clamp-1 tracking-tight leading-tight mb-0.5">
            {item.title || item.name}
          </p>
          <p className="text-white/50 text-[10px] font-medium uppercase tracking-wider">
            {formatDate(item.release_date || item.first_air_date)}
          </p>
        </div>
      </div>

      {/* Hover Progress Bar */}
      {isActive && !playVideo && trailerKey && (
        <div className="absolute bottom-0 left-0 h-[3px] bg-white/10 w-full z-20 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 3, ease: "linear" }}
            className="h-full bg-white"
          />
        </div>
      )}
    </div>
  );
});
MoreLikeThisCard.displayName = "MoreLikeThisCard";

// --- MORE LIKE THIS GRID ---
const MoreLikeThisGrid = memo(({ items }) => {
  const [activeIndex, setActiveIndex] = useState(null);

  const handleHover = useCallback((idx) => setActiveIndex(idx), []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (items.length === 0) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev === null ? 0 : (prev + 1) % items.length,
        );
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActiveIndex((prev) =>
          prev === null ? 0 : (prev - 1 + items.length) % items.length,
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [items.length]);

  if (items.length === 0)
    return (
      <div className="text-white/50 font-medium">No similar titles found.</div>
    );

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6"
      onMouseLeave={() => setActiveIndex(null)}
    >
      {items.map((item, index) => (
        <MoreLikeThisCard
          key={`${item.id}-${index}`}
          item={item}
          index={index}
          isActive={activeIndex === index}
          onHover={handleHover}
        />
      ))}
    </div>
  );
});
MoreLikeThisGrid.displayName = "MoreLikeThisGrid";

// --- MODAL COMPONENT ---
const MovieModalComponent = ({
  movie,
  onClose,
  isFavorite,
  toggleFavorite,
  isTV,
}) => {
  const [mounted, setMounted] = useState(false);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [similar, setSimilar] = useState([]);

  const [heroTrailer, setHeroTrailer] = useState(null);
  const [playHeroVideo, setPlayHeroVideo] = useState(false);
  const [isHeroMuted, setIsHeroMuted] = useState(true);

  const [isLoadingTV, setIsLoadingTV] = useState(false);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(true);

  const getLink = () => {
    if (isTV) return `/series/${movie.id}`;
    if (movie.release_date) return `/movie/${movie.id}`;
    return "#";
  };

  const title = isTV ? movie.name : movie.title;
  const heroImage = movie.backdrop_path
    ? getImageUrl(movie.backdrop_path, "w1280")
    : getImageUrl(movie.poster_path, "w500");

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const fetchEpisodes = useCallback(
    async (seasonNum, signal) => {
      if (!API_KEY || !movie?.id) return;
      setIsLoadingEpisodes(true);
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${movie.id}/season/${seasonNum}?api_key=${API_KEY}`,
          { signal },
        );
        const data = await res.json();
        setEpisodes(data.episodes || []);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching episodes:", error);
        }
      } finally {
        setIsLoadingEpisodes(false);
      }
    },
    [movie?.id],
  );

  useEffect(() => {
    if (!API_KEY || !movie?.id) return;
    const controller = new AbortController();
    const type = isTV ? "tv" : "movie";

    const fetchAllData = async () => {
      try {
        const fetchOpts = { signal: controller.signal };

        const similarPromise = fetch(
          `https://api.themoviedb.org/3/${type}/${movie.id}/similar?api_key=${API_KEY}&language=en-US&page=1`,
          fetchOpts,
        ).then((res) => res.json());
        const videoPromise = fetch(
          `https://api.themoviedb.org/3/${type}/${movie.id}/videos?api_key=${API_KEY}`,
          fetchOpts,
        ).then((res) => res.json());

        let tvDetailsPromise = Promise.resolve(null);
        if (isTV) {
          setIsLoadingTV(true);
          tvDetailsPromise = fetch(
            `https://api.themoviedb.org/3/tv/${movie.id}?api_key=${API_KEY}`,
            fetchOpts,
          ).then((res) => res.json());
        }

        const [similarData, videoData, tvData] = await Promise.all([
          similarPromise,
          videoPromise,
          tvDetailsPromise,
        ]);

        // Process Hero Trailer
        const trailer = videoData.results?.find(
          (vid) => vid.site === "YouTube" && vid.type === "Trailer",
        );
        if (trailer) setHeroTrailer(trailer.key);

        // Process Similar Movies safe-guard limits
        if (similarData?.results) {
          let validSimilar = similarData.results.filter(
            (item) => item.poster_path || item.backdrop_path,
          );
          if (validSimilar.length >= 8) {
            validSimilar = validSimilar.slice(0, 8);
          } else if (validSimilar.length > 0) {
            const copy = [...validSimilar];
            let safety = 0;
            while (validSimilar.length < 8 && safety < 20) {
              validSimilar.push(copy[validSimilar.length % copy.length]);
              safety++;
            }
          }
          setSimilar(validSimilar);
        }
        setIsLoadingSimilar(false);

        // Process TV
        if (isTV && tvData?.seasons) {
          const mainSeasons = tvData.seasons.filter((s) => s.season_number > 0);
          setSeasons(mainSeasons);
          if (mainSeasons.length > 0) {
            const firstSeasonNum = mainSeasons[0].season_number;
            setSelectedSeason(firstSeasonNum);
            fetchEpisodes(firstSeasonNum, controller.signal);
          }
          setIsLoadingTV(false);
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error fetching modal data:", error);
          setIsLoadingSimilar(false);
          setIsLoadingTV(false);
        }
      }
    };

    fetchAllData();

    return () => controller.abort();
  }, [isTV, movie?.id, fetchEpisodes]);

  // Trigger Hero Trailer after 3 seconds of banner display
  useEffect(() => {
    let timer;
    if (heroTrailer) {
      timer = setTimeout(() => {
        setPlayHeroVideo(true);
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [heroTrailer]);

  const handleSeasonChange = (seasonNum) => {
    if (seasonNum === selectedSeason) return; // Ignore if already selected
    setSelectedSeason(seasonNum);
    fetchEpisodes(seasonNum);
  };

  if (!mounted) return null;

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] flex justify-center overflow-y-auto bg-black/60 backdrop-blur-md sm:p-6 md:p-12 p-0"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 50, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.98 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative w-full max-w-[1000px] bg-[#0a0a0a]/95 backdrop-blur-3xl sm:rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden h-fit my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-50 p-3 bg-black/20 border border-white/10 backdrop-blur-xl rounded-full text-white hover:bg-white hover:text-black hover:scale-110 transition-all duration-300"
        >
          <X size={24} strokeWidth={2.5} />
        </button>

        <div className="relative w-full aspect-[4/3] sm:aspect-[21/9] bg-[#050505] overflow-hidden">
          <Image
            src={heroImage}
            alt={title}
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover z-0 opacity-80"
            priority
          />

          {heroTrailer && playHeroVideo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 z-0 pointer-events-none"
            >
              <iframe
                src={`https://www.youtube.com/embed/${heroTrailer}?autoplay=1&mute=${
                  isHeroMuted ? 1 : 0
                }&controls=0&modestbranding=1&loop=1&playlist=${heroTrailer}&playsinline=1`}
                className="w-[150%] h-[150%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                allow="autoplay; encrypted-media"
              />
            </motion.div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/30 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 via-transparent to-transparent z-10" />

          <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full z-20">
            <h1 className="text-5xl sm:text-7xl font-black text-white mb-6 tracking-tighter drop-shadow-2xl leading-none">
              {title}
            </h1>

            <div className="flex flex-wrap items-center gap-4">
              <Link href={getLink()}>
                <button className="group flex items-center gap-3 bg-white text-black px-8 py-3.5 rounded-full font-extrabold text-lg hover:bg-neutral-200 hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                  <Play
                    size={22}
                    className="fill-black group-hover:scale-110 transition-transform"
                  />
                  Play
                </button>
              </Link>
              {heroTrailer && (
                <button
                  onClick={() => setIsHeroMuted(!isHeroMuted)}
                  className="flex items-center gap-3 bg-white/10 text-white px-8 py-3.5 rounded-full font-bold text-lg border border-white/20 hover:bg-white/20 hover:border-white/40 active:scale-95 transition-all duration-300 backdrop-blur-xl"
                >
                  {isHeroMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
                </button>
              )}
              <button
                onClick={toggleFavorite}
                className={`flex items-center gap-3 px-6 py-3.5 rounded-full font-bold text-lg border transition-all duration-300 backdrop-blur-xl active:scale-95
                  ${
                    isFavorite
                      ? "bg-[#f3c0c2]/20 text-[#f3c0c2] border-[#f3c0c2]/50 hover:bg-[#f3c0c2]/30"
                      : "bg-black/40 text-white border-white/20 hover:bg-white/10 hover:border-white/40"
                  }`}
              >
                {isFavorite ? (
                  <Heart size={22} strokeWidth={3} fill="#f3c0c2" />
                ) : (
                  <Plus size={22} strokeWidth={2.5} />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="px-8 md:px-12 py-10 grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-white/5">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center flex-wrap gap-4 text-base font-bold text-white/60">
              {movie.vote_average > 0 && (
                <span className="text-[#c3f0c2] font-extrabold flex items-center gap-1.5 tracking-wide">
                  {(movie.vote_average * 10).toFixed(0)}% Match
                </span>
              )}
              <span className="text-white font-medium">
                {formatDate(movie.release_date || movie.first_air_date)}
              </span>
              <span className="border border-white/20 px-2 py-0.5 rounded text-sm text-white/80">
                {isLoadingTV
                  ? "..."
                  : isTV && seasons.length > 0
                    ? `${seasons.length} Season${seasons.length > 1 ? "s" : ""}`
                    : "HD"}
              </span>
            </div>
            <p className="text-xl text-white/90 leading-relaxed font-medium tracking-tight">
              {movie.overview || "No overview available."}
            </p>
          </div>
          <div className="md:col-span-1 space-y-4 text-sm text-white/50 font-medium">
            <div>
              <span className="text-white/70">Original Language:</span>{" "}
              {movie.original_language?.toUpperCase() || "EN"}
            </div>
          </div>
        </div>

        {isTV && (
          <div className="px-8 md:px-12 py-10 border-b border-white/5 bg-white/[0.02]">
            <div className="mb-6">
              <h3 className="text-3xl font-bold text-white tracking-tight mb-6">
                Episodes{" "}
                {seasons.length === 1 && (
                  <span className="text-white/60 text-2xl">
                    ({seasons[0]?.name})
                  </span>
                )}
              </h3>

              {/* Horizontal Scrollable Tabs shown ONLY if more than 1 season */}
              {!isLoadingTV && seasons.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-4 snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {seasons.map((s) => (
                    <button
                      key={s.season_number}
                      onClick={() => handleSeasonChange(s.season_number)}
                      className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 snap-start border ${
                        selectedSeason === s.season_number
                          ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                          : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isLoadingTV || isLoadingEpisodes ? (
              <div className="animate-pulse space-y-4 mt-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 bg-white/5 rounded-2xl w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                {episodes.map((ep) => (
                  <Link
                    href={
                      getLink() +
                      `/season/${selectedSeason}/${ep.episode_number}`
                    }
                    key={ep.id}
                  >
                    <div className="flex flex-col sm:flex-row gap-6 p-4 rounded-2xl bg-transparent hover:bg-white/5 transition-all duration-300 group cursor-pointer border border-transparent hover:border-white/10">
                      <div className="relative w-full sm:w-48 aspect-video rounded-xl overflow-hidden shrink-0 bg-[#111] shadow-lg">
                        <Image
                          src={getImageUrl(
                            ep.still_path || movie.backdrop_path,
                            "w300",
                          )}
                          alt={ep.name}
                          fill
                          sizes="200px"
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-black/50 p-3 rounded-full border border-white/20 backdrop-blur-md shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                            <Play size={20} className="fill-white text-white" />
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col justify-center py-2">
                        <div className="flex justify-between items-start mb-2 gap-4">
                          <h4 className="text-white font-bold text-lg line-clamp-1 tracking-tight">
                            {ep.episode_number}. {ep.name}
                          </h4>
                          {ep.runtime && (
                            <span className="text-sm font-bold text-white/40 shrink-0">
                              {ep.runtime}m
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-white/60 line-clamp-2 leading-relaxed font-medium">
                          {ep.overview ||
                            "No overview available for this episode."}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
                {episodes.length === 0 && (
                  <div className="text-white/50 text-base py-4 font-medium">
                    No episodes found for this season.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <div className="px-8 md:px-12 py-10 pb-20">
          <h3 className="text-3xl font-bold text-white mb-8 tracking-tight">
            More Like This
          </h3>
          {isLoadingSimilar ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="aspect-[2/3] bg-white/5 rounded-[1.5rem] animate-pulse"
                />
              ))}
            </div>
          ) : (
            <MoreLikeThisGrid items={similar} />
          )}
        </div>
      </motion.div>
    </motion.div>
  );

  return createPortal(modalContent, document.body);
};

// --- HOME CARD COMPONENT ---
const HomeCard = memo(({ MovieCard }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isTV =
    MovieCard.media_type === "tv" || MovieCard.first_air_date !== undefined;
  const title = isTV ? MovieCard.name : MovieCard.title;

  const getImagePath = () => {
    if (MovieCard.poster_path)
      return `https://image.tmdb.org/t/p/w500/${MovieCard.poster_path}`;
    return "https://i.imgur.com/HIYYPtZ.png";
  };

  const handleFavoriteToggle = useCallback(
    (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
      if (isFavorite) {
        const updated = favorites.filter((item) => item.id !== MovieCard.id);
        localStorage.setItem("favorites", JSON.stringify(updated));
      } else {
        favorites.push(MovieCard);
        localStorage.setItem("favorites", JSON.stringify(favorites));
      }
      setIsFavorite(!isFavorite);
    },
    [isFavorite, MovieCard],
  );

  useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setIsFavorite(favorites.some((item) => item.id === MovieCard.id));
  }, [MovieCard.id]);

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
    <>
      <motion.div
        variants={containerVariants}
        initial="rest"
        whileHover="hover"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative w-full aspect-[2/3] rounded-[2rem] shadow-2xl bg-[#0a0a0a] ring-1 ring-white/5 isolate transform-gpu cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <div
          className="absolute inset-0 z-0 rounded-[2rem] overflow-hidden block"
          tabIndex={0}
          role="button"
          onKeyDown={(e) => e.key === "Enter" && setIsModalOpen(true)}
        >
          <div className="absolute inset-0 bg-neutral-900">
            <Image
              src={getImagePath()}
              alt={`${title} poster`}
              fill
              loading="lazy"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-all duration-700 ease-out ${
                imageLoaded ? "opacity-100 blur-0" : "opacity-0 blur-xl"
              } ${isHovered ? "scale-110" : "scale-100"}`}
              onLoad={() => setImageLoaded(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />
          </div>

          <motion.div
            className="absolute bottom-0 left-0 right-0 p-2 z-10"
            animate={{ backgroundColor: "rgba(10, 10, 10, 0)" }}
          >
            <div className="backdrop-blur-xl border border-white/10 rounded-[1.5rem] overflow-hidden shadow-lg bg-black/20">
              <div className="px-4 pt-4 pb-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ${
                        isTV
                          ? "bg-[#d0bcff] text-[#381e72]"
                          : "bg-[#bceeff] text-[#001f2a]"
                      }`}
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
        </div>

        <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-start pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md text-black text-[11px] font-black px-3 py-1.5 rounded-full shadow-lg">
            {formatDate(MovieCard.release_date || MovieCard.first_air_date)}
          </div>
          <motion.button
            onClick={handleFavoriteToggle}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.85 }}
            className={`pointer-events-auto cursor-pointer w-10 h-10 flex items-center justify-center rounded-full shadow-lg border backdrop-blur-md transition-all duration-300 ${
              isFavorite
                ? "bg-[#ffb4ab] border-[#ffb4ab] text-[#690005]"
                : "bg-black/30 border-white/20 text-white hover:bg-white hover:text-black hover:border-white"
            }`}
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

      {/* MODAL IS NOW DYNAMICALLY IMPORTED */}
      <AnimatePresence>
        {isModalOpen && (
          <MovieModal
            movie={MovieCard}
            isTV={isTV}
            isFavorite={isFavorite}
            toggleFavorite={handleFavoriteToggle}
            onClose={() => setIsModalOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
});
HomeCard.displayName = "HomeCard";

export default HomeCard;
