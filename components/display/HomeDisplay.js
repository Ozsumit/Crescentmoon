"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  Filter,
  X,
  Film,
  Binoculars,
  Tv,
  ArrowUp,
  Sparkles,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import HomeCards from "./HomeCard";
import useGenreStore from "@/components/zustand";
import ContinueWatching from "../continuewatching";
import RecommendedMovies from "../recommended";
import GenreSelector from "@/components/filter/Filter";
import HomePagination from "../pagination/HomePagination";

// --- STATIC SKELETONS ---
const CardSkeleton = React.memo(() => (
  <div className="flex flex-col gap-2.5 contain-layout">
    <div className="w-full aspect-[2/3] bg-muted/60 rounded-2xl sm:rounded-[2rem] animate-pulse border border-border/40" />
    <div className="h-3.5 sm:h-4 w-3/4 bg-muted/60 rounded-full animate-pulse mt-1" />
    <div className="h-2.5 sm:h-3 w-1/3 bg-muted/50 rounded-full animate-pulse" />
  </div>
));
CardSkeleton.displayName = "CardSkeleton";

const PRECOMPILED_SKELETONS = Array.from({ length: 12 }).map((_, i) => (
  <CardSkeleton key={`skel-${i}`} />
));

// --- EXTRACTED GRID SUB-COMPONENT ---
const ContentGrid = React.memo(({ items }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5 sm:gap-6 xl:gap-8 z-20 contain-layout">
    {items.map((item) => (
      <HomeCards key={`${item.media_type}-${item.id}`} MovieCard={item} />
    ))}
  </div>
));
ContentGrid.displayName = "ContentGrid";

// --- MAIN COMPONENT ---
const HomeDisplay = ({ initialData = [] }) => {
  // SINGLE state for controlling the genre modal
  const [isGenreOpen, setIsGenreOpen] = useState(false);

  const { activeGenres, toggleGenre, clearGenres, activeProviders } =
    useGenreStore();

  // Helper logic to cleanly filter out future releases locally
  const isReleased = (item) => {
    const releaseStr = item.release_date || item.first_air_date;
    if (!releaseStr) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(releaseStr) <= today;
  };

  const [contentData, setContentData] = useState(() => ({
    movies: (initialData || []).filter(
      (i) => i.media_type === "movie" && isReleased(i),
    ),
    tvShows: (initialData || []).filter(
      (i) => i.media_type === "tv" && isReleased(i),
    ),
  }));

  const [activeTab, setActiveTab] = useState("all");
  const [pageData, setPageData] = useState({ movies: 1, tvShows: 1 });
  const [loading, setLoading] = useState({ movies: false, tvShows: false });
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState({ movies: 1, tvShows: 1 });

  const [showTopBtn, setShowTopBtn] = useState(false);

  const fetchedSignatures = useRef({
    movies: (initialData || []).length > 0 ? "1-" : null,
    tvShows: (initialData || []).length > 0 ? "1-" : null,
  });

  // Throttled Scroll Execution using requestAnimationFrame
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const pastThreshold = window.scrollY > 400;
          setShowTopBtn((prev) =>
            prev !== pastThreshold ? pastThreshold : prev,
          );
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const fetchContent = useCallback(async (type, page, genres, providers) => {
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    if (!apiKey) return;

    const genreString = (genres || []).map((g) => g.id).join(",");
    const providerString = (providers || []).join("|");
    const signature = `${page}-${genreString}-${providerString}`;

    if (fetchedSignatures.current[type] === signature) return;

    const isMovie = type === "movies";
    const baseUrl = isMovie ? "movie" : "tv";

    try {
      setLoading((prev) =>
        prev[type] === true ? prev : { ...prev, [type]: true },
      );
      setError(null);

      let url = "";
      if ((genres || []).length > 0 || (providers || []).length > 0) {
        url = `https://api.themoviedb.org/3/discover/${baseUrl}?api_key=${apiKey}&page=${page}&language=en-US&sort_by=popularity.desc`;
        if (genres?.length > 0) url += `&with_genres=${genreString}`;
        if (providers?.length > 0)
          url += `&with_watch_providers=${providerString}&watch_region=US`;
      } else {
        url = `https://api.themoviedb.org/3/${baseUrl}/popular?api_key=${apiKey}&page=${page}&language=en-US`;
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch ${type}`);
      const data = await response.json();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const processed = data.results
        .map((item) => ({
          ...item,
          media_type: isMovie ? "movie" : "tv",
          title: isMovie ? item.title : item.name,
          release_date: isMovie ? item.release_date : item.first_air_date,
        }))
        .filter((item) => {
          if (!item.release_date) return true;
          return new Date(item.release_date) <= today;
        });

      setContentData((prev) => ({ ...prev, [type]: processed }));
      setTotalPages((prev) => ({
        ...prev,
        [type]: Math.min(data.total_pages, 500),
      }));
      fetchedSignatures.current[type] = signature;
    } catch (err) {
      console.error(`Error fetching ${type}:`, err);
      setError(`Unable to load ${type}. Please try again later.`);
    } finally {
      setLoading((prev) => ({ ...prev, [type]: false }));
    }
  }, []);

  useEffect(() => {
    if (activeTab === "all") {
      fetchContent("movies", pageData.movies, activeGenres, activeProviders);
      fetchContent("tvShows", pageData.tvShows, activeGenres, activeProviders);
    } else {
      const currentType = activeTab === "movies" ? "movies" : "tvShows";
      fetchContent(
        currentType,
        pageData[currentType],
        activeGenres,
        activeProviders,
      );
    }
  }, [
    activeTab,
    activeGenres,
    activeProviders,
    pageData.movies,
    pageData.tvShows,
    fetchContent,
  ]);

  const handleTabChange = useCallback((value) => {
    setActiveTab(value);
  }, []);

  const handlePageChange = useCallback(
    (newPage) => {
      const currentType = activeTab === "movies" ? "movies" : "tvShows";
      setPageData((prev) => ({ ...prev, [currentType]: newPage }));
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [activeTab],
  );

  const mixedContent = useMemo(() => {
    return [...(contentData.movies || []), ...(contentData.tvShows || [])].sort(
      (a, b) => b.popularity - a.popularity,
    );
  }, [contentData.movies, contentData.tvShows]);

  const currentType =
    activeTab === "movies" ? "movies" : activeTab === "tv" ? "tvShows" : "all";
  const isLoading =
    activeTab === "all"
      ? loading.movies || loading.tvShows
      : loading[currentType];
  const currentData =
    activeTab === "all" ? mixedContent : contentData[currentType];

  const renderGrid = useCallback(
    (items) => (
      <div className="transform-gpu transition-opacity duration-300 ease-out animate-in fade-in">
        <ContentGrid items={items} />
      </div>
    ),
    [],
  );

  const renderSkeletons = useCallback(
    () => (
      <div className="w-full contain-paint">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-6 xl:gap-8">
          {PRECOMPILED_SKELETONS}
        </div>
      </div>
    ),
    [],
  );

  return (
    <div className="w-full max-w-[2400px] mx-auto px-3 sm:px-6 lg:px-12 pb-16 sm:pb-24 transform-gpu">
      <section className="mb-8 sm:mb-12">
        <ContinueWatching />
      </section>

      <div className="bg-card border border-border/80 rounded-2xl sm:rounded-[2.5rem] p-3.5 sm:p-8 md:p-12 shadow-xl sm:shadow-2xl relative contain-layout">
        {/* Background Texture */}
        <div className="absolute inset-0 rounded-2xl sm:rounded-[2.5rem] overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] transform-gpu" />
        </div>

        {/* HEADER & FILTER ACTION BAR */}
        <div className="relative z-40 flex flex-col sm:flex-row sm:items-end justify-between gap-4 sm:gap-8 mb-6 sm:mb-10">
          <div className="space-y-1 sm:space-y-2">
            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-black uppercase tracking-widest text-primary">
              <Sparkles size={13} />
              <span>Explore Content</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-6xl font-black tracking-tight sm:tracking-tighter text-foreground leading-tight">
              {activeGenres?.length > 0 ? (
                <span className="text-muted-foreground">Filtered </span>
              ) : (
                "Trending "
              )}
              {activeGenres?.length > 0
                ? activeGenres.map((g) => g.name).join(" + ")
                : "Now"}
            </h2>
          </div>

          {/* GENRE FILTER BUTTON & SELECTOR */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsGenreOpen((prev) => !prev)}
              className={`flex items-center gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-bold tracking-wide transition-all border ${
                activeGenres?.length > 0
                  ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                  : "bg-muted/80 text-foreground border-border hover:border-foreground/30 active:scale-95"
              }`}
            >
              <Filter size={14} className="sm:w-4 sm:h-4" />
              <span>GENRES</span>
              {activeGenres?.length > 0 && (
                <span className="bg-primary-foreground text-primary w-4 sm:w-5 h-4 sm:h-5 flex items-center justify-center rounded-full text-[10px] sm:text-xs font-black">
                  {activeGenres.length}
                </span>
              )}
            </button>

            {/* GENRE SELECTOR PORTAL */}
            <GenreSelector
              isOpen={isGenreOpen}
              onClose={() => setIsGenreOpen(false)}
              activeGenres={activeGenres}
              onGenreToggle={toggleGenre}
              onClearGenres={clearGenres}
            />

            {activeGenres?.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  clearGenres();
                  setIsGenreOpen(false);
                }}
                className="p-2.5 sm:p-3 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors active:scale-95"
                aria-label="Clear genres"
              >
                <X size={16} className="sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        </div>

        {/* CATEGORY TABS */}
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="relative z-10 space-y-6 sm:space-y-8"
        >
          <div className="w-full border-b border-border/80 overflow-x-auto scrollbar-none">
            <TabsList className="bg-transparent p-0 flex gap-6 sm:gap-8 w-max h-auto">
              {["all", "movies", "tv"].map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="relative px-1 py-3 sm:py-4 bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none text-base sm:text-xl font-semibold tracking-tight transition-colors text-muted-foreground hover:text-foreground/80 data-[state=active]:text-foreground shrink-0"
                  >
                    <span className="flex items-center gap-2">
                      {tab === "all" ? (
                        <Binoculars size={16} className="sm:w-5 sm:h-5" />
                      ) : tab === "movies" ? (
                        <Film size={16} className="sm:w-5 sm:h-5" />
                      ) : (
                        <Tv size={16} className="sm:w-5 sm:h-5" />
                      )}
                      {tab === "all"
                        ? "Discover"
                        : tab === "movies"
                          ? "Movies"
                          : "TV Series"}
                    </span>
                    {isActive && (
                      <div className="absolute bottom-[-1px] left-0 right-0 h-[2.5px] bg-primary rounded-full transition-all duration-300 transform-gpu" />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* MAIN GRID DISPLAY AREA */}
          <div className="min-h-[400px] sm:min-h-[500px] contain-paint">
            {isLoading ? (
              renderSkeletons()
            ) : (
              <>
                <TabsContent
                  value="all"
                  className="mt-0 focus-visible:outline-none"
                >
                  {renderGrid(mixedContent)}
                </TabsContent>
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

            {error && !isLoading && (
              <div className="p-8 sm:p-12 text-center text-destructive font-mono text-xs sm:text-sm tracking-widest bg-destructive/10 rounded-2xl sm:rounded-3xl border border-destructive/20">
                ERR: {error}
              </div>
            )}
          </div>
        </Tabs>

        {/* PAGINATION & RECOMMENDED SECTION */}
        <div className="mt-10 sm:mt-16 border-t border-border/80 pt-8 sm:pt-12">
          {activeTab !== "all" &&
            !isLoading &&
            (currentData || []).length > 0 && (
              <HomePagination
                page={pageData[currentType]}
                setPage={handlePageChange}
                totalPages={totalPages[currentType]}
              />
            )}

          {(activeGenres || []).length === 0 && !isLoading && (
            <div className="mt-12 sm:mt-20">
              <RecommendedMovies />
            </div>
          )}
        </div>
      </div>

      {/* FLOATING BACK TO TOP BUTTON */}
      {showTopBtn && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-4 sm:bottom-8 sm:right-8 z-50 p-3 sm:p-4 rounded-full sm:rounded-[1.5rem] bg-primary text-primary-foreground shadow-2xl hover:scale-110 active:scale-95 transition-transform transform-gpu animate-in zoom-in duration-300 border border-primary-foreground/20"
          aria-label="Back to top"
        >
          <ArrowUp size={20} className="sm:w-6 sm:h-6" />
        </button>
      )}

      <style jsx global>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default HomeDisplay;
 