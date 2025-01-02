"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Loader2,
  Search as SearchIcon,
  Command,
  ArrowUpDown,
  ChevronRight,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader } from "@/components/dialog";
import Link from "next/link";

const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;

const QuickSearch = ({ onSelect }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  const fetchQuickResults = async (value) => {
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=en-US&query=${value}&page=1`
      );
      const data = await res.json();
      setTotalResults(data.total_results || 0);
      setSearchResults(data.results?.slice(0, 5) || []);
    } catch (error) {
      console.error("Quick search error:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (searchTerm) {
        fetchQuickResults(searchTerm);
      }
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [searchTerm]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < searchResults.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter" && searchResults[selectedIndex]) {
      e.preventDefault();
      const selectedItem = searchResults[selectedIndex];
      onSelect(selectedItem.title || selectedItem.name);
      setSearchTerm("");
      setIsOpen(false);
    }
  };

  const getLink = (item) => {
    return item.media_type === "tv"
      ? `/series/${item.id}`
      : `/movie/${item.id}`;
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center gap-2 px-4 py-2 bg-white-100/50 hover:bg-slate-800 transition-colors rounded-lg border border-slate-700/50 text-slate-400 mobile-icon-only"
      >
        <SearchIcon className="w-4 h-4" />
        <span className="flex-1 text-left desktop-text">
          Click <kbd>Ctrl+K</kbd> to search
        </span>
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[550px] bg-slate-900/95 backdrop-blur border border-slate-800 rounded-lg p-0 overflow-hidden">
          <DialogHeader className="p-4 pb-0">
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/50 rounded-lg">
              <SearchIcon className="w-4 h-4 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                className="w-full bg-transparent border-0 focus:outline-none text-white placeholder-slate-400"
                placeholder="Type to search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                autoFocus
              />
              {isLoading && (
                <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
              )}
            </div>
          </DialogHeader>

          <div className="px-2 py-4">
            {searchResults.length > 0 ? (
              <div className="space-y-1">
                {searchResults.map((item, index) => (
                  <Link
                    key={item.id}
                    href={getLink(item)}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-md
                      ${
                        index === selectedIndex
                          ? "bg-slate-800"
                          : "hover:bg-slate-800/50"
                      }
                      transition-colors
                    `}
                    onClick={() => {
                      onSelect(item.title || item.name);
                      setSearchTerm("");
                      setIsOpen(false);
                    }}
                  >
                    {item.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${item.poster_path}`}
                        alt=""
                        className="w-12 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-16 bg-slate-800 rounded flex items-center justify-center">
                        <ArrowUpDown className="w-6 h-6 text-slate-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {item.title || item.name}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <span>
                          {item.media_type === "movie" ? "Movie" : "TV Show"}
                        </span>
                        <span className="w-1 h-1 bg-slate-600 rounded-full" />
                        <span>
                          {new Date(
                            item.release_date || item.first_air_date
                          ).getFullYear() || "N/A"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}

                {totalResults > 5 && (
                  <Link
                    href={`/search?q=${encodeURIComponent(searchTerm)}`}
                    className="flex items-center justify-between w-full p-2 mt-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-md transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <span>Show all {totalResults} results</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            ) : searchTerm && !isLoading ? (
              <div className="text-center py-8 text-slate-400">
                <p>No results found</p>
              </div>
            ) : null}
          </div>

          <div className="p-2 bg-slate-900 border-t border-slate-800">
            <Link
              href="/search"
              className="flex items-center justify-center gap-2 w-full p-2 bg-slate-800 hover:bg-slate-700 transition-colors rounded-md text-sm font-medium text-white"
              onClick={() => setIsOpen(false)}
            >
              <SearchIcon className="w-4 h-4" />
              Advanced Search
            </Link>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default QuickSearch;
