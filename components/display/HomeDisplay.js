"use client";

import React, { useState, useEffect } from "react";
import { Filter, X, Film, Tv, ArrowUp } from "lucide-react";
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
const HomeDisplay = () => {
  const { activeGenres, toggleGenre, clearGenres } = useGenreStore();
  const [contentData, setContentData] = useState({ movies: [], tvShows: [] });
  const [activeTab, setActiveTab] = useState("movies");
  const [pageData, setPageData] = useState({ movies: 1, tvShows: 1 });
  const [loading, setLoading] = useState({ movies: false, tvShows: false });
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState({ movies: 1, tvShows: 1 });
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
      setLoading((prev) => ({ ...prev, [type]: true }));
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
      if (!response.ok) throw new Error(`Failed to fetch ${type}`);

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
      setLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  useEffect(() => {
    const currentType = activeTab === "movies" ? "movies" : "tvShows";
    fetchContent(currentType, pageData[currentType], activeGenres);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    activeTab,
    activeGenres,
    pageData[activeTab === "movies" ? "movies" : "tvShows"],
  ]);

  const handleTabChange = (value) => {
    setActiveTab(value);
  };

  const handlePageChange = (newPage) => {
    const currentType = activeTab === "movies" ? "movies" : "tvShows";
    setPageData((prev) => ({ ...prev, [currentType]: newPage }));
  };

  const currentType = activeTab === "movies" ? "movies" : "tvShows";
  const isLoading = loading[currentType];
  const currentData = contentData[currentType];

  // --- RENDER HELPERS ---
  const renderGrid = (items) => (
    <motion.div
      key={pageData[currentType]}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
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
      {/* 1. Continue Watching Section */}
      <section className="mb-12">
        <ContinueWatching />
      </section>

      {/* 
         2. Main Discovery Surface 
         FIX: Removed 'overflow-hidden' so dropdowns can float outside.
      */}
      <div className="bg-[#080808] border border-white/5 rounded-[2.5rem] p-4 sm:p-8 md:p-12 shadow-2xl relative">
        {/* 
          FIX: Added a dedicated background container with overflow-hidden and rounded corners.
          This clips the background noise image without clipping UI elements (like the dropdown).
        */}
        <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
        </div>

        {/* 
          --- HEADER BLOCK --- 
          FIX: Increased z-index to z-50 to ensure header (and dropdown) sits above the Tabs/Grid.
        */}
        <div className="relative z-50 flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          {/* Typography */}
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

          {/* Controls Cluster */}
          <div className="flex flex-wrap items-center gap-3 relative z-[60]">
            {/* Filter Pill Container */}
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

            {/* Clear All 'X' Button */}
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

        {/* 
          --- TABS & CONTENT --- 
          FIX: Lowered z-index to z-0 so it sits below the header.
        */}
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="relative z-0 space-y-8"
        >
          {/* Tabs List */}
          <div className="w-full border-b border-white/10 pb-1">
            <TabsList className="bg-transparent p-0 flex gap-8 w-auto h-auto">
              {["movies", "tv"].map((tab) => {
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
                      {tab === "movies" ? <Film size={18} /> : <Tv size={18} />}
                      {tab === "movies" ? "Movies" : "TV Series"}
                    </span>
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-[-5px] left-0 right-0 h-[2px] bg-white"
                      />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Tab Contents */}
          <div className="min-h-[500px]">
            {isLoading ? (
              renderSkeletons()
            ) : (
              <>
                <TabsContent
                  value="movies"
                  className="mt-0 focus-visible:outline-none"
                >
                  {renderGrid(contentData.movies)}
                </TabsContent>

                <TabsContent
                  value="tv"
                  className="mt-0 focus-visible:outline-none"
                >
                  {renderGrid(contentData.tvShows)}
                </TabsContent>
              </>
            )}

            {/* Error Message */}
            {error && !isLoading && (
              <div className="p-12 text-center text-red-400 font-mono tracking-widest bg-red-900/10 rounded-3xl border border-red-500/20">
                ERR: {error}
              </div>
            )}
          </div>
        </Tabs>

        {/* --- FOOTER: PAGINATION & RECCOMENDATION --- */}
        <div className="mt-16 border-t border-white/5 pt-12">
          {!isLoading && currentData.length > 0 && (
            <HomePagination
              page={pageData[currentType]}
              setPage={handlePageChange}
              totalPages={totalPages[currentType]}
            />
          )}

          {activeGenres.length === 0 && !isLoading && (
            <div className="mt-20">
              <RecommendedMovies />
            </div>
          )}
        </div>
      </div>

      {/* FAB - Scroll to Top */}
      <AnimatePresence>
        {showTopBtn && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-8 right-8 z-50 p-4 rounded-[1.5rem] bg-[#c3f0c2] text-[#07210b] shadow-xl hover:scale-110 active:scale-95 transition-transform"
          >
            <ArrowUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomeDisplay;
