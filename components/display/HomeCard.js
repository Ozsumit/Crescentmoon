"use client";

import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  Heart,
  Star,
  Play,
  Plus,
  X,
  Check,
  ChevronDown,
  Volume2,
  VolumeX,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ─── Constants ────────────────────────────────────────────────────────────────
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TRAILER_DELAY_MS = 2800; // ms before video plays on hover
const HERO_TRAILER_DELAY_MS = 3000;

// ─── Module-level trailer cache (shared across all cards) ─────────────────────
const trailerCache = new Map(); // `${type}/${id}` → key | null

async function resolveTrailer(type, id, signal) {
  const cacheKey = `${type}/${id}`;
  if (trailerCache.has(cacheKey)) return trailerCache.get(cacheKey);

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/${type}/${id}/videos?api_key=${API_KEY}`,
      { signal },
    );
    const data = await res.json();
    const trailer = data.results?.find(
      (v) =>
        v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"),
    );
    const key = trailer?.key ?? null;
    trailerCache.set(cacheKey, key);
    return key;
  } catch {
    return null;
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getImageUrl = (path, size = "w1280") =>
  path
    ? `https://image.tmdb.org/t/p/${size}/${path}`
    : "https://i.imgur.com/HIYYPtZ.png";

const formatDate = (dateString) =>
  dateString ? new Date(dateString).getFullYear() : "N/A";

// ─── MoreLikeThisCard ─────────────────────────────────────────────────────────
const MoreLikeThisCard = memo(({ item, index, isActive, onHover }) => {
  const [trailerKey, setTrailerKey] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [playVideo, setPlayVideo] = useState(false);

  const abortRef = useRef(null);
  const timerRef = useRef(null);

  const type = item.media_type || (item.first_air_date ? "tv" : "movie");
  const posterUrl = getImageUrl(item.backdrop_path || item.poster_path, "w500");

  // Fetch trailer only once per card, only when first hovered
  useEffect(() => {
    if (!isActive || trailerCache.has(`${type}/${item.id}`)) {
      if (isActive) {
        const cached = trailerCache.get(`${type}/${item.id}`);
        if (cached && !trailerKey) setTrailerKey(cached);
      }
      return;
    }

    abortRef.current = new AbortController();
    resolveTrailer(type, item.id, abortRef.current.signal).then((key) => {
      if (key) setTrailerKey(key);
    });

    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  // Play timer — only while hovered
  useEffect(() => {
    if (!isActive) {
      clearTimeout(timerRef.current);
      setPlayVideo(false);
      return;
    }

    timerRef.current = setTimeout(() => setPlayVideo(true), TRAILER_DELAY_MS);

    return () => {
      clearTimeout(timerRef.current);
    };
  }, [isActive]);

  return (
    <div
      onMouseEnter={() => onHover(index)}
      onClick={() => setIsMuted((m) => !m)}
      className={`relative aspect-[16/9] sm:aspect-[2/3] rounded-[1.5rem] overflow-hidden bg-[#0a0a0a] cursor-pointer transition-[transform,box-shadow,border] duration-300 ease-out transform-gpu will-change-transform border ${
        isActive
          ? "border-white/30 scale-105 -translate-y-1 z-10 shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
          : "scale-100 translate-y-0 z-0 border-white/5"
      }`}
    >
      {playVideo && trailerKey ? (
        <div className="absolute inset-0 w-full h-full bg-black">
          <motion.iframe
            initial={{ opacity: 0, translateZ: 0 }}
            animate={{ opacity: 0.8, translateZ: 0 }}
            transition={{ duration: 0.4 }}
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&modestbranding=1&loop=1&playlist=${trailerKey}&playsinline=1`}
            className="w-[150%] h-[150%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-screen transform-gpu will-change-opacity"
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
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-cover transition-[transform,opacity] duration-500 ease-out opacity-80 transform-gpu will-change-[transform,opacity]"
        />
      )}

      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300 will-change-opacity ${isActive ? "opacity-100" : "opacity-0 sm:opacity-100"}`}
      >
        <div className="absolute bottom-0 p-4 w-full">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${type === "tv" ? "bg-[#d0bcff] text-[#381e72]" : "bg-[#bceeff] text-[#001f2a]"}`}
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

      {/* GPU Accelerated Progress Bar using scaleX */}
      {isActive && !playVideo && trailerKey && (
        <div className="absolute bottom-0 left-0 h-[3px] bg-white/10 w-full z-20 overflow-hidden">
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: TRAILER_DELAY_MS / 1000, ease: "linear" }}
            style={{ originX: 0 }}
            className="h-full bg-white transform-gpu will-change-transform"
          />
        </div>
      )}
    </div>
  );
});
MoreLikeThisCard.displayName = "MoreLikeThisCard";

// ─── MoreLikeThisGrid ─────────────────────────────────────────────────────────
const MoreLikeThisGrid = memo(({ items }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const handleHover = useCallback((idx) => setActiveIndex(idx), []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!items.length) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setActiveIndex((p) => (p === null ? 0 : (p + 1) % items.length));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActiveIndex((p) =>
          p === null ? 0 : (p - 1 + items.length) % items.length,
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [items.length]);

  if (!items.length)
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
          key={item.id}
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

// ─── MovieModal ───────────────────────────────────────────────────────────────
const MovieModal = ({ movie, onClose, isFavorite, toggleFavorite, isTV }) => {
  const [mounted, setMounted] = useState(false);
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [heroTrailer, setHeroTrailer] = useState(null);
  const [playHeroVideo, setPlayHeroVideo] = useState(false);
  const [isHeroMuted, setIsHeroMuted] = useState(true);
  const [isLoadingTV, setIsLoadingTV] = useState(isTV);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(true);

  const episodeAbortRef = useRef(null);
  const heroTimerRef = useRef(null);

  const type = isTV ? "tv" : "movie";
  const title = isTV ? movie.name : movie.title;
  const heroImage = getImageUrl(
    movie.backdrop_path || movie.poster_path,
    "w1280",
  );

  const getLink = () => {
    if (isTV) return `/series/${movie.id}`;
    if (movie.release_date) return `/movie/${movie.id}`;
    return "#";
  };

  useEffect(() => {
    setMounted(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const fetchEpisodes = useCallback(
    async (seasonNum) => {
      episodeAbortRef.current?.abort();
      episodeAbortRef.current = new AbortController();
      setIsLoadingEpisodes(true);
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/tv/${movie.id}/season/${seasonNum}?api_key=${API_KEY}`,
          { signal: episodeAbortRef.current.signal },
        );
        const data = await res.json();
        setEpisodes(data.episodes || []);
      } catch (err) {
        if (err.name !== "AbortError")
          console.error("Episodes fetch error:", err);
      } finally {
        setIsLoadingEpisodes(false);
      }
    },
    [movie.id],
  );

  useEffect(() => {
    if (!API_KEY || !movie?.id) return;
    let isMounted = true;
    const abort = new AbortController();
    const sig = abort.signal;

    const run = async () => {
      try {
        const [similarData, videoData, tvData] = await Promise.all([
          fetch(
            `https://api.themoviedb.org/3/${type}/${movie.id}/similar?api_key=${API_KEY}&language=en-US&page=1`,
            { signal: sig },
          ).then((r) => r.json()),
          fetch(
            `https://api.themoviedb.org/3/${type}/${movie.id}/videos?api_key=${API_KEY}`,
            { signal: sig },
          ).then((r) => r.json()),
          isTV
            ? fetch(
                `https://api.themoviedb.org/3/tv/${movie.id}?api_key=${API_KEY}`,
                { signal: sig },
              ).then((r) => r.json())
            : Promise.resolve(null),
        ]);

        if (!isMounted) return;

        const trailer = videoData.results?.find(
          (v) => v.site === "YouTube" && v.type === "Trailer",
        );
        if (trailer) setHeroTrailer(trailer.key);

        if (similarData?.results) {
          const deduped = Array.from(
            new Map(
              similarData.results
                .filter((i) => i.poster_path || i.backdrop_path)
                .map((i) => [i.id, i]),
            ).values(),
          ).slice(0, 8);
          setSimilar(deduped);
        }
        setIsLoadingSimilar(false);

        if (isTV && tvData?.seasons) {
          const mainSeasons = tvData.seasons.filter((s) => s.season_number > 0);
          setSeasons(mainSeasons);
          if (mainSeasons.length > 0) {
            const firstNum = mainSeasons[0].season_number;
            setSelectedSeason(firstNum);
            fetchEpisodes(firstNum);
          }
          setIsLoadingTV(false);
        }
      } catch (err) {
        if (err.name !== "AbortError") console.error("Modal data error:", err);
        if (isMounted) {
          setIsLoadingSimilar(false);
          setIsLoadingTV(false);
        }
      }
    };

    run();
    return () => {
      isMounted = false;
      abort.abort();
    };
  }, [isTV, movie?.id, fetchEpisodes, type]);

  useEffect(() => {
    if (!heroTrailer) return;
    heroTimerRef.current = setTimeout(
      () => setPlayHeroVideo(true),
      HERO_TRAILER_DELAY_MS,
    );
    return () => clearTimeout(heroTimerRef.current);
  }, [heroTrailer]);

  const handleSeasonChange = (e) => {
    const num = parseInt(e.target.value);
    setSelectedSeason(num);
    fetchEpisodes(num);
  };

  if (!mounted) return null;

  const modalContent = (
    <motion.div
      initial={{ opacity: 0, translateZ: 0 }}
      animate={{ opacity: 1, translateZ: 0 }}
      exit={{ opacity: 0, translateZ: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[99999] flex justify-center overflow-y-auto bg-black/60 backdrop-blur-md sm:p-6 md:p-12 p-0 will-change-opacity"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 50, opacity: 0, scale: 0.95, translateZ: 0 }}
        animate={{ y: 0, opacity: 1, scale: 1, translateZ: 0 }}
        exit={{ y: 20, opacity: 0, scale: 0.95, translateZ: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 400, mass: 0.8 }}
        className="relative w-full max-w-[1000px] bg-[#0a0a0a]/95 backdrop-blur-3xl sm:rounded-[2.5rem] shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-white/10 overflow-hidden h-fit my-auto transform-gpu will-change-transform"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-50 p-3 bg-black/20 border border-white/10 backdrop-blur-xl rounded-full text-white hover:bg-white hover:text-black hover:scale-110 transition-[transform,background-color] duration-300 transform-gpu will-change-transform"
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
              initial={{ opacity: 0, translateZ: 0 }}
              animate={{ opacity: 1, translateZ: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0 z-0 pointer-events-none transform-gpu will-change-opacity"
            >
              <iframe
                src={`https://www.youtube.com/embed/${heroTrailer}?autoplay=1&mute=${isHeroMuted ? 1 : 0}&controls=0&modestbranding=1&loop=1&playlist=${heroTrailer}&playsinline=1`}
                className="w-[150%] h-[150%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                allow="autoplay; encrypted-media"
                title="Hero Trailer"
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
                <button className="group flex items-center gap-3 bg-white text-black px-8 py-3.5 rounded-full font-extrabold text-lg hover:bg-neutral-200 hover:scale-105 active:scale-95 transition-[transform,background-color] duration-300 shadow-[0_0_30px_rgba(255,255,255,0.3)] transform-gpu will-change-transform">
                  <Play
                    size={22}
                    className="fill-black group-hover:scale-110 transition-transform transform-gpu"
                  />
                  Play
                </button>
              </Link>
              {heroTrailer && (
                <button
                  onClick={() => setIsHeroMuted((m) => !m)}
                  className="flex items-center gap-3 bg-white/10 text-white px-8 py-3.5 rounded-full font-bold text-lg border border-white/20 hover:bg-white/20 hover:border-white/40 active:scale-95 transition-[transform,background-color,border] duration-300 backdrop-blur-xl transform-gpu will-change-transform"
                >
                  {isHeroMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
                </button>
              )}
              <button
                onClick={toggleFavorite}
                className={`flex items-center gap-3 px-6 py-3.5 rounded-full font-bold text-lg border transition-[transform,background-color,border] duration-300 backdrop-blur-xl active:scale-95 transform-gpu will-change-transform ${
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
                    ? `${seasons.length} Seasons`
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
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-bold text-white tracking-tight">
                Episodes
              </h3>
              {!isLoadingTV && seasons.length > 0 && (
                <div className="relative group">
                  <select
                    value={selectedSeason}
                    onChange={handleSeasonChange}
                    className="appearance-none bg-black/40 text-white border border-white/10 py-3 pl-6 pr-12 rounded-xl font-bold text-lg focus:outline-none focus:ring-2 focus:ring-white/30 cursor-pointer backdrop-blur-md transition-colors group-hover:bg-black/60"
                  >
                    {seasons.map((s) => (
                      <option
                        key={s.season_number}
                        value={s.season_number}
                        className="bg-[#111]"
                      >
                        {s.name} ({s.episode_count} Episodes)
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={20}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 pointer-events-none group-hover:text-white transition-colors"
                  />
                </div>
              )}
            </div>

            {isLoadingTV || isLoadingEpisodes ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 bg-white/5 rounded-2xl w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
                {episodes.map((ep) => (
                  <Link
                    href={`${getLink()}/season/${selectedSeason}/${ep.episode_number}`}
                    key={ep.id}
                  >
                    <div className="flex flex-col sm:flex-row gap-6 p-4 rounded-2xl bg-transparent hover:bg-white/5 transition-colors duration-300 group cursor-pointer border border-transparent hover:border-white/10">
                      <div className="relative w-full sm:w-48 aspect-video rounded-xl overflow-hidden shrink-0 bg-[#111] shadow-lg">
                        <Image
                          src={getImageUrl(
                            ep.still_path || movie.backdrop_path,
                            "w300",
                          )}
                          alt={ep.name}
                          fill
                          sizes="200px"
                          className="object-cover group-hover:scale-110 transition-[transform] duration-500 transform-gpu will-change-transform"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 will-change-opacity">
                          <div className="bg-black/50 p-3 rounded-full border border-white/20 backdrop-blur-md shadow-2xl scale-90 group-hover:scale-100 transition-[transform] transform-gpu">
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
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] bg-white/5 rounded-[1.5rem] animate-pulse"
                  style={{ animationDelay: `${i * 40}ms` }}
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

// ─── HomeCard ─────────────────────────────────────────────────────────────────
const HomeCard = memo(({ MovieCard }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isTV =
    MovieCard.media_type === "tv" || MovieCard.first_air_date !== undefined;
  const title = isTV ? MovieCard.name : MovieCard.title;
  const posterSrc = MovieCard.poster_path
    ? `https://image.tmdb.org/t/p/w500/${MovieCard.poster_path}`
    : "https://i.imgur.com/HIYYPtZ.png";

  useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem("favorites")) || [];
      setIsFavorite(favs.some((item) => item.id === MovieCard.id));
    } catch {}
  }, [MovieCard.id]);

  const handleFavoriteToggle = useCallback(
    (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      try {
        const favs = JSON.parse(localStorage.getItem("favorites")) || [];
        const next = isFavorite
          ? favs.filter((item) => item.id !== MovieCard.id)
          : [...favs, MovieCard];
        localStorage.setItem("favorites", JSON.stringify(next));
        setIsFavorite(!isFavorite);
      } catch {}
    },
    [isFavorite, MovieCard],
  );

  // Snappy GPU-accelerated framer motion configurations
  const containerVariants = {
    rest: { scale: 1, y: 0, translateZ: 0 },
    hover: {
      scale: 1.03,
      y: -8,
      translateZ: 0,
      transition: { type: "spring", stiffness: 400, damping: 25, mass: 0.8 },
    },
  };

  const contentStagger = {
    rest: {
      height: 0,
      opacity: 0,
      translateZ: 0,
      transition: { duration: 0.2, ease: "easeOut", when: "afterChildren" },
    },
    hover: {
      height: "auto",
      opacity: 1,
      translateZ: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
        mass: 0.8,
        staggerChildren: 0.05,
        delayChildren: 0.05,
        when: "beforeChildren",
      },
    },
  };

  const itemFade = {
    rest: { opacity: 0, y: 10, translateZ: 0 },
    hover: { opacity: 1, y: 0, translateZ: 0 },
  };

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="rest"
        whileHover="hover"
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative w-full aspect-[2/3] rounded-[2rem] shadow-2xl bg-[#0a0a0a] ring-1 ring-white/5 isolate transform-gpu will-change-transform cursor-pointer"
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
              src={posterSrc}
              alt={title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`object-cover transition-[transform,filter,opacity] duration-500 ease-out transform-gpu will-change-[transform,filter,opacity] ${imageLoaded ? "opacity-100 blur-0" : "opacity-0 blur-xl"} ${isHovered ? "scale-110" : "scale-100"}`}
              onLoad={() => setImageLoaded(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 transition-opacity duration-300 will-change-opacity" />
          </div>

          <motion.div className="absolute bottom-0 left-0 right-0 p-2 z-10">
            <div className="backdrop-blur-xl border border-white/10 rounded-[1.5rem] overflow-hidden shadow-lg bg-black/20 transform-gpu">
              <div className="px-4 pt-4 pb-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ${isTV ? "bg-[#d0bcff] text-[#381e72]" : "bg-[#bceeff] text-[#001f2a]"}`}
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
              <motion.div
                variants={contentStagger}
                className="transform-gpu will-change-[height,opacity]"
              >
                <div className="px-4 pb-4 flex flex-col gap-3">
                  <motion.p
                    variants={itemFade}
                    className="text-xs text-neutral-300 line-clamp-3 leading-relaxed transform-gpu"
                  >
                    {MovieCard.overview || "No description available."}
                  </motion.p>
                  <motion.div
                    variants={itemFade}
                    className="w-full py-3 rounded-xl bg-[#c3f0c2] text-[#07210b] font-bold text-sm flex items-center justify-center gap-2 transform-gpu"
                  >
                    <Play size={16} className="fill-[#07210b]" />
                    <span>Watch Now</span>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Top bar */}
        <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-start pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md text-black text-[11px] font-black px-3 py-1.5 rounded-full shadow-lg">
            {formatDate(MovieCard.release_date || MovieCard.first_air_date)}
          </div>
          <motion.button
            onClick={handleFavoriteToggle}
            whileHover={{
              scale: 1.1,
              transition: { type: "spring", stiffness: 400, damping: 20 },
            }}
            whileTap={{ scale: 0.85 }}
            className={`pointer-events-auto cursor-pointer w-10 h-10 flex items-center justify-center rounded-full shadow-lg border backdrop-blur-md transition-colors duration-300 transform-gpu will-change-transform ${
              isFavorite
                ? "bg-[#ffb4ab] border-[#ffb4ab] text-[#690005]"
                : "bg-black/30 border-white/20 text-white hover:bg-white hover:text-black hover:border-white"
            }`}
          >
            <AnimatePresence mode="wait">
              {isFavorite ? (
                <motion.div
                  key="liked"
                  initial={{ scale: 0, translateZ: 0 }}
                  animate={{ scale: 1, translateZ: 0 }}
                  exit={{ scale: 0, translateZ: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <Heart size={18} className="fill-[#690005]" />
                </motion.div>
              ) : (
                <motion.div
                  key="unliked"
                  initial={{ scale: 0, translateZ: 0 }}
                  animate={{ scale: 1, translateZ: 0 }}
                  exit={{ scale: 0, translateZ: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                >
                  <Heart size={18} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>

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
