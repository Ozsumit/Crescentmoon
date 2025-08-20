// QuickSearch.jsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Loader2,
  Search as SearchIcon,
  Film,
  Tv2,
  ChevronRight,
  CornerDownLeft,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/dialog";
import Link from "next/link";
import { useRouter } from "next/navigation";

const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

// SearchResultItem component (keeping original logic, fixing UI only)
const SearchResultItem = React.memo(({ item, isSelected, href }) => {
  const mediaType = item.media_type === "movie" ? "Movie" : "TV Show";
  const year =
    item.release_date || item.first_air_date
      ? new Date(item.release_date || item.first_air_date).getFullYear()
      : "N/A";
  const Icon = item.media_type === "movie" ? Film : Tv2;

  const itemId = `search-result-${item.media_type}-${item.id}`;

  return (
    <Link
      id={itemId}
      href={href}
      role="option"
      aria-selected={isSelected}
      className={`flex items-center gap-4 px-3 py-2.5 rounded-lg outline-none transition-all duration-200 ${
        isSelected
          ? "bg-indigo-600/20 ring-1 ring-indigo-500/30"
          : "hover:bg-slate-800/60"
      } focus-visible:ring-2 focus-visible:ring-indigo-500`}
    >
      {item.poster_path ? (
        <Image
          src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
          alt={`Poster for ${item.title || item.name}`}
          width={40}
          height={56}
          className="object-cover rounded-md flex-shrink-0 shadow-sm"
          priority={isSelected}
        />
      ) : (
        <div className="w-10 h-14 bg-slate-800 rounded-md flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-slate-500" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white truncate">
          {item.title || item.name}
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
          <span>{mediaType}</span>
          <span className="w-1 h-1 bg-slate-600 rounded-full" />
          <span>{year}</span>
        </div>
      </div>
      <ChevronRight
        className={`w-4 h-4 text-slate-500 transition-all duration-200 ${
          isSelected ? "text-indigo-400" : "group-hover:text-slate-400"
        }`}
      />
    </Link>
  );
});

SearchResultItem.displayName = "SearchResultItem";

const QuickSearch = ({ open, onOpenChange }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [totalResults, setTotalResults] = useState(0);

  const debounceRef = useRef(null);
  const inputRef = useRef(null);
  const resultsContainerRef = useRef(null);
  const router = useRouter();

  // Scroll selected item into view
  const scrollToSelectedItem = useCallback(() => {
    if (selectedIndex >= 0 && resultsContainerRef.current) {
      const selectedElement = document.getElementById(
        `search-result-${searchResults[selectedIndex]?.media_type}-${searchResults[selectedIndex]?.id}`
      );
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });
      }
    }
  }, [selectedIndex, searchResults]);

  // Scroll to selected item when selection changes
  useEffect(() => {
    scrollToSelectedItem();
  }, [scrollToSelectedItem]);

  // Debounced API call for search results (keeping original logic)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!searchTerm.trim()) {
      setSearchResults([]);
      setTotalResults(0);
      setSelectedIndex(-1);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=en-US&query=${encodeURIComponent(
            searchTerm
          )}&page=1`
        );
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setTotalResults(data.total_results || 0);
        const filteredResults =
          data.results?.filter(
            (item) => item.media_type === "movie" || item.media_type === "tv"
          ) || [];
        setSearchResults(filteredResults.slice(0, 7));
        setSelectedIndex(filteredResults.length > 0 ? 0 : -1);
      } catch (error) {
        console.error("Quick search error:", error);
        setSearchResults([]);
        setTotalResults(0);
        setSelectedIndex(-1);
      } finally {
        setIsLoading(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  // Global keyboard shortcut (keeping original logic)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [onOpenChange]);

  // Auto-focus input when dialog opens (keeping original logic)
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Handle dialog open/close state changes (keeping original logic)
  const handleOpenChangeInternal = useCallback(
    (newOpenState) => {
      onOpenChange(newOpenState);
      if (!newOpenState) {
        setSearchTerm("");
        setSearchResults([]);
        setSelectedIndex(-1);
        setTotalResults(0);
      }
    },
    [onOpenChange]
  );

  const hasMoreResults = totalResults > searchResults.length;

  // Keyboard navigation (keeping original logic)
  const handleKeyDown = useCallback(
    (e) => {
      const numResults = searchResults.length;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (numResults > 0) {
          setSelectedIndex((prev) => (prev + 1) % numResults);
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (numResults > 0) {
          setSelectedIndex((prev) => (prev - 1 + numResults) % numResults);
        }
      } else if (
        e.key === "Enter" &&
        selectedIndex >= 0 &&
        selectedIndex < numResults &&
        !e.metaKey &&
        !e.ctrlKey
      ) {
        e.preventDefault();
        const selectedItem = searchResults[selectedIndex];
        const href =
          selectedItem.media_type === "tv"
            ? `/series/${selectedItem.id}`
            : `/movie/${selectedItem.id}`;
        router.push(href);
        handleOpenChangeInternal(false);
      } else if (
        (e.metaKey || e.ctrlKey) &&
        e.key === "Enter" &&
        hasMoreResults &&
        searchTerm.trim()
      ) {
        e.preventDefault();
        router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
        handleOpenChangeInternal(false);
      }
    },
    [
      selectedIndex,
      searchResults,
      router,
      searchTerm,
      hasMoreResults,
      handleOpenChangeInternal,
    ]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChangeInternal}>
      <DialogContent
        className="
          w-full min-h-screen rounded-none shadow-none
          md:max-w-[640px] md:h-[500px] md:rounded-xl md:shadow-2xl md:min-h-0
          bg-slate-950/95 backdrop-blur-xl border border-slate-800/50 p-0 overflow-hidden flex flex-col
        "
      >
        {/* Header - Fixed UI styling only */}
        <div className="flex-shrink-0 px-4 py-4 border-b border-slate-800/50">
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-900/60 rounded-xl border border-slate-700/50 text-slate-400 focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/50 transition-all duration-200">
            <SearchIcon className="w-5 h-5 text-slate-500 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              className="w-full bg-transparent border-0 focus:outline-none text-white placeholder-slate-500 text-base"
              placeholder="Search for movies and TV shows..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              aria-controls="search-results-list"
              aria-activedescendant={
                selectedIndex >= 0 && searchResults[selectedIndex]
                  ? `search-result-${searchResults[selectedIndex].media_type}-${searchResults[selectedIndex].id}`
                  : undefined
              }
            />
            {isLoading && (
              <Loader2 className="w-5 h-5 animate-spin text-indigo-400 flex-shrink-0" />
            )}
          </div>
        </div>

        {/* Main Content - Fixed UI styling only */}
        <div
          ref={resultsContainerRef}
          className="flex-1 overflow-y-auto px-2 py-2"
        >
          {searchResults.length > 0 ? (
            <div
              id="search-results-list"
              role="listbox"
              className="space-y-1 px-2"
            >
              {searchResults.map((item, index) => (
                <SearchResultItem
                  key={`${item.media_type}-${item.id}`}
                  item={item}
                  isSelected={index === selectedIndex}
                  href={
                    item.media_type === "tv"
                      ? `/series/${item.id}`
                      : `/movie/${item.id}`
                  }
                />
              ))}
            </div>
          ) : searchTerm.trim() && !isLoading ? (
            <div className="text-center h-full flex flex-col justify-center items-center text-slate-500 px-4">
              <div className="p-6 bg-slate-900/50 rounded-lg border border-slate-800/50">
                <p className="font-medium text-slate-300">
                  No results found for "{searchTerm}"
                </p>
                <p className="text-sm mt-1">Try a different search term.</p>
              </div>
            </div>
          ) : (
            <div className="text-center h-full flex flex-col justify-center items-center text-slate-500 px-4">
              <div className="p-6  rounded-lg ">
                <SearchIcon className="w-12 h-12 mx-auto mb-3 text-white" />
                <p className="font-medium text-slate-400">
                  Find a movie or TV show
                </p>
                <p className="text-sm mt-1">Start typing to see results.</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer - Fixed UI styling only */}
        <div className="px-4 py-3 bg-slate-950/90 border-t border-slate-800/50 text-xs text-slate-500 flex items-center justify-between flex-shrink-0">
          <div className="hidden md:flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono">
                ↑↓
              </kbd>
              navigate
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-mono">
                ↵
              </kbd>
              select
            </span>
          </div>
          {hasMoreResults && searchTerm.trim() && (
            <Link
              href={`/search?q=${encodeURIComponent(searchTerm)}`}
              className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors duration-200 text-sm font-medium"
              onClick={() => handleOpenChangeInternal(false)}
            >
              View all ({totalResults})
              <kbd className="hidden md:inline-flex h-5 items-center gap-1 rounded border border-slate-700 bg-slate-800 px-2 font-mono text-[10px] font-medium text-slate-400">
                <span className="text-xs">⌘</span>
                <CornerDownLeft className="w-2.5 h-2.5" />
              </kbd>
            </Link>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickSearch;
