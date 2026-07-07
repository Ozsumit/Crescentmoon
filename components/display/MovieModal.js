"use client";
import React, { useState, useEffect, useCallback, memo } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { Heart, Star, Play, Plus, X, Volume2, VolumeX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

const getImageUrl = (path, size = "w1280") => {
  if (!path) return "https://i.imgur.com/HIYYPtZ.png";
  return `https://image.tmdb.org/t/p/${size}/${path}`;
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).getFullYear();
};

const MoreLikeThisCard = memo(
  ({ item, index, isActive, onHover, ...props }) => {
    const [trailerKey, setTrailerKey] = useState(null);
    const [isMuted, setIsMuted] = useState(true);
    const [playVideo, setPlayVideo] = useState(false);
    const [progress, setProgress] = useState(0);

    const hasFetchedTrailer = React.useRef(false);
    const type = item.media_type || (item.first_air_date ? "tv" : "movie");
    const posterUrl = getImageUrl(
      item.backdrop_path || item.poster_path,
      "w342",
    );

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
          if (err.name !== "AbortError")
            console.error("Error fetching trailer", err);
        }
      };
      fetchTrailer();

      return () => controller.abort();
    }, [isActive, item.id, type]);

    useEffect(() => {
      let delayTimer;
      let progressTimer;
      if (isActive) {
        progressTimer = setTimeout(() => setProgress(100), 50);
        delayTimer = setTimeout(() => setPlayVideo(true), 3000);
      } else {
        setPlayVideo(false);
        setProgress(0);
      }
      return () => {
        clearTimeout(delayTimer);
        clearTimeout(progressTimer);
      };
    }, [isActive]);

    return (
      <div
        {...props}
        onMouseEnter={() => onHover(index)}
        onClick={() => setIsMuted(!isMuted)}
        className={`group relative aspect-[16/9] sm:aspect-[2/3] rounded-[1.5rem] overflow-hidden bg-card cursor-pointer transition-all duration-300 ease-out border will-change-transform ${
          isActive
            ? "border-primary/50 scale-105 z-10 shadow-lg"
            : "scale-100 z-0 border-border"
        }`}
      >
        {playVideo && trailerKey ? (
          <div className="absolute inset-0 w-full h-full bg-background transition-opacity duration-500 opacity-100">
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${
                isMuted ? 1 : 0
              }&controls=0&modestbranding=1&loop=1&playlist=${trailerKey}&playsinline=1`}
              className="w-[150%] h-[150%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-screen opacity-80"
              allow="autoplay; encrypted-media"
              title="Trailer"
            />
            <div className="absolute top-3 right-3 bg-background/90 p-2 rounded-full z-20 border border-border">
              {isMuted ? (
                <VolumeX size={14} className="text-foreground" />
              ) : (
                <Volume2 size={14} className="text-foreground" />
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
            className="object-cover transition-transform duration-700 opacity-80 group-hover:opacity-100 group-hover:scale-105"
          />
        )}

        <div
          className={`absolute inset-0 bg-gradient-to-t from-card/90 via-card/20 to-transparent transition-opacity duration-300 ${
            isActive ? "opacity-100" : "opacity-0 sm:opacity-100"
          }`}
        >
          <div className="absolute bottom-0 p-4 w-full">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                  type === "tv"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
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
            <p className="text-foreground text-sm font-bold line-clamp-1 tracking-tight leading-tight mb-0.5">
              {item.title || item.name}
            </p>
            <p className="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">
              {formatDate(item.release_date || item.first_air_date)}
            </p>
          </div>
        </div>

        {isActive && !playVideo && trailerKey && (
          <div className="absolute bottom-0 left-0 h-[3px] bg-foreground/10 w-full z-20 overflow-hidden">
            <div
              className="h-full bg-primary"
              style={{
                width: `${progress}%`,
                transition: progress > 0 ? "width 2.95s linear" : "none",
              }}
            />
          </div>
        )}
      </div>
    );
  },
);
MoreLikeThisCard.displayName = "MoreLikeThisCard";

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
        if (error.name !== "AbortError")
          console.error("Error fetching episodes:", error);
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

        const trailer = videoData.results?.find(
          (vid) => vid.site === "YouTube" && vid.type === "Trailer",
        );
        if (trailer) setHeroTrailer(trailer.key);

        if (similarData?.results) {
          let validSimilar = similarData.results.filter(
            (item) => item.poster_path || item.backdrop_path,
          );
          if (validSimilar.length >= 8) validSimilar = validSimilar.slice(0, 8);
          setSimilar(validSimilar);
        }
        setIsLoadingSimilar(false);

        if (isTV && tvData?.seasons) {
          const mainSeasons = tvData.seasons.filter((s) => s.season_number > 0);
          setSeasons(mainSeasons);
          if (mainSeasons.length > 0) {
            setSelectedSeason(mainSeasons[0].season_number);
            fetchEpisodes(mainSeasons[0].season_number, controller.signal);
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

  useEffect(() => {
    let timer;
    if (heroTrailer) {
      timer = setTimeout(() => setPlayHeroVideo(true), 3000);
    }
    return () => clearTimeout(timer);
  }, [heroTrailer]);

  if (!mounted) return null;

  const modalContent = (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[99999] flex justify-center overflow-y-auto bg-background/60 backdrop-blur-sm sm:p-6 md:p-12 p-0"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 50, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 20, opacity: 0, scale: 0.98 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative w-full max-w-[1000px] bg-card/95 sm:rounded-[2.5rem] shadow-2xl border border-border overflow-hidden h-fit my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-50 p-3 bg-card/90 border border-border rounded-full text-foreground hover:bg-foreground hover:text-background hover:scale-110 transition-all duration-300"
        >
          <X size={24} strokeWidth={2.5} />
        </button>

        <div className="relative w-full aspect-[4/3] sm:aspect-[21/9] bg-background overflow-hidden">
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

          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent z-10" />
          <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full z-20">
            <h1 className="text-5xl sm:text-7xl font-black text-foreground mb-6 tracking-tighter drop-shadow-2xl leading-none">
              {title}
            </h1>

            <div className="flex flex-wrap items-center gap-4">
              <Link href={getLink()}>
                <button className="group flex items-center gap-3 bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-extrabold text-lg hover:opacity-90 hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg">
                  <Play
                    size={22}
                    className="fill-primary-foreground group-hover:scale-110 transition-transform"
                  />
                  Play
                </button>
              </Link>
              {heroTrailer && (
                <button
                  onClick={() => setIsHeroMuted(!isHeroMuted)}
                  className="flex items-center gap-3 bg-foreground/90 text-background px-8 py-3.5 rounded-full font-bold text-lg border border-border hover:bg-foreground active:scale-95 transition-all duration-300"
                >
                  {isHeroMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
                </button>
              )}
              <button
                onClick={toggleFavorite}
                className={`flex items-center gap-3 px-6 py-3.5 rounded-full font-bold text-lg border transition-all duration-300 active:scale-95
                  ${
                    isFavorite
                      ? "bg-primary/20 text-primary border-primary/50 hover:bg-primary/30"
                      : "bg-background/90 text-foreground border-border/20 hover:bg-foreground/10"
                  }`}
              >
                {isFavorite ? (
                  <Heart size={22} strokeWidth={3} fill="currentColor" />
                ) : (
                  <Plus size={22} strokeWidth={2.5} />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="px-8 md:px-12 py-10 grid grid-cols-1 md:grid-cols-3 gap-12 border-b border-border">
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center flex-wrap gap-4 text-base font-bold text-muted-foreground">
              {movie.vote_average > 0 && (
                <span className="text-primary font-extrabold">
                  {(movie.vote_average * 10).toFixed(0)}% Match
                </span>
              )}
              <span className="text-foreground">
                {formatDate(movie.release_date || movie.first_air_date)}
              </span>
              <span className="border border-border px-2 py-0.5 rounded text-sm text-foreground/80">
                {isLoadingTV
                  ? "..."
                  : isTV && seasons.length > 0
                    ? `${seasons.length} Season${seasons.length > 1 ? "s" : ""}`
                    : "HD"}
              </span>
            </div>
            <p className="text-xl text-foreground/90 leading-relaxed font-medium tracking-tight">
              {movie.overview || "No overview available."}
            </p>
          </div>
        </div>

        {isTV && (
          <div className="px-8 md:px-12 py-10 border-b border-border bg-foreground/[0.02]">
            <div className="mb-6">
              <h3 className="text-3xl font-bold text-foreground tracking-tight mb-6">
                Episodes
              </h3>
              {!isLoadingTV && seasons.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-4 snap-x scrollbar-hide">
                  {seasons.map((s) => (
                    <button
                      key={s.season_number}
                      onClick={() => {
                        setSelectedSeason(s.season_number);
                        fetchEpisodes(s.season_number);
                      }}
                      className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold text-sm transition-all duration-300 border ${
                        selectedSeason === s.season_number
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-muted text-muted-foreground border-border hover:bg-accent"
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {isLoadingTV || isLoadingEpisodes ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-28 bg-muted rounded-2xl w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-4">
                {episodes.map((ep) => (
                  <Link
                    href={`${getLink()}/season/${selectedSeason}/${ep.episode_number}`}
                    key={ep.id}
                  >
                    <div className="flex flex-col sm:flex-row gap-6 p-4 rounded-2xl hover:bg-muted transition-all duration-300 group cursor-pointer border border-transparent hover:border-border">
                      <div className="relative w-full sm:w-48 aspect-video rounded-xl overflow-hidden shrink-0 bg-background shadow-lg border border-border">
                        <Image
                          src={getImageUrl(
                            ep.still_path || movie.backdrop_path,
                            "w300",
                          )}
                          alt={ep.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="bg-background/90 p-3 rounded-full border border-border shadow-lg scale-90 group-hover:scale-100 transition-transform">
                            <Play
                              size={20}
                              className="fill-foreground text-foreground"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 flex flex-col justify-center py-2">
                        <div className="flex justify-between items-start mb-2 gap-4">
                          <h4 className="text-foreground font-bold text-lg line-clamp-1 tracking-tight">
                            {ep.episode_number}. {ep.name}
                          </h4>
                          {ep.runtime && (
                           <span className="text-sm font-bold text-muted-foreground shrink-0">
                              {ep.runtime}m
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                          {ep.overview || "No overview available."}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="px-8 md:px-12 py-10 pb-20">
          <h3 className="text-3xl font-bold text-foreground mb-8 tracking-tight">
            More Like This
          </h3>
          {isLoadingSimilar ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="aspect-[2/3] bg-muted rounded-[1.5rem] animate-pulse"
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

export default MovieModalComponent;
