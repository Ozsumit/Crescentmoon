"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Filter, X } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import HomeCards from "./HomeCard";
import useGenreStore from "@/components/zustand";
import ContinueWatching from "../continuewatching";
import RecommendedMovies from "../recommended";
import GenreSelector from "@/components/filter/Filter";
import HorizontalHomeCard from "./HorHomeCards";
import HomePagination from "../pagination/HomePagination";

// Loading Components
const CardSkeleton = () => (
  <div className="flex flex-col gap-2">
    <div className="w-full aspect-[2/3] bg-slate-700 rounded-lg animate-pulse" />
    <div className="h-4 w-3/4 bg-slate-700 rounded animate-pulse" />
    <div className="h-4 w-1/2 bg-slate-700 rounded animate-pulse" />
  </div>
);

const HorizontalCardSkeleton = () => (
  <div className="flex gap-4 h-40">
    <div className="w-28 h-full bg-slate-700 rounded-lg animate-pulse" />
    <div className="flex-1 flex flex-col gap-2">
      <div className="h-6 w-3/4 bg-slate-700 rounded animate-pulse" />
      <div className="h-4 w-1/2 bg-slate-700 rounded animate-pulse" />
      <div className="h-20 w-full bg-slate-700 rounded animate-pulse" />
    </div>
  </div>
);

const ContentSkeleton = ({ count = 10 }) => (
  <div className="w-full px-2 sm:px-4 md:px-6 mb-8 mt-12 lg:px-8 xl:px-12">
    <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
      {/* Continue Watching Skeleton */}
      <div className="p-4 sm:p-6">
        <div className="h-6 w-48 bg-slate-700 rounded-lg animate-pulse mb-4" />
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex-shrink-0 w-48 h-64">
              <div className="w-full h-full bg-slate-700 rounded-lg animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 sm:p-6 md:p-8">
        <div className="h-8 w-64 mx-auto bg-slate-700 rounded-lg animate-pulse mb-6" />
        <div className="flex justify-end mb-6">
          <div className="h-10 w-32 bg-slate-700 rounded-md animate-pulse" />
        </div>
        <div className="flex justify-center mb-6">
          <div className="flex bg-slate-700 rounded-lg overflow-hidden">
            <div className="h-10 w-24 bg-slate-600 animate-pulse" />
            <div className="h-10 w-24 bg-slate-700 animate-pulse" />
          </div>
        </div>
        <div className="hidden lg:grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4">
          {Array.from({ length: count }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <div className="grid lg:hidden grid-cols-1 gap-4">
          {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
            <HorizontalCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

const LoadingIndicator = () => (
  <div className="w-full flex justify-center p-4">
    <div className="animate-pulse flex space-x-2">
      <div className="h-2 w-2 bg-indigo-400 rounded-full"></div>
      <div className="h-2 w-2 bg-indigo-400 rounded-full animate-pulse delay-100"></div>
      <div className="h-2 w-2 bg-indigo-400 rounded-full animate-pulse delay-200"></div>
    </div>
  </div>
);

const ErrorDisplay = ({ message }) => (
  <div className="w-full px-2 sm:px-4 md:px-6 mb-8 mt-12 lg:px-8 xl:px-12">
    <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden p-8">
      <div className="text-center py-8 text-red-500">{message}</div>
    </div>
  </div>
);

// Main Component
const HomeDisplay = () => {
  const { activeGenres, toggleGenre, clearGenres } = useGenreStore();
  const [contentData, setContentData] = useState({
    movies: [],
    tvShows: [],
  });
  const [activeTab, setActiveTab] = useState("movies");
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

  const fetchContent = async (type, page, genres) => {
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    const isMovie = type === "movies";
    const baseUrl = isMovie ? "movie" : "tv";
    
    try {
      setLoading(prev => ({ ...prev, [type]: true }));
      setError(null);

      const url = genres.length > 0
        ? `https://api.themoviedb.org/3/discover/${isMovie ? 'movie' : 'tv'}?api_key=${apiKey}&with_genres=${genres.map(g => g.id).join(",")}&page=${page}&language=en-US&sort_by=popularity.desc`
        : `https://api.themoviedb.org/3/${baseUrl}/popular?api_key=${apiKey}&page=${page}&language=en-US`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch ${type}`);
      
      const data = await response.json();
      const processed = data.results.map(item => ({
        ...item,
        media_type: isMovie ? "movie" : "tv",
        title: isMovie ? item.title : item.name,
        release_date: isMovie ? item.release_date : item.first_air_date,
      }));

      setContentData(prev => ({
        ...prev,
        [type]: page === 1 ? processed : [...prev[type], ...processed],
      }));

      setTotalPages(prev => ({
        ...prev,
        [type]: data.total_pages,
      }));

    } catch (err) {
      console.error(`Error fetching ${type}:`, err);
      setError(`Unable to load ${type}. Please try again later.`);
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  useEffect(() => {
    const currentType = activeTab === "movies" ? "movies" : "tvShows";
    fetchContent(currentType, pageData[currentType], activeGenres);
  }, [activeTab, activeGenres, pageData[activeTab === "movies" ? "movies" : "tvShows"]]);

  const handleTabChange = (value) => {
    setActiveTab(value);
    const contentType = value === "movies" ? "movies" : "tvShows";
    if (contentData[contentType].length === 0) {
      setPageData(prev => ({
        ...prev,
        [contentType]: 1
      }));
    }
  };

  const handlePageChange = (newPage) => {
    const currentType = activeTab === "movies" ? "movies" : "tvShows";
    setPageData(prev => ({
      ...prev,
      [currentType]: newPage
    }));
  };

  const handleClearFilters = () => {
    clearGenres();
    setPageData({ movies: 1, tvShows: 1 });
    setContentData({ movies: [], tvShows: [] });
  };

  const renderContent = (contentList) => (
    <>
      <div className="hidden lg:grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4">
        {contentList.map((item) => (
          <HomeCards
            key={`${item.media_type}-${item.id}`}
            MovieCard={item}
            className="h-[300px] sm:h-[360px] lg:h-[420px]"
          />
        ))}
      </div>
      <div className="grid lg:hidden grid-cols-1 gap-4">
        {contentList.map((item) => (
          <HorizontalHomeCard
            key={`${item.media_type}-${item.id}`}
            MovieCard={item}
            className="h-[300px] sm:h-[360px] lg:h-[420px]"
          />
        ))}
      </div>
      {loading[activeTab === "movies" ? "movies" : "tvShows"] && <LoadingIndicator />}
    </>
  );

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  const currentType = activeTab === "movies" ? "movies" : "tvShows";
  const isInitialLoading = contentData[currentType].length === 0 && loading[currentType];

  if (isInitialLoading) {
    return <ContentSkeleton />;
  }

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 mb-8 mt-12 lg:px-8 xl:px-12">
      <div className="bg-slate-900/70 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
        <ContinueWatching />
        <div className="p-4 sm:p-6 md:p-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-600 truncate">
            {activeGenres.length > 0
              ? `${activeGenres.map((g) => g.name).join(", ")} Content`
              : "Popular Content"}
          </h2>

          <div className="flex flex-col items-center space-y-4 mb-6">
            <div className="flex flex-wrap justify-end items-right gap-2 sm:gap-4">
              <button
                onClick={() => setIsGenreMenuOpen(!isGenreMenuOpen)}
                className="flex items-center space-x-2 bg-indigo-600/80 text-white px-3 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm">Filter Genres</span>
                {activeGenres.length > 0 && (
                  <span className="ml-2 bg-white text-indigo-600 rounded-full px-2 py-0.5 text-xs">
                    {activeGenres.length}
                  </span>
                )}
              </button>

              {activeGenres.length > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="text-slate-400 hover:text-white flex items-center space-x-1 text-xs sm:text-sm"
                >
                  <X className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>Clear Filters</span>
                </button>
              )}
            </div>

            <GenreSelector
              isOpen={isGenreMenuOpen}
              activeGenres={activeGenres}
              onGenreToggle={toggleGenre}
              onClearGenres={clearGenres}
            />
          </div>

          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full"
          >
            <TabsList className="flex bg-slate-700 justify-center p-0 text-gray-300 w-min mb-6">
              <TabsTrigger 
                value="movies"
                className="text-sm sm:text-base px-4 py-2 rounded-t-lg focus:outline-none"
              >
                Movies
              </TabsTrigger>
              <TabsTrigger 
                value="tv"
                className="text-sm sm:text-base px-4 py-2 rounded-t-lg focus:outline-none"
              >
                TV Shows
              </TabsTrigger>
            </TabsList>

            <TabsContent value="movies" className="focus-visible:outline-none">
              {renderContent(contentData.movies)}
            </TabsContent>

            <TabsContent value="tv" className="focus-visible:outline-none">
              {renderContent(contentData.tvShows)}
            </TabsContent>

            <HomePagination
              page={pageData[currentType]}
              setPage={handlePageChange}
              totalPages={totalPages[currentType]}
            />

            {activeGenres.length === 0 && <RecommendedMovies />}
          </Tabs>

          {/* Back to top button */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className={`fixed bottom-4 right-4 bg-indigo-600/80 text-white p-2 rounded-full shadow-lg transition-opacity duration-300 hover:bg-indigo-700 ${
              pageData[currentType] > 1 ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeDisplay;
