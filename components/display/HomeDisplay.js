"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Filter, X, Film, Tv, ArrowUp, LayoutGrid } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import HomeCards from "./HomeCard";
import useGenreStore from "@/components/zustand";
import ContinueWatching from "../continuewatching";
import RecommendedMovies from "../recommended";
import GenreSelector from "@/components/filter/Filter";
import HorizontalHomeCard from "./HorHomeCards";
import HomePagination from "../pagination/HomePagination";
import { motion, AnimatePresence } from "framer-motion";

// ─── Constants ────────────────────────────────────────────────────────────────
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const GENRE_DEBOUNCE_MS = 320;
const PREFETCH_DELAY_MS = 600; // wait until current render settles

// ─── Cache (module-level — survives re-renders, cleared on page unload) ───────
const fetchCache = new Map();

function getCached(key) {
  const entry = fetchCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL_MS) {
    fetchCache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key, data) {
  fetchCache.set(key, { data, ts: Date.now() });
}

// ─── Build TMDB URL ────────────────────────────────────────────────────────────
function buildUrl(type, page, genres) {
  const isMovie = type === "movies";
  const base = isMovie ? "movie" : "tv";
  if (genres.length > 0) {
    const ids = genres.map((g) => g.id).join(",");
    return `https://api.themoviedb.org/3/discover/${base}?api_key=${API_KEY}&with_genres=${ids}&page=${page}&language=en-US&sort_by=popularity.desc`;
  }
  return `https://api.themoviedb.org/3/${base}/popular?api_key=${API_KEY}&page=${page}&language=en-US`;
}

function normalise(items, isMovie) {
  return items.map((item) => ({
    ...item,
    media_type: isMovie ? "movie" : "tv",
    title: isMovie ? item.title : item.name,
    release_date: isMovie ? item.release_date : item.first_air_date,
  }));
}

async function fetchPage(type, page, genres, signal) {
  const cacheKey = `${type}|${page}|${genres
    .map((g) => g.id)
    .sort()
    .join(",")}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = buildUrl(type, page, genres);
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`TMDB ${res.status}`);

  const json = await res.json();
  const isMovie = type === "movies";
  const result = {
    items: normalise(json.results, isMovie),
    totalPages: Math.min(json.total_pages, 500),
  };

  setCache(cacheKey, result);
  return result;
}

// ─── Polished Skeletons ─────────────────────────────────────────────────────────
const ShimmerStyles = () => (
  <style>{`
    @keyframes premium-shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    .animate-shimmer {
      animation: premium-shimmer 2s infinite cubic-bezier(0.4, 0, 0.2, 1);
    }
  `}</style>
);

const CardSkeleton = ({ index }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.03, duration: 0.4, ease: "easeOut" }}
    className="relative w-full aspect-[2/3] rounded-[2rem] bg-[#0a0a0a] ring-1 ring-white/5 isolate overflow-hidden transform-gpu will-change-transform"
  >
    <div className="absolute inset-0 bg-neutral-900/40" />
    <div className="absolute inset-0 z-0 animate-shimmer bg-gradient-to-r from-transparent via-white/[0.07] to-transparent w-[150%] transform-gpu will-change-transform" />
    <div className="absolute bottom-0 left-0 right-0 p-2 z-10">
      <div className="rounded-[1.5rem] bg-black/40 border border-white/5 backdrop-blur-md p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-5 w-12 bg-white/10 rounded-md" />
          <div className="h-3 w-8 bg-white/10 rounded-md" />
        </div>
        <div className="h-5 w-3/4 bg-white/20 rounded-md mb-2" />
        <div className="h-3 w-full bg-white/10 rounded-md mb-1.5" />
        <div className="h-3 w-2/3 bg-white/10 rounded-md" />
      </div>
    </div>
    <div className="absolute top-4 left-4 h-6 w-12 bg-white/10 rounded-full backdrop-blur-md" />
    <div className="absolute top-4 right-4 h-10 w-10 bg-white/5 rounded-full border border-white/5 backdrop-blur-md" />
  </motion.div>
);

const HorizontalCardSkeleton = ({ index }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.04, duration: 0.4, ease: "easeOut" }}
    className="flex gap-4 p-2 h-36 bg-[#0a0a0a]/50 rounded-[2rem] border border-white/5 relative overflow-hidden isolate transform-gpu will-change-transform"
  >
    <div className="absolute inset-0 z-0 animate-shimmer bg-gradient-to-r from-transparent via-white/[0.04] to-transparent w-[150%] transform-gpu will-change-transform" />
    <div className="w-24 sm:w-28 shrink-0 h-full bg-white/5 rounded-[1.5rem]" />
    <div className="flex-1 flex flex-col justify-center gap-2.5 py-2 pr-4 z-10">
      <div className="flex gap-2">
        <div className="h-4 w-12 bg-white/10 rounded-md" />
        <div className="h-4 w-8 bg-white/5 rounded-md" />
      </div>
      <div className="h-6 w-3/4 bg-white/20 rounded-md mb-1" />
      <div className="h-3 w-full bg-white/5 rounded-md" />
      <div className="h-3 w-4/5 bg-white/5 rounded-md" />
    </div>
  </motion.div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
const HomeDisplay = () => {
  const { activeGenres, toggleGenre, clearGenres } = useGenreStore();

  const [contentData, setContentData] = useState({ movies: [], tvShows: [] });
  const [activeTab, setActiveTab] = useState("all"); // Initially mixed
  const [pageData, setPageData] = useState({ all: 1, movies: 1, tvShows: 1 });
  const [loading, setLoading] = useState({ movies: true, tvShows: true });
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState({ movies: 1, tvShows: 1 });
  const [isGenreMenuOpen, setIsGenreMenuOpen] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);

  const hasLoaded = useRef({ movies: false, tvShows: false });
  const abortRefs = useRef({ movies: null, tvShows: null });
  const genreDebounce = useRef(null);
  const prefetchTimer = useRef(null);
  const isMounted = useRef(false);

  useEffect(() => {
    const handleScroll = () => setShowTopBtn(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const loadType = useCallback(
    async (type, page, genres, { silent = false } = {}) => {
      abortRefs.current[type]?.abort();
      const controller = new AbortController();
      abortRefs.current[type] = controller;

      if (!silent && !hasLoaded.current[type]) {
        setLoading((prev) => ({ ...prev, [type]: true }));
      }

      setError(null);

      try {
        const result = await fetchPage(type, page, genres, controller.signal);
        if (controller.signal.aborted) return;

        setContentData((prev) => ({ ...prev, [type]: result.items }));
        setTotalPages((prev) => ({ ...prev, [type]: result.totalPages }));
        hasLoaded.current[type] = true;
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error(`Error fetching ${type}:`, err);
        setError(`Unable to load ${type}. Please try again.`);
      } finally {
        if (!controller.signal.aborted) {
          setLoading((prev) => ({ ...prev, [type]: false }));
        }
      }
    },
    [],
  );

  const prefetchPage = useCallback((type, page, genres) => {
    clearTimeout(prefetchTimer.current);
    prefetchTimer.current = setTimeout(() => {
      fetchPage(type, page, genres, new AbortController().signal).catch(
        () => {},
      );
    }, PREFETCH_DELAY_MS);
  }, []);

  // Initial load
  useEffect(() => {
    Promise.all([
      loadType("movies", 1, activeGenres),
      loadType("tvShows", 1, activeGenres),
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Genre filters
  const prevPageData = useRef(pageData);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    clearTimeout(genreDebounce.current);
    genreDebounce.current = setTimeout(() => {
      const resetPages = { all: 1, movies: 1, tvShows: 1 };
      setPageData(resetPages);
      prevPageData.current = resetPages;
      hasLoaded.current = { movies: false, tvShows: false };

      Promise.all([
        loadType("movies", 1, activeGenres),
        loadType("tvShows", 1, activeGenres),
      ]);
    }, GENRE_DEBOUNCE_MS);

    return () => clearTimeout(genreDebounce.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGenres]);

  // Handle Pagination Fetching based on Active Tab
  useEffect(() => {
    if (activeTab === "all") {
      const page = pageData.all;
      if (prevPageData.current.all !== page) {
        prevPageData.current.all = page;
        loadType("movies", page, activeGenres);
        loadType("tvShows", page, activeGenres);
      }
    } else {
      const type = activeTab === "movies" ? "movies" : "tvShows";
      const page = pageData[activeTab];
      if (prevPageData.current[activeTab] !== page) {
        prevPageData.current[activeTab] = page;
        loadType(type, page, activeGenres);

        if (page < totalPages[type]) {
          prefetchPage(type, page + 1, activeGenres);
        }
      }
    }
  }, [pageData, activeTab, activeGenres, loadType, prefetchPage, totalPages]);

  const handleTabChange = useCallback((value) => {
    setActiveTab(value);
  }, []);

  useEffect(() => {
    return () => {
      abortRefs.current.movies?.abort();
      abortRefs.current.tvShows?.abort();
      clearTimeout(genreDebounce.current);
      clearTimeout(prefetchTimer.current);
    };
  }, []);

  const handlePageChange = (newPage) => {
    setPageData((prev) => ({ ...prev, [activeTab]: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Compose Data based on current active view
  let currentData = [];
  let isLoading = false;
  let currentTotalPages = 1;
  let currentPage = 1;

  if (activeTab === "all") {
    // Interleave Movies & TV Shows perfectly for the mixed state
    const m = contentData.movies;
    const t = contentData.tvShows;
    const maxLen = Math.max(m.length, t.length);
    for (let i = 0; i < maxLen; i++) {
      if (m[i]) currentData.push(m[i]);
      if (t[i]) currentData.push(t[i]);
    }
    isLoading = loading.movies || loading.tvShows;
    currentTotalPages = Math.max(totalPages.movies, totalPages.tvShows);
    currentPage = pageData.all;
  } else {
    const type = activeTab === "movies" ? "movies" : "tvShows";
    currentData = contentData[type];
    isLoading = loading[type];
    currentTotalPages = totalPages[type];
    currentPage = pageData[activeTab];
  }

  const renderGrid = (items) => (
    <motion.div
      key={`${activeTab}-${currentPage}`} // Ensure Framer fires on swap & pagination
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="hidden lg:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 2xl:grid-cols-5 gap-6 xl:gap-8 z-20">
        {items.map((item) => (
          <HomeCards key={`${item.media_type}-${item.id}`} MovieCard={item} />
        ))}
      </div>
      <div className="grid lg:hidden grid-cols-1 gap-4">
        {items.map((item) => (
          <HorizontalHomeCard
            key={`${item.media_type}-${item.id}`}
            MovieCard={item}
          />
        ))}
      </div>
    </motion.div>
  );

  const renderSkeletons = () => (
    <motion.div
      key={`skeleton-${activeTab}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <div className="hidden lg:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 2xl:grid-cols-5 gap-6 xl:gap-8">
        {Array.from({ length: 15 }).map((_, i) => (
          <CardSkeleton key={i} index={i} />
        ))}
      </div>
      <div className="grid lg:hidden grid-cols-1 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <HorizontalCardSkeleton key={i} index={i} />
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="w-full max-w-[2400px] mx-auto px-2 sm:px-6 lg:px-12 pb-24">
      <ShimmerStyles />

      <section className="mb-12">
        <ContinueWatching />
      </section>

      <div className="bg-[#080808] border inset-shadow-white-2xl border-white/5 rounded-[2.5rem] p-4 sm:p-8 md:p-12 shadow-white-2xl relative">
        <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
        </div>

        <div className="relative z-50 flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-2 z-10">
            <span className="block text-xs font-mono text-neutral-500 uppercase tracking-widest pl-1">
              Browse Library
            </span>
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white">
              {activeGenres.length > 0 ? (
                <span className="text-neutral-400">Filtered: </span>
              ) : (
                "Trending "
              )}
              {activeGenres.length > 0
                ? activeGenres.map((g) => g.name).join(" + ")
                : "Now"}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-[60]">
            <div className="relative">
              <button
                onClick={() => setIsGenreMenuOpen(!isGenreMenuOpen)}
                className={`
                  flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold tracking-wide transition-all border
                  ${
                    activeGenres.length > 0
                      ? "bg-white text-black border-white hover:bg-neutral-200"
                      : "bg-neutral-900 text-white border-white/10 hover:border-white/30"
                  }
                `}
              >
                <Filter size={16} />
                <span>GENRES</span>
                {activeGenres.length > 0 && (
                  <span className="bg-black text-white w-5 h-5 flex items-center justify-center rounded-full text-[10px]">
                    {activeGenres.length}
                  </span>
                )}
              </button>

              <GenreSelector
                isOpen={isGenreMenuOpen}
                activeGenres={activeGenres}
                onGenreToggle={toggleGenre}
                onClearGenres={clearGenres}
              />
            </div>

            {activeGenres.length > 0 && (
              <button
                onClick={() => {
                  clearGenres();
                  setIsGenreMenuOpen(false);
                }}
                className="p-3 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="relative z-0 space-y-8"
        >
          <div className="w-full border-b border-white/10 pb-1">
            <TabsList className="bg-transparent p-0 flex gap-6 md:gap-8 w-auto h-auto overflow-x-auto no-scrollbar">
              {["all", "movies", "tv"].map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="
                      relative px-0 py-4 bg-transparent
                      data-[state=active]:bg-transparent data-[state=active]:shadow-none
                      text-lg md:text-xl font-medium tracking-tight transition-colors
                      text-neutral-500 hover:text-neutral-300
                      data-[state=active]:text-white
                    "
                  >
                    <span className="flex items-center gap-2">
                      {tab === "all" && <LayoutGrid size={18} />}
                      {tab === "movies" && <Film size={18} />}
                      {tab === "tv" && <Tv size={18} />}
                      {tab === "all"
                        ? "All"
                        : tab === "movies"
                          ? "Movies"
                          : "TV Series"}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-[-5px] left-0 right-0 h-[2px] bg-white transform-gpu"
                      />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <div className="min-h-[500px]">
            <AnimatePresence mode="wait">
              {isLoading ? (
                renderSkeletons()
              ) : (
                <>
                  <TabsContent
                    value="all"
                    forceMount
                    hidden={activeTab !== "all"}
                    className="mt-0 focus-visible:outline-none"
                  >
                    {renderGrid(currentData)}
                  </TabsContent>
                  <TabsContent
                    value="movies"
                    forceMount
                    hidden={activeTab !== "movies"}
                    className="mt-0 focus-visible:outline-none"
                  >
                    {renderGrid(currentData)}
                  </TabsContent>
                  <TabsContent
                    value="tv"
                    forceMount
                    hidden={activeTab !== "tv"}
                    className="mt-0 focus-visible:outline-none"
                  >
                    {renderGrid(currentData)}
                  </TabsContent>
                </>
              )}
            </AnimatePresence>

            {error && !isLoading && (
              <div className="p-12 text-center text-red-400 font-mono tracking-widest bg-red-900/10 rounded-3xl border border-red-500/20">
                ERR: {error}
              </div>
            )}
          </div>
        </Tabs>

        <div className="mt-16 border-t border-white/5 pt-12">
          {!isLoading && currentData.length > 0 && (
            <HomePagination
              page={currentPage}
              setPage={handlePageChange}
              totalPages={currentTotalPages}
            />
          )}

          {activeGenres.length === 0 && !isLoading && (
            <div className="mt-20">
              <RecommendedMovies />
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showTopBtn && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-8 right-8 z-50 p-4 rounded-[1.5rem] bg-[#c3f0c2] text-[#07210b] shadow-xl hover:scale-110 active:scale-95 transition-transform transform-gpu will-change-transform"
          >
            <ArrowUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomeDisplay;
