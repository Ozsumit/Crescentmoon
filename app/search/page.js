"use client";

import React, { useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Search as SearchIcon, Film, Tv, Info } from "lucide-react"; // Added more icons
import SearchDisplay from "@/components/display/SearchDisplay";
import SearchBar from "@/components/searchbar/SearchBar";
import SearchTitle from "@/components/title/SearchTitle"; // Assuming this is a simple title

const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

// A wrapper component is needed for Suspense when using useSearchParams
const SearchPageContent = () => {
  const searchParams = useSearchParams();
  const initialQueryFromUrl = searchParams.get("q") || "";

  // searchTerm now truly represents the current input in the bar
  const [searchTerm, setSearchTerm] = useState(initialQueryFromUrl);
  // data stores the fetched results
  const [data, setData] = useState([]);
  // isLoading covers all fetching states (initial, debounced, explicit search)
  const [isLoading, setIsLoading] = useState(false);
  // isInitialLoad is true only for the very first fetch based on URL query
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [error, setError] = useState(null);
  // This state tracks if an explicit search (Enter/Button) was triggered
  // to differentiate from debounced typing
  const [explicitSearchTriggered, setExplicitSearchTriggered] = useState(false);

  // Memoize fetchSearchResults to prevent unnecessary re-renders in useEffect dependencies
  const fetchSearchResults = useCallback(async (query) => {
    if (!query.trim()) {
      setData([]);
      setIsLoading(false); // Ensure loading is off if query is empty
      return;
    }

    setIsLoading(true);
    setError(null); // Clear previous errors

    try {
      const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=en-US&query=${encodeURIComponent(
        query
      )}&page=1`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(
          `API error: ${response.status} ${response.statusText}. Please try again.`
        );
      }
      const resultData = await response.json();

      const filteredAndSorted = (resultData.results || [])
        .filter(
          (item) => item.media_type === "movie" || item.media_type === "tv"
        )
        .sort((a, b) => b.popularity - a.popularity)
        .map((item) => ({
          ...item,
          title: item.title || item.name,
          release_date: item.release_date || item.first_air_date,
        }));

      setData(filteredAndSorted);
    } catch (err) {
      setError(err.message);
      setData([]); // Clear data on error
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false); // Initial load is complete
      setExplicitSearchTriggered(false); // Explicit search complete
    }
  }, []); // No dependencies for this useCallback as it uses `apiKey` from outer scope

  // Effect for handling initial load from URL query
  useEffect(() => {
    if (initialQueryFromUrl && isInitialLoad) {
      // Set isLoading immediately for initial query fetch
      setIsLoading(true);
      fetchSearchResults(initialQueryFromUrl);
    } else if (!initialQueryFromUrl) {
      setIsInitialLoad(false); // No initial query, so initial load is "done"
    }
  }, [initialQueryFromUrl, isInitialLoad, fetchSearchResults]);

  // Effect for live searching as the user types (with debounce)
  useEffect(() => {
    // Only debounce if it's not an explicit search trigger
    if (explicitSearchTriggered) {
      return; // Skip debounce if an explicit search just happened
    }

    const timer = setTimeout(() => {
      // Only trigger search if searchTerm is different from the initial URL query
      // OR if we're past the initial load phase.
      // This prevents a double fetch if initialQuery is set and then searchTerm is same.
      if (
        searchTerm &&
        (searchTerm !== initialQueryFromUrl || !isInitialLoad)
      ) {
        fetchSearchResults(searchTerm);
      } else if (!searchTerm) {
        // Clear results when search term is empty
        setData([]);
        setError(null);
        setIsLoading(false);
      }
    }, 500); // Debounce delay

    // Cleanup function: clears the timeout if searchTerm changes before the timeout fires
    return () => clearTimeout(timer);
  }, [
    searchTerm,
    initialQueryFromUrl,
    isInitialLoad,
    explicitSearchTriggered,
    fetchSearchResults,
  ]);

  // Check for API key presence on mount
  useEffect(() => {
    if (!apiKey) {
      setError(
        "TMDB API key is missing. Please check your environment variables (NEXT_PUBLIC_TMDB_API_KEY)."
      );
    }
  }, []);

  // Handler for explicit search (e.g., pressing Enter or clicking a search button)
  const handleExplicitSearch = () => {
    setExplicitSearchTriggered(true);
    fetchSearchResults(searchTerm);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-black text-white font-sans">
      <div className="container mx-auto mt-16 px-4 py-8 flex-grow">
        <SearchTitle />
        <SearchBar
          initialValue={searchTerm}
          onTyping={setSearchTerm}
          onSearch={handleExplicitSearch} // Use the new handler for explicit searches
          isLoading={isLoading && searchTerm.trim() !== ""} // Pass loading state to SearchBar for subtle feedback
        />

        {/* Dynamic Content Display Area */}
        <div className="mt-10 min-h-[calc(100vh-300px)] flex flex-col items-center justify-center">
          {error && (
            <div
              className="bg-red-900/30 border border-red-700 rounded-xl p-6 my-4 text-center max-w-lg w-full"
              role="alert"
              aria-live="assertive"
            >
              <Info className="text-red-300 mx-auto mb-3" size={36} />
              <p className="text-red-300 text-lg font-semibold mb-2">
                Oops! Something went wrong.
              </p>
              <p className="text-red-400 text-sm">{error}</p>
              <p className="text-red-400 text-sm mt-2">
                Please check your internet connection or try again later.
              </p>
            </div>
          )}

          {!error && isLoading && (
            <div
              className="flex flex-col justify-center items-center py-12"
              role="status"
              aria-live="polite"
            >
              <Loader2 className="animate-spin text-indigo-400" size={64} />
              <p className="mt-4 text-indigo-300 text-lg font-medium">
                Searching for your content...
              </p>
            </div>
          )}

          {!isLoading && !error && (
            <>
              {data.length > 0 ? (
                // Use a key to force re-render of SearchDisplay if data significantly changes (optional, but good practice)
                <SearchDisplay key={searchTerm} media={data} />
              ) : searchTerm ? (
                <div
                  className="text-center text-slate-400 py-12 flex flex-col items-center"
                  role="status"
                  aria-live="polite"
                >
                  <Film className="mb-4 text-slate-500" size={64} />
                  <p className="text-2xl font-semibold mb-2">
                    No results found for "{searchTerm}"
                  </p>
                  <p className="text-lg text-slate-500 max-w-md">
                    We couldn't find any movies or TV shows matching your
                    search. Try checking your spelling or using different
                    keywords.
                  </p>
                </div>
              ) : (
                <div
                  className="text-center text-slate-500 py-12 flex flex-col items-center animate-fade-in"
                  role="region"
                  aria-live="polite"
                >
                  <div className="flex space-x-4 mb-6">
                    <Film size={72} className="text-indigo-400" />
                    <Tv size={72} className="text-teal-400" />
                  </div>
                  <p className="text-3xl font-bold text-white mb-3">
                    Discover Your Next Binge
                  </p>
                  <p className="text-xl max-w-lg text-slate-400">
                    Search for thousands of movies and TV shows. From
                    blockbusters to hidden gems, find everything here.
                  </p>
                  <p className="text-md mt-4 text-slate-500">
                    Try searching for "Inception", "The Crown", or "Stranger
                    Things".
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Main component that uses Suspense
const Search = () => {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-screen bg-slate-900/90 backdrop-blur-sm fixed inset-0 z-50">
          <Loader2 className="animate-spin text-indigo-400" size={64} />
          <p className="ml-4 text-indigo-300 text-lg">Loading search page...</p>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
};

export default Search;
