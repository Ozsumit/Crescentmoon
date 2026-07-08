"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { Filter, X, Film, Binoculars, Tv, ArrowUp } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import HomeCards from "./HomeCard";
import useGenreStore from "@/components/zustand";
import ContinueWatching from "../continuewatching";
import RecommendedMovies from "../recommended";
import GenreSelector from "@/components/filter/Filter";
import HorizontalHomeCard from "./HorHomeCards";
import HomePagination from "../pagination/HomePagination";

// --- STATIC SKELETONS ---
const CardSkeleton = React.memo(() => (
  <div className="flex flex-col gap-3 contain-layout">
    <div className="w-full aspect-[2/3] bg-muted rounded-[2rem] animate-pulse border border-border" />
    <div className="h-4 w-3/4 bg-muted rounded-full animate-pulse" />
    <div className="h-3 w-1/4 bg-muted rounded-full animate-pulse" />
  </div>
));
CardSkeleton.displayName = "CardSkeleton";

const HorizontalCardSkeleton = React.memo(() => (
  <div className="flex gap-4 h-40 p-2 bg-muted/30 rounded-[2rem] border border-border contain-layout">
    <div className="w-28 h-full bg-muted rounded-[1.5rem] animate-pulse" />
    <div className="flex-1 flex flex-col justify-center gap-3">
      <div className="h-6 w-3/4 bg-muted rounded-full animate-pulse" />
      <div className="h-4 w-1/3 bg-muted rounded-full animate-pulse" />
    </div>
  </div>
));
HorizontalCardSkeleton.displayName = "HorizontalCardSkeleton";

const PRECOMPILED_SKELETONS = Array.from({ length: 20 }).map((_, i) => (
  <CardSkeleton key={`skel-${i}`} />
));
const PRECOMPILED_HOR_SKELETONS = Array.from({ length: 8 }).map((_, i) => (
  <HorizontalCardSkeleton key={`h-skel-${i}`} />
));

// --- EXTRACTED GRID SUB-COMPONENTS TO INSULATE RENDERS ---
const DesktopGrid = React.memo(({ items }) => (
  <div className="hidden lg:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 2xl:grid-cols-5 gap-6 xl:gap-8 z-20 contain-layout">
    {items.map((item) => (
      <HomeCards key={`${item.media_type}-${item.id}`} MovieCard={item} />
    ))}
  </div>
));
DesktopGrid.displayName = "DesktopGrid";

const MobileGrid = React.memo(({ items }) => (
  <div className="grid lg:hidden grid-cols-1 gap-4 contain-layout">
    {items.map((item) => (
      <HorizontalHomeCard
        key={`${item.media_type}-${item.id}`}
        MovieCard={item}
      />
    ))}
  </div>
));
MobileGrid.displayName = "MobileGrid";

// --- MAIN COMPONENT ---
const HomeDisplay = ({ initialData = [] }) => {
  const { activeGenres, toggleGenre, clearGenres } = useGenreStore();

  // Helper logic to cleanly filter out future releases locally
  const isReleased = (item) => {
    const releaseStr = item.release_date || item.first_air_date;
    if (!releaseStr) return true; // Keep if no date available fallback

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(releaseStr) <= today;
  };

  const [contentData, setContentData] = useState(() => ({
    movies: initialData.filter(
      (i) => i.media_type === "movie" && isReleased(i),
    ),
    tvShows: initialData.filter((i) => i.media_type === "tv" && isReleased(i)),
  }));

  const [activeTab, setActiveTab] = useState("all");
  const [pageData, setPageData] = useState({ movies: 1, tvShows: 1 });
  const [loading, setLoading] = useState({ movies: false, tvShows: false });
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState({ movies: 1, tvShows: 1 });

  const [isGenreMenuOpen, setIsGenreMenuOpen] = useState(false);
  const [showTopBtn, setShowTopBtn] = useState(false);

  const fetchedSignatures = useRef({
    movies: initialData.length > 0 ? "1-" : null,
    tvShows: initialData.length > 0 ? "1-" : null,
  });

  // FIXED: Throttled Scroll Execution using requestAnimationFrame
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const pastThreshold = window.scrollY > 500;
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

  const fetchContent = useCallback(async (type, page, genres) => {
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    const genreString = genres.map((g) => g.id).join(",");
    const signature = `${page}-${genreString}`;

    if (fetchedSignatures.current[type] === signature) return;

    const isMovie = type === "movies";
    const baseUrl = isMovie ? "movie" : "tv";

    try {
      setLoading((prev) =>
        prev[type] === true ? prev : { ...prev, [type]: true },
      );
      setError(null);

      const url =
        genres.length > 0
          ? `https://api.themoviedb.org/3/discover/${baseUrl}?api_key=${apiKey}&with_genres=${genreString}&page=${page}&language=en-US&sort_by=popularity.desc`
          : `https://api.themoviedb.org/3/${baseUrl}/popular?api_key=${apiKey}&page=${page}&language=en-US`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch ${type}`);
      const data = await response.json();

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Map profiles and enforce date exclusions matching your timestamp setup
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
      fetchContent("movies", pageData.movies, activeGenres);
      fetchContent("tvShows", pageData.tvShows, activeGenres);
    } else {
      const currentType = activeTab === "movies" ? "movies" : "tvShows";
      fetchContent(currentType, pageData[currentType], activeGenres);
    }
  }, [
    activeTab,
    activeGenres,
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
    return [...contentData.movies, ...contentData.tvShows].sort(
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
      <div className="transform-gpu contain-paint transition-opacity duration-300 ease-out animate-in fade-in">
        <DesktopGrid items={items} />
        <MobileGrid items={items} />
      </div>
    ),
    [],
  );

  const renderSkeletons = useCallback(
    () => (
      <div className="w-full contain-paint">
        <div className="hidden lg:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-6 xl:gap-8">
          {PRECOMPILED_SKELETONS}
        </div>
        <div className="grid lg:hidden grid-cols-1 gap-4">
          {PRECOMPILED_HOR_SKELETONS}
        </div>
      </div>
    ),
    [],
  );

  return (
    <div className="w-full max-w-[2400px] mx-auto px-2 sm:px-6 lg:px-12 pb-24 transform-gpu">
      <section className="mb-12">
        <ContinueWatching />
      </section>

      <div className="bg-card border border-border rounded-[2.5rem] p-4 sm:p-8 md:p-12 shadow-2xl relative contain-layout">
        <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none z-0">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] transform-gpu" />
        </div>

        <div className="relative z-40 flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-2">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground">
              {activeGenres.length > 0 ? (
                <span className="text-muted-foreground">Filtered: </span>
              ) : (
                "Trending "
              )}
              {activeGenres.length > 0
                ? activeGenres.map((g) => g.name).join(" + ")
                : "Now"}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 relative z-[50]">
            <div className="relative">
              <button
                onClick={() => setIsGenreMenuOpen(!isGenreMenuOpen)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-bold tracking-wide transition-all border ${
                  activeGenres.length > 0
                    ? "bg-primary text-primary-foreground border-primary hover:opacity-90"
                    : "bg-muted text-foreground border-border hover:border-foreground/30"
                }`}
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

        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="relative z-10 space-y-8"
        >
          <div className="w-full border-b border-border pb-1">
            <TabsList className="bg-transparent p-0 flex gap-8 w-auto h-auto">
              {["all", "movies", "tv"].map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="relative px-0 py-4 bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none text-lg md:text-xl font-medium tracking-tight transition-colors text-muted-foreground hover:text-foreground/80 data-[state=active]:text-foreground"
                  >
                    <span className="flex items-center gap-2">
                      {tab === "all" ? (
                        <Binoculars size={18} />
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
                      <div className="absolute bottom-[-5px] left-0 right-0 h-[2px] bg-primary transition-all duration-300 transform-gpu" />
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <div className="min-h-[500px] contain-paint">
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
              <div className="p-12 text-center text-destructive font-mono tracking-widest bg-destructive/10 rounded-3xl border border-destructive/20">
                ERR: {error}
              </div>
            )}
          </div>
        </Tabs>

        <div className="mt-16 border-t border-border pt-12">
          {activeTab !== "all" && !isLoading && currentData.length > 0 && (
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

      {showTopBtn && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 z-50 p-4 rounded-[1.5rem] bg-primary text-primary-foreground shadow-xl hover:scale-110 active:scale-95 transition-transform transform-gpu animate-in zoom-in duration-300"
        >
          <ArrowUp size={24} />
        </button>
      )}
    </div>
  );
};

export default HomeDisplay;
