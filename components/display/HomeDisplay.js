"use client";

import React, { useState, useEffect } from "react";
import { Filter, X, Film, Binoculars, Tv, ArrowUp } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import HomeCards from "./HomeCard";
import useGenreStore from "@/components/zustand";
import ContinueWatching from "../continuewatching";
import RecommendedMovies from "../recommended";
import GenreSelector from "@/components/filter/Filter";
import HorizontalHomeCard from "./HorHomeCards";
import HomePagination from "../pagination/HomePagination";
import { motion, AnimatePresence } from "framer-motion";

// --- SKELETONS ---
const CardSkeleton = () => (
  <div className="flex flex-col gap-3">
    <div className="w-full aspect-[2/3] bg-neutral-900/50 rounded-[2rem] animate-pulse border border-white/5" />
    <div className="h-4 w-3/4 bg-neutral-900/50 rounded-full animate-pulse" />
    <div className="h-3 w-1/4 bg-neutral-900/50 rounded-full animate-pulse" />
  </div>
);

const HorizontalCardSkeleton = () => (
  <div className="flex gap-4 h-40 p-2 bg-neutral-900/30 rounded-[2rem] border border-white/5">
    <div className="w-28 h-full bg-neutral-800/50 rounded-[1.5rem] animate-pulse" />
    <div className="flex-1 flex flex-col justify-center gap-3">
      <div className="h-6 w-3/4 bg-neutral-800/50 rounded-full animate-pulse" />
      <div className="h-4 w-1/3 bg-neutral-800/50 rounded-full animate-pulse" />
    </div>
  </div>
);

// --- MAIN COMPONENT ---
const HomeDisplay = ({ initialData = [] }) => {
  const { activeGenres, toggleGenre, clearGenres } = useGenreStore();

  const [contentData, setContentData] = useState({
    movies: initialData.filter(i => i.media_type === "movie"),
    tvShows: initialData.filter(i => i.media_type === "tv"),
    all: initialData
  });

  // DEFAULT TAB = ALL
  const [activeTab, setActiveTab] = useState("all");

  const [pageData, setPageData] = useState({
    movies: 1,
    tvShows: 1,
  });

  const [loading, setLoading] = useState({
    movies: false,
    tvShows: false,
  });

  const [error, setError] = useState(null);

  const [totalPages, setTotalPages] = useState({
    movies: 1,
    tvShows: 1,
  });

  const [isGenreMenuOpen, setIsGenreMenuOpen] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowTopBtn(window.scrollY > 500);

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchContent = async (type, page, genres) => {
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

    const isMovie = type === "movies";
    const baseUrl = isMovie ? "movie" : "tv";

    try {
      setLoading((prev) => ({
        ...prev,
        [type]: true,
      }));

      setError(null);

      const url =
        genres.length > 0
          ? `https://api.themoviedb.org/3/discover/${
              isMovie ? "movie" : "tv"
            }?api_key=${apiKey}&with_genres=${genres
              .map((g) => g.id)
              .join(",")}&page=${page}&language=en-US&sort_by=popularity.desc`
          : `https://api.themoviedb.org/3/${baseUrl}/popular?api_key=${apiKey}&page=${page}&language=en-US`;

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${type}`);
      }

      const data = await response.json();

      const processed = data.results.map((item) => ({
        ...item,
        media_type: isMovie ? "movie" : "tv",
        title: isMovie ? item.title : item.name,
        release_date: isMovie ? item.release_date : item.first_air_date,
      }));

      setContentData((prev) => ({
        ...prev,
        [type]: processed,
      }));

      setTotalPages((prev) => ({
        ...prev,
        [type]: Math.min(data.total_pages, 500),
      }));
    } catch (err) {
      console.error(`Error fetching ${type}:`, err);

      setError(`Unable to load ${type}. Please try again later.`);
    } finally {
      setLoading((prev) => ({
        ...prev,
        [type]: false,
      }));
    }
  };

  // FETCH LOGIC
  useEffect(() => {
    // Skip initial fetch if initialData is provided and it's the first render for "all" tab
    if (activeTab === "all" && initialData.length > 0 && contentData.all?.length > 0 && activeGenres.length === 0 && pageData.movies === 1 && pageData.tvShows === 1) {
      // Data already initialized from props
      return;
    }

    if (activeTab === "all") {
      fetchContent("movies", pageData.movies, activeGenres);
      fetchContent("tvShows", pageData.tvShows, activeGenres);
    } else {
      const currentType = activeTab === "movies" ? "movies" : "tvShows";

      fetchContent(currentType, pageData[currentType], activeGenres);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, activeGenres, pageData.movies, pageData.tvShows]);

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  const handlePageChange = (newPage) => {
    const currentType = activeTab === "movies" ? "movies" : "tvShows";

    setPageData((prev) => ({
      ...prev,
      [currentType]: newPage,
    }));
  };

  // MIXED CONTENT
  const mixedContent = [...contentData.movies, ...contentData.tvShows].sort(
    (a, b) => b.popularity - a.popularity,
  );

  const currentType =
    activeTab === "movies" ? "movies" : activeTab === "tv" ? "tvShows" : "all";

  const isLoading =
    activeTab === "all"
      ? loading.movies || loading.tvShows
      : loading[currentType];

  const currentData =
    activeTab === "all" ? mixedContent : contentData[currentType];

  // --- RENDER HELPERS ---
  const renderGrid = (items) => (
    <motion.div
      key={`${activeTab}-${pageData.movies}-${pageData.tvShows}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {/* Desktop Grid */}
      <div className="hidden lg:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 2xl:grid-cols-5 gap-6 xl:gap-8 z-20">
        {items.map((item) => (
          <HomeCards key={`${item.media_type}-${item.id}`} MovieCard={item} />
        ))}
      </div>

      {/* Mobile Horizontal List */}
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
    <div className="w-full">
      <div className="hidden lg:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-6 xl:gap-8">
        {Array.from({ length: 20 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      <div className="grid lg:hidden grid-cols-1 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <HorizontalCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-[2400px] mx-auto px-2 sm:px-6 lg:px-12 pb-24">
      {/* Continue Watching */}
      <section className="mb-12">
        <ContinueWatching />
      </section>

      {/* Main Surface */}
      <div className="bg-card border border-border rounded-[2.5rem] p-4 sm:p-8 md:p-12 shadow-2xl relative">
        {/* Background */}
        <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
        </div>

        {/* Header */}
        <div className="relative z-50 flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          {/* Typography */}
          <div className="space-y-2 z-10">
            <span className="block text-xs font-mono text-muted-foreground uppercase tracking-widest pl-1">
              Browse Library
            </span>

            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground">
              {activeGenres.length > 0 ? (
                <span className="text-muted-foreground">Filtered:</span>
              ) : (
                "Trending "
              )}

              {activeGenres.length > 0
                ? activeGenres.map((g) => g.name).join(" + ")
                : "Now"}
            </h2>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center gap-3 relative z-[60]">
            {/* Genre Button */}
            <div className="relative">
              <button
                onClick={() => setIsGenreMenuOpen(!isGenreMenuOpen)}
                className={`
                  flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold tracking-wide transition-all border
                  ${
                    activeGenres.length > 0
                      ? "bg-primary text-primary-foreground border-primary hover:opacity-90"
                      : "bg-muted text-foreground border-border hover:border-foreground/30"
                  }
                `}
              >
                <Filter size={16} />

                <span>GENRES</span>

                {activeGenres.length > 0 && (
                  <span className="bg-primary-foreground text-primary w-5 h-5 flex items-center justify-center rounded-full text-[10px]">
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

            {/* Clear Genres */}
            {activeGenres.length > 0 && (
              <button
                onClick={() => {
                  clearGenres();
                  setIsGenreMenuOpen(false);
                }}
                className="p-3 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="relative z-0 space-y-8"
        >
          {/* Tab List */}
          <div className="w-full border-b border-border pb-1">
            <TabsList className="bg-transparent p-0 flex gap-8 w-auto h-auto">
              {["all", "movies", "tv"].map((tab) => {
                const isActive = activeTab === tab;

                return (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="
                      relative px-0 py-4 bg-transparent 
                      data-[state=active]:bg-transparent 
                      data-[state=active]:shadow-none 
                      text-lg md:text-xl font-medium tracking-tight transition-colors
                      text-muted-foreground hover:text-foreground/80
                      data-[state=active]:text-foreground
                    "
                  >
                    <span className="flex items-center gap-2">
                      {tab === "all" ? (
                        <>
                          <Binoculars size={18} />
                        </>
                      ) : tab === "movies" ? (
                        <Film size={18} />
                      ) : (
                        <Tv size={18} />
                      )}

                      {tab === "all"
                        ? "Discover"
                        : tab === "movies"
                          ? "Movies"
                          : "TV Series"}
                    </span>

                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-[-5px] left-0 right-0 h-[2px] bg-primary"
                      />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Content */}
          <div className="min-h-[500px]">
            {isLoading ? (
              renderSkeletons()
            ) : (
              <>
                {/* ALL */}
                <TabsContent
                  value="all"
                  className="mt-0 focus-visible:outline-none"
                >
                  {renderGrid(mixedContent)}
                </TabsContent>

                {/* MOVIES */}
                <TabsContent
                  value="movies"
                  className="mt-0 focus-visible:outline-none"
                >
                  {renderGrid(contentData.movies)}
                </TabsContent>

                {/* TV */}
                <TabsContent
                  value="tv"
                  className="mt-0 focus-visible:outline-none"
                >
                  {renderGrid(contentData.tvShows)}
                </TabsContent>
              </>
            )}

            {/* Error */}
            {error && !isLoading && (
              <div className="p-12 text-center text-red-400 font-mono tracking-widest bg-red-900/10 rounded-3xl border border-red-500/20">
                ERR: {error}
              </div>
            )}
          </div>
        </Tabs>

        {/* Footer */}
        <div className="mt-16 border-t border-border pt-12">
          {/* Hide Pagination on Mixed View */}
          {activeTab !== "all" && !isLoading && currentData.length > 0 && (
            <HomePagination
              page={pageData[currentType]}
              setPage={handlePageChange}
              totalPages={totalPages[currentType]}
            />
          )}

          {/* Recommendations */}
          {activeGenres.length === 0 && !isLoading && (
            <div className="mt-20">
              <RecommendedMovies />
            </div>
          )}
        </div>
      </div>

      {/* Scroll To Top */}
      <AnimatePresence>
        {showTopBtn && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
            className="fixed bottom-8 right-8 z-50 p-4 rounded-[1.5rem] bg-primary text-primary-foreground shadow-xl hover:scale-110 active:scale-95 transition-transform"
          >
            <ArrowUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomeDisplay;
